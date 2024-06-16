from fastapi import Depends, HTTPException, status
from fastapi.responses import JSONResponse
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from datetime import timedelta, datetime
from dotenv import load_dotenv
import os
from model.model import *
from data.database import execute_query

load_dotenv()

# 定義 JWT 相關的設置
secret_key = os.getenv("SECRET_KEY")
algorithm = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_DAYS = 7


# 建立 CryptContext 物件
# 處理加密/解密相關
bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 建立 OAuth2PasswordBearer 物件
# 驗證請求 header 中的 token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/user/auth")


# 檢查信箱是否被註冊過
def get_user_by_email(email):
    sql = "SELECT * FROM member WHERE email = %s"
    values = (email,)
    results = execute_query(sql, values, fetch_method="fetchone")
    print("查詢信箱是否存在")
    return results


# 新增註冊會員資料進資料庫
def add_new_member(name, email, password):
    # 將密碼加密
    hashed_password = bcrypt_context.hash(password)
    sql = "INSERT INTO member (name, email, password) VALUES(%s, %s, %s)"
    values = (name, email, hashed_password)

    execute_query(sql, values)
    print("新增會員資料")
    return


# 驗證密碼
def verify_password(plain_password, hashed_password):
    return bcrypt_context.verify(plain_password, hashed_password)


# 生成 JWT token
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    # 如果有提供時數，使用那個時數與現在時間計算出過期時數
    # 如果沒有，使用預設時數與現在時間計算出過期時數
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    # 將過期時數更新進用戶資訊中
    # 將用戶資訊與密鑰、使用的加密演算法一起生成token
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
    return encoded_jwt


# 驗證 token，驗證成功後從資料庫取得 user資訊
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credential_exception = HTTPException(status_code=401, detail="無效的token", headers={
        "WWW-Authenticate": "Bearer"})
    try:
        # decode token
        payload = jwt.decode(token, secret_key, algorithms=[algorithm])
        email: str = payload.get("sub")

        if email is None:
            raise credential_exception
        else:
            user = get_user_by_email(email)
            return user

    except JWTError:
        raise credential_exception
