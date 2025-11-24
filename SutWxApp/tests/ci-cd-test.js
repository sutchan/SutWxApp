/**
 * 文件名: ci-cd-test.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-24
 * 描述: CI/CD配置测试脚本
 * 用于验证CI/CD配置是否正确设置
 */

const fs = require('fs');
const path = require('path');

/**
 * 测试CI/CD配置
 */
function testCiCdConfig() {
  console.log('开始测试CI/CD配置...');
  
  try {
    // 检查CI/CD配置文件是否存在
    const ciConfigPath = path.join(__dirname, '..', '.github', 'workflows', 'ci-cd.yml');
    if (fs.existsSync(ciConfigPath)) {
      console.log('✅ CI/CD配置文件存在');
    } else {
      console.error('❌ CI/CD配置文件不存在');
      return false;
    }
    
    // 检查构建脚本是否存在
    const buildScriptPath = path.join(__dirname, '..', 'build', 'index.js');
    if (fs.existsSync(buildScriptPath)) {
      console.log('✅ 构建脚本存在');
    } else {
      console.error('❌ 构建脚本不存在');
      return false;
    }
    
    // 检查BuildUtils是否存在
    const buildUtilsPath = path.join(__dirname, '..', 'build', 'buildUtils.js');
    if (fs.existsSync(buildUtilsPath)) {
      console.log('✅ BuildUtils存在');
    } else {
      console.error('❌ BuildUtils不存在');
      return false;
    }
    
    console.log('✅ CI/CD配置测试通过');
    return true;
  } catch (error) {
    console.error(`❌ CI/CD配置测试失败: ${error.message}`);
    return false;
  }
}

// 执行测试
if (require.main === module) {
  const result = testCiCdConfig();
  process.exit(result ? 0 : 1);
}

module.exports = { testCiCdConfig };