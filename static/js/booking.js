//fetchData Module
import { fetchBooking } from "./component/fetchData.js";

//檢查登入狀態 Module
import { checkUserStatus } from "./component/userStatus.js";

console.log("attraction.js運行中");

//改變頁面顯示屬性(主要是配合 footer的 css屬性)
function updatePageWithData() {
  const contentEL = document.querySelector(".booking_content");
  const mainEL = document.querySelector(".booking_main");
  const footerEL = document.querySelector(".footer");
  const footerText = document.querySelector(".footer_text");

  contentEL.classList.toggle("no-data");
  mainEL.classList.toggle("no-data");
  footerEL.classList.toggle("no-data");
  footerText.classList.toggle("no-data");
}


//將使用者名字及信箱顯示在 contact input
function showUserInfo(name , email) {
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  console.log(nameInput, emailInput);

  nameInput.placeholder = name;
  emailInput.placeholder = email;
}

//紀錄預定行程總價格
let totalPrice = 0;


//更新預定行程總價格
function updateTotalPrice() {
  const priceEL = document.querySelector(".total_price");
  priceEL.textContent = `總價：新台幣 ${totalPrice} 元`;
}


//點擊垃圾桶 icon，獲取對應的 bookingId，送出刪除請求
//以 bookingId 刪除預定行程
async function deleteBooking(e) {
  const bookingItem = e.currentTarget.parentNode;
  const bookingId = e.currentTarget.parentNode.getAttribute("data-bookingId");
  // “新台幣 2000 元”
  const priceText = bookingItem.querySelector(".booking_info_text.bold:nth-of-type(3) p").textContent;
  //只截取數字部分，轉成整數
  const price = parseInt(priceText.split(" ")[1]);

  //從 localStorage獲取 token
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`/api/booking/${bookingId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })

    const results = await response.json();

    if (!response.ok) {
      throw new Error(results.message);
    }

    // 如果刪除成功，從 DOM中移除該元素
    bookingItem.remove();

    //更新總價格
    totalPrice -= price;
    updateTotalPrice();

    //檢查是否還有預定行程
    const remainBooking = document.querySelectorAll(".booking_info_container");

    //如果刪除後行程變成空的，回復到沒有資料的頁面狀態
    if (remainBooking.length === 0) {
      updatePageWithData();
      document.querySelector(".heading p").style.display = "block";
    }

  } catch (error) {
    console.error("Error: ", error)
  }
}

//點擊預定行程元素，導向該行程頁面
function relocateToAttractionPage(e, attractionId) {
  // 檢查點擊的不是垃圾桶圖標
  if (!e.target.classList.contains('fa-trash')) {
    // 如果有 attractionId，就導向到該景點頁面
    if (attractionId) {
      window.location.href = `/attraction/${attractionId}`;
    }
  }
}

//創建預定行程元素
function createBookingItem(booking) {
  // 整理資料
  const { bookingId, attraction, date, time, price } = booking;

  // 容器
  const bookingContainer = document.createElement("div");
  bookingContainer.classList.add("booking_info_container");
  bookingContainer.setAttribute("data-bookingId", `${bookingId}`)

  //點擊整個預定行程容器能夠導向該行程頁面
  const { attractionId } = attraction;
  bookingContainer.addEventListener("click", (e) => relocateToAttractionPage(e, attractionId))

  //垃圾桶 icon
  const icon = document.createElement("i");
  icon.className = "fa-solid fa-trash booking_info_icon";
  //監聽點擊事件
  icon.addEventListener("click", deleteBooking);
  bookingContainer.appendChild(icon);

  //圖片
  const imageDiv = document.createElement("div");
  const image = document.createElement("img");
  imageDiv.classList.add("booking_image");
  image.src = `${attraction.image}`;
  imageDiv.appendChild(image);
  bookingContainer.appendChild(imageDiv);

  //景點資訊容器
  const infoDiv = document.createElement("div");
  infoDiv.classList.add("booking_info");

  //景點資訊標題
  const title = document.createElement("h3");
  title.className = "booking_info_title bold primary-color";
  title.textContent = `台北一日遊：${attraction.name}`;
  infoDiv.appendChild(title);

  //景點資訊內容
  const infoTexts = [
    {label: "日期： ", value: date},
    {label: "時間： ", value: time},
    {label: "費用： ", value: `新台幣 ${price}元`},
    {label: "地點： ", value: attraction.address},
  ]

  infoTexts.forEach(text => {
    const span = document.createElement("span");
    span.className = "booking_info_text bold";
    span.textContent = text.label;

    const p = document.createElement("p");
    p.className = "booking_info_text";
    p.textContent = text.value;

    span.appendChild(p);
    infoDiv.appendChild(span);
  })

  bookingContainer.appendChild(infoDiv);

  return bookingContainer;
}


//顯示預定資料在畫面上
async function displayBooking(results, userData) {
  const textEL = document.querySelector(".heading p");
  const container = document.querySelector(".booking_content");
  const divideLine = document.querySelector(".horizontal-line"); 

  const { name, email } = userData;

  if (!results) {
    console.log("請求發生錯誤");
    return;
  }
  
  const { data } = results;

  //如果沒有資料，顯示“沒有預定行程”文字
  //如果有資料，改變頁面顯示屬性並動態生成預定行程元素
  if (!data) {
    textEL.style.display = "block";
    return

  } 

  //改變頁面顯示屬性(主要是配合 footer的 css屬性)
  updatePageWithData();
  //將使用者名字及信箱顯示在 contact input
  showUserInfo(name, email);
  //預定行程總價格清零
  totalPrice = 0;
  
  data.forEach( booking => {
    const bookingItem = createBookingItem(booking);
    container.insertBefore(bookingItem, divideLine);
    
    //計算價格
    const { price } = booking;
    totalPrice += price;
    console.log(totalPrice);
  })
    
  //更新總價格
  updateTotalPrice();
  

}

//改變歡迎詞用戶名
function updateUserName(userData) {
  const { name } = userData;
  const welcomeText = document.querySelector("h2.booking_info_title");
  welcomeText.textContent = `您好，${name}，待預定的行程如下：`;
}

//顯示加載轉圈動畫
function showSpinner() {
  const spinner = document.querySelector(".spinner");
  spinner.classList.add("show");
}

//隱藏加載轉圈動畫
function hideSpinner() {
  const spinner = document.querySelector(".spinner");
  spinner.classList.remove("show");
}

//加載初始頁面
async function init() {
  //檢查有沒有登入，沒登入跳轉回首頁
  const userData = await checkUserStatus();
  if (!userData) {
    location.href = "/";
  }

  //改變歡迎詞用戶名
  updateUserName(userData);

  //加載頁面資料
  const results = await fetchBooking();

  //顯示加載轉圈動畫
  showSpinner();
  
  setTimeout(async() => {
    displayBooking(results, userData);
    hideSpinner();
  }, 300)

}
 
window.addEventListener("load", init);

