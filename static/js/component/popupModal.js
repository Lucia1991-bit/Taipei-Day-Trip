//彈出註冊/登入頁面
function initModal() {

//註冊/登入頁面所需元素
const navLoginBtn = document.getElementById("nav_loginBtn");
const overlayEL = document.querySelector(".overlay");
const signupPage = document.querySelector(".signup");
const loginPage = document.querySelector(".login");
const loginLink = document.getElementById("loginLink");
const signUpLink = document.getElementById("signUpLink");

// 獲取滾動條的寬度
function getScrollbarWidth() {
  const outer = document.createElement("div");
  outer.style.visibility = "hidden";
  outer.style.overflow = "scroll";
  document.body.appendChild(outer);

  const inner = document.createElement("div");
  outer.appendChild(inner);

  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
  outer.parentNode.removeChild(outer);
  console.log(scrollbarWidth);

  return scrollbarWidth;
}

// 禁止滾動
function disableScroll() {
  const scrollbarWidth = getScrollbarWidth();
  document.body.style.overflow = "hidden";
  //滾軸消失後把右邊 padding補上滾軸寬度
  document.body.style.paddingRight = `${scrollbarWidth}px`;
}

// 恢復滾動
function enableScroll() {
  document.body.style.overflowY = "auto";
  document.body.style.paddingRight = '';
}


  // Navigation ==== 點擊登入/註冊按鈕，彈出註冊/登入頁面
  navLoginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    
    loginPage.classList.add("active")
    overlayEL.style.display = "block";
    disableScroll();
  })

  // 點擊遮罩層時,關閉登入視窗和遮罩層
  overlayEL.addEventListener("click", (e) => {
    if (e.target === overlayEL) {
      loginPage.classList.remove("active");
      signupPage.classList.remove("active");
      overlayEL.style.display = "none";
      enableScroll();
    }
  });

  // Signup/Login Page ==== 點擊按鈕，轉換註冊 / 登入頁面
  function togglePages (showPage, hidePage) {
    showPage.classList.add("active");
    hidePage.classList.remove("active");
  }

  signUpLink.addEventListener("click", ()=> {
    console.log("點擊");
    togglePages(signupPage, loginPage);
  })

  loginLink.addEventListener("click", ()=> {
    togglePages(loginPage, signupPage);
  })
}

export { initModal };