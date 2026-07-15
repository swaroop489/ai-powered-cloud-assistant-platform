from app.database import connect_to_mongo

async def startup_db_client():
    await connect_to_mongo()
