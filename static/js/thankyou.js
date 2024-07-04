//顯示註冊/登入頁面 Module
import { showLoginModal } from "./view/popupModal.js";
//檢查使用者登入狀態 Module
import { checkUserStatus } from "./auth/userStatus.js";
//NavBar以及註冊/登入相關 Module
import { initNavBar } from "./navBar.js";

console.log("thankyou js運行中...");


function displayOrderNumber() {
  //從查詢參數獲取訂單編號
  const urlParams = new URLSearchParams(window.location.search);
  const orderNumber = urlParams.get("number");

  const orderNumberEL = document.querySelector(".order_info_number");
  orderNumberEL.textContent = orderNumber;
}


// 加載初始頁面
async function init() {
  //檢查使用者登入狀態
  const isAuthUser = await checkUserStatus();

  if (!isAuthUser) {
    location.href = "/";
    return;
  }

  //初始化 NavBar
  initNavBar(isAuthUser);

  //獲取查詢參數的訂單編號並渲染畫面
  displayOrderNumber();

}

document.addEventListener("DOMContentLoaded", init);
