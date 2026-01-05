import uuid
import datetime
from fastapi import APIRouter, BackgroundTasks, HTTPException

from app.schemas.deployment_schema import DeploymentRequest
from app.services.terraform_service import TerraformService
from app.utils.codegen import generate_hcl
from app.database import db  # MongoDB connection

router = APIRouter()


@router.post("/apply")
async def apply_infrastructure(
    plan: DeploymentRequest,
    background_tasks: BackgroundTasks,
):
    """
    User approves plan → Terraform is executed asynchronously
    Logs + state are persisted in MongoDB
    """
    deployment_id = str(uuid.uuid4())[:8]
    work_dir = f"./deployments/{plan.project_name}-{deployment_id}"

    # -----------------------------
    # Create DB Record
    # -----------------------------
    deployment_doc = {
        "deployment_id": deployment_id,
        "project_name": plan.project_name,
        "environment": plan.environment,
        "region": plan.region.value,
        "status": "PENDING",
        "created_at": datetime.datetime.utcnow(),
        "updated_at": datetime.datetime.utcnow(),
        "resources": [r.model_dump() for r in plan.resources],
        "logs": [],
        "terraform_outputs": {},
    }

    await db.db.deployments.insert_one(deployment_doc)

    # -----------------------------
    # Terraform Setup
    # -----------------------------
    tf_service = TerraformService(work_dir)
    hcl_code = generate_hcl(plan)
    tf_service.write_main_tf(hcl_code)

    # Run Terraform async
    background_tasks.add_task(
        run_terraform_workflow,
        deployment_id,
        tf_service,
    )

    return {
        "status": "deployment_started",
        "deployment_id": deployment_id,
        "path": work_dir,
    }


# =====================================================
# Helper Functions
# =====================================================

async def log_update(deployment_id: str, message: str):
    """
    Append a log entry while preventing unbounded growth.
    Keeps last 500 logs only.
    """
    await db.db.deployments.update_one(
        {"deployment_id": deployment_id},
        {
            "$push": {
                "logs": {
                    "$each": [message],
                    "$slice": -500,
                }
            },
            "$set": {"updated_at": datetime.datetime.utcnow()},
        },
    )


async def status_update(deployment_id: str, status: str):
    """
    Update deployment lifecycle status
    """
    await db.db.deployments.update_one(
        {"deployment_id": deployment_id},
        {
            "$set": {
                "status": status,
                "updated_at": datetime.datetime.utcnow(),
            }
        },
    )


# =====================================================
# Terraform Lifecycle Runner
# =====================================================

async def run_terraform_workflow(
    deployment_id: str,
    service: TerraformService,
):
    """
    Executes Terraform init → plan → apply
    Streams logs + updates state in MongoDB
    """
    try:
        # -----------------------------
        # INIT
        # -----------------------------
        await status_update(deployment_id, "INITIALIZING")
        await log_update(deployment_id, "[INIT] Terraform initialization started")

        async for line in service.init():
            await log_update(deployment_id, f"[INIT] {line}")

        # -----------------------------
        # PLAN
        # -----------------------------
        await status_update(deployment_id, "PLANNING")
        await log_update(deployment_id, "[PLAN] Terraform planning started")

        async for line in service.plan():
            await log_update(deployment_id, f"[PLAN] {line}")

        # -----------------------------
        # APPLY
        # -----------------------------
        await status_update(deployment_id, "APPLYING")
        await log_update(deployment_id, "[APPLY] Terraform apply started")

        async for line in service.apply():
            await log_update(deployment_id, f"[APPLY] {line}")

        # -----------------------------
        # OUTPUTS
        # -----------------------------
        try:
            outputs = await service.get_outputs()
        except Exception:
            outputs = {}

        await db.db.deployments.update_one(
            {"deployment_id": deployment_id},
            {"$set": {"terraform_outputs": outputs}},
        )

        # -----------------------------
        # DONE
        # -----------------------------
        await status_update(deployment_id, "COMPLETED")
        await log_update(deployment_id, "[DONE] Deployment completed successfully")

    except Exception as e:
        await status_update(deployment_id, "FAILED")
        await log_update(
            deployment_id,
            f"[ERROR] Deployment failed: {str(e)}",
        )
