import mysql.connector
from fastapi import *
from fastapi.responses import FileResponse, JSONResponse
from fastapi.exceptions import RequestValidationError
from typing import Annotated, Optional, Union
from data.database import get_db
from data.data_query import get_mrt_name, get_attraction_data_by_id, check_attraction_id, get_attraction_data_by_page_and_keyword
from model.model import *


app = FastAPI()

# Dependency: 獲取資料庫連接
db_depend = Annotated[mysql.connector.MySQLConnection, Depends(get_db)]


# Static Pages (Never Modify Code in this Block)
@app.get("/", include_in_schema=False)
async def index(request: Request):
    return FileResponse("./static/index.html", media_type="text/html")


@app.get("/attraction/{id}", include_in_schema=False)
async def attraction(request: Request, id: int):
    return FileResponse("./static/attraction.html", media_type="text/html")


@app.get("/booking", include_in_schema=False)
async def booking(request: Request):
    return FileResponse("./static/booking.html", media_type="text/html")


@app.get("/thankyou", include_in_schema=False)
async def thankyou(request: Request):
    return FileResponse("./static/thankyou.html", media_type="text/html")


# 自定義錯誤處理
# 因為FastAPI在進入函數前會自動驗證參數，如果沒通過驗證就會拋出錯誤，導致catch不到驗證錯誤
# 在JSONResponse時套用BaseModel時要先轉換成字典(.dict())，才能順利被轉換成json
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=400,
        content=ErrorResponse(error=True, message="輸入的格式不正確，請按照指定格式輸入").dict()
    )


# 獲取不同分頁的景點資料，並可根據關鍵字、或捷運名稱篩選
@app.get("/api/attractions")
async def get_attraction_by_page_and_keyword(request: Request, db: db_depend, page: int = Query(..., description="分頁頁碼，從0開始", ge=0), keyword: str = Query(None, description="搜尋關鍵字")) -> Union[AttractionPageResponse, ErrorResponse]:
    try:
        page_size = 12
        attractions, next_page, total_page = get_attraction_data_by_page_and_keyword(
            db, page, keyword, page_size)

        # 如果沒有結果
        if attractions is None:
            return JSONResponse(content=ErrorResponse(error=True, message="查無指定的景點資料").dict(), status_code=400)

        # 檢查輸入的page是否超過總頁數
        if page > total_page:
            return JSONResponse(content=ErrorResponse(error=True, message="頁碼超過範圍，查無資料").dict(), status_code=400)

        return AttractionPageResponse(nextPage=next_page, data=attractions)
    except Exception as e:
        return JSONResponse(content=ErrorResponse(error=True, message=str(e)).dict(), status_code=500)


# 依據景點id獲取景點資料
@app.get("/api/attraction/{attractionID}")
async def get_attraction_by_id(request: Request, db: db_depend, attractionID: int = Path(..., title='景點id', description='需要獲取的景點ID，必須是大於0的整數', ge=1)) -> Union[AttractionResponse, ErrorResponse]:
    try:
        # 檢查景點id是否存在，如果不存在，回報錯誤
        if check_attraction_id(attractionID) is None:
            return JSONResponse(content=ErrorResponse(error=True, message="此景點id不存在").dict(), status_code=400)

        attraction_data = get_attraction_data_by_id(attractionID, db)

        if attraction_data is None:
            return JSONResponse(content=ErrorResponse(error=True, message="查無指定的景點資料").dict(), status_code=400)

        return AttractionResponse(data=attraction_data)

    except Exception as e:
        return JSONResponse(content=ErrorResponse(error=True, message=str(f"伺服器發生錯誤：{e}")).dict(), status_code=500)


# 獲取捷運站名列表
@ app.get("/api/mrts")
async def get_mrt(request: Request, db: db_depend) -> Union[MRTData, ErrorResponse]:
    try:
        mrt_data = get_mrt_name(db)
        return MRTData(data=mrt_data)
    except Exception as e:
        # 處理 FastAPI 引發的 HTTPException
        if isinstance(e, HTTPException):
            return ErrorResponse(error=True, message=str(e.detail), status_code=e.status_code)
        # 處理其他未預期的異常
        else:
            return JSONResponse(content=ErrorResponse(error=True, message=str(f"伺服器發生錯誤：{e}")).dict(), status_code=500)
