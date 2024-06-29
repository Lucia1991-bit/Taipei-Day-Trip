from utility.auth import *
from utility.database import execute_query
from jose import jwt
from datetime import timedelta, datetime


class UserModel:
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
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        # 如果沒有，使用預設時數與現在時間計算出過期時數
        else:
            expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)

        # 將過期時數更新進用戶資訊中
        to_encode.update({"exp": expire})

        # 將用戶資訊與密鑰、使用的加密演算法一起生成token
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
