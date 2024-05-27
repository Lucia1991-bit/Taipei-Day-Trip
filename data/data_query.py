from .database import db


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
    except Exception as e:
        print("查詢資料時發生錯誤")
        raise e

    return data
