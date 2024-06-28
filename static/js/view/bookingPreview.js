//fetchData Module
import { fetchBooking } from "./component/fetchData.js";


async function initNavBookingBtn() {
  const bookingBtn = document.getElementById("nav_bookingBtn");
  const prevModal = document.querySelector(".booking_modal");
  const amountEL = document.querySelector(".nav_booking_count");

  let timeout;

  //先檢查該用戶是否有預定行程
  const results = await fetchBooking();
  
  if (!results) {
    console.log("請求發生錯誤");
    return;
  }

  const { data } = results;

  //如果沒有預定行程，結束程式
  if (!data) {
    //隱藏預訂數量
    amountEL.style.display = "none";
    return;
  } 

  //如果有資料，在按鈕旁顯示預訂數量
  const amount = data.length;
  amountEL.textContent = amount;
  amountEL.style.display = "block";

  //監聽滑鼠移出移入事件，顯示彈出行程預定預覽
  bookingBtn.addEventListener("mouseenter", showBookingPreview);
  bookingBtn.addEventListener("mouseleave", hideBookingPreview);
  prevModal.addEventListener("mouseenter", showBookingPreview);
  prevModal.addEventListener("mouseleave", hideBookingPreview);


  function showBookingPreview() {
    clearTimeout(timeout);
    const container = document.querySelector(".booking_modal_container");
    const priceContainer = document.querySelector(".booking_modal_price_container");

    data.forEach(booking => {
      const bookingEL = createItem(booking);
      container.insertBefore(bookingEL, divideLine);
    });
    //
    const 

  
  
  
  
  prevModal.classList.add("show");

}







}