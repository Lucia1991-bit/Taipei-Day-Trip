// 獲取當前網址
// const currentURL = window.location.origin; //在EC2上必須使用這個
const currentURL = "http://127.0.0.1:8000";
console.log(currentURL);

//獲取景點資料
async function fetchAttractionData(page = 0, keyword = "") {
  
  try {
    let url;

    //如果沒有關鍵字直接以page請求
    if (!keyword) {
      url = `${currentURL}/api/attractions?page=${page}`;

    } else {
      //關鍵字是中文，送到後端前需先編碼
      const encodedKeyword = encodeURIComponent(keyword);
      url = `${currentURL}/api/attractions?page=${page}&keyword=${encodedKeyword}`;
    }

    const response = await fetch(url);
    const results = await response.json();
  
    if (!response.ok) {
      throw new Error(results.message)
    }

    return results;

  } catch (error) {
    console.log("Error:", error);
    return null;
  }
}

//獲取捷運站名資料
async function fetchMrtData() {
  try {
    const response = await fetch(`${currentURL}/api/mrts`);
    const results = await response.json();

    if (!response.ok) {
      throw new Error(results.message);
    }
    return results;
  } catch (error) {
    console.log("Error:", error);
    return null;
  }
  
}

export { currentURL, fetchAttractionData, fetchMrtData };


