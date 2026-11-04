/**
 * 文件名: request-security-sql.js
 * 版本号: 3.0.9
 * 更新日期: 2026-09-12
 * 描述: 请求数据 SQL 注入校验（从 request-security.js 抽离）
 */

/**
 * 验证请求数据，防止 SQL 注入
 * @param {Object} data 请求数据
 * @throws {Error} 检测到潜在注入时抛出错误
 */
function validateRequestData(data) {
  // 仅匹配真实 SQL 注入结构，避免误杀含 order/from/group 等常见英文词的合法文本
  // （服务端才是 SQL 注入的真正防线，客户端仅做粗粒度拦截）
  const sqlInjectionPatterns = [
    /(--|#|\/\*|\*\/)/i, // SQL 注释符
    /;\s*(drop|delete|update|insert|alter|create|truncate|exec|execute)\b/i, // 堆叠查询 + 危险动词
    /\bunion\b\s+(all\s+)?select\b/i, // UNION SELECT
    /\bor\b\s+\d+\s*=\s*\d+/i, // OR 1=1 类恒真条件
    /\band\b\s+\d+\s*=\s*\d+/i, // AND 1=1 类恒真条件
    /\b(drop|truncate)\s+table\b/i, // DROP/TRUNCATE TABLE
  ];

  function checkStringForSqlInjection(value, fieldPath) {
    for (const pattern of sqlInjectionPatterns) {
      if (pattern.test(value)) {
        throw new Error(
          `Invalid request data for field ${fieldPath}: potential SQL injection detected`,
        );
      }
    }
  }

  function checkValue(value, fieldPath) {
    if (typeof value === "string") {
      checkStringForSqlInjection(value, fieldPath);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        checkValue(item, `${fieldPath}[${index}]`);
      });
    } else if (typeof value === "object" && value !== null) {
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          checkValue(value[key], `${fieldPath}.${key}`);
        }
      }
    }
  }

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      checkValue(data[key], key);
    }
  }
}

module.exports = { validateRequestData };
