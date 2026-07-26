import os
from celery import Celery
from celery.schedules import crontab

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "cloud_assistant",
    broker=redis_url,
    backend=redis_url,
    include=["app.tasks.drift_detection_task"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

# Schedule the drift detection to run every 24 hours at midnight UTC
celery_app.conf.beat_schedule = {
    "daily-drift-detection": {
        "task": "app.tasks.drift_detection_task.run_drift_detection",
        "schedule": crontab(minute=0, hour=0),
    }
}
