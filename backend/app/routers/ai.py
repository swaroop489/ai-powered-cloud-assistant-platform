from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.schemas.deployment_schema import DeploymentRequest
from app.services.ai_service import AIService

router = APIRouter()
ai_service = AIService()


class PromptRequest(BaseModel):
    message: str


@router.post("/plan", response_model=DeploymentRequest)
async def generate_plan(request: PromptRequest):
    """
    Step 1:
    User provides natural language.
    We return a validated JSON infrastructure plan.
    """
    try:
        return ai_service.parse_intent(request.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
