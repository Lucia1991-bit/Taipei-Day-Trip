//獲取 localStorage的 TOKEN Module
import { getToken } from "../auth/getToken.js";

const TOKEN = getToken();

//創建新預定
async function createBooking(requestData) {

  try {
    console.log("送出請求...");
    const response = await fetch("/api/booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOKEN}`
      },
      body: JSON.stringify(requestData)
    })

    const result = await response.json();

    if (!response.ok) {
      // 因預定時段衝突新增失敗，顯示錯誤訊息
      if (response.status === 400) {
        showStatusMessage(result.message, "fail");
      }
      throw new Error(result.message);
    }

    return result;

  } catch(error) {
    console.error("Error: ", error);
  }
}


//獲取預定資料
async function fetchBooking() {

  try {
    const response = await fetch("/api/booking", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${TOKEN}`
      }
    })

    const results = await response.json();

    if (!response.ok) {
      throw new Error(results.message);
    }

    return results;

  } catch (error) {
    console.log("Error:", error);
    return null;
  }

}

// 以 bookingId 刪除預定行程
async function deleteBooking(bookingId) {

  try {
    const response = await fetch(`/api/booking/${bookingId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOKEN}`
      }
    });

    const results = await response.json();

    if (!response.ok) {
      throw new Error(results.message);
    }

    return results;
  } catch (error) {
    console.error("Error: ", error);
    throw error;
  }
}


export { createBooking, fetchBooking, deleteBooking };