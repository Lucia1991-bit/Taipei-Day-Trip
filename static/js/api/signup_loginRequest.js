//顯示成功 /錯誤訊息 Module
import { showMessage } from "../view/showMessage.js";


//登入使用者
async function loginUser(requestData) {

  try {
    const response = await fetch("/api/user/auth", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestData)
    })

    const result = await response.json();

    if (!response.ok) {
      // 登入失敗，顯示錯誤訊息
      if (response.status === 400) {
        showMessage("login", result.message, "fail");
      }
      //輸入格式錯誤，顯示錯誤訊息
      if (response.status === 422) {
        showMessage("login", "請輸入正確的電子信箱格式", "fail");
      }

      throw new Error(result.message);
    }
    
    return result;

  } catch (error) {
    console.error("Error: ", error)
  }
  
}


// 註冊使用者
async function registerUser(requestData) {
  try {
    const response = await fetch("/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestData)
    })

    const result = await response.json();

    if (!response.ok) {
      // 註冊失敗，顯示錯誤訊息
      if (response.status === 400) {
        showMessage("signup", result.message, "fail");
      }

      //輸入格式錯誤，顯示錯誤訊息
      if (response.status === 422) {
        showMessage("signup", "請輸入正確的電子信箱格式", "fail");
      }

      throw new Error(result.message);
    }

    return true;

  } catch (error) {
    console.error("Error: ", error)
    return false;
  }
}

export { registerUser, loginUser };