from .database import execute_query
import mysql.connector
import json


# #檢查景點id是否存在
# 這個指令結束後不能關資料庫，因為接著會繼續獲取資料
def check_attraction_id(attractionID):
    query = "SELECT * FROM attraction WHERE id = %s"
    values = (attractionID,)
    return execute_query(query, values)


# 獲取不同分頁的景點資料，並可根據關鍵字、或捷運名稱篩選
def get_attraction_data_by_page_and_keyword(page, keyword, page_size):

    sql_base = """
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
    """

    # 如果未提供關鍵字，獲取所有景點資料
    if keyword == None:
        condition = ""
        values = (page_size, page * page_size)

    # 如果提供關鍵字，加上條件
    else:
        condition = "WHERE( m.name = %s OR a.name LIKE %s )"
        values = (keyword, f"%{keyword}%", page_size, page * page_size)

    group_by = "GROUP BY a.id"
    limit_offset = "LIMIT %s OFFSET %s"

    query = f"{sql_base} {condition} {group_by} {limit_offset}"

    results = execute_query(query, values, fetch_method="fetchall")

    # 如果沒有找到符合關鍵字的景點資料，回傳 None (fetchall()會回傳空列表)
    if len(results) == 0:
        return None

    # 因為圖片列表是json格式，回傳前要先處理
    for result in results:
        img_list = json.loads(result["images"])
        result["images"] = img_list

    return results


# 獲得景點資料的總頁數
def get_total_page(keyword, page, page_size):
  # 獲取總頁數
    sql_page = """
    SELECT CEIL(COUNT(*) / %s) AS total_page
    FROM attraction a
    JOIN mrt m ON m.id = a.mrt_id
    """

    if keyword == None:
        condition = ""
        values = (page_size,)

    else:
        condition = "WHERE ( m.name = %s OR a.name LIKE %s)"
        values = (page_size, keyword, f"%{keyword}%")

    query = f"{sql_page} {condition}"

    page_result = execute_query(query, values, fetch_method="fetchone")

    # 回傳資料類型是decimal
    total_page = int(page_result["total_page"])

    # 顯示下一頁頁碼
    next_page = page + 1 if page + 1 < total_page else None
    print("以關鍵字獲取景點資料成功")
    return next_page, total_page


# 依據景點id獲取景點資料
def get_attraction_data_by_id(attractionID):
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
    values = (attractionID,)
    results = execute_query(sql, values, fetch_method="fetchone")

    # 沒有符合的資料回傳 None
    if results is None:
        return None

    # 因為圖片是json格式，回傳前要先處理
    else:
        img_list = json.loads(results["images"])
        results["images"] = img_list
        print("以景點id獲取景點資料成功")
        return results


# 獲取捷運站名資料，並按照周邊景點數量排列
def get_mrt_name():
    sql = """
    SELECT mrt.name FROM mrt
    JOIN attraction at ON mrt.id = at.mrt_id
    GROUP BY mrt.name
    ORDER BY COUNT(at.name) DESC;
    """
    values = None
    results = execute_query(sql, values, fetch_method="fetchall")

    data = [result["name"] for result in results]
    print("查詢捷運站資料成功")
    return data
