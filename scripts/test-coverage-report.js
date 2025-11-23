/**
 * 文件名: test-coverage-report.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 测试覆盖率报告生成脚本
 */

const fs = require('fs');
const path = require('path');

/**
 * 生成测试覆盖率报告
 * @returns {Object} 覆盖率报告数据
 */
function generateCoverageReport() {
  // 读取覆盖率数据
  const coveragePath = path.join(__dirname, '..', 'coverage', 'coverage-final.json');
  
  if (!fs.existsSync(coveragePath)) {
    console.error('覆盖率文件不存在，请先运行测试生成覆盖率数据');
    console.log('尝试的路径:', coveragePath);
    return null;
  }
  
  const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
  
  // 计算总体覆盖率
  let totalStatements = 0;
  let totalCoveredStatements = 0;
  let totalBranches = 0;
  let totalCoveredBranches = 0;
  let totalFunctions = 0;
  let totalCoveredFunctions = 0;
  let totalLines = 0;
  let totalCoveredLines = 0;
  
  const fileReports = [];
  
  for (const filePath in coverageData) {
    const fileData = coverageData[filePath];
    
    // 计算语句覆盖率
    const statements = Object.keys(fileData.s || {}).length;
    const coveredStatements = Object.values(fileData.s || {}).filter(count => count > 0).length;
    
    // 计算分支覆盖率
    const branches = Object.keys(fileData.b || {}).length;
    const coveredBranches = Object.values(fileData.b || {}).filter(branch => branch[0] > 0).length;
    
    // 计算函数覆盖率
    const functions = Object.keys(fileData.f || {}).length;
    const coveredFunctions = Object.values(fileData.f || {}).filter(count => count > 0).length;
    
    // 计算行覆盖率
    const lines = Object.keys(fileData.l || {}).length;
    const coveredLines = Object.values(fileData.l || {}).filter(count => count > 0).length;
    
    // 计算文件覆盖率百分比
    const statementPercent = statements > 0 ? (coveredStatements / statements * 100).toFixed(2) : 0;
    const branchPercent = branches > 0 ? (coveredBranches / branches * 100).toFixed(2) : 0;
    const functionPercent = functions > 0 ? (coveredFunctions / functions * 100).toFixed(2) : 0;
    const linePercent = lines > 0 ? (coveredLines / lines * 100).toFixed(2) : 0;
    
    // 添加到文件报告
    fileReports.push({
      path: filePath,
      statements: { total: statements, covered: coveredStatements, percent: statementPercent },
      branches: { total: branches, covered: coveredBranches, percent: branchPercent },
      functions: { total: functions, covered: coveredFunctions, percent: functionPercent },
      lines: { total: lines, covered: coveredLines, percent: linePercent }
    });
    
    // 累加到总计
    totalStatements += statements;
    totalCoveredStatements += coveredStatements;
    totalBranches += branches;
    totalCoveredBranches += coveredBranches;
    totalFunctions += functions;
    totalCoveredFunctions += coveredFunctions;
    totalLines += lines;
    totalCoveredLines += coveredLines;
  }
  
  // 计算总体覆盖率百分比
  const overallStatementPercent = totalStatements > 0 ? (totalCoveredStatements / totalStatements * 100).toFixed(2) : 0;
  const overallBranchPercent = totalBranches > 0 ? (totalCoveredBranches / totalBranches * 100).toFixed(2) : 0;
  const overallFunctionPercent = totalFunctions > 0 ? (totalCoveredFunctions / totalFunctions * 100).toFixed(2) : 0;
  const overallLinePercent = totalLines > 0 ? (totalCoveredLines / totalLines * 100).toFixed(2) : 0;
  
  // 生成报告
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      statements: { total: totalStatements, covered: totalCoveredStatements, percent: overallStatementPercent },
      branches: { total: totalBranches, covered: totalCoveredBranches, percent: overallBranchPercent },
      functions: { total: totalFunctions, covered: totalCoveredFunctions, percent: overallFunctionPercent },
      lines: { total: totalLines, covered: totalCoveredLines, percent: overallLinePercent }
    },
    files: fileReports
  };
  
  // 保存报告到文件
  const reportPath = path.join(__dirname, '..', 'docs', '测试覆盖率报告.md');
  const reportContent = generateMarkdownReport(report);
  
  // 确保目录存在
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, reportContent, 'utf8');
  
  console.log(`测试覆盖率报告已生成: ${reportPath}`);
  
  return report;
}

/**
 * 生成Markdown格式的报告
 * @param {Object} report 覆盖率报告数据
 * @returns {string} Markdown格式的报告内容
 */
function generateMarkdownReport(report) {
  const { timestamp, summary, files } = report;
  
  let content = `# 测试覆盖率报告\n\n`;
  content += `生成时间: ${new Date(timestamp).toLocaleString('zh-CN')}\n\n`;
  
  // 总体覆盖率
  content += `## 总体覆盖率\n\n`;
  content += `| 指标 | 覆盖数/总数 | 覆盖率 |\n`;
  content += `|------|------------|--------|\n`;
  content += `| 语句 | ${summary.statements.covered}/${summary.statements.total} | ${summary.statements.percent}% |\n`;
  content += `| 分支 | ${summary.branches.covered}/${summary.branches.total} | ${summary.branches.percent}% |\n`;
  content += `| 函数 | ${summary.functions.covered}/${summary.functions.total} | ${summary.functions.percent}% |\n`;
  content += `| 行数 | ${summary.lines.covered}/${summary.lines.total} | ${summary.lines.percent}% |\n\n`;
  
  // 覆盖率进度条
  content += `### 覆盖率进度\n\n`;
  content += `- 语句覆盖率: ${generateProgressBar(summary.statements.percent)} ${summary.statements.percent}%\n`;
  content += `- 分支覆盖率: ${generateProgressBar(summary.branches.percent)} ${summary.branches.percent}%\n`;
  content += `- 函数覆盖率: ${generateProgressBar(summary.functions.percent)} ${summary.functions.percent}%\n`;
  content += `- 行数覆盖率: ${generateProgressBar(summary.lines.percent)} ${summary.lines.percent}%\n\n`;
  
  // 文件覆盖率详情
  content += `## 文件覆盖率详情\n\n`;
  content += `| 文件路径 | 语句覆盖率 | 分支覆盖率 | 函数覆盖率 | 行数覆盖率 |\n`;
  content += `|----------|------------|------------|------------|------------|\n`;
  
  // 按覆盖率从低到高排序
  files.sort((a, b) => {
    const aPercent = parseFloat(a.statements.percent);
    const bPercent = parseFloat(b.statements.percent);
    return aPercent - bPercent;
  });
  
  files.forEach(file => {
    const relativePath = path.relative(process.cwd(), file.path);
    content += `| ${relativePath} | ${file.statements.percent}% | ${file.branches.percent}% | ${file.functions.percent}% | ${file.lines.percent}% |\n`;
  });
  
  // 覆盖率低的文件
  content += `\n## 覆盖率低的文件\n\n`;
  const lowCoverageFiles = files.filter(file => parseFloat(file.statements.percent) < 70);
  
  if (lowCoverageFiles.length === 0) {
    content += `所有文件的覆盖率均达到70%以上。\n`;
  } else {
    content += `以下文件的覆盖率低于70%，建议增加测试用例：\n\n`;
    lowCoverageFiles.forEach(file => {
      const relativePath = path.relative(process.cwd(), file.path);
      content += `- **${relativePath}**: 语句覆盖率 ${file.statements.percent}%\n`;
    });
  }
  
  // 改进建议
  content += `\n## 改进建议\n\n`;
  
  if (parseFloat(summary.statements.percent) < 70) {
    content += `- 当前总体语句覆盖率为 ${summary.statements.percent}%，建议增加单元测试以提高覆盖率\n`;
  }
  
  if (parseFloat(summary.branches.percent) < 70) {
    content += `- 当前总体分支覆盖率为 ${summary.branches.percent}%，建议增加条件分支的测试用例\n`;
  }
  
  if (parseFloat(summary.functions.percent) < 70) {
    content += `- 当前总体函数覆盖率为 ${summary.functions.percent}%，建议为未覆盖的函数添加测试\n`;
  }
  
  if (parseFloat(summary.lines.percent) < 70) {
    content += `- 当前总体行数覆盖率为 ${summary.lines.percent}%，建议增加代码行覆盖\n`;
  }
  
  if (parseFloat(summary.statements.percent) >= 70 && 
      parseFloat(summary.branches.percent) >= 70 && 
      parseFloat(summary.functions.percent) >= 70 && 
      parseFloat(summary.lines.percent) >= 70) {
    content += `- 当前各项覆盖率指标均已达到70%以上，继续保持\n`;
    content += `- 建议定期运行测试，确保新代码有足够的测试覆盖\n`;
    content += `- 考虑将覆盖率检查集成到CI/CD流程中\n`;
  }
  
  return content;
}

/**
 * 生成覆盖率进度条
 * @param {string} percent 覆盖率百分比
 * @returns {string} 进度条字符串
 */
function generateProgressBar(percent) {
  const width = 20;
  const filled = Math.round(width * parseFloat(percent) / 100);
  const empty = width - filled;
  
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
}

// 如果直接运行此脚本，则生成覆盖率报告
if (require.main === module) {
  generateCoverageReport();
}

module.exports = {
  generateCoverageReport,
  generateMarkdownReport
};