/**
 * 文件名: .prettierrc.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-24
 * 描述: Prettier配置文件
 * 提供统一的代码格式化规则
 */
module.exports = {
  // 行宽
  printWidth: 100,
  // 使用2个空格进行缩进
  tabWidth: 2,
  // 不使用制表符
  useTabs: false,
  // 语句末尾使用分号
  semi: true,
  // 使用单引号
  singleQuote: true,
  // 对象属性使用引号规则 (consistent: 一致的)
  quoteProps: 'consistent',
  // 箭头函数参数括号
  arrowParens: 'always',
  // 不使用尾随逗号
  trailingComma: 'none',
  // 对象大括号内的空格
  bracketSpacing: true,
  // HTML自闭合标签
  htmlWhitespaceSensitivity: 'css',
  // Vue文件脚本和样式标签缩进
  vueIndentScriptAndStyle: false,
  // 换行符格式
  endOfLine: 'lf',
  // JSX标签闭合方式
  jsxBracketSameLine: false,
  // 行尾换行符类型
  proseWrap: 'preserve',
  // 是否格式化嵌入的代码
  embeddedLanguageFormatting: 'auto'
};