from .database import db
import mysql.connector
import json


# #檢查景點id是否存在
def check_attraction_id(attractionID):
    try:
        with db.cursor(dictionary=True) as cursor:
            sql = "SELECT * FROM attraction WHERE id = %s"
            cursor.execute(sql, (attractionID,))
            result = cursor.fetchone()
            return result
    except mysql.connector.Error as e:
        print(f"發生 SQL 錯誤: {e}")
    except Exception as e:
        print("查詢資料時發生其他錯誤")
        raise e
    finally:
        # 將連接歸還到連接池
        db.close()
        print("連接已歸還到連接池")


# 獲取不同分頁的景點資料，並可根據關鍵字、或捷運名稱篩選
def get_attraction_data_by_page_and_keyword(db, page, keyword, page_size):
    try:
        with db.cursor(dictionary=True) as cursor:

            sql_keyword = """
            SELECT
              a.id,
              a.name,
              c.name AS category,
              a.description,
              a.address,
              a.transport,
              m.name AS mrt,
              a.lat,
              a.lng,
              JSON_ARRAYAGG(i.url) AS images
            FROM attraction a
            JOIN category c ON c.id = a.category_id
            JOIN mrt m ON m.id = a.mrt_id
            JOIN image i ON i.attraction_id = a.id
            WHERE( %s IS NULL OR m.name = %s OR a.name LIKE %s )
            GROUP BY a.id
            LIMIT %s OFFSET %s;
            """
            cursor.execute(sql_keyword, (keyword, keyword, f"%{
                keyword}%", page_size, page * page_size,))
            results = cursor.fetchall()
            print(results)

            # 獲取總頁數
            sql_page = """
            SELECT CEIL(COUNT(*) / %s) AS total_page
            FROM attraction a
            JOIN mrt m ON m.id = a.mrt_id
            WHERE ( %s IS NULL OR m.name = %s OR a.name LIKE %s)
            """
            cursor.execute(
                sql_page, (page_size, keyword, keyword, f"%{keyword}%"))

            # 回傳資料類型是decimal
            total_page = int(cursor.fetchone()["total_page"])
            print(total_page)

            # 如果沒有找到符合結果，回傳 None (fetchall()會回傳空列表)
            if len(results) == 0:
                return None, None, total_page

            # 因為圖片列表是json格式，回傳前要先處理
            for result in results:
                img_list = json.loads(result["images"])  # 因為圖片列表是json格式
                result["images"] = img_list

            # 顯示下一頁頁碼
            next_page = page + 1 if page + 1 < total_page else None
            print("以關鍵字獲取景點資料成功")

            return results, next_page, total_page

    except mysql.connector.Error as e:
        print(f"發生 SQL 錯誤: {e}")
    except Exception as e:
        print("查詢資料時發生其他錯誤")
        raise e
    finally:
        # 將連接歸還到連接池
        db.close()
        print("連接已歸還到連接池")


# 依據景點id獲取景點資料
def get_attraction_data_by_id(attractionID, db):
    try:
        with db.cursor(dictionary=True) as cursor:
            sql = """
              SELECT
              a.id,
              a.name,
              c.name AS category,
              a.description,
              a.address,
              a.transport,
              mrt.name AS mrt,
              a.lat,
              a.lng,
              JSON_ARRAYAGG(i.url) AS images
              FROM attraction a
              JOIN mrt ON mrt.id = a.mrt_id
              JOIN category c ON c.id = a.category_id
              JOIN image i ON i.attraction_id = a.id
              WHERE a.id = %s;
              """
            cursor.execute(sql, (attractionID,))
            results = cursor.fetchone()  # results是dict

            # 沒有符合的資料回傳 None
            if results is None:
                return None
            # 因為圖片是josn格式，回傳前要先處理
            else:
                img_list = json.loads(results["images"])  # 因為圖片列表是json格式
                results["images"] = img_list
                print("以景點id獲取景點資料成功")
                return results

    except mysql.connector.Error as e:
        print(f"發生 SQL 錯誤: {e}")
    except Exception as e:
        print("查詢資料時發生其他錯誤")
        raise e
    finally:
        # 將連接歸還到連接池
        db.close()
        print("連接已歸還到連接池")


# 獲取捷運站名資料，並按照周邊景點數量排列
def get_mrt_name(db):
    try:
        with db.cursor(dictionary=True) as cursor:
            sql = """
            SELECT mrt.name FROM mrt
            JOIN attraction at ON mrt.id = at.mrt_id
            GROUP BY mrt.name
            ORDER BY COUNT(at.name) DESC;
            """
            cursor.execute(sql)
            results = cursor.fetchall()
            data = [result["name"] for result in results]
            print("查詢捷運站資料成功")

            return data

    except mysql.connector.Error as e:
        print(f"發生 SQL 錯誤: {e}")
    except Exception as e:
        print("查詢資料時發生其他錯誤")
        raise e
    finally:
        # 將連接歸還到連接池
        db.close()
        print("連接已歸還到連接池")
