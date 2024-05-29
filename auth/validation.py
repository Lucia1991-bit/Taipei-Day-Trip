import re

# 檢查 keyword格式


def is_valid_keyword(keyword):
    if keyword is None:
        return True

    # 定義允許的字符pattern(數字英文中文)
    allowed_pattern = r"^[a-zA-Z0-9\u4e00-\u9fa5]+$"

    # 如果符合條件，return True，不符合 False
    return re.match(allowed_pattern, keyword)
