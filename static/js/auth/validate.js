//檢查信箱格式
function isValidEmail(email) {
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailPattern.test(email);
}


//檢查手機格式
function isValidPhone(phone) {
  const phonePattern = /^(09)\d{8}$/;
  return phonePattern.test(phone);
}

export { isValidEmail, isValidPhone };