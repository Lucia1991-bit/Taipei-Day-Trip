//fetchData Module
import { fetchBooking, deleteBooking } from "./api/bookingRequest.js";
//檢查使用者登入狀態 Module
import { checkUserStatus } from "./auth/userStatus.js";
//NavBar以及註冊/登入相關 Module
import { initNavBar } from "./navBar.js";
//topPay config
import { config } from "./config/topPay_config.js";
//spinner loading 相關
import { showSpinner, hideSpinner } from "./view/spinnerLoading.js";
//驗證 信箱、手機 Module
import { isValidEmail, isValidPhone } from "./auth/validate.js";
//顯示按鈕 loading
import { showButtonLoading, hideButtonLoading } from "./view/buttonLoading.js";


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
  const nameInput = document.getElementById("contact-name");
  const emailInput = document.getElementById("contact-email");
  nameInput.value = name;
  emailInput.value = email;
}

//紀錄目前頁面的預訂資料
let currentBooking = null;

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
    // 清空 currentBooking
    currentBooking = null; 
  }
}

//更新 目前頁面的 currentBooking 
function updateCurrentBooking(deletedBookingId) {
  if (!currentBooking) return;

  console.log("更新前的 currentBooking:", currentBooking);

  console.log(deletedBookingId);

  // 找到並移除被刪除的預定
  currentBooking = currentBooking.filter(booking => booking.bookingId !== parseInt(deletedBookingId));

  // 如果 currentBooking 變為空陣列，將其設為 null
  if (currentBooking.length === 0) {
    currentBooking = null;
  }

   console.log("更新後的 currentBooking:", currentBooking);
}

// 點擊垃圾桶 icon,獲取對應的 bookingId,送出刪除請求
async function handleDeleteBooking(e) {
  const bookingItem = e.currentTarget.parentNode;
  const bookingId = bookingItem.getAttribute("data-bookingId");

  try {
    const successStatus = await deleteBooking(bookingId);
    if (successStatus) {
      removeBookingItemFromDOM(bookingItem);
      // 更新 currentBooking
      updateCurrentBooking(bookingId);
    }
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

  //紀錄預定行程的日期
  let currentDate = null;
  //紀錄目前有沒有同日期的行程被分組
  let currentGroup = null;
  
  data.forEach( (booking, index) => {

    const bookingItem = createBookingItem(booking);

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

    //append進分組容器
    currentGroup.appendChild(bookingItem);

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

//檢查信用卡是什麼卡，並顯示在畫面上
function handleCardType(cardType) {

  let imageSrc = "/static/image/card/card_default.svg";
  
  switch(cardType) { 
    case "visa":
      imageSrc = "/static/image/card/card_visa.png";
      break;

    case "mastercard":
      imageSrc = "/static/image/card/card_mastercard.png";
      break;

    case "jcb":
      imageSrc = "/static/image/card/card_jcb.svg";
      break;

    case "amex":
      imageSrc = "/static/image/card/card_amex.png";
      break;

    case "unionpay":
      imageSrc = "/static/image/card/card_union_pay.png";
      break;
  }

  return imageSrc;
}

//驗證輸入，如果無效，將錯誤結果顯示在畫面上(輸入框抖動)
function updateFieldStatus(element, status) {
  //移除原本的 class
  element.classList.remove("has-error", "shake-effect");

  switch(status) {
    case 2:
      element.classList.add("has-error", "shake-effect");
      break;
    
    case false:
      element.style.color = "red";
      element.classList.add("has-error", "shake-effect");
      setTimeout(() => {
        element.classList.remove("shake-effect")
      }, 300)
      break;

    case true:
      console.log("是正確的！");
      element.classList.remove("has-error", "shake-effect");
      element.style.color = "green";
      break;
  }
}

//驗證信用卡
function checkCreditCard(update) {
  const cardTypeEL = document.querySelector(".card-type");
  const cardImage = document.querySelector(".card-type img");
  const submitButton = document.querySelector(".submitBtn");
  const numberInput = document.getElementById("card-number");
  const expiryInput = document.getElementById("card-expiration-date");
  const cvvInput = document.getElementById("card-ccv");

  // 控制提交按鈕
  //canGetPrime: 如果所有信用卡欄位都是 true會返回 true
  submitButton.disabled = !update.canGetPrime;

  //處理信用卡類型，在畫面顯示是什麼卡
  const imageSrc = handleCardType(update.cardType);
  cardImage.src = imageSrc;

  //驗證卡號
  updateFieldStatus(numberInput, update.status.number);
  //驗證有效期
  updateFieldStatus(expiryInput, update.status.expiry);
  //驗證 CCV
  updateFieldStatus(cvvInput, update.status.ccv);

}


//初始化 TapPay
function initTopPay() {
  try {
    // //設置 TapPay SDK
    TPDirect.setupSDK(config.APP_ID, config.APP_KEY, "sandbox");

    TPDirect.card.setup({
            fields: {
                number: {
                    element: "#card-number",
                    placeholder: "**** **** **** ****"
                },
                expirationDate: {
                    element: "#card-expiration-date",
                    placeholder: "MM / YY"
                },
                ccv: {
                    element: "#card-ccv",
                    placeholder: "CVV"
                }
            },
            styles: {
                "input": {
                    "color": "#666666",
                    "font-size": "16px"
                },
                "input.ccv": {
                    "font-size": "16px"
                },
                ":focus": {
                    "color": "black"
                },
                ".valid": {
                    "color": "green"
                },
                ".invalid": {
                    "color": "red"
                },
                "@media screen and (max-width: 400px)": {
                    "input": {
                        "color": "orange"
                    }
                }
            },
            // 此設定會顯示卡號輸入正確後，會顯示前六後四碼信用卡卡號
            isMaskCreditCardNumber: true,
            maskCreditCardNumberRange: {
                beginIndex: 6, 
                endIndex: 11
            }
        })

    // 監聽卡片更新事件
    TPDirect.card.onUpdate(function (update) {
      checkCreditCard(update);
    });

  } catch(error) {
    console.error("Error: ", error);
  }

}


//檢查三個欄位是否填寫正確
//name和 email已經自動填上使用者資料，除非使用者改動，否則預設是true
let isNameValid = true;
let isEmailValid = true;
let isPhoneValid = false;


//獲取驗證通過後的聯絡資料
function getValidatedContactInfo() {
  const nameInput = document.getElementById("contact-name");
  const emailInput = document.getElementById("contact-email");
  const phoneInput = document.getElementById("contact-phone");

  if (isNameValid && isEmailValid && isPhoneValid ) {
    return {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
    } 
  } else {
    return null;
  }
}

//監聽聯絡資訊輸入框的輸入
function checkContactInput() {
  const nameInput = document.getElementById("contact-name");
  const emailInput = document.getElementById("contact-email");
  const phoneInput = document.getElementById("contact-phone");


  //檢查姓名欄不能為空
  nameInput.addEventListener("blur", () => {
    const name = nameInput.value.trim();
    console.log(name);
    isNameValid = name !== "";
    updateFieldStatus(nameInput, isNameValid);
  })

  //檢查信箱格式
  emailInput.addEventListener("blur", () => {
    const email = emailInput.value.trim();
    console.log(email);
    isEmailValid = isValidEmail(email);
    updateFieldStatus(emailInput, isEmailValid);
  })

  //檢查手機格式
  phoneInput.addEventListener("blur", () => {
    const phone = phoneInput.value.trim();
    isPhoneValid = isValidPhone(phone);
    updateFieldStatus(phoneInput, isPhoneValid);
  })

}

//獲取 prime，TPDirect.card.getPrime是非同步函數，無法把資料傳出來
//包裝成一個返回 Promise 的函數
function getPrimePromise() {
  return new Promise((resolve, reject) => {
    TPDirect.card.getPrime((result) => {
      if (result.status !== 0) {
        reject(new Error("獲取prime失敗"));
      } else {
        resolve(result.card.prime);
      }
    });
  });
}

//訂購表單送出事件
async function submitOrderForm(currentBooking, totalPrice) {
    // 取得 TapPay Fields 的 status
    const tappayStatus = TPDirect.card.getTappayFieldsStatus();
    //取得經過驗證的聯絡資訊
    const contactData = getValidatedContactInfo();

    if (tappayStatus.canGetPrime === false || !contactData) {
      throw new Error("表單驗證失敗，無法獲取 prime");
    }

    try {
      const prime = await getPrimePromise();
      console.log("獲取prime成功", prime);

      //創建請求體
      const requestData = {
        prime,
        totalPrice,
        currentBooking,
        contactData
      }

      console.log(requestData);


      

    } catch(error) {
      console.error("處理訂單時發生錯誤:", error);
    }
    
}


//加載初始頁面
async function init() {
  //檢查使用者登入狀態，沒登入跳轉回首頁
  const isAuthUser = await checkUserStatus();

  if (!isAuthUser) {
    location.href = "/";
    return;
  }

  //顯示加載轉圈動畫
  showSpinner();

  //初始化 NavBar
  initNavBar(isAuthUser);

  //初始化 TapPay SDK
  initTopPay();

  //改變歡迎詞用戶名
  updateUserName(isAuthUser);

  //加載頁面資料
  const results = await fetchBooking();

  //更新目前頁面的 current Booking
  currentBooking = results.data;
  
  setTimeout( async() => {
    await displayBooking(results, isAuthUser);
    hideSpinner();
  }, 300)

  //監聽聯絡資訊輸入框的輸入
  //必須等待畫面render結束才能取得輸入框裡的資料
  checkContactInput();

  //監聽訂購表單送出事件
  const submitButton = document.querySelector(".submitBtn");
  submitButton.addEventListener("click", () => {
    //處理送出表單
    submitOrderForm(currentBooking, totalPrice);
  })


}
 
document.addEventListener("DOMContentLoaded", init);
