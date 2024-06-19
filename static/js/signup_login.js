import { showLoginModal, hideLoginModal, togglePages, disableScroll, enableScroll } from "./component/popupModal.js";



//顯示成功/錯誤訊息
function showMessage(field, message, isSuccess = true) {
  const page = document.getElementById(`${field}`);
  const form = document.getElementById(`${field}Form`);
  const formLink = document.getElementById(`${field}LinkContent`);
  let text = document.querySelector(".validate_error p");

  //如果錯誤訊息已存在，更換訊息內容（防止重複顯示錯誤訊息）
  //如果不存在製作新訊息
  if (text) {
    text.textContent = message;
  } else {
    const div = document.createElement("div");
    const icon = document.createElement("i");
    text = document.createElement("p");

    icon.classList.add("fa-solid", isSuccess ? "fa-check-circle" : "fa-circle-exclamation");
    div.classList.add("form_message", isSuccess ? "success" : "fail");
    text.textContent = message;

    div.appendChild(icon);
    div.appendChild(text);
    form.insertBefore(div, formLink);

    if (!isSuccess) {
      page.classList.add("shake-effect");
    }
    //看要不要自動移除訊息
    setTimeout(() => {
      page.classList.remove("shake-effect");
      clearMessage();
    }, 3000)
    
  }
}

//移除訊息
function clearMessage(){
  const message = document.querySelector(".form_message");
  if (message) {
    message.remove();
  }
}


//登入使用者
async function loginUser(requestData) {
  console.log("送出請求...");

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
        showMessage("login", result.message, false);
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

  console.log("送出登入請求");

  const result = await loginUser(requestData);

  emailInput.value = "";
  passwordInput.value = "";

  //註冊成功
  if (result) {
    const { token } = result;
    
    //將 token 存進 localStorage
    localStorage.setItem("token", token);

    //顯示成功訊息
    showMessage("login", "登入成功，請等待跳轉頁面", true);

    //跳轉到首頁
    setTimeout(()=> {
      window.location.href = "/";
    }, 500)

  } else {
    console.error("登入失敗");
  }
    
}

// 註冊使用者
async function registerUser(requestData) {
  console.log("送出請求...");
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
        showMessage("signup", result.message, false);
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
  console.log("送出註冊請求");
  const successStatus = await registerUser(requestData);


  //註冊成功，清空 input
  if (successStatus) {
    nameInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";
    //顯示成功訊息
    showMessage("signup", "註冊成功，請登入會員", true);

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
  })

  //點擊登入按鈕，從註冊頁面轉換成登入頁面
  loginLink.addEventListener("click", ()=> {
    togglePages(loginPage, signupPage);
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

export { initModal, initMobileMenu };