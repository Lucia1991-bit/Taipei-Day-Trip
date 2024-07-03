import mysql.connector
from mysql.connector.pooling import MySQLConnectionPool
import json
from dotenv import load_dotenv
import os
import traceback
from contextlib import contextmanager

load_dotenv()

# 資料庫連接設定
database_config = {
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": "localhost",
    "database": "taipei_day_trip",
    "charset": "utf8mb4"
}

# 資料庫連接設定
pool = MySQLConnectionPool(
    pool_name="my_pool",
    pool_size=20,
    connection_timeout=600,  # 單位為秒
    ** database_config
)


# 連接資料庫
# 用 contextmanager管理連接的獲取和釋放
@contextmanager
def get_db():
    # 初始化資料庫
    db = None
    try:
        db = pool.get_connection()
        if db.is_connected():
            print("資料庫連接成功")
            yield db
    except Exception as e:
        print(f"資料庫連接失敗: {e}")
        # 追蹤錯誤
        traceback.print_exc()
        raise e
    finally:
        if db and db.is_connected():
            db.close()
            print("資料庫操作結束，連接已歸還到連接池")


# 進行資料庫操作
def execute_query(query, values=None, fetch_method="fetchone"):
    with get_db() as db:
        try:
            with db.cursor(dictionary=True) as cursor:
                if values:
                    cursor.execute(query, values)
                else:
                    cursor.execute(query)

                # 判斷查詢類型
                query_type = query.lstrip().upper().split()[0]

                # 查詢操作
                if query_type == "SELECT":
                    # 可控制cursor.fetchone()或者cursor.fetchall()
                    fetch_function = getattr(cursor, fetch_method)
                    result = fetch_function()
                    return result
                else:
                    # 插入、更新或刪除操作
                    db.commit()
                    affected_rows = cursor.rowcount
                    last_id = cursor.lastrowid if query_type == "INSERT" else None

                    print(f"{query_type} 操作，影響的行數：{affected_rows}")

                    return {
                        "affected_rows": affected_rows,
                        "last_inserted_id": last_id
                    }

        except mysql.connector.Error as e:
            # 如果操作失敗，回到操作前的狀態
            db.rollback()
            print(f"操作資料庫時發生 SQL 錯誤: {e}")

        except Exception as e:
            # 如果操作失敗，回到操作前的狀態
            db.rollback()
            print("操作資料庫時發生其他錯誤")
