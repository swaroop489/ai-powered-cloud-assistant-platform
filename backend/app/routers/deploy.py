import uuid
from fastapi import APIRouter, BackgroundTasks

from app.schemas.deployment_schema import DeploymentRequest
from app.services.terraform_service import TerraformService
from app.utils.codegen import generate_hcl

router = APIRouter()


@router.post("/apply")
async def apply_infrastructure(
    plan: DeploymentRequest, background_tasks: BackgroundTasks
):
    """
    Step 2:
    User approves plan → Terraform is executed.
    """
    deployment_id = str(uuid.uuid4())[:8]
    work_dir = f"./deployments/{plan.project_name}-{deployment_id}"

    tf_service = TerraformService(work_dir)

    # Generate Terraform code
    hcl_code = generate_hcl(plan)
    tf_service.write_main_tf(hcl_code)

    # Run Terraform asynchronously
    background_tasks.add_task(run_terraform_workflow, tf_service)

    return {
        "status": "deployment_started",
        "deployment_id": deployment_id,
        "workdir": work_dir,
    }


async def run_terraform_workflow(service: TerraformService):
    """
    Background Terraform lifecycle.
    """
    async for line in service.init():
        print(f"[INIT] {line}")

    async for line in service.plan():
        print(f"[PLAN] {line}")

    async for line in service.apply():
        print(f"[APPLY] {line}")

    print("[DEPLOYMENT COMPLETE]")
