//fetchData Module
import { fetchBooking, deleteBooking } from "./api/bookingRequest.js";

//檢查使用者登入狀態 Module
import { checkUserStatus } from "./auth/userStatus.js";
//NavBar以及註冊/登入相關 Module
import { initNavBar } from "./navBar.js";

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

//從 DOM 中移除預定行程項目
function removeBookingItemFromDOM(bookingItem) {
  const bookingGroup = bookingItem.closest(".booking_group");
  // "新台幣 2000 元"
  const priceText = bookingItem.querySelector(".booking_info_text.bold:nth-of-type(3) p").textContent;
  // 只截取數字部分,轉成整數
  const price = parseInt(priceText.split(" ")[1]);

  // 從 DOM 中移除該元素
  bookingItem.remove();

  // 檢查分組容器內是否有別的資料
  const remainingItems = bookingGroup.querySelectorAll(".booking_info_container");

  if (remainingItems.length === 0) {
    // 如果組內沒有別的項目,刪除整個分組容器
    bookingGroup.remove();
  } else {
    // 如果有剩(一組最多兩個項目而已),刪除分隔線
    const separator = bookingGroup.querySelector(".horizontal-line");
    if (separator) {
      separator.remove();
    }
  }
  // 更新總價格
  totalPrice -= price;
  updateTotalPrice();

  // 檢查是否還有預定行程
  const remainingGroups = document.querySelectorAll(".booking_group");

  // 如果刪除後行程變成空的,回復到沒有資料的頁面狀態
  if (remainingGroups.length === 0) {
    updatePageWithData();
    document.querySelector(".heading p").style.display = "block";
  }
}

// 點擊垃圾桶 icon,獲取對應的 bookingId,送出刪除請求
async function handleDeleteBooking(e) {
  const bookingItem = e.currentTarget.parentNode;
  const bookingId = bookingItem.getAttribute("data-bookingId");

  try {
    await deleteBooking(bookingId);
    removeBookingItemFromDOM(bookingItem);
  } catch (error) {
    console.error("Error: ", error);
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


//檢查圖片是否完成加載，若完成加載，替換掉低解析度圖片
function checkImageLoaded(image, imageDiv) {
  if (image.complete) {
    imageDiv.classList.add("loaded");
  } else {
    image.addEventListener("load", () => {
      imageDiv.classList.add("loaded");
    })
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
  //監聽垃圾桶點擊事件，觸發刪除預定行程
  icon.addEventListener("click", handleDeleteBooking);
  bookingContainer.appendChild(icon);

  //圖片
  const imageDiv = document.createElement("div");
  const image = document.createElement("img");
  imageDiv.classList.add("booking_image");

  //獲取低解析度圖片路徑(在與景點同名資料夾)
  const name = attraction["name"].replace(/ /g, "_");
  const lowerResImageUrl = `/static/image/low_res_images/${name}/1.jpg`;    
  imageDiv.style.backgroundImage = `url("${lowerResImageUrl}")`;

  //真正的圖片
  image.src = `${attraction.image}`;
  //啟用圖片 lazing loading
  image.loading = "lazy";

  //監聽圖片是否完成加載，若完成加載，替換掉低解析圖片
  checkImageLoaded(image,imageDiv);


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
function displayBooking(results, userData) {
  const textEL = document.querySelector(".heading p");
  const container = document.querySelector(".booking_content");
  const divideLine = document.querySelector(".horizontal-line"); 
  console.log(container);
  console.log(divideLine);

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

  //紀錄預定行程的日期
  let currentDate = null;
  let currentGroup = null;
  
  data.forEach( (booking, index) => {

    //把同日期的預定行程分配在一組
    if (booking.date !== currentDate) {
      //循環到新日期，如果有上一組存在，把上一組行程加進 DOM
      if (currentGroup) {
        container.insertBefore(currentGroup, divideLine);
      }

      //創建分組的容器
      currentGroup = document.createElement("div");
      currentGroup.className = "booking_group";
      currentDate = booking.date;
    }

    const bookingItem = createBookingItem(booking);
    currentGroup.appendChild(bookingItem);
    console.log(currentGroup);

    //如果不是每組的最後一個項目，加分隔線
    if (index < data.length - 1 && data[index + 1].date === currentDate ) {
      const line = document.createElement("div");
      line.className = "horizontal-line";
      currentGroup.appendChild(line);
    }

    //計算價格
    totalPrice += booking.price;

  })

  //迴圈結束，把最後一個分組加進 DOM
  if (currentGroup) {
    container.insertBefore(currentGroup, divideLine);
  }
    
  //更新總價格
  updateTotalPrice(); 

}

//改變歡迎詞用戶名
function updateUserName(userData) {
  if (!userData) {
    return
  }
  const { name } = userData;
  const welcomeText = document.querySelector("h2.booking_info_title");
  welcomeText.textContent = `您好，${name}，待預訂的行程如下：`;
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

  //檢查使用者登入狀態，沒登入跳轉回首頁
  const isAuthUser = await checkUserStatus();

  if (!isAuthUser) {
    location.href = "/";
    return;
  }

  //初始化 NavBar
  initNavBar(isAuthUser);

  //顯示加載轉圈動畫
  showSpinner();

  //改變歡迎詞用戶名
  updateUserName(isAuthUser);

  //加載頁面資料
  const results = await fetchBooking();
  
  setTimeout(() => {
    displayBooking(results, isAuthUser);
    hideSpinner();
  }, 300)

}
 
document.addEventListener('DOMContentLoaded', init);