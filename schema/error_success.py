from pydantic import BaseModel
from typing import Optional


# 錯誤回應模型
class ErrorResponse(BaseModel):
    error: bool
    message: Optional[str] = None


# 成功回應模型
class SuccessResponse(BaseModel):
    ok: bool
