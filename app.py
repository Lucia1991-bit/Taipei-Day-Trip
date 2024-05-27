import mysql.connector
from fastapi import *
from fastapi.responses import FileResponse
from typing import Annotated, Optional, Union
from data.database import get_db
from data.data_query import get_mrt_name
from model.model import *


app = FastAPI()

# Dependency: 獲取資料庫連接
db_depend = Annotated[mysql.connector.MySQLConnection, Depends(get_db)]


# Static Pages (Never Modify Code in this Block)
@app.get("/", include_in_schema=False)
async def index(request: Request):
    return FileResponse("./static/index.html", media_type="text/html")


@app.get("/attraction/{id}", include_in_schema=False)
async def attraction(request: Request, id: int):
    return FileResponse("./static/attraction.html", media_type="text/html")


@app.get("/booking", include_in_schema=False)
async def booking(request: Request):
    return FileResponse("./static/booking.html", media_type="text/html")


@app.get("/thankyou", include_in_schema=False)
async def thankyou(request: Request):
    return FileResponse("./static/thankyou.html", media_type="text/html")


# 依據景點id獲取景點資料


# 獲取捷運站名列表
@app.get("/api/mrts")
async def get_mrt(request: Request, db: db_depend) -> Union[MRTData, ErrorResponse]:
    try:
        mrt_data = get_mrt_name(db)
        return MRTData(data=mrt_data)
    except Exception as e:
        return ErrorResponse(error=True, message=f"{e}")
