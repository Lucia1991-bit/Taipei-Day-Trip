from fastapi import *
from fastapi.responses import FileResponse, JSONResponse
from fastapi.exceptions import RequestValidationError
from typing import Union
from routes import attraction, mrt, user, booking, order
from schema.error_success import *
from fastapi.staticfiles import StaticFiles


app = FastAPI()

# 設置路由
app.include_router(attraction.router, tags=["Attraction"])
app.include_router(mrt.router, tags=["MRT Station"])
app.include_router(user.router, tags=["User"])
app.include_router(booking.router, tags=["Booking"])
app.include_router(order.router, tags=["Order"])


# 渲染靜態檔
app.mount("/static", StaticFiles(directory="static", html=True), name="static")


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
# 直接將RequestValidationError錯誤處理套用自己的格式
# 在JSONResponse時套用BaseModel時要先轉換成字典(.dict())，才能順利被轉換成json
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content=ErrorResponse(
            error=True, message="輸入格式無效，請按照指定格式輸入", detail=exc.errors()).dict()
    )


# 自定義 HTTP Exception錯誤
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    if exc.status_code == 401:
        return JSONResponse(
            status_code=401,
            content={"error": True, "message": "請先登入系統，才能操作此項功能"}
        )
    elif exc.status_code == 403:
        return JSONResponse(
            status_code=403,
            content={"error": True, "message": "您沒有權限操作此項功能"}
        )
    # 所有其他的HTTP異常
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": True, "message": str(exc.detail)},
    )
