from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional, List
from datetime import date
from enum import Enum
import re
from schema.booking import BookingData


# 聯絡資料
class ContactData(BaseModel):
    name: str = Field(...)
    email: EmailStr
    phone: str = Field(...)

    # 驗證手機格式
    # @validator("phone")
    # def validate_phone(cls, value):
    #     pattern = r"^(09)\d{8}$"
    #     if not re.match(pattern, value):
    #         raise ValueError("無效的電話格式")
    #     return value

    # 驗證姓名不能為空
    # @validator("phone")
    # def validate_name(cls, value):
    #     if not value.strip():
    #         raise ValueError("姓名不能為空")
    #     return value.strip()


# 訂單資料
class OrderData(BaseModel):
    total_price: int
    trip: List[BookingData]
    contact: ContactData


# 訂單請求
class OrderRequest(BaseModel):
    prime: str = Field(...)
    order: OrderData


# 付款狀態
class PaymentStatus(BaseModel):
    status: int
    message: str


# 加上訂單編號
class OrderResponseDetail(BaseModel):
    number: str
    payment: PaymentStatus


# 訂單回應
class OrderResponse(BaseModel):
    data: OrderResponseDetail
