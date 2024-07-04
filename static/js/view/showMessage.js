
//******************** 註冊/登入頁面 ***********************
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



//****************** Attraction頁面 ***********************
//顯示成功/錯誤訊息 
function showStatusMessage(message, type) {
  const messageContainer = document.querySelector(".schedule_message");
  const icon = messageContainer.querySelector("i");
  const text = messageContainer.querySelector("p");

  if (type === "success") {
    icon.className = "fa-solid fa-check-circle";
    messageContainer.className = "schedule_message success";
  } else {
    icon.className = "fa-solid fa-circle-exclamation";
    messageContainer.className = "schedule_message fail";
  }

  text.textContent = message;

}



export { showMessage, showStatusMessage };