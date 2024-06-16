//點擊導覽列的登入/註冊按鈕，彈出頁面處理
const loginPage = document.querySelector(".login");
const signupPage = document.querySelector(".signup");
const overlayEL = document.querySelector(".overlay");

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


//顯示彈出頁面，顯示遮罩，禁止滾動
function showLoginModal() {
  loginPage.classList.add("active");
  overlayEL.style.display = "block";
  disableScroll();
}

//隱藏彈出頁面，隱藏遮罩，恢復滾動
function hideLoginModal() {
  loginPage.classList.remove("active");
  signupPage.classList.remove("active");
  overlayEL.style.display = "none";
  enableScroll();
}

// 轉換登入/註冊頁面
function togglePages(showPage, hidePage) {
  showPage.classList.add("active");
  hidePage.classList.remove("active");
}

export { showLoginModal, hideLoginModal, togglePages };
