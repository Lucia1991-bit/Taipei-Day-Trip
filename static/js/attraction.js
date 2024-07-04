//fetchData Module
import { fetchAttractionByID } from "./api/attractionRequest.js";
import { createBooking } from "./api/bookingRequest.js";
//幻燈片相關 Module
import { initImageSlider, initSliderEvents } from "./view/imageSlider.js";
//顯示註冊/登入頁面 Module
import { showLoginModal } from "./view/popupModal.js";
//檢查使用者登入狀態 Module
import { checkUserStatus } from "./auth/userStatus.js";
//NavBar以及註冊/登入相關 Module
import { initNavBar } from "./navBar.js";
//顯示成功／錯誤訊息 Module
import { showStatusMessage } from "./view/showMessage.js";
//顯示按鈕 loading
import { showButtonLoading, hideButtonLoading } from "./view/buttonLoading.js";

console.log("attraction.js運行中");

//預載圖片，給一個記憶體空間
const imagePreloadArr = [];

//預載圖片
function preloadImages(imageURLs) {
  imageURLs.forEach(imageURL => {
    //建立實體化圖片
    const img = new Image();
    img.src = imageURL;
    imagePreloadArr.push(img);
  })
}

//隱藏 skeleton loading
const mainContainer = document.querySelector(".main_container");
const skeletonContainer = document.querySelector(".skeleton_container");

function hideSkeletonLoading() {
  mainContainer.classList.remove("hide");
  skeletonContainer.classList.add("hide");
}

//景點資料元素
const scheduleContainer = document.querySelector(".schedule_container");
const title = document.querySelector(".schedule_title");
const profile = document.querySelector(".schedule_profile");
const infoContainer = document.querySelector(".attraction_info_container");
const description = document.querySelector(".description");
const address = document.querySelector(".address");
const transport = document.querySelector(".transport");



//渲染景點頁面
function displayAttraction(results) {
  if (!results) {
    hideSkeletonLoading();
    // showErrorMessage("請求發生錯誤");
    return;
  }
  const { data } = results;
  const { images } = data;

  //預載圖片
  preloadImages(images);

  //顯示圖片幻燈片
  initImageSlider(images);
  //啟動圖片幻燈片監聽事件
  initSliderEvents();

  //獲得資料後隱藏 skeleton loading
  hideSkeletonLoading();

  //顯示景點文字資料
  title.textContent = data.name;
  profile.textContent = `${data.category} at ${data.mrt}`;
  description.textContent = data.description;
  address.textContent = data.address;
  transport.textContent = data.transport;
}

//依選擇時間改變價格
function changePrice() {
  const timeInput = document.querySelector("input[name='time']:checked");
  const price = document.querySelector(".schedule_form_price");
  if (timeInput.value === "下半天") {
    price.textContent = "新台幣 2500元";
  } else {
    price.textContent = "新台幣 2000元";
  }
}

//監聽選擇時間表單，依選擇時間改變價格
const timeInputs = document.querySelectorAll("input[name='time']");
timeInputs.forEach(input => {
  input.addEventListener("change", changePrice);
});



//檢查送出的請求跟上一次的請求有沒有重複
function isSameRequest(req1, req2) {
  return JSON.stringify(req1) === JSON.stringify(req2);
}

//暫存上一次的請求資訊
let lastRequest = null;

//送出預定行程表單
async function submitBookingForm() {
  //取得網址的景點id
  const path = window.location.pathname;
  const parts = path.split("/");
  //從網址擷取下來的格式是字串，要轉成整數
  const attractionId = parseInt(parts[parts.length - 1]);
  
  //獲取日期
  const dateInput = document.getElementById("date");
  //格式為"YYYY-MM-DD"的字串，pydantic能夠直接轉成 "YYYY-MM-DD"的 date格式
  const date = dateInput.value;

  //獲取被選取的時間
  const timeInput = document.querySelector("input[name='time']:checked")
  const time = timeInput.value;

  //獲取價格
  const price = time == "上半天" ? 2000 : 2500;

  // 創建要求體
  const requestData = {
    attractionId,
    date,
    time,
    price
  }

  //送出請求前，檢查送出的請求跟上一次的請求有沒有重複
  if (lastRequest && isSameRequest(requestData, lastRequest)) {
    showStatusMessage("新增失敗，已經存在相同的預訂", "fail");
    console.log("重複的請求，不發送");
    return; 
  }

  // 更新最後一次請求
  //用...防止直接修改原始物件時影響 lastRequest
  lastRequest = { ...requestData };

  //送出請求將loading顯示在按鈕
  const submitBtn = document.querySelector(".schedule_form_button");

  showButtonLoading(submitBtn);

  const successStatus = await createBooking(requestData);

  setTimeout(() => {  
    hideButtonLoading(submitBtn);
  }, 100)

  if (successStatus) {
    //顯示成功訊息
    showStatusMessage("新增成功，請查看預定頁面", "success");
    console.log("新增成功");

    //跳轉至預定頁面
    setTimeout(()=> {
      location.href = "/booking";
    }, 500)


    //重新加載畫面
  } else {
    console.error("新增失敗");
  }
  
}

//檢查日期
function checkDate() {
  //獲取當前日期
  //"Fri Jun 28 2024 03:33:23 GMT+0800 (台北標準時間)"
  const today = new Date();

  //幾日前預定
  const reservedDays = 3;

  //將目前時間多加上需保留的預定時間
  today.setDate(today.getDate() + reservedDays);
  // 將時間調整為台北標準時間(toISOString()回傳的是UTC時間)
  today.setHours(today.getHours() + 8);

  // 格式化日期為 "YYYY-MM-DD" 格式
  //toISOString後變成"2024-06-27T19:33:23.326Z"
  const formattedDate = today.toISOString().split("T")[0];
  const dateInput = document.getElementById("date");

  // 設定最小日期為當前日期
  dateInput.setAttribute("min", formattedDate);
}


// 加載初始頁面
async function init() {
  const results = await fetchAttractionByID();
  setTimeout(async() => {
    displayAttraction(results);
  }, 300)

  //檢查使用者登入狀態
  const isAuthUser = await checkUserStatus();
  //初始化 NavBar
  initNavBar(isAuthUser);

  //檢查日期選單，禁止選擇小於當日的日期
  checkDate();

  //監聽預約行程按鈕
  //如果沒登入，顯示登入/註冊頁面。如果已登入，送出表單請求
  const bookingForm = document.querySelector(".schedule_form");
  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!isAuthUser) {
      showLoginModal();
    }
    //處理送出預定行程表單
    submitBookingForm();
  })

}

document.addEventListener("DOMContentLoaded", init);



