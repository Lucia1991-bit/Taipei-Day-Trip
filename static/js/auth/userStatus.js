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
        "Authorization": `Bearer ${token}`
      }
    })

    //驗證成功，獲得登入使用者資訊。
    //驗證不成功，data為 None
    const { data } = await response.json();

    return data;

  } catch(error) {
    console.error("Error: ", error)
    return false
  }
}

export { checkUserStatus };


