from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

MONGODB_URL = settings.MONGODB_URL

class Database:
    client: AsyncIOMotorClient = None
    db = None

db = Database()

async def get_database():
    return db.db

async def connect_to_mongo():
    db.client = AsyncIOMotorClient(MONGODB_URL)
    db.db = db.client.get_default_database()

async def close_mongo_connection():
    if db.client:
        db.client.close()
