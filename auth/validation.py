import re


# 檢查景點 keyword格式
def is_valid_keyword(keyword):
    if keyword is None:
        return True

    # 定義允許的字符pattern(數字英文中文)
    # 特別為其中一個“台北101／世貿”捷運站，允許條件加入全型斜線及空白
    allowed_pattern = r"^[a-zA-Z0-9\u4e00-\u9fa5/／\s]+$"

    # 如果符合條件，return True，不符合 False
    return re.match(allowed_pattern, keyword)
