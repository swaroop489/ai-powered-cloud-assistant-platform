from fastapi import APIRouter, Depends
from datetime import datetime
from app.database import db

router = APIRouter()

@router.get("/")
async def get_metrics():
    """
    Returns aggregated metrics across all deployments for the dashboard.
    """
    try:
        # Get all deployments
        deployments = await db.db.deployments.find({}).to_list(length=1000)
        
        total_deployments = len(deployments)
        if total_deployments == 0:
            return {
                "total_deployments": 0,
                "success_rate": 0,
                "avg_deploy_time": 0
            }

        successful_deployments = [d for d in deployments if d.get("status") == "COMPLETED"]
        failed_deployments = [d for d in deployments if d.get("status") == "FAILED"]
        
        # Calculate success rate
        success_rate = (len(successful_deployments) / total_deployments) * 100

        # Calculate average duration for successful deployments
        total_duration = 0
        valid_duration_count = 0
        
        for d in successful_deployments:
            created_at = d.get("created_at")
            updated_at = d.get("updated_at")
            
            if created_at and updated_at:
                try:
                    # If they are string ISO formats
                    if isinstance(created_at, str):
                        created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                    if isinstance(updated_at, str):
                        updated_at = datetime.fromisoformat(updated_at.replace("Z", "+00:00"))
                        
                    duration = (updated_at - created_at).total_seconds()
                    total_duration += duration
                    valid_duration_count += 1
                except Exception:
                    pass
                    
        avg_deploy_time = total_duration / valid_duration_count if valid_duration_count > 0 else 0

        return {
            "total_deployments": total_deployments,
            "success_rate": round(success_rate, 1),
            "avg_deploy_time": round(avg_deploy_time, 0), # in seconds
            "total_failed": len(failed_deployments)
        }
    except Exception as e:
        return {
            "error": str(e),
            "total_deployments": 0,
            "success_rate": 0,
            "avg_deploy_time": 0
        }
