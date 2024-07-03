import { updateFieldStatus } from "../view/fieldStatus.js";

const config = {
    APP_ID: "151683",
    APP_KEY: "app_z60Z765LKvawMueRKQOw6SeX7lNw36ODZTXeO4G6ilbfnfQY11xhAIeqqZF5"
};

//檢查信用卡是什麼卡，並顯示在畫面上
function handleCardType(cardType) {

  let imageSrc = "/static/image/card/card_default.svg";
  
  switch(cardType) { 
    case "visa":
      imageSrc = "/static/image/card/card_visa.png";
      break;

    case "mastercard":
      imageSrc = "/static/image/card/card_mastercard.png";
      break;

    case "jcb":
      imageSrc = "/static/image/card/card_jcb.svg";
      break;

    case "amex":
      imageSrc = "/static/image/card/card_amex.png";
      break;

    case "unionpay":
      imageSrc = "/static/image/card/card_union_pay.png";
      break;
  }

  return imageSrc;
}

//驗證信用卡
function checkCreditCard(update) {
  const cardTypeEL = document.querySelector(".card-type");
  const cardImage = document.querySelector(".card-type img");
  const submitButton = document.querySelector(".submitBtn");
  const numberInput = document.getElementById("card-number");
  const expiryInput = document.getElementById("card-expiration-date");
  const cvvInput = document.getElementById("card-ccv");

  //處理信用卡類型，在畫面顯示是什麼卡
  const imageSrc = handleCardType(update.cardType);
  cardImage.src = imageSrc;

  //驗證卡號
  updateFieldStatus(numberInput, update.status.number);
  //驗證有效期
  updateFieldStatus(expiryInput, update.status.expiry);
  //驗證 CCV
  updateFieldStatus(cvvInput, update.status.ccv);

}


//初始化 TapPay
function initTopPay() {
  try {
    // //設置 TapPay SDK
    TPDirect.setupSDK(config.APP_ID, config.APP_KEY, "sandbox");

    TPDirect.card.setup({
            fields: {
                number: {
                    element: "#card-number",
                    placeholder: "**** **** **** ****"
                },
                expirationDate: {
                    element: "#card-expiration-date",
                    placeholder: "MM / YY"
                },
                ccv: {
                    element: "#card-ccv",
                    placeholder: "CVV"
                }
            },
            styles: {
                "input": {
                    "color": "#666666",
                    "font-size": "16px"
                },
                "input.ccv": {
                    "font-size": "16px"
                },
                ":focus": {
                    "color": "black"
                },
                ".valid": {
                    "color": "green"
                },
                ".invalid": {
                    "color": "red"
                },
                "@media screen and (max-width: 400px)": {
                    "input": {
                        "color": "black"
                    }
                }
            },
            // 此設定會顯示卡號輸入正確後，會顯示前六後四碼信用卡卡號
            isMaskCreditCardNumber: true,
            maskCreditCardNumberRange: {
                beginIndex: 6, 
                endIndex: 11
            }
        })

  } catch(error) {
    console.error("Error: ", error);
  }

}

export { initTopPay, checkCreditCard, handleCardType };
