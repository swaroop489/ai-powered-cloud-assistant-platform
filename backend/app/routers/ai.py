from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.schemas.deployment_schema import DeploymentRequest
from app.services.ai_service import AIService
from app.services.pricing_service import PricingService

router = APIRouter()
ai_service = AIService()
pricing_service = PricingService()

class PromptRequest(BaseModel):
    message: str
    github_repo_url: Optional[str] = None


@router.post("/plan", response_model=DeploymentRequest)
async def generate_plan(request: PromptRequest):
    """
    Step 1:
    User provides natural language.
    We return a validated JSON infrastructure plan.
    """
    try:
        plan = ai_service.parse_intent(request.message, request.github_repo_url or "")
        plan.estimated_cost = pricing_service.estimate_cost(plan)
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
