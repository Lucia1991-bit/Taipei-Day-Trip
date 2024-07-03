function showButtonLoading(button) {
  button.classList.add("showBtnLoading");
  button.style.backgroundColor = "var(--cyan80)";
}


function hideButtonLoading(button) {
  button.classList.remove("showBtnLoading");
  button.style.backgroundColor = "var(--cyan70)";
}


export { showButtonLoading, hideButtonLoading };