from pydantic import BaseModel
from typing import Optional


# 自定義新增訂單至資料庫失敗模型
class OrderCreationError(Exception):
    def __init__(self, message: str):
        self.message = message


# 自定義付款失敗模型
class PaymentError(Exception):
    def __init__(self, message: str):
        self.message = message


# 錯誤回應模型
class ErrorResponse(BaseModel):
    error: bool
    message: Optional[str] = None


# 成功回應模型
class SuccessResponse(BaseModel):
    ok: bool
