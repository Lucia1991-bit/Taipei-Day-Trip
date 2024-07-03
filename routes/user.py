from fastapi import APIRouter, Request, Body, Depends, HTTPException
from fastapi.responses import JSONResponse
from jose import jwt, JWTError, ExpiredSignatureError
from typing import Union
from model.user import UserModel
from schema.user import *
from schema.error_success import *
from utility.auth import *
from utility.auth import verify_token_to_get_user

router = APIRouter()


# 註冊新會員
@router.post("/api/user")
async def register_user(request: Request, register_input: SignUpRequest = Body(...)) -> Union[SuccessResponse, ErrorResponse]:
    name = register_input.name
    email = register_input.email
    password = register_input.password

    # 驗證 password 是否符合規範
    # if not is_valid_password(password):
    #     raise ValueError("無效的密碼格式")

    # 從資料庫檢查信箱是否被註冊過
    try:
        if UserModel.get_user_by_email(email):
            raise ValueError("這個電子信箱已被註冊")

        # 若沒被註冊過，將註冊會員資料加入資料庫
        result = UserModel.add_new_member(name, email, password)

        if result["affected_rows"] > 0:
            return SuccessResponse(ok=True)

        else:
            return JSONResponse(content=ErrorResponse(error=True, message="註冊失敗，請稍後再試").dict(), status_code=500)

    except ValueError as e:
        return JSONResponse(content=ErrorResponse(error=True, message=str(e)).dict(), status_code=400)
    except Exception as e:
        return JSONResponse(content=ErrorResponse(error=True, message=str(f"伺服器發生錯誤：{e}")).dict(), status_code=500)


# 會員登入
@router.put("/api/user/auth")
async def login_for_access_token(request: Request, login_input: LogInRequest = Body(...)) -> Union[TokenResponse, ErrorResponse]:
    email = login_input.email
    password = login_input.password

    try:
        # 檢查資料庫是否有註冊該使用者
        auth_user = UserModel.get_user_by_email(email)

        # 如果該信箱沒有註冊，回報錯誤
        if not auth_user:
            raise ValueError("無效的電子信箱")

        # 如果密碼驗證錯誤，回報錯誤
        if not UserModel.verify_password(password, auth_user["password"]):
            raise ValueError("密碼輸入錯誤")

        # 驗證成功，生成 token，在 payload放進使用者信箱及id
        access_token = UserModel.create_access_token(
            data={"sub": auth_user["email"], "user_id": auth_user["id"], "name": auth_user["name"]})

        return TokenResponse(token=access_token)

    except ValueError as e:
        return JSONResponse(content=ErrorResponse(error=True, message=str(e)).dict(), status_code=400)
    except Exception as e:
        return JSONResponse(content=ErrorResponse(error=True, message=str(f"伺服器發生錯誤：{e}")).dict(), status_code=500)


# 檢查 JWT token，獲取當前登入的會員資訊
@router.get("/api/user/auth")
async def get_user_data(user: dict = Depends(verify_token_to_get_user)) -> Union[UserDataResponse, ErrorResponse]:
    try:
        return UserDataResponse(data=user)

    except HTTPException as e:
        return JSONResponse(content=ErrorResponse(error=True, message=e.detail).dict(), status_code=e.status_code)
    except Exception as e:
        return JSONResponse(content=ErrorResponse(error=True, message=str(f"伺服器發生錯誤：{e}")).dict(), status_code=500)
