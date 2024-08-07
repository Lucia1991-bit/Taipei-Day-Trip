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



 //監聽各種幻燈片事件
function initSliderEvents() {
 
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

  //監控觸控事件
  slidesWrapper.addEventListener("touchstart", handleTouchStart);
  slidesWrapper.addEventListener("touchmove", handleTouchMove);
  slidesWrapper.addEventListener("touchend", handleTouchEnd);

  //滑鼠移入移出事件
  slideContainer.addEventListener('mouseenter', showControls);
  slideContainer.addEventListener('mouseleave', hideControls);

}


export { initImageSlider, initSliderEvents };

