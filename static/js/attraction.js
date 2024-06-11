import { currentURL } from "./component/fetchData.js";
import { initModal } from "./component/popupModal.js";

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
const slidesWrapper = document.querySelector(".slides_wrapper");
const prevButton = document.querySelector(".prev");
const nextButton = document.querySelector(".next");



//紀錄目前捲動到哪張圖片
let currentIndex = 1;
//紀錄總共幾張圖片
let imageCounts = 0;
//頁面顯示器
const indicators = [];
//檢查是否正在滑動
let isMoving = false;


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
  const pageContainer = document.querySelector(".slide_pageIndicator_container");

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
  console.log(slidesWrapper);

  //按照要顯示的圖片數量創建頁面顯示器
  initPageIndicator(amount);


  //監聽按鍵盤左右鍵時觸發左右滑動
  window.addEventListener("keyup", (e) => {
    if (isMoving) {
      return;
    }
    switch(e.key) {
      case "ArrowLeft":
        clickHandler("left");
        break;
      case "ArrowRight":
        clickHandler();
        break;
      default:
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
  slidesWrapper.addEventListener("transitionend", () => {
    slideHandler();
  })

  //初始化顯示第一張圖片
  indicators[0].classList.add("active");
}

//點擊時滑動幻燈片
function clickHandler(direction) {
  isMoving = true;
  slidesWrapper.style.transition = `transform 0.3s ease-in-out`;
  if (direction === "left") {
    currentIndex--;
    console.log(`往前，現在的index: ${currentIndex}`);
  } else {
    currentIndex++;
    console.log(`往後，現在的index: ${currentIndex}`);
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
  console.log(imageCounts);
}

//顯示現在是哪張圖片
function updateIndicator() {
  const indicators = document.querySelectorAll(".pageIndicator");
  const realIndex = (currentIndex - 1 + indicators.length) % indicators.length;
  indicators.forEach((indicator, index) => {
    if (index === realIndex) {
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

//以景點id獲取景點資料
async function fetchAttractionByID() {
  const path = window.location.pathname;
  const parts = path.split("/");
  const attractionID = parts[parts.length - 1];

  try {
    const response = await fetch(`${currentURL}/api/attraction/${attractionID}`);
    const results = await response.json();

    if (!response.ok) {
      //如果查詢的景點 id不存在，導向首頁
      if (response.status === 400) {
        window.location.href = "/";
      }  
      throw new Error(results.message);
    }

    return results;
  } catch (error) {
    console.log("Error:", error);
    return null;
  }
}

// 加載初始頁面
async function init() {

  //監聽登入/註冊視窗
  initModal();

  const results = await fetchAttractionByID();
  setTimeout(async() => {
    displayAttraction(results);
  }, 300)
}

init();


//依選擇時間改變價格
function changePrice() {
  const timeInput = document.querySelector("input[name='time']:checked");
  const price = document.querySelector(".schedule_form_price");
  if (timeInput.value === "afternoon") {
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