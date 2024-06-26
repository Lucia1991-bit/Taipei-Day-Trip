from datetime import date
from utility.database import execute_query


class BookingModel:
    # 獲取尚未下單的預定行程
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
          b.member_id = %s
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
