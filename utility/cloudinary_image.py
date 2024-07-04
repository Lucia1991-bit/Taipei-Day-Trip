import requests
from cloudinary.utils import cloudinary_url
import cloudinary.uploader
import cloudinary.exceptions
import cloudinary
import os
from dotenv import load_dotenv


load_dotenv()

# Configuration
cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("API_KEY"),
    api_secret=os.getenv("API_SECRET"),
    secure=True
)


# 上傳圖片到 Cloudinary
def upload_image(image_url, public_id, folder, overwrite=False):
    try:
        # 下載圖片
        response = requests.get(image_url)
        file_size = len(response.content)

        # 檢查文件大小
        if file_size > 10 * 1024 * 1024:  # 10MB in bytes
            print(f"跳過大文件: {public_id}, 大小: {
                  file_size / (1024 * 1024):.2f} MB")
            return None

        upload_result = cloudinary.uploader.upload(
            image_url, public_id=public_id, folder=folder, overwrite=overwrite)

        return upload_result["secure_url"]

    except Exception as e:
        raise e


# 優化圖片傳遞
def optimize_image(upload_url):
    if not upload_url:
        return None

    # 使用上傳響應中的 secure_url
    original_url = upload_url

    # 在 'upload/' 之後插入優化參數
    optimized_url = original_url.replace(
        "/upload/", "/upload/f_auto,q_auto,w_auto,c_scale/")

    print(f"原始 URL: {original_url}")
    print(f"優化後的 URL: {optimized_url}")

    return optimized_url


# 轉換圖片
def transform_image(public_id, width, height, crop="fill", gravity="center"):
    transformed_url, _ = cloudinary_url(
        public_id, width=width, height=height, crop=crop, gravity=gravity)
    return transformed_url
