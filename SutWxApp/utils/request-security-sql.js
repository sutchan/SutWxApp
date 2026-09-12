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
  const sqlInjectionPatterns = [
    /('|--|;|#|-- | --|\/\*)/i,
    /\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXECUTE|UNION|JOIN|FROM|WHERE|GROUP|ORDER|HAVING|LIMIT|OFFSET|INTO|VALUES|CALL|EXEC|DECLARE|BEGIN|END|FETCH|LOCK|MERGE|ROLLBACK|COMMIT|SAVEPOINT|GRANT|REVOKE|DENY|TRANSACTION)\b/i,
    /\/\*.*?\*\//i,
    /\b(WAITFOR|SLEEP|DELAY)\b/i,
    /\b(UNION|ALL)\b.*?\b(SELECT|INSERT|UPDATE|DELETE)\b/i,
    /\(\s*SELECT\s+/i,
    /\b(OR|AND|NOT)\s+\d+\s*=\s*\d+\b/i,
    /\b(CONVERT|CAST)\b/i,
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
