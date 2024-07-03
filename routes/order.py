from fastapi import APIRouter, Request, Body, Depends
from fastapi.responses import JSONResponse
from typing import Union
from schema.error_success import *
from schema.order import *
from utility.auth import verify_token_to_get_user
from model.order import OrderModel
from model.booking import BookingModel
from service.payment import process_tappay_payment

router = APIRouter()


# 新增訂單
@router.post("/api/orders")
async def create_orders(request: Request, current_user: dict = Depends(verify_token_to_get_user), order_input: OrderRequest = Body(...)) -> Union[OrderResponse, ErrorResponse]:
    if current_user is None:
        return JSONResponse(content=ErrorResponse(error=True, message="您沒有權限操作此項功能").dict(), status_code=403)

    # 獲取需要的資料
    user_id = current_user.id
    booking_ids = [booking.bookingId for booking in order_input.order.trip]

    prime = order_input.prime
    # 給 tapPay的 details
    attraction_names = [
        booking.attraction.name for booking in order_input.order.trip]
    # 轉成字串
    attraction_names_str = ",".join(map(str, attraction_names))

    total_price = order_input.order.total_price
    contact_name = order_input.order.contact.name
    contact_email = order_input.order.contact.email
    contact_phone = order_input.order.contact.phone

    # 產生不重複的 order_number
    order_number = OrderModel.generate_order_number()

    try:
        # 新增訂單資料並獲取 order_id
        add_result = OrderModel.add_new_order(
            order_number, user_id, total_price, contact_name, contact_email, contact_phone)

        # 如果新增失敗
        if add_result["affected_rows"] == 0:
            raise OrderCreationError("資料庫發生錯誤，訂單創建失敗")

        # 獲取 order_id
        order_id = add_result["last_inserted_id"]

        # 將確定的行程加入 order_id 與 orders資料表關聯
        BookingModel.add_order_id_into_booking_table(
            user_id, booking_ids, order_id)

        # 向 TapPay送出付款請求
        payment_result = await process_tappay_payment(prime, order_number, total_price, contact_name, contact_email, contact_phone, attraction_names_str)

        # 整理資料
        order_number = payment_result["order_number"]
        amount = payment_result["amount"]
        tappay_status = payment_result["status"]
        tappay_message = payment_result["msg"]
        tappay_transaction_id = payment_result["rec_trade_id"]
        bank_transaction_id = payment_result["bank_transaction_id"]
        card_info = payment_result["card_info"]
        transaction_time = payment_result["transaction_time_millis"]

        # 將付款紀錄加進 payment資料表
        add_payment_result = OrderModel.add_new_payment(
            order_number, user_id, amount, tappay_status, tappay_message, tappay_transaction_id, bank_transaction_id, card_info, transaction_time)

        # 如果新增失敗
        if add_payment_result["affected_rows"] == 0:
            raise OrderCreationError("資料庫發生錯誤，付款紀錄創建失敗")

        # 付款成功
        if tappay_status == 0:
            # 更新 order資料表的 status欄，由"待付款"改為"已付款"
            print("更新訂單付款狀態")
            OrderModel.update_order_status("已付款", order_number)

        # 付款失敗，印出原因
        else:
            print(tappay_message)

        # 套用 pydantic model 整理資料
        order = OrderResponseDetail(
            number=order_number,
            payment=PaymentStatus(
                status=tappay_status,
                message=tappay_message
            )
        )

        return OrderResponse(data=order)

    # 資料輸入不正確錯誤處理
    except ValueError as e:
        return JSONResponse(content=ErrorResponse(error=True, message=str(f"格式錯誤: {e}")).dict(), status_code=400)
    # 訂單創建失敗錯誤處理
    except OrderCreationError as e:
        return JSONResponse(content=ErrorResponse(error=True, message=str(e)).dict(), status_code=500)
    # 付款失敗錯誤處理
    except PaymentError as e:
        return JSONResponse(content=ErrorResponse(error=True, message=str(e)).dict(), status_code=400)
    except Exception as e:
        return JSONResponse(content=ErrorResponse(error=True, message=str(f"伺服器發生錯誤：{e}")).dict(), status_code=500)
