//fetchData Module
import { fetchAttractionByID } from "./component/fetchData.js";

//顯示註冊/登入頁面 Module
import { showLoginModal } from "./component/popupModal.js";

//檢查登入狀態 Module
import { checkUserStatus } from "./component/userStatus.js";


console.log("attraction.js運行中");

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

//圖片幻燈片元素
const slideContainer = document.querySelector(".slides_container");
const slidesWrapper = document.querySelector(".slides_wrapper");
const prevButton = document.querySelector(".prev");
const nextButton = document.querySelector(".next");
const pageContainer = document.querySelector(".slide_pageIndicator_container");


//紀錄目前捲動到哪張圖片
let currentIndex = 1;
//紀錄總共幾張圖片
let imageCounts = 0;
//頁面顯示器
const indicators = [];
//檢查是否正在滑動
let isMoving = false;


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


//創建幻燈片元素
function createSlide(imageURL) {
  const slide = document.createElement("li");
  const image = document.createElement("img");

  slide.classList.add("slide", "loading");
  image.src = imageURL;
  slide.appendChild(image);

  return slide;
}

//創建並顯示 pageIndicator
function initPageIndicator(amount) {
  for (let i = 0; i < amount; i++) {
    const indicator = document.createElement("div");
    indicator.classList.add("pageIndicator");
    indicators.push(indicator);
    pageContainer.appendChild(indicator);
  }
}

//創建圖片幻燈片
function initImageSlider(imageURLs) {
  //要顯示的圖片數量(原始圖片資料數量)
  const amount = imageURLs.length
  
  //創建幻燈片元素
  imageURLs.forEach(imageURL => {
    const slide = createSlide(imageURL);
    slidesWrapper.appendChild(slide);
  })

  //在幻燈片最後插入第一張圖片的複製
  const firstSlide = createSlide(imageURLs[0]);
  slidesWrapper.appendChild(firstSlide);

  //在幻燈片最前面插入最後一張圖片的複製
  const lastSlide = createSlide(imageURLs[amount - 1]);
  slidesWrapper.insertBefore(lastSlide, slidesWrapper.firstChild);

  // 真實的圖片數量
  imageCounts = amount + 2;

  //按照要顯示的圖片數量創建頁面顯示器
  initPageIndicator(amount);

  //初始化顯示第一張圖片
  indicators[0].classList.add("active");
}

//點擊時滑動幻燈片
function clickHandler(direction) {
  isMoving = true;
  slidesWrapper.style.transition = `transform 0.3s ease-in-out`;
  if (direction === "left") {
    currentIndex--;
    console.log("往前，目前的idx:", currentIndex);
  } else {
    currentIndex++;
    console.log("往後，目前的idx:", currentIndex);
  }
  moveSlides();
}

//控制滑動讓第一張與最後一張之間無縫接軌
function slideHandler() {
  isMoving = false;

  // 如果滑超過第一張（最後一張的複製品，index = 0）
  //將 index重新設為最後一張(真正的最後一張，index = length-2)
  if (currentIndex === 0) {
    slidesWrapper.style.transition = "none";
    currentIndex = imageCounts - 2;
    moveSlides();
  }
  // 如果滑超過最後一張（第一張的複製品，index = length）
  //將 index重新設為第一張(真正的第一張，index = 1)
  if (currentIndex === imageCounts - 1) {
    slidesWrapper.style.transition = "none";
    currentIndex = 1;
    moveSlides();
  }
}

//幻燈片移動位置並改變頁面顯示
function moveSlides() {
  slidesWrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
  updateIndicator();
}

//顯示現在是哪張圖片
function updateIndicator() {
  const indicators = document.querySelectorAll(".pageIndicator");
  //將頁面索引轉換成指示器索引
  //            因為頁面索引是從 1 開始  + 確保不會變成負數    % 確保範圍在 0 ～ indicators.length - 1
  const showIndex = (currentIndex - 1 + indicators.length) % indicators.length;
  indicators.forEach((indicator, index) => {
    if (index === showIndex) {
      console.log("現在的頁面指示器:", index);
      indicator.classList.add("active");
    } else {
      indicator.classList.remove("active");
    }
  })
}

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

  //獲得資料後隱藏 skeleton loading
  hideSkeletonLoading();

  //顯示景點文字資料
  title.textContent = data.name;
  profile.textContent = `${data.category} at ${data.mrt}`;
  description.textContent = data.description;
  address.textContent = data.address;
  transport.textContent = data.transport;
}


//顯示成功/錯誤訊息 
function showStatusMessage(message, type) {
  const messageContainer = document.querySelector(".schedule_message");
  const icon = messageContainer.querySelector("i");
  const text = messageContainer.querySelector("p");

  if (type === "success") {
    icon.className = "fa-solid fa-check-circle";
    messageContainer.className = "schedule_message success";
  } else {
    icon.className = "fa-solid fa-circle-exclamation";
    messageContainer.className = "schedule_message fail";
  }

  text.textContent = message;

}


//創建新預定
async function createBooking(requestData) {
  //從 localStorage獲取 token
  const token = localStorage.getItem("token");

  try {
    console.log("送出請求...");
    const response = await fetch("/api/booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(requestData)
    })

    const result = await response.json();

    if (!response.ok) {
      // 因預定時段衝突新增失敗，顯示錯誤訊息
      if (response.status === 400) {
        showStatusMessage(result.message, "fail");
      }
      throw new Error(response.message);
    }

    return result;

  } catch(error) {
    console.error("Error: ", error);
  }
}

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

  //送出請求前可以將loading顯示在按鈕
  const successStatus = await createBooking(requestData);

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


// 加載初始頁面
async function init() {

  const results = await fetchAttractionByID();
  setTimeout(async() => {
    displayAttraction(results);
  }, 300)

  //監聽預約行程按鈕
  //如果沒登入，顯示登入/註冊頁面。如果已登入，送出表單請求
  const bookingForm = document.querySelector(".schedule_form");
  const isLogin = await checkUserStatus();

  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!isLogin) {
      showLoginModal();
    }
    submitBookingForm();
  })

}

window.addEventListener("load", init);

//=====監聽幻燈片事件
//監聽按鍵盤左右鍵時觸發左右滑動
window.addEventListener("keyup", (e) => {
  if (isMoving) {
    return;
  }
  switch(e.key) {
    case "ArrowLeft":
      clickHandler("left");
      showControls(); 
      break;
    case "ArrowRight":
      clickHandler();
      showControls(); 
      break;
    default:
      hideControls(); 
      break;
  }
})
//監聽左右按鈕觸發左右滑動
prevButton.addEventListener("click", () => {
  //檢查如果正在滑動就不能觸發點擊事件
  if (isMoving) {
    return
  };
  clickHandler("left");
});

nextButton.addEventListener("click", () => {
  //檢查如果正在滑動就不能觸發點擊事件
  if (isMoving) {
    return;
  }
  clickHandler();
});

//監聽幻燈片的滑動
slidesWrapper.addEventListener("transitionend", slideHandler);

//監聽觸控滑動
let touchStartX = 0;
let touchEndX = 0;

//取得觸控開始的位置
function handleTouchStart(e) {
  touchStartX = e.touches[0].clientX;
  // 顯示按鈕和頁面顯示器
  showControls(); 
}

//取得觸控移動的位置
function handleTouchMove(e) {
  touchEndX = e.touches[0].clientX;
}

//觸控結束，計算得出觸控方向
function handleTouchEnd() {
  if (isMoving) {
    return;
  }
  const touchDistance = touchEndX - touchStartX;
  if (touchDistance > 50) {
    //表示向右滑動=點擊左鍵
    clickHandler("left");
  } else if (touchDistance < -50) {
    //表示向左滑動=點擊右鍵
    clickHandler();
  }

  // 結束後歸零
  touchStartX = 0;
  touchEndX = 0;
  // 隱藏按鈕和頁面顯示器
  hideControls(); 

}

// 監控觸控事件
slidesWrapper.addEventListener("touchstart", handleTouchStart);
slidesWrapper.addEventListener("touchmove", handleTouchMove);
slidesWrapper.addEventListener("touchend", handleTouchEnd);


//滑鼠進入圖片範圍時顯示按鈕及頁面顯示器
function showControls() {
  prevButton.classList.remove("hide");
  nextButton.classList.remove("hide");
  pageContainer.classList.remove("hide");
}

//滑鼠離開圖片時隱藏按鈕及頁面顯示器
function hideControls() {
  prevButton.classList.add("hide");
  nextButton.classList.add("hide");
  pageContainer.classList.add("hide");
}

slideContainer.addEventListener('mouseenter', showControls);
slideContainer.addEventListener('mouseleave', hideControls);


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

