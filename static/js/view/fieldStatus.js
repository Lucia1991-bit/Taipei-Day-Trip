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
      element.classList.remove("has-error", "shake-effect");
      element.style.color = "green";
      break;
  }
}

export { updateFieldStatus };