from pydantic import BaseModel, Field, EmailStr


# 註冊會員請求模型
class SignUpRequest(BaseModel):
    name: str = Field(...)
    email: EmailStr
    password: str = Field(...)


# 登入會員請求模型
class LogInRequest(BaseModel):
    email: EmailStr
    password: str = Field(...)


# token 回應模型
class TokenResponse(BaseModel):
    token: str


# 使用者資訊模型
class UserData(BaseModel):
    id: int
    name: str
    email: EmailStr


# 使用者資訊回應模型
class UserDataResponse(BaseModel):
    data: UserData
