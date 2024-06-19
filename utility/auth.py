from passlib.context import CryptContext
from fastapi.security import HTTPBearer
from dotenv import load_dotenv
import os

load_dotenv()

# 定義 JWT 相關的設置
secret_key = os.getenv("SECRET_KEY")
algorithm = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_DAYS = 7

# 建立 CryptContext 物件
# 處理加密/解密相關
bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 建立 JWTBearer 物件
# 從請求 Header驗證 JWT token
jwt_bearer = HTTPBearer()
