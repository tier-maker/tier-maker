#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 配置
const CONFIG = {
  inputDir: path.join(__dirname, '../public/hex'),
  outputDir: path.join(__dirname, '../public/hex-processed'),
  targetWidth: 119,  // 目标宽度
  targetHeight: 68,  // 目标高度
  quality: 90,       // PNG 质量
  format: 'png'      // 输出格式
};

async function processHexImages() {
  try {
    console.log('🚀 开始处理 hex 图片...');
    
    // 创建输出目录
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    // 读取输入目录中的所有文件
    const files = fs.readdirSync(CONFIG.inputDir)
      .filter(file => file.toLowerCase().endsWith('.png'))
      .sort(); // 按文件名排序

    console.log(`📁 找到 ${files.length} 个图片文件`);

    // 处理每个文件
    for (let i = 0; i < files.length; i++) {
      const oldFileName = files[i];
      const oldFilePath = path.join(CONFIG.inputDir, oldFileName);
      
      // 生成新的文件名：hex-001.png, hex-002.png, etc.
      const newFileName = `hex-${String(i + 1).padStart(3, '0')}.${CONFIG.format}`;
      const newFilePath = path.join(CONFIG.outputDir, newFileName);
      console.log(`🔄 处理: ${oldFileName} -> ${newFileName}`);

      try {
        // 使用 sharp 处理图片 - 强制精确尺寸
        await sharp(oldFilePath)
          .resize(CONFIG.targetWidth, CONFIG.targetHeight, {
            fit: 'fill',            // 强制填充到指定尺寸
            kernel: sharp.kernel.lanczos3
          })
          .png({
            quality: CONFIG.quality,
            compressionLevel: 6
          })
          .toFile(newFilePath);

        console.log(`✅ 完成: ${newFileName}`);
      } catch (error) {
        console.error(`❌ 处理失败 ${oldFileName}:`, error.message);
      }
    }

    console.log('\n🎉 所有图片处理完成！');
    console.log(`📊 统计信息:`);
    console.log(`   - 处理文件数: ${files.length}`);
    console.log(`   - 输出目录: ${CONFIG.outputDir}`);
    console.log(`   - 图片尺寸: ${CONFIG.targetWidth}x${CONFIG.targetHeight}`);
    console.log(`   - 输出格式: ${CONFIG.format.toUpperCase()}`);

    // 生成重命名映射文件
    const mapping = files.map((oldName, index) => ({
      old: oldName,
      new: `hex-${String(index + 1).padStart(3, '0')}.${CONFIG.format}`,
      index: index + 1
    }));

    const mappingPath = path.join(CONFIG.outputDir, 'rename-mapping.json');
    fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
    console.log(`📝 重命名映射已保存到: ${mappingPath}`);

  } catch (error) {
    console.error('❌ 脚本执行失败:', error);
    process.exit(1);
  }
}

// 检查依赖
function checkDependencies() {
  try {
    require('sharp');
    return true;
  } catch (error) {
    console.error('❌ 缺少依赖: sharp');
    console.log('请运行以下命令安装依赖:');
    console.log('npm install sharp');
    console.log('或');
    console.log('pnpm add sharp');
    return false;
  }
}

// 主函数
async function main() {
  console.log('🖼️  Hex 图片处理脚本');
  console.log('='.repeat(50));

  if (!checkDependencies()) {
    process.exit(1);
  }

  if (!fs.existsSync(CONFIG.inputDir)) {
    console.error(`❌ 输入目录不存在: ${CONFIG.inputDir}`);
    process.exit(1);
  }

  await processHexImages();
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { processHexImages, CONFIG };
