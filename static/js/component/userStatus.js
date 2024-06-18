//檢查使用者登入狀態
async function checkUserStatus() {
  //從 localStorage獲取 token
  const token = localStorage.getItem("token");

  //如果沒有token，結束程式
  if (!token) {
    return false
  }
  try {
    //如果有 token，送到後端驗證
    const response = await fetch("/api/user/auth", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })

    const result = await response.json();

    if (!response.ok) {
      throw new Error(response.message);
    }
    return result;

  } catch(error) {
    console.error("Error: ", error)
    return false
  }
}

//登出使用者
function logoutUser() {
  //清除token並更新界面
  localStorage.removeItem("token");

  //重新導向首頁
  window.location.href = "/";
}

export { checkUserStatus, logoutUser }