//彈出頁面相關 Module
import { showLoginModal, hideLoginModal, togglePages } from "./view/popupModal.js";
//送出註冊 /登入請求到後端 Module
import { registerUser, loginUser } from "./api/signup_loginRequest.js";

//顯示成功 /錯誤訊息 Module
import { showMessage } from "./view/showMessage.js";

//顯示按鈕 loading
import { showButtonLoading, hideButtonLoading } from "./view/buttonLoading.js";


//把表單清乾淨
function clearForm(field){
  const page = document.getElementById(`${field}`);
  const form = document.getElementById(`${field}Form`);
  const inputs = form.querySelectorAll(".form_control input");
  const message = form.querySelector(".form_message");

  page.classList.remove("shake-effect");

  inputs.forEach(input => {
    input.value = "";
  })

  if (message) {
    message.remove();
  }
}

// 送出登入表單
async function submitLoginForm(e) {
  e.preventDefault();
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  //創建請求體
  const requestData = {
    email,
    password
  }

  showButtonLoading(loginBtn);
  // showMessage("login", "驗證中...", "pending");
  const result = await loginUser(requestData);

  setTimeout(() => {  
    hideButtonLoading(loginBtn);
  }, 100)

  //註冊成功
  if (result) {
    const { token } = result;
    
    //將 token 存進 localStorage
    localStorage.setItem("token", token);

    //顯示成功訊息
    showMessage("login", "登入成功，請等待跳轉頁面", "success");

    //重新加載頁面
    setTimeout(()=> {
      location.reload();
    }, 500)

  } else {
    console.error("登入失敗");
  }
    
}

//送出註冊表單
async function submitSignupForm(e) {
  e.preventDefault();
  const signupPage = document.querySelector(".signup");
  const loginPage = document.querySelector(".login");

  const nameInput = document.getElementById("signup-name");
  const emailInput = document.getElementById("signup-email");
  const passwordInput = document.getElementById("signup-password");

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  const signupBtn = document.getElementById("signupBtn");
  const loginBtn = document.getElementById("loginBtn");
 
  // //驗證 password 格式
  // const isValidPassword = validatePassword(password);

  // //如果沒通過驗證，無法提交表單
  // if (!isValidPassword) {
  //   console.error("驗證失敗");
  //   return;
  // }

  //創建請求體
  const requestData = {
    name,
    email,
    password
  }

  //送註冊請求到後端
  showButtonLoading(signupBtn);
  // showMessage("signup", "驗證中...", "pending");
  const successStatus = await registerUser(requestData);

  setTimeout(() => {  
    hideButtonLoading(signupBtn);
  }, 100)


  //註冊成功，清空 input
  if (successStatus) {
    nameInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";
    //顯示成功訊息
    showMessage("signup", "註冊成功，請登入會員", "success");

    //跳轉到登入頁面
    setTimeout(()=> {
      togglePages(loginPage, signupPage);
    }, 1000)
    

  } else {
    console.error("註冊失敗");
  }
}


//桌機版註冊/登入頁面
function initModal() {

  //註冊/登入頁面所需元素
  const navLoginBtn = document.getElementById("nav_loginBtn");

  const overlayEL = document.querySelector(".overlay");
  const signupPage = document.querySelector(".signup");
  const loginPage = document.querySelector(".login");
  const loginLink = document.getElementById("loginLink");
  const signupLink = document.getElementById("signupLink");
  
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");

  const exitBtns = document.querySelectorAll(".form_exit_button");

  // 點擊導覽列的登入/註冊按鈕，彈出註冊/登入頁面
  navLoginBtn.addEventListener("click", showLoginModal);

  // 點擊 x按鈕或遮罩層時,關閉登入頁面和遮罩層
  exitBtns.forEach(exitBtn => {
    exitBtn.addEventListener("click", () => {
      hideLoginModal(); 
    });
  })
  
  overlayEL.addEventListener("click", (e) => {
    if (e.target === overlayEL) {
      hideLoginModal();
    }
  });

  //點擊註冊按鈕，從登入頁面轉換成註冊頁面
  signupLink.addEventListener("click", ()=> {
    togglePages(signupPage, loginPage);
     clearForm("login");
  })

  //點擊登入按鈕，從註冊頁面轉換成登入頁面
  loginLink.addEventListener("click", ()=> {
    togglePages(loginPage, signupPage);
     clearForm("signup");
  })

  // 監聽註冊/登入表單提交事件
  signupForm.addEventListener("submit", submitSignupForm);
  loginForm.addEventListener("submit",submitLoginForm);

}

//手機版 Hamburger 註冊/登入頁面
function initMobileMenu() {
  const hamburgerMenu = document.querySelector(".hamburger-menu");
  const mobileModal = document.querySelector(".mobile_nav_list");
  const mobileNavLoginBtn = document.getElementById("mobile_nav_loginBtn");
  const mobileOverlayEL = document.querySelector(".mobileOverlay");

  hamburgerMenu.addEventListener("click", () => {
    hamburgerMenu.classList.toggle("open");
    mobileModal.classList.toggle("open");
    mobileOverlayEL.style.display = "block";
    //檢查 mobileModal 是否是開啟的狀態，如果是則顯示遮罩，不是的話隱藏遮罩
    mobileOverlayEL.style.display = mobileModal.classList.contains("open") ? "block" : "none";
  })

  mobileOverlayEL.addEventListener("click", (e) => {
    if (e.target === mobileOverlayEL) {
      hamburgerMenu.classList.toggle("open");
      mobileModal.classList.toggle("open");
      mobileOverlayEL.style.display = mobileModal.classList.contains("open") ? "block" : "none";
    }
  });

  mobileNavLoginBtn.addEventListener("click", showLoginModal);
  
}

//登出使用者
function logoutUser() {
  //清除token並更新界面
  localStorage.removeItem("token");

  //重新加載頁面
  location.reload();
}


export { initModal, initMobileMenu, logoutUser };