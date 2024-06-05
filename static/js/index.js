//獲取當前網址
// const currentURL = window.location.origin; //在EC2上必須使用這個
const currentURL = "http://127.0.0.1:8000";
console.log(currentURL);

// const url = window.location.href;
// console.log(url);

// const pathname = window.location.pathname;
// console.log(pathname);

//註冊/登入頁面所需元素
const navLoginBtn = document.getElementById("nav_loginBtn");
const overlayEL = document.querySelector(".overlay");
const signupPage = document.querySelector(".signup");
const loginPage = document.querySelector(".login");
const loginLink = document.getElementById("loginLink");
const signUpLink = document.getElementById("signUpLink");

//Attractions資料的容器
const container = document.querySelector(".attractions_container");


//紀錄景點資料下一頁頁碼
let newNextPage = null;

console.log("script運行...");

// Navigation ==== 點擊登入/註冊按鈕，彈出註冊/登入頁面
navLoginBtn.addEventListener("click", (e) => {
  e.preventDefault();
  loginPage.classList.add("active")
  overlayEL.style.display = "block";
})

// 點擊遮罩層時,關閉登入視窗和遮罩層
overlayEL.addEventListener("click", (e) => {
  if (e.target === overlayEL) {
    loginPage.classList.remove("active");
    signupPage.classList.remove("active");
    overlayEL.style.display = "none";
  }
});

// Signup/Login Page ==== 點擊按鈕，轉換註冊 / 登入頁面
function togglePages (showPage, hidePage) {
  showPage.classList.add("active");
  hidePage.classList.remove("active");
}

signUpLink.addEventListener("click", ()=> {
  console.log("點擊");
  togglePages(signupPage, loginPage);
})


loginLink.addEventListener("click", ()=> {
  togglePages(loginPage, signupPage);
})


//顯示捷運站列表
async function displayMrtList(results) {
  if (!results) return;

  const { data } = results;

  data.forEach( mrt => {
      const mrtItem = document.createElement("li");
      mrtItem.classList.add("list_item");
      mrtItem.textContent = mrt;
      document.querySelector(".listBar_listWrapper").appendChild(mrtItem);
  })

  //捷運站列表左右按鈕功能
  initListBarScroll();

  //點擊捷運站名後，顯示在搜尋欄並搜尋
  clickMrtAndSearch();
}

//點擊捷運站名後，顯示在搜尋欄並搜尋
function clickMrtAndSearch() {
  const searchInput = document.querySelector(".searchInput");
  const mrtItems = document.querySelectorAll(".list_item");

  mrtItems.forEach(mrtItem => {
    mrtItem.addEventListener("click", (e) => {
      searchInput.value = e.target.textContent;
      keyword = searchInput.value.trim();
      //點擊捷運站名後，顯示在搜尋欄並搜尋
      searchAttractions(searchInput.value);

      //搜尋完畢清空搜尋欄
      setTimeout(() => {
        searchInput.value = "";
      }, 3000)

    })
  })
}

//ListBar ==== 點擊往左往右按鈕能左右捲動
function initListBarScroll() {
  const listWrapper = document.querySelector(".listBar_listWrapper");
  const prevButton = document.querySelector(".leftButton");
  const nextButton = document.querySelector(".rightButton");

  //獲取所有 mrt item
  const mrtItems = listWrapper.querySelectorAll(".list_item");


  //往左按鈕
  prevButton.addEventListener("click", () => {
    //獲取當前滾動位置
    const currentScroll = listWrapper.scrollLeft;
    //計算滾動距離為列表長度的80%
    const scrollDistance = listWrapper.clientWidth * 0.8;

    //如果大於0表示不在起始位置
    if (currentScroll > 0) {

      listWrapper.scrollBy({
        left: -scrollDistance,
        behavior: "smooth"
      })
    }
  })

  //往右按鈕
  nextButton.addEventListener("click", () => {
     //目前的位置
    const currentScroll = listWrapper.scrollLeft;
    //計算滾動距離為列表長度的80%
    const scrollDistance = listWrapper.clientWidth * 0.8;
    //計算出能夠滾動的範圍
    const maxScroll = listWrapper.scrollWidth - listWrapper.clientWidth;

    if (currentScroll < maxScroll) {
      listWrapper.scrollBy({
        left: scrollDistance,
        behavior: "smooth"
      })
    }
  })
}

//顯示 skeleton loading動畫
function showSkeletonLoading() {

  // 創建 skeleton loading item
  for (let i = 0; i < 4; i++) {
    const skeleton = document.createElement("div");
    const img = document.createElement("div");
    const info = document.createElement("div");
    const text1 = document.createElement("p");
    const text2 = document.createElement("p");

    skeleton.classList.add("attraction_item", "skeleton");
    img.classList.add("attraction_item_image", "loading_image");
    info.classList.add("attraction_item_info");
    text1.classList.add("mrt_name", "loading_mrt_name");
    text2.classList.add("category", "loading_category");

    info.appendChild(text1);
    info.appendChild(text2);
    skeleton.appendChild(img);
    skeleton.appendChild(info);

    container.appendChild(skeleton);
  }
}

//隱藏 skeleton loading動畫 
function hideSkeletonLoading() {
  const skeletons = document.querySelectorAll(".skeleton");

  skeletons.forEach(skeleton => {
    skeleton.classList.add("hide-skeleton");
  });
}

//顯示景點
async function displayAttractions(results) {

  if (!results) {
    showErrorMessage("請求發生錯誤");
    return;
  }

  const { nextPage, data } =results;

  //更新下一頁頁碼
  console.log("目前:", newNextPage);
  newNextPage = nextPage;
  console.log("下一頁:", newNextPage);

  // 隱藏 skeleton loading
  hideSkeletonLoading();


  data.forEach( attraction => {
    const attractionItem = document.createElement("div");
    const imgContainer = document.createElement("div");
    const attractionLink = document.createElement("a");
    const image = document.createElement("img");
    const itemTitle = document.createElement("div");
    const title = document.createElement("p");
    const itemInfo = document.createElement("div");
    const mrt = document.createElement("p");
    const category = document.createElement("p");
    
    attractionItem.classList.add("attraction_item");
    imgContainer.classList.add("attraction_item_image");
    itemTitle.classList.add("attraction_item_title");
    itemInfo.classList.add("attraction_item_info");
    mrt.classList.add("mrt_name");
    category.classList.add("category");

    image.src = attraction["images"][0];
    attractionLink.href = `attraction/${attraction["id"]}`
    title.textContent = attraction["name"];
    mrt.textContent = attraction["mrt"];
    category.textContent = attraction["category"];

    attractionLink.appendChild(image);
    itemTitle.appendChild(title);

    imgContainer.appendChild(attractionLink);
    imgContainer.appendChild(itemTitle);

    itemInfo.appendChild(mrt);
    itemInfo.appendChild(category);

    attractionItem.appendChild(imgContainer);
    attractionItem.appendChild(itemInfo);

    container.appendChild(attractionItem);
  })

  //觀察最後一個元素
  observeLastItem(container);

}

// 創建 IntersectionObserver 並觀察最後一個元素
function observeLastItem(container) {
  let timeoutId;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      //滾動接近視窗底部並且有下一頁，停止觀察，加載下一頁
      if (entry.isIntersecting && newNextPage) {
        observer.unobserve(entry.target);

        //使用debounce技巧，防止快速捲動觸發重複請求
        clearTimeout(timeoutId);
        timeoutId = setTimeout( () => {
           showLoading();
        }, 500)
      }
    })
  }, {threshold: 0.1})

  const lastAttractionItem = container.lastElementChild;
  if (lastAttractionItem) {
    observer.observe(lastAttractionItem);
  }
}


//加載更多資料
async function displayMoreData() {
  const results = await fetchAttractionData(newNextPage);
  // 顯示新的資料
  displayAttractions(results);
}


//監控如果資料請求已經被觸發，在資料還沒有加載完成前無法繼續滾動加載下一頁
let isLoading = false; 

//加載新頁面前顯示loader以及 skeleton動畫
async function showLoading() {
  if (isLoading) return; // 如果正在加載中,直接返回

  isLoading = true; // 設置為正在加載中

  const loader = document.querySelector(".loader");

  loader.classList.add("show");

  //停留幾秒再顯示新資料
  setTimeout(() => {

    loader.classList.remove("show");
    showSkeletonLoading();

    setTimeout(async () => {
      if (newNextPage) {
        await displayMoreData();
      }
      isLoading = false; // 加載完成,設置為未加載中
    }, 800);
  }, 500);
}


// 使用表單搜尋
function submitSearchForm() {
  const form = document.getElementById("searchForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const keyword = document.getElementById("searchInput").value;

    console.log("關鍵字:", keyword);

    searchAttractions(keyword);
  })
}

//搜尋景點資料
async function searchAttractions(keyword) {
  //把原本的內容清空
  container.innerHTML = "";
  
  const results = await fetchAttractionData(0, keyword);


  if (!results) {
    showErrorMessage("查無相關景點資料");
    return;
  }
  
  //重設下一頁頁碼
  newNextPage = null;

  //顯示搜尋結果，稍微延遲
  setTimeout(() => {
    displayAttractions(results);
  }, 500)
    
}


//顯示錯誤訊息
function showErrorMessage(message) {
  //移除原本的錯誤訊息
  removeErrorMessage();
  container.innerHTML = "";
  // const main = document.querySelector(".main_container");
  const errorEL = document.createElement("div");
  errorEL.classList.add("error");
  errorEL.textContent = message;
  container.appendChild(errorEL);
}

//移除錯誤訊息
function removeErrorMessage() {
  const errorEL = document.querySelector(".error");
  if (errorEL) {
    errorEL.remove();
  }
}

//獲取景點資料
async function fetchAttractionData(page = 0, keyword = "") {

   // 移除之前的錯誤訊息 (如果存在)
  removeErrorMessage();

  // 在獲取資料前顯示 skeleton loading 效果
  showSkeletonLoading(); 
 
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
    hideSkeletonLoading();
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

//加載頁面
async function init() { 
  //初始化時重設下一頁頁碼
  newNextPage = null;
  const mrtResults = await fetchMrtData();
  displayMrtList(mrtResults);
  const results = await fetchAttractionData();
  displayAttractions(results);
  submitSearchForm();
}

init();




