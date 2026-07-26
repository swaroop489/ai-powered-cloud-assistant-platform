from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import connect_to_mongo, close_mongo_connection
from .routers import auth
from app.routers import ai, deploy, telemetry, metrics
from app.events.startup import startup_db_client
from app.events.shutdown import shutdown_db_client
import sys
import asyncio

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

app = FastAPI()

from .config import settings

origins = settings.cors_origin_list

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

app.add_event_handler("startup", startup_db_client)
app.add_event_handler("shutdown", shutdown_db_client)

@app.get("/")
def read_root():
    return {"message": "Welcome to AI-Powered Cloud Assistant Platform Backend"}

app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(deploy.router, prefix="/api/deploy", tags=["Deployment"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["Metrics"])
app.include_router(telemetry.router, prefix="/api/telemetry", tags=["Telemetry"])
