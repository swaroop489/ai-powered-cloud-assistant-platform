from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="User password (min 8 characters)")
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str]
    created_at: datetime
    is_active: bool = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
