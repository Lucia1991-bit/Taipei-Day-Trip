from pydantic import BaseModel, Field, EmailStr
from decimal import Decimal
from typing import Optional, List


# 註冊會員請求模型
class SignUpRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)


# 登入會員請求模型
class SignInRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


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


# 個別景點資料模型
class AttractionData(BaseModel):
    id: int
    name: str
    category: str
    description: str
    address: str
    transport: str
    # 有個景點的捷運站是null
    mrt: Optional[str] = None
    # 資料庫設定的資料類型是decimal，導入decimal模組
    lat: Decimal
    lng: Decimal
    images: List[str]


# 個別景點回應模型
class AttractionResponse(BaseModel):
    data: AttractionData


# 分頁景點回應模型
class AttractionPageResponse(BaseModel):
    nextPage: Optional[int] = None
    data: List[AttractionData]


# 捷運站名模型
class MRTData(BaseModel):
    data: List[str]


# 錯誤回應模型
class ErrorResponse(BaseModel):
    error: bool
    message: Optional[str] = None


# 成功回應模型
class SuccessResponse(BaseModel):
    ok: bool
