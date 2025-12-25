from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str = Field(..., max_length=50)
    password: str = Field(..., min_length=1, max_length=255)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MeResponse(BaseModel):
    username: str = Field(..., max_length=50)
    role: str | None = Field(default=None, max_length=20)
