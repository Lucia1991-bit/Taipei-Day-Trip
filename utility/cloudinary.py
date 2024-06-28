from cloudinary.utils import cloudinary_url
import cloudinary.uploader
import cloudinary.exceptions
import cloudinary
from cloudinary import CloudinaryResource
from fastapi import BackgroundTasks
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
def upload_image(image_url, public_id, overwrite=False):
    try:
        upload_result = cloudinary.uploader.upload(
            image_url, public_id=public_id, overwrite=overwrite)
        return upload_result["secure_url"]
    except Exception as e:
        raise e


# 優化圖片傳遞
def optimize_image(public_id):
    optimized_url, _ = cloudinary_url(
        public_id, fetch_format="auto", quality="auto")
    return optimized_url


# 轉換圖片
def transform_image(public_id, width, height, crop="fill", gravity="center"):
    transformed_url, _ = cloudinary_url(
        public_id, width=width, height=height, crop=crop, gravity=gravity)
    return transformed_url


# 處理 attraction 圖片
def process_attraction_images(attraction_images, attraction_name, background_tasks: BackgroundTasks):
    processed_images = []
    for index, image_url in enumerate(attraction_images, start=1):
        # 根據 attraction name 及 每張圖片編號生成 public_id
        public_id = f"{attraction_name}{index}"

        if CloudinaryResource(public_id).exists():
            # 圖片已存在，直接使用優化後的 URL
            optimized_url = optimize_image(public_id)
            processed_images.append(
                {"url": optimized_url, "status": "uploaded"})
        else:
            # 圖片不存在，將上傳任務添加到後台任務
            background_tasks.add_task(
                upload_image, image_url, public_id, False)
            processed_images.append({"url": image_url, "status": "uploading"})

    return processed_images
