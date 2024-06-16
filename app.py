from fastapi import *
from fastapi.responses import FileResponse, JSONResponse
from fastapi.exceptions import RequestValidationError
from typing import Union
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, datetime
from data.data_query import get_mrt_name, get_attraction_data_by_id, get_attraction_data_by_page_and_keyword, check_attraction_id
from auth.validation import is_valid_keyword
from auth.auth import get_user_by_email, add_new_member, verify_password, create_access_token, get_current_user
from model.model import *
from fastapi.staticfiles import StaticFiles


app = FastAPI()


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
        status_code=400,
        content=ErrorResponse(error=True, message="輸入格式無效，請按照指定格式輸入").dict()
    )


# 自定義 401 未經授權錯誤處理
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    if exc.status_code == 401:
        return JSONResponse(
            status_code=401,
            headers={"WWW-Authenticate": "Bearer"},
            content={"error": True, "message": "無效的token", },
        )
    # 這是所有其他的HTTP異常
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": True, "message": str(exc.detail)},
    )


# 註冊新會員
@app.post("/api/user")
async def register_user(request: Request, register_input: SignUpRequest = Body(...)) -> Union[SuccessResponse, ErrorResponse]:
    name = register_input.name
    email = register_input.email
    password = register_input.password

    print(name)
    print(email)
    print(password)

    # 驗證 password 是否符合規範
    # if not is_valid_password(password):
    #     raise ValueError("無效的密碼格式")

    # 從資料庫檢查信箱是否被註冊過
    try:
        if get_user_by_email(email):
            return JSONResponse(content=ErrorResponse(error=True, message="該電子郵件地址已被註冊").dict(), status_code=400)

        # 若沒被註冊過，將註冊會員資料加入資料庫
        add_new_member(name, email, password)

        return SuccessResponse(ok=True)

    except ValueError as e:
        return JSONResponse(content=ErrorResponse(error=True, message=str(e)).dict(), status_code=400)
    except Exception as e:
        return JSONResponse(content=ErrorResponse(error=True, message=str(f"伺服器發生錯誤：{e}")).dict(), status_code=500)


# 會員登入
@app.put("/api/user/auth")
async def login_for_access_token(request: Request, login_input: SignInRequest = Body(...)) -> Union[TokenResponse, ErrorResponse]:
    email = login_input.email
    password = login_input.password
    try:
        # 檢查資料庫是否有註冊該使用者
        auth_user = get_user_by_email(email)

        error_message = "電子信箱或者密碼輸入錯誤"

        # 如果該信箱沒有註冊，回報錯誤
        if not auth_user:
            return JSONResponse(content=ErrorResponse(error=True, message=error_message).dict(), status_code=400)

        # 如果密碼驗證錯誤，回報錯誤
        if not verify_password(password, auth_user["password"]):
            return JSONResponse(content=ErrorResponse(error=True, message=error_message).dict(), status_code=400)

        # 驗證成功，生成 token，在 payload放進使用者信箱及id
        access_token = create_access_token(
            data={"sub": auth_user["email"], "id": auth_user["id"]})

        return TokenResponse(token=access_token)

    except Exception as e:
        return JSONResponse(content=ErrorResponse(error=True, message=str(f"伺服器發生錯誤：{e}")).dict(), status_code=500)


# 獲取當前登入的會員資訊
@app.get("/api/user/auth")
async def get_user_data(user: dict = Depends(get_current_user)) -> Union[UserDataResponse, ErrorResponse]:
    try:
        if user is None:
            return JSONResponse(content=ErrorResponse(error=True, message="查無該使用者").dict(), status_code=400)

        user = UserData(
            id=user.get("id"),
            name=user.get("name"),
            email=user.get("email")
        )

        return UserDataResponse(data=user)

    except HTTPException as e:
        return JSONResponse(content=ErrorResponse(error=True, message=e.detail).dict(), status_code=e.status_code)
    except Exception as e:
        return JSONResponse(content=ErrorResponse(error=True, message=str(f"伺服器發生錯誤：{e}")).dict(), status_code=500)


# 獲取不同分頁的景點資料，並可根據關鍵字、或捷運名稱篩選
# 頁碼預設為 0
@app.get("/api/attractions")
async def get_attraction_by_page_and_keyword(request: Request, page: int = Query(0, description="分頁頁碼，從0開始", ge=0), keyword: str = Query(None, description="搜尋關鍵字")) -> Union[AttractionPageResponse, ErrorResponse]:
    try:
        # 驗證和過濾關鍵字參數(避免SQL injection並減少無效查詢)
        if not is_valid_keyword(keyword):
            raise ValueError("無效的關鍵字")

        # 每個分頁顯示12筆資料(多取一筆為了檢查頁碼)
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

            # # 取得低解析度圖片
            # for attraction in attractions_of_page_size:
            #     low_res_image = get_first_low_res_image_by_attraction_id(
            #         attraction["id"])
            #     attraction["low_image"] = low_res_image

            return AttractionPageResponse(nextPage=next_page, data=attractions_of_page_size)

    except ValueError as e:
        return JSONResponse(content=ErrorResponse(error=True, message=str(e)).dict(), status_code=400)
    except Exception as e:
        return JSONResponse(content=ErrorResponse(error=True, message=str(f"伺服器發生錯誤：{e}")).dict(), status_code=500)


# 依據景點id獲取景點資料
@app.get("/api/attraction/{attractionID}")
async def get_attraction_by_id(request: Request, attractionID: int = Path(..., description='景點編號，必須是大於0的整數', ge=1)) -> Union[AttractionResponse, ErrorResponse]:
    try:
        # 先查 id 是否存在
        # 如果 id不存在，回報錯誤
        if not check_attraction_id(attractionID):
            return JSONResponse(content=ErrorResponse(error=True, message="查無指定的景點資料").dict(), status_code=400)

        else:
            # 以正確的 id獲取 attraction資料
            attraction_data = get_attraction_data_by_id(attractionID)
            return AttractionResponse(data=attraction_data)

    except Exception as e:
        return JSONResponse(content=ErrorResponse(error=True, message=str(f"伺服器發生錯誤：{e}")).dict(), status_code=500)


# 獲取捷運站名列表
@ app.get("/api/mrts")
async def get_mrt(request: Request) -> Union[MRTData, ErrorResponse]:
    try:
        mrt_data = get_mrt_name()
        return MRTData(data=mrt_data)

    except Exception as e:
        return JSONResponse(content=ErrorResponse(error=True, message=str(f"伺服器發生錯誤：{e}")).dict(), status_code=500)
