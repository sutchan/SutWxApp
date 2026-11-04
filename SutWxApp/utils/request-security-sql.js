/**
 * 文件名: request-security-sql.js
 * 版本号: 3.5.10
 * 更新日期: 2026-11-04
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
  // 客户端仅做粗粒度拦截，服务端（参数化查询）才是真正防线。
  // 注释符不能单独匹配：地址「A#301」、备注「加急--勿拆」等合法文本会被误杀。
  // 只有「注释符 + SQL 关键字」或明确的注入结构才拦截。
  const sqlInjectionPatterns = [
    /(--|#|\/\*)\s*(select|union|drop|delete|update|insert|alter|create|truncate|exec|execute|or|and|where)\b/i,
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
