from datetime import date
from utility.database import execute_query


class BookingModel:
    # 獲取尚未下單的預定行程
    # 選取 order_id 為 null 代表還沒成立訂單，並免重複下訂
    def get_booking_data(user_id: int):
        sql = """
        SELECT 
          b.id AS booking_id, 
          b.date AS date, 
          b.time, 
          b.price,
          a.id AS attraction_id, 
          a.name AS name, 
          a.address AS address, 
          SUBSTRING_INDEX(a.images, ",", 1) AS image
        FROM 
          booking b
        JOIN 
          attraction_view a ON b.attraction_id = a.id
        WHERE 
          b.member_id = %s AND b.order_id is NULL 
        ORDER BY 
          b.date DESC, b.time ASC;
        """

        values = (user_id, )
        results = execute_query(sql, values, fetch_method="fetchall")

        if len(results) == 0:
            return None

        print("以使用者id獲取booking資料成功")
        return results

    # 檢查資料庫中的行程
    def check_booking(user_id: int, booking_id: int = None, date: date = None, time: str = None):
        if booking_id:
            # 檢查特定預訂是否存在且屬於當前用戶
            print("檢查特定預訂是否存在且屬於當前用戶")
            sql = "SELECT id FROM booking WHERE id = %s AND member_id = %s"
            values = (booking_id, user_id)
        else:
            # 檢查是否有時間衝突的預訂
            print("檢查是否有時間衝突的預訂")
            sql = "SELECT id FROM booking WHERE member_id = %s AND date = %s AND time = %s"
            values = (user_id, date, time)

        result = execute_query(sql, values)
        return result

    # 新增新預定行程
    def add_new_booking(user_id: int, attraction_id: int, date: date, time: str, price: int):
        sql = """
        INSERT INTO booking(member_id, attraction_id, date, time, price)
        VALUES(%s, %s, %s, %s, %s)
        """
        values = (user_id, attraction_id, date, time, price)
        return execute_query(sql, values)

    # 刪除預定行程
    def delete_booking_data(booking_id: int):
        sql = """
        DELETE FROM booking WHERE id = %s
        """
        values = (booking_id,)
        return execute_query(sql, values)

    # 將確定的行程加入 order_id 與 orders資料表關聯
    def add_order_id_into_booking_table(
            user_id, booking_ids, order_id):

        # 用 IN 子句處理複數 booking_id的複數查詢
        # 佔位符數量必須跟 booking_ids相同
        #  "%s, %s, %s"   <--   ["%s", "%s", "%s"]
        placeholder = ",".join(["%s"] * len(booking_ids))

        sql = f"""
        UPDATE booking
        SET order_id = %s
        WHERE id IN ({placeholder}) AND member_id = %s AND order_id IS NULL
        """
        # 將列表轉換成字串後再合併為以逗號分開的字串組
        values = (order_id,) + tuple(booking_ids) + (user_id,)

        print("在booking資料表更新order_id")
        return execute_query(sql, values)
