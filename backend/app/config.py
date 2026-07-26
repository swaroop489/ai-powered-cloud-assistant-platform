from typing import List, Union
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = "default_insecure_secret"
    MONGODB_URL: str = "mongodb://localhost:27017/cloud_assistant"
    GEMINI_API_KEY: str = ""

    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_DEFAULT_REGION: str = "us-east-1"
    
    # Terraform Remote State
    TF_STATE_BUCKET: str = "ai-cloud-assistant-state-bucket"
    TF_STATE_LOCK_TABLE: str = "ai-cloud-assistant-state-lock"
    TF_STATE_REGION: str = "us-east-1"
    
    CORS_ORIGINS: str = "http://localhost:5173"

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore" 

settings = Settings()
