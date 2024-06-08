// 獲取當前網址
// const currentURL = window.location.origin; //在EC2上必須使用這個
const currentURL = "http://127.0.0.1:8000";
console.log(currentURL);

//獲取景點資料
async function fetchAttractionData(page = 0, keyword = "", mrt = "", category = "") {
  
  try {
    //建構查詢參數物件
    const params = new URLSearchParams();

    //當參數不為空時，把參數加入查詢物件變成key-value pair
    //***這裡的 append() 是 URLSearchParams()專用的 method
    if (keyword) {
      params.append("keyword", keyword);
    }
    if (mrt) {
      params.append("mrt", mrt);
    }
    if (category) {
      params.append("category", category);
    }

    //將 params轉成查詢字串
    console.log(params);
    const searchParams = params.toString();
    console.log(searchParams);
    //檢查searchParams，如果是空的，只送出 page網址，如果不為空，加上searchParams                       
    const url = `${currentURL}/api/attractions?page=${page}${searchParams ? `&${searchParams}` : ""}`;
    console.log(url);
    

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


