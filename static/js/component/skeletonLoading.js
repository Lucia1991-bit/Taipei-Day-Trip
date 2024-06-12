//顯示 skeleton loading動畫
function showSkeletonLoading() {
  const amount = currentKeyword? 4 : 8;

  // 創建 skeleton loading item
  for (let i = 0; i < amount; i++) {
    const skeleton = document.createElement("div");
    const img = document.createElement("div");
    const info = document.createElement("div");
    const text1 = document.createElement("p");
    const text2 = document.createElement("p");
    const skeletonText1 = document.createElement("span");
    const skeletonText2 = document.createElement("span");

    skeleton.classList.add("attraction_item", "skeleton");
    img.classList.add("attraction_item_image", "loading_image");
    info.classList.add("attraction_item_info");
    skeletonText1.classList.add("loading", "mrt_name");
    skeletonText2.classList.add("loading", "category");

    text1.appendChild(skeletonText1);
    text2.appendChild(skeletonText2);
    info.appendChild(text1);
    info.appendChild(text2);
    skeleton.appendChild(img);
    skeleton.appendChild(info);

    container.appendChild(skeleton);
  }
}

//隱藏 skeleton loading動畫 
function hideSkeletonLoading() {
  const skeletons = document.querySelectorAll(".skeleton");

  skeletons.forEach(skeleton => {
    skeleton.classList.add("hide-skeleton");
  });
}

export { showSkeletonLoading, hideSkeletonLoading };