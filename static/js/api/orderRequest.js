//獲取 localStorage的 TOKEN Module
import { getToken } from "../auth/getToken.js";

const TOKEN = getToken();

//向後端送出訂購請求
async function createOrder(requestData) {
  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOKEN}`
      },
      body: JSON.stringify(requestData)
    })

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message)
    }

    return result

  } catch (error) {
    console.error("送出付款請求發生錯誤", error);
  } 
}

export { createOrder };