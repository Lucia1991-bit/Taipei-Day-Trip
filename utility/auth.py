from fastapi import Depends, HTTPException
from passlib.context import CryptContext
from fastapi.security import HTTPBearer
from jose import jwt
from dotenv import load_dotenv
import os

from schema.user import UserData

load_dotenv()

# 定義 JWT 相關的設置
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_DAYS = 7

# 建立 CryptContext 物件
# 處理加密/解密相關
bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 建立 JWTBearer 物件
# 從請求 Header驗證 JWT token
jwt_bearer = HTTPBearer()


# 驗證 token，驗證成功後從資料庫取得 user資訊
# 格式為 "Authorization" : "Bearer token"
async def verify_token_to_get_user(token: str = Depends(jwt_bearer)):
    credential_exception = HTTPException(status_code=403, detail="無效的Token", headers={
        "WWW-Authenticate": "Bearer"})
    try:
        # decode token 後驗證 token
        payload = jwt.decode(token.credentials, SECRET_KEY,
                             algorithms=[ALGORITHM])
        user = UserData(id=payload["user_id"],
                        name=payload["name"], email=payload["sub"])
        return user
    except:
        return None
