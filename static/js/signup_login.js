import { showLoginModal, hideLoginModal, togglePages } from "./component/popupModal.js";



//顯示錯誤訊息

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
  const nameInput = document.getElementById("signup-name");
  const emailInput = document.getElementById("signup-email");
  const passwordInput = document.getElementById("signup-password");

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
 

  // //驗證 password
  // const isValidPassword = validatePassword(formData.password);

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
  
  //註冊成功，清空 input，跳轉到 login頁面
  if (successStatus) {
    nameInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";
    togglePages(loginPage, signupPage);

  } else {
    console.error("註冊失敗");
    //顯示錯誤訊息
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
 
  // 點擊導覽列的登入/註冊按鈕，彈出註冊/登入頁面
  navLoginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    //彈出頁面
    showLoginModal();
  })

  // 點擊遮罩層時,關閉登入頁面和遮罩層
  overlayEL.addEventListener("click", (e) => {
    if (e.target === overlayEL) {
      hideLoginModal();
    }
  });

  //點擊註冊按鈕，從登入頁面轉換成註冊頁面
  signupLink.addEventListener("click", ()=> {
    console.log("點擊");
    togglePages(signupPage, loginPage);
  })

  //點擊登入按鈕，從註冊頁面轉換成登入頁面
  loginLink.addEventListener("click", ()=> {
    togglePages(loginPage, signupPage);
  })


  // 監聽註冊/登入表單提交事件
  signupForm.addEventListener("submit", submitSignupForm);

}


//手機版 Hamburger 註冊/登入頁面
function initMobileMenu() {
  const hamburgerMenu = document.querySelector(".hamburger-menu");
  const mobileModal = document.querySelector(".mobile_nav_list");
  const mobileNavLoginBtn = document.getElementById("mobile_nav_loginBtn");

  hamburgerMenu.addEventListener("click", () => {
    hamburgerMenu.classList.toggle("open");
    mobileModal.classList.toggle("open");
  })

  mobileNavLoginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    showLoginModal();
  })
  
}



export { initModal, initMobileMenu };