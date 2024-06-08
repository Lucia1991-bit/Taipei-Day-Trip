
from .database import execute_query
from math import ceil
import json


# #檢查景點id是否存在
# 這個指令結束後不能關資料庫，因為接著會繼續獲取資料
def check_attraction_id(attractionID):
    query = "SELECT * FROM attraction WHERE id = %s"
    values = (attractionID,)
    return execute_query(query, values)


# 獲取不同分頁的景點資料，並可根據關鍵字、或捷運名稱篩選
# === JOIN捷運站列表必須用 LEFT JOIN，不然捷運站為null的景點會被忽略
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
      GROUP_CONCAT(i.url ORDER BY i.id) AS images
    FROM attraction a
    JOIN category c ON c.id = a.category_id
    LEFT JOIN mrt m ON m.id = a.mrt_id  
    JOIN image i ON i.attraction_id = a.id
    """

    # 如果未提供關鍵字，獲取所有景點資料
    # 一次查13筆資料，如果資料列表長度 > 12，就能確定會有下一頁
    # offset還是12
    if keyword == None:
        condition = ""
        values = (page_size + 1, page * page_size)

    # 如果提供關鍵字，加上條件
    else:
        condition = "WHERE( m.name = %s OR a.name LIKE %s )"
        values = (keyword, f"%{keyword}%", page_size + 1, page * page_size)

    group_by = "GROUP BY a.id"
    limit_offset = "LIMIT %s OFFSET %s"

    query = f"{sql_base} {condition} {group_by} {limit_offset}"

    results = execute_query(query, values, fetch_method="fetchall")

    # 如果沒有找到符合關鍵字的景點資料，回傳 None (fetchall()會回傳空列表)
    if len(results) == 0:
        return None

    # 因為圖片列表是字串格式，回傳前要先處理
    for result in results:
        img_list = result["images"].split(",")
        result["images"] = img_list

    print("以關鍵字獲取景點資料成功")
    return results


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
      GROUP_CONCAT(i.url ORDER BY i.id) AS images
      FROM attraction a
      LEFT JOIN mrt ON mrt.id = a.mrt_id
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
        img_list = results["images"].split(",")
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
