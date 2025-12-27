from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    """Request body cho login endpoint"""
    username: str = Field(..., max_length=50,
                          description="Username để đăng nhập")
    password: str = Field(..., min_length=1, max_length=255,
                          description="Password để đăng nhập")

    class Config:
        json_schema_extra = {
            "example": {
                "username": "admin",
                "password": "password123"
            }
        }


class LoginResponse(BaseModel):
    """Response trả về khi login thành công"""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Loại token")
    username: str = Field(..., description="Username của người dùng")
    role: str = Field(..., description="Role của người dùng")

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "username": "admin",
                "role": "BUILDING_MANAGER"
            }
        }


class MeResponse(BaseModel):
    """Response cho endpoint lấy thông tin user hiện tại"""
    username: str = Field(..., max_length=50)
    role: str | None = Field(default=None, max_length=20)


class TokenData(BaseModel):
    """Data được lưu trong JWT token"""
    username: str
    role: str
