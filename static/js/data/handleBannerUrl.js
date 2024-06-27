// 獲取正確的基礎 URL
function getBaseUrl() {

    // 根據環境變量或其他邏輯來決定使用哪個 URL
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        return "";  // 本地開發時使用相對路徑
    } else {
        return "https://dwt3855sb6n39.cloudfront.net";  // 生產環境使用 CloudFront
    }
}
// 在頁面加載時設置正確的 URL
function updateBannerUrl() {
  const baseUrl = getBaseUrl();
    
    // 更新 preload 連結
    document.querySelector("link[rel='preload']").href = `${baseUrl}/static/image/banner/welcome.png`;
    
    // 更新圖片源
    const sources = document.querySelectorAll("source");
    sources.forEach(source => {
        source.srcset = baseUrl + source.getAttribute("srcset");
    });
    
    // 更新 img 標籤
    const img = document.querySelector("picture img");
    img.src = baseUrl + img.getAttribute("src");
}

    