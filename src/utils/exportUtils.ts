import html2canvas from "html2canvas";

export const exportElementAsImage = async (
  element: HTMLElement,
  filename: string = "tier-list"
): Promise<void> => {
  try {
    // 确保所有图片都已加载
    const images = element.querySelectorAll("img");
    await Promise.all(
      Array.from(images).map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) {
              resolve(void 0);
            } else {
              img.onload = () => resolve(void 0);
              img.onerror = () => resolve(void 0);
            }
          })
      )
    );

    // 等待一小段时间确保渲染完成
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 创建 canvas
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2, // 高质量导出
      useCORS: true,
      allowTaint: false,
      logging: false,
      foreignObjectRendering: true,
      // 确保捕获完整元素
      width: element.scrollWidth,
      height: element.scrollHeight,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
    });

    // 创建下载链接
    const link = document.createElement("a");
    link.download = `${filename.replace(
      /[^a-zA-Z0-9\u4e00-\u9fa5]/g,
      "_"
    )}.png`;
    link.href = canvas.toDataURL("image/png", 1.0);

    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("Export completed successfully");
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  }
};
