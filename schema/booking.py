from pydantic import BaseModel, Field, ValidationError
from typing import Optional, List
from datetime import date
from enum import Enum


# 使用者選擇的時間(限制選項)
class TimeChoice(str, Enum):
    morning = "上半天"
    afternoon = "下半天"


# 預定資料模型中的景點資訊
class AttractionBooking(BaseModel):
    attractionId: int
    name: str
    address: str
    image: str


# 預定資料模型(加上日期、時間、價格)
class BookingData(BaseModel):
    bookingId: int
    attraction: AttractionBooking
    date: date
    time: TimeChoice
    price: int


# 預定回應模型
class BookingResponse(BaseModel):
    data: Optional[List[BookingData]] = None


# 創建預定模型
class BookingRequest(BaseModel):
    attractionId: int
    date: date
    time: str
    price: int


data_dict = {
    'attractionId': 2,
    'date': '2024-06-22',
    'time': '上半天',
    'price': 2000
}

try:
    booking = BookingRequest(**data_dict)
    print("成功")

except ValidationError as e:
    print(e.json())
