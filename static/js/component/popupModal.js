//點擊導覽列的登入/註冊按鈕，彈出頁面處理
const container = document.querySelector(".popup_container");
const loginPage = document.querySelector(".login");
const signupPage = document.querySelector(".signup");
const overlayEL = document.querySelector(".overlay");

// 檢查頁面是否需要滾動
// 如果頁面本來就沒有滾動軸，再多加上滾動軸寬度後頁面反而會偏移
function isPageScrollable() {
  return document.documentElement.scrollHeight > document.documentElement.clientHeight;
}

// 獲取滾動條的寬度
function getScrollbarWidth() {
  const outer = document.createElement("div");
  outer.style.visibility = "hidden";
  outer.style.overflow = "scroll";
  document.body.appendChild(outer);
  const inner = document.createElement("div");
  outer.appendChild(inner);
  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
  //移除 outer 元素，以免影響頁面的其他部分
  outer.parentNode.removeChild(outer);
  
  return scrollbarWidth;
}
// 禁止滾動
function disableScroll() {
  console.log("禁止滾動");
  if (isPageScrollable()) {
    const scrollbarWidth = getScrollbarWidth();
    document.body.style.overflow = "hidden";
    //滾軸消失後，把右邊補上滾軸寬度
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    // navBar是 fixed，不會隨 body改變寬度，所以需要另外調整 navBar 的寬度
    document.querySelector(".nav").style.width = `calc(100% - ${scrollbarWidth}px)`;
  } else {
    document.body.style.overflow = "hidden";
  }
}
// 恢復滾動
function enableScroll() {
  document.body.style.overflowY = "auto";
  document.body.style.paddingRight = "";
  // 恢復 navBar 的寬度
  document.querySelector(".nav").style.width = "100%";
}


//顯示彈出頁面，顯示遮罩，禁止滾動
function showLoginModal() {
  container.classList.add("active");
  container.style.transition = "all 0.4s ease-in-out";
  loginPage.classList.add("active");
  overlayEL.style.display = "block";
  disableScroll();
}

//隱藏彈出頁面，隱藏遮罩，恢復滾動
function hideLoginModal() {
  container.classList.remove("active");
  container.style.transition = "none";
  loginPage.classList.remove("active");
  signupPage.classList.remove("active");
  overlayEL.style.display = "none";
  enableScroll();
}

// 轉換登入/註冊頁面
function togglePages(showPage, hidePage) {
  hidePage.classList.remove("active");
  hidePage.classList.add("hide");
  showPage.classList.add("active");
}

export { showLoginModal, hideLoginModal, togglePages, disableScroll, enableScroll };
