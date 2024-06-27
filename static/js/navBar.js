//顯示註冊/登入頁面 Module
import { showLoginModal } from "./view/popupModal.js";
import { initModal, initMobileMenu, logoutUser } from "./signup_login.js";


async function initNavBar(userStatus) {
  const navLoginBtn = document.getElementById("nav_loginBtn");
  const mobileNavLoginBtn = document.getElementById("mobile_nav_loginBtn");
  const navBookingBtn = document.getElementById("nav_bookingBtn");

    //監聽登入/註冊視窗
    initModal();
    //監聽手機版導覽列
    initMobileMenu();

    //檢查登入狀態，並改變登入/註冊按鈕文字
   if (userStatus) {
    navLoginBtn.textContent = "登出系統";
    mobileNavLoginBtn.textContent = "登出系統";

    //移除原本的監聽器
    navLoginBtn.removeEventListener("click", showLoginModal);
    mobileNavLoginBtn.removeEventListener("click", showLoginModal);

    //監聽登出按鈕
    navLoginBtn.addEventListener("click", logoutUser);
    mobileNavLoginBtn.addEventListener("click", logoutUser);

   } 

   //檢查登入狀態，若沒登入，顯示登入/註冊頁面。若已登入，導入 booking頁面
   const bookingBtn = document.getElementById("nav_bookingBtn");
   bookingBtn.addEventListener("click", () => {
      if (!userStatus) {
        showLoginModal();
      }
      else {
        location.href = "/booking";
      }
   });
}

export { initNavBar };