from utility.database import execute_query


class MRTModel:
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
