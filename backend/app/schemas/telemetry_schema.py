from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class TelemetryEvent(BaseModel):
    event_name: str = Field(..., description="Name of the telemetry event (e.g., 'ai_generation_time', 'ui_button_click')")
    user_id: Optional[str] = Field(None, description="ID of the user who triggered the event")
    deployment_id: Optional[str] = Field(None, description="Related deployment ID, if applicable")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional event properties (e.g., duration_ms, error_code)")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="When the event occurred")

class TelemetryBatch(BaseModel):
    events: list[TelemetryEvent]
    client_version: str = Field(..., description="Frontend version string")
