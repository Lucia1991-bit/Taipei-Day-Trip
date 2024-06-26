import { showLoginModal, hideLoginModal, togglePages } from "./component/popupModal.js";

//顯示成功/錯誤訊息
function showMessage(field, message, type = "success") {
  const page = document.getElementById(`${field}`);
  const form = document.getElementById(`${field}Form`);
  const formLink = document.getElementById(`${field}LinkContent`);

  let oldMessage = document.querySelector(".form_message");

  //如果有舊的訊息，則先移除
  if (oldMessage) {
    form.removeChild(oldMessage);
  }
 
  let text = document.createElement("p");
  const div = document.createElement("div");
  const icon = document.createElement("i");

  // 設定 icon 和 message 的顏色
  switch (type) {
    case "success":
      icon.classList.add("fa-solid", "fa-check-circle");
      div.classList.add("form_message", "success");
      break;
    case "fail":
      icon.classList.add("fa-solid", "fa-circle-exclamation");
      div.classList.add("form_message", "fail");
      break;
    case "pending":
      icon.classList.add("fa-solid", "fa-warning");
      div.classList.add("form_message", "pending");
      break;
    default:
      console.log(`Unknown type: ${type}`);
      break
  }

  text.textContent = message;

  div.appendChild(icon);
  div.appendChild(text);
  form.insertBefore(div, formLink);

  if (type === 'fail') {
    page.classList.remove("shake-effect");
    setTimeout(() => {
      page.classList.add("shake-effect");
    }, 100);
  }
}

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


//登入使用者
async function loginUser(requestData) {

  try {
    const response = await fetch("/api/user/auth", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestData)
    })

    const result = await response.json();

    if (!response.ok) {
      // 登入失敗，顯示錯誤訊息
      if (response.status === 400) {
        showMessage("login", result.message, "fail");
      }
      //輸入格式錯誤，顯示錯誤訊息
      if (response.status === 422) {
        showMessage("login", "請輸入正確的電子信箱格式", "fail");
      }

      throw new Error(result.message);
    }
    
    return result;

  } catch (error) {
    console.error("Error: ", error)
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

  showMessage("login", "驗證中...", "pending");
  const result = await loginUser(requestData);

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

// 註冊使用者
async function registerUser(requestData) {
  try {
    const response = await fetch("/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestData)
    })

    const result = await response.json();

    if (!response.ok) {
      // 註冊失敗，顯示錯誤訊息
      if (response.status === 400) {
        showMessage("signup", result.message, "fail");
      }

      //輸入格式錯誤，顯示錯誤訊息
      if (response.status === 422) {
        showMessage("signup", "請輸入正確的電子信箱格式", "fail");
      }

      throw new Error(result.message);
    }

    return true;

  } catch (error) {
    console.error("Error: ", error)
    return false;
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
  showMessage("signup", "驗證中...", "pending");
  const successStatus = await registerUser(requestData);


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


//頁面初始
async function initNavBar(userStatus) {
  const navLoginBtn = document.getElementById("nav_loginBtn");
  const mobileNavLoginBtn = document.getElementById("mobile_nav_loginBtn");
  const navBookingBtn = document.getElementById("nav_bookingBtn");

    //初始化使用者登入狀態，並獲得使用者資料
    // await initUserStatus();
    // const userData = await getUserData();
    // console.log("在外層檢查使用者：", userData);

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