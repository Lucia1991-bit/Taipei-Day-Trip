from typing import Optional
import httpx
import os
from dotenv import load_dotenv
from schema.error_success import PaymentError


load_dotenv()

# 連接設定
PARTNER_KEY = os.getenv("PARTNER_KEY")
MERCHANT_ID = os.getenv("MERCHANT_ID")

TAPPAY_API_URL = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"


# 取出需要的資料
def extract_data(data, keys):
    return {k: data[k] for k in keys if k in data}


# 向 TapPay API 發送付款請求
async def process_tappay_payment(prime, order_number, total_price, contact_name, contact_email, contact_phone, attraction_names_str):
    print(order_number)
    print("送請求到TapPay")
    headers = {
        "Content-Type": "application/json",
        "x-api-key": PARTNER_KEY
    }
    payload = {
        "prime": prime,
        "partner_key": PARTNER_KEY,
        "merchant_id": MERCHANT_ID,
        "amount": total_price,
        "order_number": order_number,
        "details": attraction_names_str,
        "cardholder": {
            "name": contact_name,
            "email": contact_email,
            "phone_number": contact_phone,
        }
    }

    # 使用處理異步的 http函數庫 httpx
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(TAPPAY_API_URL, json=payload, headers=headers)
            print(f"Response Status: {response.status_code}")
            print(f"Response Headers: {response.headers}")
            print(f"Response Content: {response.text}")

            if response.status_code == 200:
                result = response.json()

                # 取出需要的資料
                needed_keys = ["status", "msg",
                               "rec_trade_id", "bank_transaction_id", "amount", "order_number", "order_number", "card_info", "transaction_time_millis"]

                data = extract_data(result, needed_keys)
                return data
            else:
                print("送請求到TapPayAPI發生問題")
                raise PaymentError("TapPay API 請求失敗")

    except Exception as e:
        print("其他錯誤")
        raise PaymentError(f"處理支付時發生錯誤: {str(e)}")
