from app.database import close_mongo_connection

async def shutdown_db_client():
    await close_mongo_connection()
