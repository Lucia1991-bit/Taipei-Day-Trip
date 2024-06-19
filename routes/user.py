from fastapi import APIRouter, Request, Body, Depends, HTTPException
from fastapi.responses import JSONResponse
from jose import jwt, JWTError, ExpiredSignatureError
from typing import Union
from model.user import UserModel
from schema.user import *
from schema.error_success import *
from utility.auth import *

router = APIRouter()


#################################################################


# 驗證 token，驗證成功後從資料庫取得 user資訊
# 格式為 "Authorization" : "Bearer token"
async def verify_token(token: str = Depends(jwt_bearer)):
    credential_exception = HTTPException(status_code=401, detail="無效的Token", headers={
        "WWW-Authenticate": "Bearer"})
    try:
        # decode token 後驗證 token
        payload = jwt.decode(token.credentials, secret_key,
                             algorithms=[algorithm])

        email = payload.get("sub")

        # 檢查payload裡的資訊
        if email is None:
            raise credential_exception

        # 從資料庫獲取使用者資訊
        user = UserModel.get_user_by_email(email)

        if user is None:
            raise credential_exception
        return user

    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token已經過期")
    except JWTError:
        raise credential_exception


#########################################################


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
            return JSONResponse(content=ErrorResponse(error=True, message="這個電子信箱已被註冊").dict(), status_code=400)

        # 若沒被註冊過，將註冊會員資料加入資料庫
        UserModel.add_new_member(name, email, password)

        return SuccessResponse(ok=True)

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
            return JSONResponse(content=ErrorResponse(error=True, message="無效的電子信箱").dict(), status_code=400)

        # 如果密碼驗證錯誤，回報錯誤
        if not UserModel.verify_password(password, auth_user["password"]):
            return JSONResponse(content=ErrorResponse(error=True, message="密碼輸入錯誤").dict(), status_code=400)

        # 驗證成功，生成 token，在 payload放進使用者信箱及id
        access_token = UserModel.create_access_token(
            data={"sub": auth_user["email"], "user_id": auth_user["id"], "name": auth_user["name"]})

        return TokenResponse(token=access_token)

    except Exception as e:
        return JSONResponse(content=ErrorResponse(error=True, message=str(f"伺服器發生錯誤：{e}")).dict(), status_code=500)


# 檢查 JWT token，獲取當前登入的會員資訊
@router.get("/api/user/auth")
async def get_user_data(user: dict = Depends(verify_token)) -> Union[UserDataResponse, ErrorResponse]:
    try:
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
