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
    pool_size=10,
    connection_timeout=1800,  # 單位為秒,1800秒 = 30分鐘
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


# # Dependency: 獲取資料庫連接
# db_depend = Annotated[mysql.connector.MySQLConnection, Depends(get_db)]


def execute_query(query, values=None, fetch_method="fetchall"):
    try:
        with db.cursor(dictionary=True) as cursor:
            if values:
                cursor.execute(query, values)
            else:
                cursor.execute(query)

            # 可控制cursor.fetchone()或者cursor.fetchall()
            fetch_function = getattr(cursor, fetch_method)
            result = fetch_function()

            if not query.lstrip().upper().startswith("SELECT"):
                db.commit()

        return result

    except mysql.connector.Error as e:
        print(f"發生 SQL 錯誤: {e}")
    except Exception as e:
        print("查詢資料時發生其他錯誤")
        raise e
