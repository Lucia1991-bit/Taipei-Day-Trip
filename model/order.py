import random
from pydantic import EmailStr
from datetime import datetime
from utility.database import execute_query
from typing import Dict, Any
import json


class OrderModel:
    # 產生隨機訂單編號
    # 格式：ORD + YYYY + MMDD + HHMM + 3位隨機數
    def generate_order_number():
        now = datetime.now()

        # 格式化日期時間
        year = now.strftime("%Y")
        month = now.strftime("%m%d")
        time = now.strftime("%H%M")

        # 3位隨機數並轉成字串
        random_number = f"{random.randint(100, 999):03d}"

        # 組成訂單編號
        return f"ORD{year}{month}{time}{random_number}"

    # 新增訂單
    def add_new_order(order_number: str, user_id: int, total_price: int, contact_name: str, contact_email: EmailStr, contact_phone: str):
        sql = """
        INSERT INTO orders(order_number, member_id, total_price, contact_name, contact_email, contact_phone)
        VALUES(%s, %s, %s, %s, %s, %s)
        """
        values = (order_number, user_id, total_price,
                  contact_name, contact_email, contact_phone)

        print("新增訂單進orders資料表")
        return execute_query(sql, values)

    # 新增付款紀錄
    def add_new_payment(order_number: str, user_id: int, amount: int,
                        tappay_status: int, tappay_message: str, tappay_transaction_id: str, bank_transaction_id: str, card_info: Dict[str, Any], transaction_time: int):
        sql = """
        INSERT INTO payment(order_number, member_id, total_price,
                        tappay_status, tappay_message, tappay_transaction_id, bank_transaction_id, card_info, transaction_time)
        VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        # 將 card_info 轉換為json字符
        card_info_json = json.dumps(card_info)

        values = (order_number, user_id, amount,
                  tappay_status, tappay_message, tappay_transaction_id, bank_transaction_id, card_info_json, transaction_time)

        print("新增付款資料進payment資料表")
        return execute_query(sql, values)

    # 更新 order資料表的 status欄，由"待付款"改為"已付款"
    # 可以處理 “已付款” 或是 “取消”

    def update_order_status(status, order_number):
        if status == "已付款":
            sql = """
            UPDATE orders
            SET status = %s, paid_at = CURRENT_TIMESTAMP
            WHERE order_number = %s
            """
        else:
            sql = """
            UPDATE orders
            SET status = %s
            WHERE order_number = %s
            """
        values = (status, order_number)

        print(f"更新訂單 {order_number} 狀態為 {status}")

        result = execute_query(sql, values)

        if result is None:
            print("操作資料庫錯誤")

        return result
