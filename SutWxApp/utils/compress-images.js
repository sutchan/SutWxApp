/**
 * 文件名: compress-images.js
 * 版本号: 1.0.0
 * 更新日期: 2025-12-29 18:30
 * 描述: 图片压缩脚本，用于压缩项目中的图片文件，提升应用性能
 */

import fs from "fs/promises";
import path, { dirname } from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 检查文件是否存在
 * @param {string} filePath - 文件路径
 * @returns {Promise<boolean>} - 文件是否存在
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * 压缩单个图片文件
 * @param {string} filePath - 图片文件路径
 * @returns {Promise<boolean>} - 压缩是否成功
 */
async function compressImage(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const dirName = path.dirname(filePath);
    const fileName = path.basename(filePath, ext);
    const outputPath = `${dirName}/${fileName}${ext}`;
    const backupPath = `${dirName}/${fileName}-backup${ext}`;

    // 检查文件是否已压缩过（通过检查是否存在备份文件）
    if (await fileExists(backupPath)) {
      console.log(`✓ ${filePath} 已压缩过，跳过`);
      return true;
    }

    // 读取原始文件大小
    const originalStats = await fs.stat(filePath);
    const originalSize = originalStats.size;

    // 创建备份文件
    await fs.copyFile(filePath, backupPath);
    console.log(`📋 已创建备份: ${backupPath}`);

    // 根据文件类型进行不同的压缩处理
    let compressedBuffer;
    if (ext === ".png") {
      // PNG压缩
      compressedBuffer = await sharp(filePath)
        .png({ quality: 80, compressionLevel: 9 })
        .toBuffer();
    } else if (ext === ".jpg" || ext === ".jpeg") {
      // JPG压缩
      compressedBuffer = await sharp(filePath)
        .jpeg({ quality: 75, progressive: true })
        .toBuffer();
    } else if (ext === ".svg") {
      // SVG压缩 - 简单的优化，sharp不支持完整的SVG压缩
      console.log(`⚠️  ${filePath} 是SVG文件，跳过压缩`);
      await fs.unlink(backupPath); // 删除备份
      return false;
    } else {
      console.log(`⚠️  ${filePath} 不支持的文件类型，跳过压缩`);
      await fs.unlink(backupPath); // 删除备份
      return false;
    }

    // 写入压缩后的文件
    await fs.writeFile(outputPath, compressedBuffer);

    // 计算压缩后的文件大小和压缩率
    const compressedStats = await fs.stat(outputPath);
    const compressedSize = compressedStats.size;
    const reduction = (
      ((originalSize - compressedSize) / originalSize) *
      100
    ).toFixed(2);

    console.log(
      `✅ ${filePath} 压缩成功，大小从 ${formatSize(originalSize)} 减少到 ${formatSize(compressedSize)}，减少了 ${reduction}%`,
    );
    return true;
  } catch (error) {
    console.error(`❌ ${filePath} 压缩失败: ${error.message}`);
    return false;
  }
}

/**
 * 格式化文件大小
 * @param {number} bytes - 文件大小（字节）
 * @returns {string} - 格式化后的文件大小
 */
function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
  else return (bytes / 1048576).toFixed(2) + " MB";
}

/**
 * 压缩目录下的所有图片文件
 * @param {string} dirPath - 目录路径
 * @returns {Promise<Object>} - 压缩结果统计
 */
async function compressDirectory(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    let successCount = 0;
    let totalCount = 0;

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fs.stat(filePath);

      if (stats.isDirectory()) {
        // 递归处理子目录
        const subDirResult = await compressDirectory(filePath);
        successCount += subDirResult.successCount;
        totalCount += subDirResult.totalCount;
      } else {
        const ext = path.extname(file).toLowerCase();
        if ([".png", ".jpg", ".jpeg", ".svg"].includes(ext)) {
          totalCount++;
          const success = await compressImage(filePath);
          if (success) {
            successCount++;
          }
        }
      }
    }

    return { successCount, totalCount };
  } catch (error) {
    console.error(`❌ 处理目录 ${dirPath} 失败: ${error.message}`);
    return { successCount: 0, totalCount: 0 };
  }
}

/**
 * 主函数
 */
async function main() {
  console.log("🚀 开始压缩图片...");
  console.log("=".repeat(50));

  // 图片目录
  const imageDirs = [path.join(__dirname, "SutWxApp", "images")];

  let totalSuccess = 0;
  let totalFiles = 0;

  for (const dir of imageDirs) {
    console.log(`\n📁 处理目录: ${dir}`);
    const result = await compressDirectory(dir);
    totalSuccess += result.successCount;
    totalFiles += result.totalCount;
  }

  console.log("\n" + "=".repeat(50));
  console.log(`📊 压缩完成！`);
  console.log(`✅ 成功压缩: ${totalSuccess} 个文件`);
  console.log(`📋 总文件数: ${totalFiles} 个文件`);
  console.log(`📈 压缩率: ${((totalSuccess / totalFiles) * 100).toFixed(2)}%`);
  console.log(
    "💡 提示: 压缩后的图片已覆盖原文件，原始文件已备份为 -backup 后缀的文件",
  );
}

// 运行主函数
main();
