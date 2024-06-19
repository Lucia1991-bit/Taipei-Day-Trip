from pydantic import BaseModel
from typing import List


# 捷運站名模型
class MRTData(BaseModel):
    data: List[str]
