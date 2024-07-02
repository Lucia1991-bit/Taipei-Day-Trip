//顯示加載轉圈動畫
function showSpinner() {
  const spinner = document.querySelector(".spinner");
  spinner.classList.add("show");
}

//隱藏加載轉圈動畫
function hideSpinner() {
  const spinner = document.querySelector(".spinner");
  spinner.classList.remove("show");
}

export { showSpinner, hideSpinner };