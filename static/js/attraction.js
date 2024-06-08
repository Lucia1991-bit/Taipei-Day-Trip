import { currentURL } from "./component/fetchData.js";
import { initModal } from "./component/popupModal.js";

//隱藏 skeleton loading
const mainContainer = document.querySelector(".main_container");
const skeletonContainer = document.querySelector(".skeleton_container");

function hideSkeletonLoading() {
  mainContainer.classList.remove("hide");
  skeletonContainer.classList.add("hide");
}

//顯示景點資料
const scheduleContainer = document.querySelector(".schedule_container");
const title = document.querySelector(".schedule_title");
const profile = document.querySelector(".schedule_profile");
const infoContainer = document.querySelector(".attraction_info_container");
const description = document.querySelector(".description");
const address = document.querySelector(".address");
const transport = document.querySelector(".transport");



// function initImageSlider() {
//   const slidesWrapper = document.querySelector(".slides_wrapper");
//   const prevButton = document.querySelector(".prev");
//   const nextButton = document.querySelector(".next");

//   //獲取所有景點圖片
//   const images = slidesWrapper.querySelectorAll(".slide");

//   // 往左按鈕 
  

// }










function displayAttraction(results) {
  if (!results) {
    // showErrorMessage("請求發生錯誤");
    return;
  }
  const { data } = results;

  //獲得資料後隱藏 skeleton loading
  hideSkeletonLoading();

  title.textContent = data.name;
  profile.textContent = `${data.category} at ${data.mrt}`;
  description.textContent = data.description;
  address.textContent = data.address;
  transport.textContent = data.transport;
}


//以景點id獲取景點資料
async function fetchAttractionByID() {
  const urlParams = new URLSearchParams(window.location.search);
  const attractionID = urlParams.get("id");

  try {
    const response = await fetch(`${currentURL}/api/attraction/${attractionID}`);
    const results = await response.json();
    console.log(results);

    if (!response.ok) {
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
    // displaySlider(results);
    displayAttraction(results);
  }, 300)
}

init();