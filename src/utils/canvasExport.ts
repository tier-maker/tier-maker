import { TierList } from "@/types";

// 颜色映射表
const TIER_COLORS: Record<string, string> = {
  'S': '#ff7f7f',
  'A': '#ffbf7f',
  'B': '#ffdf7f',
  'C': '#ffff7f',
  'D': '#bfff7f',
  'E': '#7fff7f',
  'F': '#7f7f7f'
};

// 加载图片的 Promise 包装器
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn(`Failed to load image: ${src}`);
      // 创建一个占位符图片
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, 64, 64);
      ctx.fillStyle = '#999';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('?', 32, 36);
      
      const placeholderImg = new Image();
      placeholderImg.src = canvas.toDataURL();
      placeholderImg.onload = () => resolve(placeholderImg);
    };
    img.src = src;
  });
};

// 绘制圆角矩形
const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

// 绘制图片并保持宽高比
const drawImageWithAspectRatio = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number
) => {
  const imgAspect = img.width / img.height;
  const boxAspect = maxWidth / maxHeight;
  
  let drawWidth = maxWidth;
  let drawHeight = maxHeight;
  let drawX = x;
  let drawY = y;
  
  if (imgAspect > boxAspect) {
    // 图片更宽，以宽度为准
    drawHeight = maxWidth / imgAspect;
    drawY = y + (maxHeight - drawHeight) / 2;
  } else {
    // 图片更高，以高度为准
    drawWidth = maxHeight * imgAspect;
    drawX = x + (maxWidth - drawWidth) / 2;
  }
  
  // 绘制圆角裁剪
  ctx.save();
  drawRoundedRect(ctx, drawX, drawY, drawWidth, drawHeight, 4);
  ctx.clip();
  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();
};

export const exportTierListAsCanvas = async (
  tierList: TierList,
  filename: string = "tier-list"
): Promise<void> => {
  console.log("🎨 Starting Canvas-based export...");
  
  try {
    // 设置画布尺寸
    const canvasWidth = 1200;
    const rowHeight = 120;
    const headerHeight = 80;
    const padding = 20;
    const tierLabelWidth = 100;
    const itemSize = 80;
    const itemSpacing = 10;
    
    const canvasHeight = headerHeight + (tierList.rows.length * rowHeight) + padding * 2;
    
    // 创建画布
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d')!;
    
    // 设置高质量渲染
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // 绘制背景
    if (tierList.backgroundImage) {
      try {
        const bgImg = await loadImage(tierList.backgroundImage);
        ctx.drawImage(bgImg, 0, 0, canvasWidth, canvasHeight);
        // 添加半透明覆盖层以确保文字可读
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      } catch (e) {
        console.warn('Failed to load background image, using solid color');
        ctx.fillStyle = tierList.theme.background || '#ffffff';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }
    } else {
      ctx.fillStyle = tierList.theme.background || '#ffffff';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
    
    // 绘制标题
    ctx.fillStyle = tierList.theme.text || '#000000';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(tierList.title, canvasWidth / 2, 50);
    
    // 预加载所有图片
    console.log("🖼️ Loading images...");
    const allImages = new Map<string, HTMLImageElement>();
    
    for (const row of tierList.rows) {
      for (const item of row.items) {
        if (item.imageUrl && !allImages.has(item.imageUrl)) {
          try {
            const img = await loadImage(item.imageUrl);
            allImages.set(item.imageUrl, img);
            console.log(`✅ Loaded image: ${item.name}`);
          } catch (e) {
            console.warn(`❌ Failed to load image: ${item.name}`);
          }
        }
      }
    }
    
    console.log(`📸 Loaded ${allImages.size} images, starting to draw...`);
    
    // 绘制每个 Tier 行
    let currentY = headerHeight + padding;
    
    for (const row of tierList.rows) {
      // 绘制 Tier 标签背景
      ctx.fillStyle = row.color || TIER_COLORS[row.label] || '#cccccc';
      drawRoundedRect(ctx, padding, currentY, tierLabelWidth, rowHeight - 10, 8);
      ctx.fill();
      
      // 绘制 Tier 标签文字
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(row.label, padding + tierLabelWidth / 2, currentY + rowHeight / 2 + 8);
      
      // 绘制项目区域背景
      const itemsAreaX = padding + tierLabelWidth + 10;
      const itemsAreaWidth = canvasWidth - itemsAreaX - padding;
      
      ctx.fillStyle = '#f8f9fa';
      ctx.strokeStyle = '#dee2e6';
      ctx.lineWidth = 2;
      drawRoundedRect(ctx, itemsAreaX, currentY, itemsAreaWidth, rowHeight - 10, 8);
      ctx.fill();
      ctx.stroke();
      
      // 绘制项目
      if (row.items.length === 0) {
        // 显示空状态提示
        ctx.fillStyle = '#6c757d';
        ctx.font = '16px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          '拖拽图片到这里',
          itemsAreaX + itemsAreaWidth / 2,
          currentY + rowHeight / 2
        );
      } else {
        let itemX = itemsAreaX + itemSpacing;
        const itemY = currentY + (rowHeight - itemSize) / 2;
        
        for (const item of row.items) {
          // 检查是否有足够空间
          if (itemX + itemSize > itemsAreaX + itemsAreaWidth - itemSpacing) {
            break; // 如果空间不够，停止绘制更多项目
          }
          
          if (item.imageUrl && allImages.has(item.imageUrl)) {
            const img = allImages.get(item.imageUrl)!;
            
            // 绘制图片边框
            ctx.strokeStyle = '#dee2e6';
            ctx.lineWidth = 2;
            drawRoundedRect(ctx, itemX, itemY, itemSize, itemSize, 6);
            ctx.stroke();
            
            // 绘制图片
            drawImageWithAspectRatio(ctx, img, itemX + 2, itemY + 2, itemSize - 4, itemSize - 4);
          } else {
            // 绘制占位符
            ctx.fillStyle = '#e9ecef';
            drawRoundedRect(ctx, itemX, itemY, itemSize, itemSize, 6);
            ctx.fill();
            
            ctx.strokeStyle = '#dee2e6';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // 绘制问号
            ctx.fillStyle = '#6c757d';
            ctx.font = '24px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('?', itemX + itemSize / 2, itemY + itemSize / 2 + 8);
          }
          
          itemX += itemSize + itemSpacing;
        }
        
        // 如果有更多项目没有显示，显示省略号
        if (row.items.length > Math.floor((itemsAreaWidth - itemSpacing * 2) / (itemSize + itemSpacing))) {
          ctx.fillStyle = '#6c757d';
          ctx.font = '20px Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('...', itemX - itemSpacing / 2, itemY + itemSize / 2 + 8);
        }
      }
      
      currentY += rowHeight;
    }
    
    // 添加水印/签名
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.font = '12px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(
      `Created with Tier Maker - ${new Date().toLocaleDateString()}`,
      canvasWidth - padding,
      canvasHeight - 10
    );
    
    console.log("🎨 Canvas drawing completed, creating download...");
    
    // 创建下载链接
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to create image blob');
      }
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${filename.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.png`;
      link.href = url;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      console.log("✅ Canvas export completed successfully!");
    }, 'image/png', 0.9);
    
  } catch (error) {
    console.error("❌ Canvas export failed:", error);
    throw error;
  }
};

// SVG 导出作为备选方案
export const exportTierListAsSVG = async (
  tierList: TierList,
  filename: string = "tier-list"
): Promise<void> => {
  console.log("🎨 Starting SVG export...");
  
  try {
    const svgWidth = 1200;
    const rowHeight = 120;
    const headerHeight = 80;
    const padding = 20;
    const tierLabelWidth = 100;
    const itemSize = 80;
    const itemSpacing = 10;
    
    const svgHeight = headerHeight + (tierList.rows.length * rowHeight) + padding * 2;
    
    let svgContent = `
      <svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .title { font: bold 32px Arial, sans-serif; text-anchor: middle; }
            .tier-label { font: bold 28px Arial, sans-serif; text-anchor: middle; fill: white; }
            .empty-text { font: 16px Arial, sans-serif; text-anchor: middle; fill: #6c757d; }
            .watermark { font: 12px Arial, sans-serif; text-anchor: end; fill: rgba(0,0,0,0.3); }
          </style>
        </defs>
        
        <!-- Background -->
        <rect width="${svgWidth}" height="${svgHeight}" fill="${tierList.theme.background || '#ffffff'}"/>
        
        <!-- Title -->
        <text x="${svgWidth / 2}" y="50" class="title" fill="${tierList.theme.text || '#000000'}">${tierList.title}</text>
    `;
    
    let currentY = headerHeight + padding;
    
    for (const row of tierList.rows) {
      const itemsAreaX = padding + tierLabelWidth + 10;
      const itemsAreaWidth = svgWidth - itemsAreaX - padding;
      
      // Tier 标签
      svgContent += `
        <rect x="${padding}" y="${currentY}" width="${tierLabelWidth}" height="${rowHeight - 10}" 
              rx="8" fill="${row.color || TIER_COLORS[row.label] || '#cccccc'}"/>
        <text x="${padding + tierLabelWidth / 2}" y="${currentY + rowHeight / 2 + 8}" class="tier-label">${row.label}</text>
      `;
      
      // 项目区域
      svgContent += `
        <rect x="${itemsAreaX}" y="${currentY}" width="${itemsAreaWidth}" height="${rowHeight - 10}" 
              rx="8" fill="#f8f9fa" stroke="#dee2e6" stroke-width="2"/>
      `;
      
      if (row.items.length === 0) {
        svgContent += `
          <text x="${itemsAreaX + itemsAreaWidth / 2}" y="${currentY + rowHeight / 2}" class="empty-text">拖拽图片到这里</text>
        `;
      } else {
        let itemX = itemsAreaX + itemSpacing;
        const itemY = currentY + (rowHeight - itemSize) / 2;
        
        for (const item of row.items) {
          if (itemX + itemSize > itemsAreaX + itemsAreaWidth - itemSpacing) break;
          
          if (item.imageUrl) {
            svgContent += `
              <rect x="${itemX}" y="${itemY}" width="${itemSize}" height="${itemSize}" 
                    rx="6" fill="#e9ecef" stroke="#dee2e6" stroke-width="2"/>
              <image x="${itemX + 2}" y="${itemY + 2}" width="${itemSize - 4}" height="${itemSize - 4}" 
                     href="${item.imageUrl}" preserveAspectRatio="xMidYMid slice"/>
            `;
          } else {
            svgContent += `
              <rect x="${itemX}" y="${itemY}" width="${itemSize}" height="${itemSize}" 
                    rx="6" fill="#e9ecef" stroke="#dee2e6" stroke-width="2"/>
              <text x="${itemX + itemSize / 2}" y="${itemY + itemSize / 2 + 8}" 
                    font="24px Arial" text-anchor="middle" fill="#6c757d">?</text>
            `;
          }
          
          itemX += itemSize + itemSpacing;
        }
      }
      
      currentY += rowHeight;
    }
    
    // 水印
    svgContent += `
      <text x="${svgWidth - padding}" y="${svgHeight - 10}" class="watermark">
        Created with Tier Maker - ${new Date().toLocaleDateString()}
      </text>
    </svg>`;
    
    // 创建下载
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${filename.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.svg`;
    link.href = url;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    console.log("✅ SVG export completed successfully!");
    
  } catch (error) {
    console.error("❌ SVG export failed:", error);
    throw error;
  }
};
