import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# Ensure the MONGODB_URL includes the database name
MONGODB_URL = os.getenv("MONGO_URI", "mongodb://localhost:27017/cloud_assistant_db")

class Database:
    client: AsyncIOMotorClient = None
    db = None

db = Database()

async def get_database():
    return db.db

async def connect_to_mongo():
    db.client = AsyncIOMotorClient(MONGODB_URL)
    # get_default_database() uses the database specified in the connection string
    db.db = db.client.get_default_database()
    print(f"Connected to MongoDB")

async def close_mongo_connection():
    if db.client:
        db.client.close()
        print("Closed MongoDB connection")
