import json
import re
import os
import mysql.connector
from PIL import Image, ImageFilter
import requests
import tempfile


attractions = []


# 讀取json資料
def read_json_file():
    # 處理檔案路徑（這樣到 ec2就不用另外改）
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, 'taipei-attractions.json')

    with open(file_path, "r", encoding="utf-8") as file:
        content = json.load(file)
        data = content["result"]["results"]
    return data


# 整理資料並提取需要的部分
def extract_data(attractions):

    data = read_json_file()

    keys = ["name", "CAT", "description", "address",
            "direction", "MRT", "latitude", "longitude"]
    new_key_name = ["name", "category",
                    "description", "address", "transport", "mrt", "lat", "lng"]

    for attraction in data:
        # 處理圖片，分離網址並過濾出末端是.jpg或.png的網址
        # ===大小寫不敏感
        pattern = r"https://[^\s]+?\.(?:jpg|png)"
        img_url = re.findall(pattern, attraction["file"], re.IGNORECASE)

        clean_attraction = {
            new_key_name[i]: attraction[key] for i, key in enumerate(keys)
        }
        clean_attraction["images"] = img_url
        attractions.append(clean_attraction)

    return attractions


# 放資料進 category及 mrt資料表
def put_mrt_and_category_in_database(attractions):
    with get_db() as db:

        for attraction in attractions:
            mrt = attraction["mrt"]
            category = attraction["category"]

            try:
                with db.cursor() as cursor:
                    # 放捷運資料
                    sql_mrt = "INSERT INTO mrt (name) VALUE (%s)"
                    cursor.execute(sql_mrt, (mrt,))
                    db.commit()
                    print("新增資料庫成功")

                    # 放 category資料
                    sql_category = "INSERT INTO category (name) VALUE (%s)"
                    cursor.execute(sql_category, (category,))
                    db.commit()
                    print("新增資料成功")

            except mysql.connector.IntegrityError:
                # 唯一性約束被違反,跳過該筆資料
                print("重複的資料，跳過")
                continue
            except Exception as e:
                # 如果操作失敗，回到操作前的狀態
                db.rollback()
                print("新增資料發生錯誤")


# 放資料進 attraction 資料表
def put_attractions_in_database(attractions):

    with get_db() as db:

        for attraction in attractions:
            name = attraction["name"]
            description = attraction["description"]
            address = attraction["address"]
            transport = attraction["transport"]
            lat = attraction["lat"]
            lng = attraction["lng"]
            print(lat, lng)

            try:
                with db.cursor(dictionary=True) as cursor:
                    # 獲取 category_id
                    category = attraction["category"]
                    sql_category = "SELECT id FROM category WHERE name = %s"
                    cursor.execute(sql_category, (category,))
                    category_id = cursor.fetchone()["id"]
                    print("成功獲取category id")
                    # 獲取 mrt_id
                    mrt = attraction["mrt"]
                    sql_mrt = "SELECT id FROM mrt WHERE name = %s"
                    cursor.execute(sql_mrt, (mrt,))
                    result = cursor.fetchone()
                    if result:
                        mrt_id = result["id"]
                    else:
                        mrt_id = None
                    print("成功獲取捷運站id")
                    # 放進資料表
                    sql_add = """
                        INSERT INTO attraction
                        (name, description, address, category_id, mrt_id, transport, lat, lng)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        """
                    cursor.execute(sql_add, (name, description, address,
                                   category_id, mrt_id, transport, lat, lng,))
                    db.commit()
                    print("新增資料成功")
            except Exception as e:
                db.rollback()
                print("新增資料發生錯誤")
                raise e


# 指定儲存低解析度圖片的資料夾
low_res_folder = "low_res_images"
# 如果資料夾不存在,則建立它
if not os.path.exists(low_res_folder):
    os.makedirs(low_res_folder)


# 使用 Pillow 將圖片轉換成低解析度
def convert_to_low_resolution(image_path, output_path, width=50):
    try:
        # 打開圖片
        with Image.open(image_path) as img:
            # 計算縮放後的高度,保持寬高比
            height = int((width / img.width) * img.height)
            # 調整圖片大小
            img = img.resize((width, height))
            # 應用模糊濾鏡
            img = img.filter(ImageFilter.GaussianBlur(radius=2))
            # 保存低解析度圖片
            img.save(output_path, optimize=True, quality=85)
            print(f"圖片轉換成功: {output_path}")
    except Exception as e:
        print(f"圖片轉換失敗: {e}")


# 放資料進 image 資料表
def put_image_in_database(attractions):

    with get_db() as db:
        for attraction in attractions:
            name = attraction["name"]
            img_urls = attraction["images"]
            # 獲取景點id
            try:
                with db.cursor(dictionary=True) as cursor:
                    sql_get = "SELECT id FROM attraction WHERE name = %s"
                    cursor.execute(sql_get, (name,))
                    attraction_id = cursor.fetchone()["id"]
                    # 把圖片網址與景點id放進資料表
                    for order, img in enumerate(img_urls, start=1):
                        # sql_add = "INSERT INTO image (attraction_id, url) VALUES (%s, %s)"
                        # cursor.execute(sql_add, (attraction_id, img))
                        # db.commit()
                        # print("新增資料成功")
                        # 將 img從 url下載下來存進暫存資料夾
                        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                            response = requests.get(img)
                            temp_file.write(response.content)
                            temp_file_path = temp_file.name

                        # 按景點名稱創建資料夾,將空格替換為下劃線
                        attraction_folder = os.path.join(
                            low_res_folder, name.replace(" ", "_"))

                        # 如果資料夾不存在,則建立它
                        if not os.path.exists(attraction_folder):
                            os.makedirs(attraction_folder)

                        # 使用 Pillow 將圖片轉換成低解析度並存入另一個資料表
                        low_res_img_name = f"{order}.jpg"
                        low_res_img_path = os.path.join(
                            attraction_folder, low_res_img_name)
                        convert_to_low_resolution(
                            temp_file_path, low_res_img_path)

                        # 刪除臨時檔案
                        os.unlink(temp_file_path)

                        # with open(low_res_img, 'rb') as f:
                        #     img_data = f.read()
                        # sql_add_low_res = "INSERT INTO low_image (attraction_id, content, url) VALUES (%s, %s, %s)"
                        # cursor.execute(sql_add_low_res,
                        #                (attraction_id, img_data, img))
                        # db.commit()
                        # print("新增低解析度圖片成功")

            # except mysql.connector.IntegrityError as e:
            #     # 唯一性約束被違反,跳過該筆資料
            #     print("重複的資料，跳過")
            #     continue
            except Exception as e:
                db.rollback()
                print("新增資料發生錯誤")
                raise e


extract_data(attractions)
# put_mrt_and_category_in_database(db, attractions)
# put_attractions_in_database(db, attractions)
# put_image_in_database(attractions)
