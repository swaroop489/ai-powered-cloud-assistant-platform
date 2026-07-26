import asyncio
import os
from app.celery_app import celery_app
from app.services.logging_service import logger
from app.database import db
from app.services.terraform_service import TerraformService
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

async def async_drift_detection():
    logger.info("Starting Daily Infrastructure Drift Detection...")
    
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    database = client.get_default_database()
    
    cursor = database.deployments.find({"status": "APPLIED"})
    deployments = await cursor.to_list(length=1000)
    
    for deployment in deployments:
        dep_id = str(deployment["_id"])
        
        base_dir = os.path.join(os.getcwd(), "..", "deployments")
        working_dir = os.path.abspath(os.path.join(base_dir, dep_id))
        
        if not os.path.exists(working_dir):
            continue
            
        try:
            tf_service = TerraformService(working_dir)
            logger.info(f"Checking drift for {dep_id}")
            
            cmd = ["terraform", "plan", "-detailed-exitcode", "-no-color", "-input=false"]
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                cwd=str(tf_service.working_dir),
                env=tf_service._get_env_vars(),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            exit_code = process.returncode
            
            if exit_code == 2:
                logger.warning(f"DRIFT DETECTED for deployment {dep_id}!")
                await database.deployments.update_one(
                    {"_id": deployment["_id"]},
                    {"$set": {"status": "DRIFT_DETECTED"}}
                )
            elif exit_code == 1:
                logger.error(f"Error checking drift for {dep_id}: {stderr.decode('utf-8')}")
            else:
                logger.info(f"Deployment {dep_id} is healthy. No drift.")
                
        except Exception as e:
            logger.error(f"Failed drift detection on {dep_id}: {str(e)}")
            
    client.close()

@celery_app.task
def run_drift_detection():
    asyncio.run(async_drift_detection())
