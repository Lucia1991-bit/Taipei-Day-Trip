import mysql.connector
from fastapi import *
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from typing import Annotated, Optional, Union
from data.database import get_db
from data.data_query import get_mrt_name, get_attraction_data_by_id, check_attraction_id, get_attraction_data_by_page_and_keyword
from auth.validation import is_valid_keyword
from model.model import *


app = FastAPI()

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
# 因為FastAPI在進入函數前會自動驗證參數，如果沒通過驗證就會拋出錯誤，導致catch不到驗證錯誤(無法使用自定義格式)
# 在JSONResponse時套用BaseModel時要先轉換成字典(.dict())，才能順利被轉換成json
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=400,
        content=ErrorResponse(error=True, message="輸入格式無效，請按照指定格式輸入").dict()
    )


# 獲取不同分頁的景點資料，並可根據關鍵字、或捷運名稱篩選
# 頁碼預設為 0
@app.get("/api/attractions")
async def get_attraction_by_page_and_keyword(request: Request, db: db_depend, page: int = Query(0, description="分頁頁碼，從0開始", ge=0), keyword: str = Query(None, description="搜尋關鍵字")) -> Union[AttractionPageResponse, ErrorResponse]:
    try:
        # 驗證和過濾關鍵字參數(避免SQL injection並減少無效查詢)
        if not is_valid_keyword(keyword):
            raise ValueError("無效的關鍵字")

        # 每個分頁顯示12筆資料
        page_size = 12

        # 景點資料查詢
        attractions = get_attraction_data_by_page_and_keyword(
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
    finally:
        # 將連接歸還到連接池
        db.close()
        print("連接已歸還到連接池")


# 依據景點id獲取景點資料
@app.get("/api/attraction/{attractionID}")
async def get_attraction_by_id(request: Request, db: db_depend, attractionID: int = Path(..., description='景點編號，必須是大於0的整數', ge=1)) -> Union[AttractionResponse, ErrorResponse]:
    try:
        # 檢查景點id是否存在，如果不存在，回報錯誤(減少之後的無效查詢)
        if check_attraction_id(attractionID) is None:
            return JSONResponse(content=ErrorResponse(error=True, message="查無指定的景點資料").dict(), status_code=400)

        # 以 id獲取 attraction資料
        attraction_data = get_attraction_data_by_id(attractionID)

        if attraction_data is None:
            return JSONResponse(content=ErrorResponse(error=True, message="查無指定的景點資料").dict(), status_code=400)

        else:
            return AttractionResponse(data=attraction_data)

    except Exception as e:
        return JSONResponse(content=ErrorResponse(error=True, message=str(f"伺服器發生錯誤：{e}")).dict(), status_code=500)
    finally:
        # 將連接歸還到連接池
        db.close()
        print("連接已歸還到連接池")


# 獲取捷運站名列表
@ app.get("/api/mrts")
async def get_mrt(request: Request, db: db_depend) -> Union[MRTData, ErrorResponse]:
    try:
        mrt_data = get_mrt_name()
        return MRTData(data=mrt_data)

    except Exception as e:
        return JSONResponse(content=ErrorResponse(error=True, message=str(f"伺服器發生錯誤：{e}")).dict(), status_code=500)
    finally:
        # 將連接歸還到連接池
        db.close()
        print("連接已歸還到連接池")
