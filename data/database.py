import mysql.connector
from mysql.connector.pooling import MySQLConnectionPool
from fastapi import Depends
from typing import Annotated
import json
from dotenv import load_dotenv
import os

load_dotenv()

# 資料庫連接設定
# .env通常儲存key=value pair，如果想儲存整個字典需先轉換成字串
database_config_str = os.getenv("DATABASE_CONFIG")
database_config = json.loads(database_config_str)

# 資料庫連接設定
pool = MySQLConnectionPool(
    pool_name="my_pool",
    pool_size=5,
    ** database_config
)


# 連接資料庫
def get_db():
    try:
        db = pool.get_connection()
        if db.is_connected():
            print("資料庫連接成功")
            return db
    except Exception as e:
        print(f"資料庫連接失敗: {e}")
        raise e


db = get_db()

# Dependency: 獲取資料庫連接
db_depend = Annotated[mysql.connector.MySQLConnection, Depends(get_db)]


def test(db):
    try:
        with db.cursor() as cursor:
            sql = "SELECT * FROM attraction"
            cursor.execute(sql)
            result = cursor.fetchone()
            print("查詢資料成功")
            return result
    except Exception as e:
        raise e


if __name__ == "__main__":
    test(get_db())
