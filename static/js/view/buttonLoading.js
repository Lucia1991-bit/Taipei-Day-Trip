

function showButtonLoading(button) {
  button.classList.add("showBtnLoading");
  button.style.backgroundColor = "var(--cyan80)"
  button.disabled = true;
  console.log("按鈕loading");
}


function hideButtonLoading(button) {
  console.log("隱藏按鈕loading");
  button.classList.remove("showBtnLoading");
  button.style.backgroundColor = "var(--cyan70)"
  button.disabled = false;
  
}


export { showButtonLoading, hideButtonLoading };