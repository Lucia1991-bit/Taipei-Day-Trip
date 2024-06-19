import mysql.connector
from mysql.connector.pooling import MySQLConnectionPool
import json
from dotenv import load_dotenv
import os
import traceback
from contextlib import contextmanager

load_dotenv()

# 資料庫連接設定
# .env通常儲存key=value pair，如果想儲存整個字典需先轉換成字串
database_config_str = os.getenv("DATABASE_CONFIG")
database_config = json.loads(database_config_str)

# 資料庫連接設定
pool = MySQLConnectionPool(
    pool_name="my_pool",
    pool_size=20,
    connection_timeout=300,  # 單位為秒
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

                # 可控制cursor.fetchone()或者cursor.fetchall()
                fetch_function = getattr(cursor, fetch_method)
                result = fetch_function()

                # 如果 SQL語句開頭不是 SELECT，執行新增/刪除指令
                if not query.lstrip().upper().startswith("SELECT"):
                    db.commit()
                return result

        except mysql.connector.Error as e:
            # 如果操作失敗，回到操作前的狀態
            db.rollback()
            print(f"操作資料庫時發生 SQL 錯誤: {e}")

        except Exception as e:
            # 如果操作失敗，回到操作前的狀態
            db.rollback()
            print("操作資料庫時發生其他錯誤")
