from fastapi import APIRouter, Request
from typing import Union
from model.mrt import MRTModel
from schema.mrt import *
from schema.error_success import *

router = APIRouter()


# 獲取捷運站名列表
@router.get("/api/mrts")
async def get_mrt(request: Request) -> Union[MRTData, ErrorResponse]:
    try:
        mrt_data = MRTModel.get_mrt_name()
        return MRTData(data=mrt_data)
    except Exception as e:
        return ErrorResponse(error=True, message=str(f"伺服器發生錯誤：{e}"))
