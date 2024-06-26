from fastapi import APIRouter, Request, Body, Path, Depends
from fastapi.responses import JSONResponse
from typing import Union
from schema.booking import *
from schema.error_success import *
from utility.auth import verify_token_to_get_user
from model.booking import BookingModel

router = APIRouter()

# 獲取預定行程


@router.get("/api/booking")
async def get_booking(request: Request, current_user: dict = Depends(verify_token_to_get_user)) -> Union[BookingResponse, ErrorResponse]:
    if current_user is None:
        return JSONResponse(content=ErrorResponse(error=True, message="您沒有權限操作此項功能").dict(), status_code=403)
    user_id = current_user.id

    try:
        results = BookingModel.get_booking_data(user_id)

        # 沒有資料，回傳 None
        if results is None:
            return BookingResponse(data=None)

        # 套用 pydantic model 整理資料
        bookings = [
            BookingData(
                bookingId=result["booking_id"],
                attraction=AttractionBooking(
                    attractionId=result["attraction_id"],
                    name=result["name"],
                    address=result["address"],
                    image=result["image"]
                ),
                date=result["date"],
                time=result["time"],
                price=result["price"]
            )
            for result in results
        ]

        return BookingResponse(data=bookings)

    except Exception as e:
        return JSONResponse(content=ErrorResponse(error=True, message=str(f"伺服器發生錯誤：{e}")).dict(), status_code=500)


# 新增預定行程
@router.post("/api/booking")
async def create_booking(request: Request, current_user: dict = Depends(verify_token_to_get_user), booking_input: BookingRequest = Body(...)) -> Union[SuccessResponse, ErrorResponse]:
    print(current_user)
    if current_user is None:
        return JSONResponse(content=ErrorResponse(error=True, message="您沒有權限操作此項功能").dict(), status_code=403)

    user_id = current_user.id
    attraction_id = booking_input.attractionId
    date = booking_input.date
    time = booking_input.time
    price = booking_input.price

    try:
        # 檢查同天同時段有沒有行程，避免時段衝突
        conflict_booking = BookingModel.check_booking(
            user_id=user_id, date=date, time=time)

        if conflict_booking:
            return JSONResponse(content=ErrorResponse(error=True, message="新增失敗，該日期同時間段已有預訂").dict(), status_code=400)

        # 新增預定行程
        BookingModel.add_new_booking(user_id, attraction_id, date, time, price)
        return SuccessResponse(ok=True)

    except ValueError as e:
        return JSONResponse(content=ErrorResponse(error=True, message=str(e)).dict(), status_code=400)
    except Exception as e:
        return JSONResponse(content=ErrorResponse(error=True, message=str(f"伺服器發生錯誤：{e}")).dict(), status_code=500)


# 刪除預定行程
@router.delete("/api/booking/{booking_id}")
async def delete_booking(request: Request, current_user: dict = Depends(verify_token_to_get_user), booking_id: int = Path(..., description="預定行程編號，必須是大於0的整數", ge=1)) -> Union[SuccessResponse, ErrorResponse]:
    if current_user is None:
        return JSONResponse(content=ErrorResponse(error=True, message="您沒有權限操作此項功能").dict(), status_code=403)
    user_id = current_user.id

    try:
        # 檢查預定是否存在且屬於當前用戶
        isAuth = BookingModel.check_booking(
            user_id=user_id, booking_id=booking_id)

        if not isAuth:
            raise ValueError("查無此預定或無權限刪除")

        # 刪除預定行程
        BookingModel.delete_booking_data(booking_id)

        return SuccessResponse(ok=True)

    except ValueError as e:
        return JSONResponse(content=ErrorResponse(error=True, message=str(e)).dict(), status_code=400)
    except Exception as e:
        return JSONResponse(content=ErrorResponse(error=True, message=str(f"伺服器發生錯誤：{e}")).dict(), status_code=500)
