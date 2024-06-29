from fastapi import APIRouter, Request, Path, Query
from fastapi.responses import JSONResponse
from typing import Union
from model.attraction import AttractionModel
from schema.attraction import *
from schema.error_success import *

router = APIRouter()


@router.get("/api/attractions")
async def get_attraction_by_page_and_keyword(request: Request, page: int = Query(0, description="分頁頁碼，從0開始", ge=0), keyword: str = Query(None, description="搜尋關鍵字")) -> Union[AttractionPageResponse, ErrorResponse]:
    try:
        # 驗證和過濾關鍵字參數(避免SQL injection並減少無效查詢)
        if not AttractionModel.is_valid_keyword(keyword):
            raise ValueError("無效的關鍵字")

        # 每個分頁顯示12筆資料(多取一筆為了檢查頁碼)
        page_size = 12

        # 景點資料查詢
        attractions = AttractionModel.get_attraction_data_by_page_and_keyword(
            page, keyword, page_size)

        # 如果沒有結果，回應錯誤
        if attractions is None:
            return JSONResponse(content=ErrorResponse(error=True, message="查無指定的景點資料").dict(), status_code=400)

        else:
            # 計算顯示在頁面的下一頁頁碼
            # 一次查13筆資料，如果資料列表長度 > 12，就能確定會有下一頁
            next_page = page + 1 if len(attractions) == 13 else None

            attractions_of_page_size = []
            # 因為查了13筆，要把最後一筆除掉
            if len(attractions) == 13:
                attractions_of_page_size = attractions[:12]

            else:
                attractions_of_page_size = attractions

            return AttractionPageResponse(nextPage=next_page, data=attractions_of_page_size)

    except ValueError as e:
        return JSONResponse(content=ErrorResponse(error=True, message=str(e)).dict(), status_code=400)
    except Exception as e:
        return JSONResponse(content=ErrorResponse(error=True, message=str(f"伺服器發生錯誤：{e}")).dict(), status_code=500)


@router.get("/api/attraction/{attraction_id}")
async def get_attraction_by_id(request: Request, attraction_id: int = Path(..., description="景點編號，必須是大於0的整數", ge=1)) -> Union[AttractionResponse, ErrorResponse]:
    try:
        # 檢查景點 id是否存在資料
        data = AttractionModel.check_attraction_id(attraction_id)

        if not data:
            return JSONResponse(content=ErrorResponse(error=True, message="查無指定的景點資料").dict(), status_code=400)

        else:
            # 以正確的 id獲取 attraction資料
            attraction_data = AttractionModel.get_attraction_data_by_id(
                attraction_id)
            return AttractionResponse(data=attraction_data)

    except Exception as e:
        return JSONResponse(content=ErrorResponse(error=True, message=str(f"伺服器發生錯誤：{e}")).dict(), status_code=500)
