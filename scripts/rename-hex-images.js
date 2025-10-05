#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 配置
const CONFIG = {
  hexDir: path.join(__dirname, '../public/hex'),
  backupDir: path.join(__dirname, '../public/hex-backup'),
  targetWidth: 119,  // 目标宽度
  targetHeight: 68,  // 目标高度
  quality: 90,       // PNG 质量
};

async function renameAndProcessHexImages() {
  try {
    console.log('🚀 开始重命名和处理 hex 图片...');
    
    // 创建备份目录
    if (!fs.existsSync(CONFIG.backupDir)) {
      fs.mkdirSync(CONFIG.backupDir, { recursive: true });
    }

    // 读取所有 PNG 文件并排序
    const files = fs.readdirSync(CONFIG.hexDir)
      .filter(file => file.toLowerCase().endsWith('.png'))
      .sort();

    console.log(`📁 找到 ${files.length} 个图片文件`);

    // 第一步：备份原文件
    console.log('📦 备份原文件...');
    for (const file of files) {
      const srcPath = path.join(CONFIG.hexDir, file);
      const backupPath = path.join(CONFIG.backupDir, file);
      fs.copyFileSync(srcPath, backupPath);
    }
    console.log('✅ 备份完成');

    // 第二步：处理和重命名
    const tempDir = path.join(CONFIG.hexDir, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const mapping = [];
    
    for (let i = 0; i < files.length; i++) {
      const oldFileName = files[i];
      const oldFilePath = path.join(CONFIG.hexDir, oldFileName);
      
      // 生成新的文件名
      const newFileName = `hex-${String(i + 1).padStart(3, '0')}.png`;
      const tempFilePath = path.join(tempDir, newFileName);

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
          .toFile(tempFilePath);

        mapping.push({
          old: oldFileName,
          new: newFileName,
          index: i + 1
        });

        console.log(`✅ 完成: ${newFileName}`);
      } catch (error) {
        console.error(`❌ 处理失败 ${oldFileName}:`, error.message);
      }
    }

    // 第三步：删除原文件并移动新文件
    console.log('🔄 替换原文件...');
    for (const file of files) {
      const filePath = path.join(CONFIG.hexDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // 移动处理后的文件到原目录
    const tempFiles = fs.readdirSync(tempDir);
    for (const file of tempFiles) {
      const tempPath = path.join(tempDir, file);
      const finalPath = path.join(CONFIG.hexDir, file);
      fs.renameSync(tempPath, finalPath);
    }

    // 删除临时目录
    fs.rmdirSync(tempDir);

    // 保存映射文件
    const mappingPath = path.join(CONFIG.hexDir, 'rename-mapping.json');
    fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));

    console.log('\n🎉 重命名和处理完成！');
    console.log(`📊 统计信息:`);
    console.log(`   - 处理文件数: ${files.length}`);
    console.log(`   - 图片尺寸: ${CONFIG.targetWidth}x${CONFIG.targetHeight}`);
    console.log(`   - 备份目录: ${CONFIG.backupDir}`);
    console.log(`   - 映射文件: ${mappingPath}`);

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
    console.log('pnpm add sharp');
    return false;
  }
}

// 主函数
async function main() {
  console.log('🖼️  Hex 图片重命名和处理脚本');
  console.log('='.repeat(50));

  if (!checkDependencies()) {
    process.exit(1);
  }

  if (!fs.existsSync(CONFIG.hexDir)) {
    console.error(`❌ hex 目录不存在: ${CONFIG.hexDir}`);
    process.exit(1);
  }

  // 确认操作
  console.log('⚠️  此操作将：');
  console.log('   1. 备份所有原文件到 hex-backup 目录');
  console.log('   2. 将所有图片裁剪为 200x200 像素');
  console.log('   3. 重命名为 hex-001.png, hex-002.png 等格式');
  console.log('   4. 替换原文件');
  console.log('');

  await renameAndProcessHexImages();
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { renameAndProcessHexImages, CONFIG };
