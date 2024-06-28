from math import ceil
import re
from utility.database import execute_query


class AttractionModel:
    # 檢查景點 keyword格式
    def is_valid_keyword(keyword):
        if keyword is None:
            return True
        # 定義允許的字符pattern(數字英文中文)
        # 特別為其中一個“台北101／世貿”捷運站，允許條件加入全型斜線及空白
        allowed_pattern = r"^[a-zA-Z0-9\u4e00-\u9fa5/／\s]+$"
        # 如果符合條件，return True，不符合 False
        return re.match(allowed_pattern, keyword)


##############################################################

    # 獲取不同分頁的景點資料，並可根據關鍵字、或捷運名稱篩選
    # === JOIN捷運站列表必須用 LEFT JOIN，不然捷運站為null的景點會被忽略
    # 創建一個 view 先把需要的 attraction 資料合併起來


    def get_attraction_data_by_page_and_keyword(page: int, keyword: str, page_size: int):
        sql_base = "SELECT * FROM taipei_day_trip.attraction_view"
        # 如果未提供關鍵字，獲取所有景點資料
        # 一次查13筆資料，如果資料列表長度 > 12，就能確定會有下一頁
        # offset還是12
        if keyword == None:
            condition = ""
            values = (page_size + 1, page * page_size)
        # 如果提供關鍵字，加上條件
        else:
            condition = "WHERE( mrt = %s OR name LIKE %s )"
            values = (keyword, f"%{keyword}%", page_size + 1, page * page_size)
        group_by = "GROUP BY id"
        limit_offset = "LIMIT %s OFFSET %s"
        query = f"{sql_base} {condition} {group_by} {limit_offset}"
        results = execute_query(query, values, fetch_method="fetchall")
        # 如果沒有找到符合關鍵字的景點資料，回傳 None (fetchall()會回傳空列表)
        if len(results) == 0:
            return None

        # 因為圖片列表是字串格式，回傳前要先處理
        else:
            for result in results:
                img_list = result["images"].split(",")
                result["images"] = img_list

        print("以關鍵字獲取景點資料成功")

        return results
    ############################################################

    # 檢查景點id是否存在

    def check_attraction_id(attractionID):
        print("查詢景點id是否存在")
        query = "SELECT * FROM attraction WHERE id = %s"
        values = (attractionID,)
        return execute_query(query, values)

    ############################################################
    # 依據景點id獲取景點資料

    def get_attraction_data_by_id(attractionID):
        # SQL的 group_concat參數長度預設值很小(1024)，圖片網址很長，因此必須重新設定他的 max_len
        sql = """
        SELECT * FROM taipei_day_trip.attraction_view
        WHERE id = %s;
      """
        values = (attractionID,)
        results = execute_query(sql, values, fetch_method="fetchone")
        # 沒有符合的資料回傳 None
        # 資料庫找不到符合景點id時會回傳{id: None, name: None...}的字典
        if results["id"] is None:
            return None
        else:
            # 因為圖片列表是字串格式，回傳前要先處理
            img_list = results["images"].split(",")
            results["images"] = img_list

            return results
