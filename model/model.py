from pydantic import BaseModel, Field
from typing import Optional, Union, List


# 捷運站名模型
class MRTData(BaseModel):
    data: List[str]


# 錯誤回應模型
class ErrorResponse(BaseModel):
    error: bool
    message: Optional[str] = None
