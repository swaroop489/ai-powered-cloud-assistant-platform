import uuid
import datetime
from fastapi import APIRouter, BackgroundTasks, HTTPException, Depends
from fastapi.responses import StreamingResponse
import asyncio
import json

from app.schemas.deployment_schema import DeploymentRequest
from app.services.terraform_service import TerraformService
from app.services.stream_manager import stream_manager
from app.utils.codegen import generate_hcl
from app.database import db
from app.dependencies import get_current_user

router = APIRouter()


@router.post("/apply")
async def apply_infrastructure(
    plan: DeploymentRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
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
        "user_id": str(current_user["_id"]), 
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


@router.get("/history")
async def get_deployment_history(current_user: dict = Depends(get_current_user)):
    """
    Fetch all deployments for the current user.
    """
    cursor = db.db.deployments.find(
        {"user_id": str(current_user["_id"])}  # Match by ID
    ).sort("created_at", -1)
    
    deployments = await cursor.to_list(length=100)
    
    # Convert _id to string or remove it to avoid serialization issues
    for d in deployments:
        if "_id" in d:
            d["_id"] = str(d["_id"])
            
    return deployments


@router.get("/{deployment_id}")
async def get_deployment_status(
    deployment_id: str,
    # Optional: Enforce auth for status check too?
    # current_user: dict = Depends(get_current_user) 
):
    """
    Fetch deployment status and logs.
    """
    deployment = await db.db.deployments.find_one({"deployment_id": deployment_id}, {"_id": 0})
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")
    return deployment


@router.get("/{deployment_id}/stream")
async def stream_logs(deployment_id: str):
    """
    SSE Endpoint for real-time logs.
    """
    async def event_generator():
        # 1. Yield existing logs from MongoDB (Catch-up)
        deployment = await db.db.deployments.find_one({"deployment_id": deployment_id})
        if deployment and "logs" in deployment:
            for log in deployment["logs"]:
                yield f"data: {json.dumps({'log': log})}\n\n"
        
        # 2. Subscribe to new logs
        queue = await stream_manager.connect(deployment_id)
        try:
            while True:
                # Wait for new log
                data = await queue.get()
                
                # Check for special status messages or just pure logs
                if data.startswith("STATUS:"):
                    status = data.split(":", 1)[1]
                    yield f"data: {json.dumps({'status': status})}\n\n"
                    # If completed/failed, we can optionally close, but let's keep open for a bit
                    if status in ["COMPLETED", "FAILED"]:
                        # Send a final close event if needed, or just let client handle it
                        yield f"event: close\ndata: {json.dumps({'status': status})}\n\n"
                        break 
                else:
                    yield f"data: {json.dumps({'log': data})}\n\n"
        finally:
            await stream_manager.disconnect(deployment_id, queue)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


# =====================================================
# Helper Functions
# =====================================================

async def log_update(deployment_id: str, message: str):
    """
    Append a log entry while preventing unbounded growth.
    Keeps last 500 logs only.
    """
    timestamp = datetime.datetime.now().strftime("%I:%M:%S %p")
    log_entry = f"[{timestamp}] {message}"
    await db.db.deployments.update_one(
        {"deployment_id": deployment_id},
        {
            "$push": {
                "logs": {
                    "$each": [log_entry],
                    "$slice": -500,
                }
            },
            "$set": {"updated_at": datetime.datetime.utcnow()},
        },
    )
    # Broadcast to real-time clients
    await stream_manager.broadcast(deployment_id, log_entry)


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
    # Broadcast status change
    await stream_manager.broadcast(deployment_id, f"STATUS:{status}")


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
