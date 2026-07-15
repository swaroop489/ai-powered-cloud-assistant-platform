from fastapi import APIRouter
from app.schemas.telemetry_schema import TelemetryEvent, TelemetryBatch
from app.database import db

router = APIRouter()

@router.post("/")
async def record_telemetry(event: TelemetryEvent):
    event_dict = event.dict()
    await db.db.telemetry.insert_one(event_dict)
    return {"status": "recorded"}

@router.post("/batch")
async def record_telemetry_batch(batch: TelemetryBatch):
    events = [e.dict() for e in batch.events]
    if events:
        await db.db.telemetry.insert_many(events)
    return {"status": "recorded", "count": len(events)}
