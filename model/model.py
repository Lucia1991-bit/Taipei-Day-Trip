from pydantic import BaseModel, Field, condecimal, root_validator
from decimal import Decimal
from typing import Optional, List


# 個別景點資料模型
class AttractionData(BaseModel):
    id: int
    name: str
    category: str
    description: str
    address: str
    transport: str
    mrt: str
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
