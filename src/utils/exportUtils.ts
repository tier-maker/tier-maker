import html2canvas from "html2canvas";

// 创建一个安全的 html2canvas 包装器来处理颜色解析错误
const safeHtml2Canvas = async (element: HTMLElement, options: Record<string, unknown>): Promise<HTMLCanvasElement> => {
  console.log('🎨 Using safeHtml2Canvas wrapper');
  try {
    console.log('🎨 First attempt with original configuration');
    return await html2canvas(element, options);
  } catch (error) {
    console.error('🎨 First attempt failed:', error);
    if (error instanceof Error && error.message.includes('Attempting to parse an unsupported color function')) {
      console.warn('🎨 Detected unsupported color function, retrying with fallback configuration...');
      
      // 使用更保守的配置重试
      const fallbackOptions = {
        ...options,
        backgroundColor: "#ffffff",
        scale: 1,
        foreignObjectRendering: false,
        useCORS: false,
        allowTaint: true,
        logging: false,
        onclone: (clonedDoc: Document) => {
          console.log("Using fallback color configuration");
          
          // 添加样式覆盖来强制使用兼容的颜色
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * {
              /* 强制所有元素使用兼容的颜色格式 */
              color: inherit !important;
              background-color: inherit !important;
              border-color: inherit !important;
            }
            
            /* 覆盖常见的 Tailwind 类 */
            .text-gray-400 { color: #9ca3af !important; }
            .text-gray-500 { color: #6b7280 !important; }
            .text-gray-800 { color: #1f2937 !important; }
            .bg-gray-50 { background-color: #f9fafb !important; }
            .bg-blue-50 { background-color: #eff6ff !important; }
            .border-gray-300 { border-color: #d1d5db !important; }
            .border-blue-300 { border-color: #93c5fd !important; }
            .border-blue-500 { border-color: #3b82f6 !important; }
            .bg-red-500 { background-color: #ef4444 !important; }
            .bg-red-600 { background-color: #dc2626 !important; }
            .text-white { color: #ffffff !important; }
            .bg-black { background-color: #000000 !important; }
            .bg-transparent { background-color: transparent !important; }
            
            /* 确保容器有正确的背景 */
            #tier-maker-content {
              background-color: #ffffff !important;
            }
          `;
          clonedDoc.head.appendChild(style);
          
          // 如果原来的 onclone 函数存在，也执行它
          if (options.onclone && typeof options.onclone === 'function') {
            options.onclone(clonedDoc);
          }
        }
      };
      
      console.log('🎨 Attempting fallback configuration...');
      return await html2canvas(element, fallbackOptions);
    }
    console.error('🎨 Non-color related error, rethrowing:', error);
    throw error;
  }
};

// 创建一个更强力的解决方案：预处理 DOM 来移除有问题的样式
const preprocessElementForExport = (element: HTMLElement): HTMLElement => {
  console.log('🔧 Preprocessing element for export...');
  
  // 克隆元素以避免修改原始 DOM
  const clonedElement = element.cloneNode(true) as HTMLElement;
  
  // 递归处理所有元素
  const processElement = (el: Element) => {
    if (el instanceof HTMLElement) {
      // 获取计算样式
      const computedStyle = window.getComputedStyle(el);
      
      // 检查并替换有问题的颜色属性
      const colorProps = ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'];
      
      colorProps.forEach(prop => {
        const value = computedStyle.getPropertyValue(prop);
        if (value && (value.includes('lab(') || value.includes('lch(') || value.includes('oklab(') || value.includes('oklch('))) {
          console.log(`🔧 Found problematic color in ${prop}: ${value}`);
          
          // 设置安全的替代颜色
          const safeColors: Record<string, string> = {
            'color': '#000000',
            'backgroundColor': '#ffffff',
            'borderColor': '#cccccc',
            'borderTopColor': '#cccccc',
            'borderRightColor': '#cccccc',
            'borderBottomColor': '#cccccc',
            'borderLeftColor': '#cccccc'
          };
          
          el.style.setProperty(prop, safeColors[prop] || '#000000', 'important');
          console.log(`🔧 Replaced ${prop} with ${safeColors[prop] || '#000000'}`);
        }
      });
      
      // 强制设置一些关键样式
      if (el.classList.contains('text-gray-400')) el.style.setProperty('color', '#9ca3af', 'important');
      if (el.classList.contains('text-gray-500')) el.style.setProperty('color', '#6b7280', 'important');
      if (el.classList.contains('text-gray-800')) el.style.setProperty('color', '#1f2937', 'important');
      if (el.classList.contains('bg-gray-50')) el.style.setProperty('background-color', '#f9fafb', 'important');
      if (el.classList.contains('bg-blue-50')) el.style.setProperty('background-color', '#eff6ff', 'important');
      if (el.classList.contains('border-gray-300')) el.style.setProperty('border-color', '#d1d5db', 'important');
      if (el.classList.contains('border-blue-300')) el.style.setProperty('border-color', '#93c5fd', 'important');
      if (el.classList.contains('border-blue-500')) el.style.setProperty('border-color', '#3b82f6', 'important');
      if (el.classList.contains('bg-red-500')) el.style.setProperty('background-color', '#ef4444', 'important');
      if (el.classList.contains('bg-red-600')) el.style.setProperty('background-color', '#dc2626', 'important');
      if (el.classList.contains('text-white')) el.style.setProperty('color', '#ffffff', 'important');
      if (el.classList.contains('bg-black')) el.style.setProperty('background-color', '#000000', 'important');
    }
    
    // 递归处理子元素
    Array.from(el.children).forEach(child => processElement(child));
  };
  
  processElement(clonedElement);
  
  // 将处理后的元素临时添加到 body 中
  clonedElement.style.position = 'absolute';
  clonedElement.style.top = '-9999px';
  clonedElement.style.left = '-9999px';
  document.body.appendChild(clonedElement);
  
  return clonedElement;
};

export const exportElementAsImage = async (
  element: HTMLElement,
  filename: string = "tier-list"
): Promise<void> => {
  let preprocessedElement: HTMLElement | null = null;
  
  try {
    console.log("Starting export process...");
    console.log("Element dimensions:", {
      offsetWidth: element.offsetWidth,
      offsetHeight: element.offsetHeight,
      scrollWidth: element.scrollWidth,
      scrollHeight: element.scrollHeight,
    });

    // 预处理元素以移除有问题的样式
    preprocessedElement = preprocessElementForExport(element);
    console.log("Using preprocessed element for export");

    // 确保所有图片都已加载
    const images = preprocessedElement.querySelectorAll("img");
    console.log(`Found ${images.length} images to load`);
    
    await Promise.all(
      Array.from(images).map(
        (img, index) =>
          new Promise((resolve) => {
            if (img.complete && img.naturalWidth > 0) {
              console.log(`Image ${index} already loaded`);
              resolve(void 0);
            } else {
              console.log(`Waiting for image ${index} to load`);
              img.onload = () => {
                console.log(`Image ${index} loaded successfully`);
                resolve(void 0);
              };
              img.onerror = () => {
                console.log(`Image ${index} failed to load`);
                resolve(void 0);
              };
              // 强制重新加载图片
              if (img.src) {
                const src = img.src;
                img.src = "";
                img.src = src;
              }
            }
          })
      )
    );

    // 等待更长时间确保所有样式和布局都已应用
    console.log("Waiting for render completion...");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 获取元素的实际尺寸
    const rect = preprocessedElement.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(preprocessedElement);
    
    console.log("Element rect:", rect);
    console.log("Computed style background:", computedStyle.backgroundColor);

    // 创建 canvas，使用更保守的配置
    console.log("Creating canvas...");
    const canvas = await safeHtml2Canvas(preprocessedElement, {
      backgroundColor: "#ffffff", // 使用白色背景避免透明度问题
      scale: 1, // 降低 scale 避免内存问题
      useCORS: true,
      allowTaint: true, // 允许跨域图片
      logging: true, // 开启日志
      foreignObjectRendering: false, // 禁用 foreignObject 渲染
      removeContainer: true,
      // 使用元素的实际尺寸
      width: Math.max(preprocessedElement.offsetWidth, preprocessedElement.scrollWidth),
      height: Math.max(preprocessedElement.offsetHeight, preprocessedElement.scrollHeight),
      // 移除窗口尺寸限制
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      // 添加更多选项来确保正确渲染
      imageTimeout: 15000,
      // 忽略某些CSS属性来避免解析错误
      ignoreElements: (_element: Element) => {
        // 可以在这里忽略特定元素
        return false;
      },
      onclone: (clonedDoc: Document) => {
        console.log("Document cloned for rendering");
        // 确保克隆的文档中的样式正确应用
        const clonedElement = clonedDoc.getElementById("tier-maker-content");
        if (clonedElement) {
          // 强制应用一些关键样式
          clonedElement.style.position = "relative";
          clonedElement.style.display = "block";
          clonedElement.style.visibility = "visible";
          clonedElement.style.opacity = "1";
        }

        // 修复不支持的 CSS 颜色函数
        const fixUnsupportedColors = (element: Element) => {
          const computedStyle = clonedDoc.defaultView?.getComputedStyle(element);
          if (computedStyle) {
            // 检查并修复可能包含 lab() 等不支持颜色函数的属性
            const colorProperties = [
              'color', 'backgroundColor', 'borderColor', 
              'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
              'outlineColor', 'textDecorationColor', 'caretColor'
            ];
            
            colorProperties.forEach(prop => {
              const value = computedStyle.getPropertyValue(prop);
              if (value && (value.includes('lab(') || value.includes('lch(') || value.includes('oklab(') || value.includes('oklch('))) {
                console.log(`Found unsupported color function in ${prop}: ${value}`);
                // 尝试转换为支持的颜色格式
                try {
                  // 创建一个临时元素来获取计算后的颜色值
                  const tempDiv = clonedDoc.createElement('div');
                  tempDiv.style.color = value;
                  clonedDoc.body.appendChild(tempDiv);
                  const computedColor = clonedDoc.defaultView?.getComputedStyle(tempDiv).color;
                  clonedDoc.body.removeChild(tempDiv);
                  
                  if (computedColor && computedColor !== value) {
                    (element as HTMLElement).style.setProperty(prop, computedColor);
                    console.log(`Converted ${prop} from ${value} to ${computedColor}`);
                  }
                } catch (e) {
                  console.warn(`Failed to convert color ${value} for property ${prop}:`, e);
                  // 回退到安全的颜色
                  const fallbackColors: Record<string, string> = {
                    'color': '#000000',
                    'backgroundColor': 'transparent',
                    'borderColor': '#cccccc'
                  };
                  const fallback = fallbackColors[prop] || 'transparent';
                  (element as HTMLElement).style.setProperty(prop, fallback);
                  console.log(`Applied fallback color ${fallback} for ${prop}`);
                }
              }
            });
          }
          
          // 递归处理子元素
          Array.from(element.children).forEach(child => fixUnsupportedColors(child));
        };

        // 对整个克隆的文档应用颜色修复
        if (clonedElement) {
          fixUnsupportedColors(clonedElement);
        }

        // 添加一个样式表来覆盖可能有问题的颜色
        const style = clonedDoc.createElement('style');
        style.textContent = `
          /* 覆盖可能使用现代颜色函数的样式 */
          * {
            /* 确保所有颜色都使用兼容格式 */
          }
          
          /* 强制使用 RGB/HEX 颜色 */
          .text-gray-400 { color: #9ca3af !important; }
          .text-gray-500 { color: #6b7280 !important; }
          .text-gray-800 { color: #1f2937 !important; }
          .bg-gray-50 { background-color: #f9fafb !important; }
          .bg-blue-50 { background-color: #eff6ff !important; }
          .border-gray-300 { border-color: #d1d5db !important; }
          .border-blue-300 { border-color: #93c5fd !important; }
          .border-blue-500 { border-color: #3b82f6 !important; }
          .bg-red-500 { background-color: #ef4444 !important; }
          .bg-red-600 { background-color: #dc2626 !important; }
          .text-white { color: #ffffff !important; }
          .bg-black { background-color: #000000 !important; }
        `;
        clonedDoc.head.appendChild(style);
      },
    });

    console.log("Canvas created:", {
      width: canvas.width,
      height: canvas.height,
    });

    // 检查 canvas 是否为空
    const ctx = canvas.getContext("2d");
    const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
    const isEmpty = imageData?.data.every((value, index) => {
      // 检查 alpha 通道，如果全部为 0 则表示完全透明
      return index % 4 === 3 ? value === 0 : true;
    });

    if (isEmpty) {
      console.warn("Generated canvas appears to be empty");
      throw new Error("Generated image is empty. This might be due to styling issues or content not being rendered properly.");
    }

    // 创建下载链接
    const link = document.createElement("a");
    link.download = `${filename.replace(
      /[^a-zA-Z0-9\u4e00-\u9fa5]/g,
      "_"
    )}.png`;
    link.href = canvas.toDataURL("image/png", 0.9);

    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("Export completed successfully");
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  } finally {
    // 清理预处理的元素
    if (preprocessedElement && preprocessedElement.parentNode) {
      console.log("Cleaning up preprocessed element");
      preprocessedElement.parentNode.removeChild(preprocessedElement);
    }
  }
};
