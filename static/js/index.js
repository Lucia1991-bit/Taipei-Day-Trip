//更改圖片網址
// import { updateBannerUrl } from "./data/handleBannerUrl.js";

//fetchData Module
import { fetchAttractionData, fetchMrtData } from "./api/fetchData.js";
//Skeleton loading相關 Module
import { showSkeletonLoading, hideSkeletonLoading } from "./view/skeletonLoading.js";
//檢查使用者登入狀態 Module
import { checkUserStatus } from "./auth/userStatus.js";
//NavBar以及註冊/登入相關 Module
import { initNavBar } from "./navBar.js";


// const url = window.location.href;
// console.log(url);

// const pathname = window.location.pathname;
// console.log(pathname);


//Attractions資料的容器
const container = document.querySelector(".attractions_container");

//NavBar設定滑到 attraction section時顯示border-bottom
const navBar = document.querySelector(".nav");
const banner = document.querySelector(".banner");

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    //如果banner離開視窗範圍，navBar底部加上border
    if (!entry.isIntersecting) {
      navBar.classList.add("show");
    } else {
      navBar.classList.remove("show");
    }
  })
}, {threshold: 0.2})

observer.observe(banner);


//紀錄景點資料下一頁頁碼
let newNextPage = null;
//紀錄最後一次搜尋的關鍵字
let currentKeyword = "";

console.log("script運行...");


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
      const mrtKeyword = searchInput.value.trim();

      //點擊捷運站名後，顯示在搜尋欄並搜尋
      searchAttractions(mrtKeyword);
      //搜尋結束後清空搜尋欄
      // searchInput.value = "";
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
    //計算滾動距離為可見列表長度的80%
    const scrollDistance = listWrapper.clientWidth * 0.8;
   
    //如果大於 0表示不在起始位置
    if (currentScroll > 0) {
      listWrapper.scrollBy({
        left: -scrollDistance, //往左為負數
        behavior: "smooth"
      })
    }
  })

  //往右按鈕
  nextButton.addEventListener("click", () => {
     //目前的位置
    const currentScroll = listWrapper.scrollLeft;

    //計算滾動距離為可見列表長度的80%
    const scrollDistance = listWrapper.clientWidth * 0.8;

    //計算出能夠滾動的範圍(列表全部範圍 - 可見範圍)
    const maxScroll = listWrapper.scrollWidth - listWrapper.clientWidth;
   
    if (currentScroll < maxScroll) {
      listWrapper.scrollBy({
        left: scrollDistance,
        behavior: "smooth"
      })
    }
  })
}

//檢查圖片是否完成加載，若完成加載，替換掉低解析度圖片
function checkImageLoaded(image, imgContainer) {
  if (image.complete) {
    imgContainer.classList.add("loaded");
  } else {
    image.addEventListener("load", () => {
      imgContainer.classList.add("loaded");
    })
  }
}

//創建景點元素
function createAttractionItem(attraction) {
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
  // mrt.classList.add("loading", "mrt_name");
  // category.classList.add("loading", "category");

  //獲取低解析度圖片路徑(在與景點同名資料夾)
  const name = attraction["name"].replace(/ /g, "_");
  const lowerResImageUrl = `/static/image/low_res_images/${name}/1.jpg`;    
  imgContainer.style.backgroundImage = `url("${lowerResImageUrl}")`;

  //真正圖片
  image.src = attraction["images"][0];
  //啟用圖片 lazing loading
  image.loading = "lazy";

  //監聽圖片是否完成加載，若完成加載，替換掉低解析圖片
  checkImageLoaded(image,imgContainer);


  attractionLink.href = `/attraction/${attraction["id"]}`;
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

  return attractionItem;
}

//顯示景點
async function displayAttractions(results) {

  if (!results) {
    hideSkeletonLoading();
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
    const attractionItem = createAttractionItem(attraction);
    container.appendChild(attractionItem);
  })

  //觀察最後一個元素
  observeLastItem(container);
}

// 創建 IntersectionObserver 並觀察最後一個元素
function observeLastItem(container) {

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      //滾動接近視窗底部並且有下一頁，停止觀察，加載下一頁
      if (entry.isIntersecting && newNextPage) {
        observer.unobserve(entry.target);
        getNextPage();
      }
    })
  }, {threshold: 0.5})


const lastAttractionItem = container.lastElementChild;
  if (lastAttractionItem) {
    observer.observe(lastAttractionItem);
  }
}


//加載新頁面前顯示loader以及 skeleton動畫
//防止重複加載，執行加載下一頁時先檢查是否正在loading
let isLoading = false;

async function getNextPage() {
  if (isLoading) return;
  isLoading = true;

  const loader = document.querySelector(".loader");

  loader.classList.add("show");
 
  //停留幾秒再顯示新資料
  setTimeout(() => {

    showSkeletonLoading();
    loader.classList.remove("show");

    setTimeout(async () => {

      if (newNextPage) {
        const results = await fetchAttractionData(newNextPage, currentKeyword);
        
        // 顯示新的資料
        displayAttractions(results);
        isLoading = false;
      }
    }, 300);
  }, 500);
}


// 使用表單搜尋
function submitSearchForm() {
  const form = document.getElementById("searchForm");
  const input = document.getElementById("searchInput");
  
  //進入搜尋框時先將placeholder清空
  input.addEventListener("focus", () => {
    input.placeholder = "";
  })

  //離開搜尋框時回復 placeholder
  input.addEventListener("blur", () => {
    input.placeholder = "輸入景點名稱查詢";
  })

  //提交表單
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const keyword = input.value;

    console.log("關鍵字:", keyword);

    searchAttractions(keyword);
  })
}

//搜尋景點資料
async function searchAttractions(keyword) {
  //把原本的內容清空
  container.innerHTML = "";
  
  //紀錄目前搜尋關鍵字
  currentKeyword = keyword

  showSkeletonLoading(currentKeyword);

  const results = await fetchAttractionData(0, currentKeyword);

  if (!results) {
    showErrorMessage("查無相關景點資料");
    // 重置 currentKeyword 為空字串
    currentKeyword = ""; 
    return;
  }
  
  //重設下一頁頁碼
  newNextPage = null;

  //顯示搜尋結果，稍微延遲
  setTimeout(() => {
    displayAttractions(results, keyword);
  },  300)
}


//顯示錯誤訊息
function showErrorMessage(message) {
  //清空頁面
  container.innerHTML = "";
  
  const errorEL = document.createElement("div");
  errorEL.classList.add("error");
  errorEL.textContent = message;
  container.appendChild(errorEL);
}


//初始頁面
async function init() { 
  //初始化時重設下一頁頁碼
  newNextPage = null;
  //初始化時重設關鍵字
  currentKeyword = "";

  //清空頁面
  container.innerHTML = "";

  //顯示 skeleton loading 動畫
  showSkeletonLoading();

  //獲取並顯示捷運站列表
  const mrtResults = await fetchMrtData();
  displayMrtList(mrtResults);

  //獲取並顯示景點資料
  setTimeout(async() => {
    const results = await fetchAttractionData();
    displayAttractions(results);
  }, 300)

  //檢查使用者登入狀態
  const isAuthUser = await checkUserStatus();
  //初始化 NavBar
  initNavBar(isAuthUser);
  
  //監聽搜尋表單提交
  submitSearchForm();
}

document.addEventListener("DOMContentLoaded", init);






