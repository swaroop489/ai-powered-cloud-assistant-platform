import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY", "default_insecure_secret")
    MONGODB_URL: str = os.getenv("MONGO_URI", os.getenv("MONGODB_URL", "mongodb://localhost:27017/cloud_assistant"))
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # AWS Credentials
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_DEFAULT_REGION: str = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
    
    # CORS
    @property
    def CORS_ORIGINS(self) -> List[str]:
        origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173")
        return [origin.strip() for origin in origins_str.split(",") if origin.strip()]

settings = Settings()
