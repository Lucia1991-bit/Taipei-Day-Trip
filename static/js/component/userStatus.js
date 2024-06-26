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

    const { data: userData } = await response.json();

    return userData

  } catch(error) {
    console.error("Error: ", error)
    return false
  }
}

export { checkUserStatus }


