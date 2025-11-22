# SutWxApp API 开发指南

> 说明：本文件的详细接口说明与示例已统一迁移至 `03-API接口文档.md`。后续更新请以 `03-API接口文档.md` 为准，本文件保留为设计原则与开发流程参考。

## 1. 简介

本文档提供了 SutWxApp 微信小程序项目中 API 开发的指导规范和最佳实践。所有参与项目开发的后端工程师都应严格遵循本文档中的规范，确保 API 设计的一致性、安全性和可维护性。

## 2. API 设计原则

### 2.1 RESTful 设计原则

- **资源命名**：使用名词而非动词命名 API 端点，例如 `/users` 而非 `/getUsers`
- **HTTP 方法**：使用适当的 HTTP 方法表示操作类型
  - GET：获取资源
  - POST：创建资源
  - PUT：更新资源（替换整个资源）
  - PATCH：部分更新资源
  - DELETE：删除资源
- **状态码**：使用标准的 HTTP 状态码表示响应结果
- **版本控制**：API URL 中包含版本信息，例如 `/v1/users`
- **过滤和排序**：使用查询参数实现过滤、排序和分页

### 2.2 接口命名规范

- **URL 格式**：`https://api.example.com/v{version}/{resource}[/{id}][/{subresource}]`
- **使用小写字母**：所有 URL 路径使用小写字母
- **使用连字符**：多个单词使用连字符 `-` 分隔，例如 `/user-profiles`
- **避免下划线**：不要使用下划线 `_`
- **避免文件扩展名**：URL 中不应包含文件扩展名

### 2.3 数据结构设计

- **使用 JSON 格式**：所有请求和响应都应使用 JSON 格式
- **统一数据格式**：保持响应数据结构的一致性
- **使用有意义的字段名**：字段名应清晰表达其含义
- **避免深层次嵌套**：尽量避免超过 3 层的 JSON 嵌套结构
- **类型一致性**：相同字段在不同接口中的数据类型应保持一致

## 3. API 开发流程

### 3.1 需求分析与设计

1. **需求理解**：详细理解业务需求，确定所需的 API 接口
2. **资源识别**：识别系统中的主要资源及其关系
3. **API 设计**：设计 API 端点、请求参数、响应格式
4. **文档编写**：在开发前编写 API 接口文档初稿
5. **团队评审**：组织团队成员评审 API 设计，确保合理性和一致性

### 3.2 开发实施

1. **环境准备**：设置开发环境和数据库
2. **接口实现**：根据设计文档实现 API 接口
3. **单元测试**：为每个 API 接口编写单元测试
4. **集成测试**：确保 API 与其他系统组件正常协作
5. **性能测试**：对关键 API 进行性能测试和优化

### 3.3 代码审查与部署

1. **代码审查**：提交代码审查请求，确保代码质量
2. **修复问题**：根据代码审查意见修复问题
3. **文档更新**：更新 API 接口文档，确保与实际实现一致
4. **部署测试**：在测试环境部署并进行最终测试
5. **生产部署**：部署到生产环境

## 4. 安全规范

### 4.1 认证与授权

- **Token 认证**：使用 JWT (JSON Web Token) 进行身份认证
- **Token 管理**：
  - Token 应包含过期时间，默认 7 天
  - 提供 Token 刷新机制
  - 服务端应维护 Token 黑名单
- **权限控制**：实现基于角色的访问控制 (RBAC)
- **敏感操作验证**：重要操作需要二次验证（如修改密码）

### 4.2 数据安全

- **数据加密**：
  - 密码使用加盐哈希存储（推荐 bcrypt、Argon2）
  - 敏感数据传输使用 HTTPS
  - 数据库敏感字段加密存储
- **输入验证**：所有用户输入必须进行验证和清理
- **SQL 注入防护**：使用参数化查询或 ORM 框架
- **XSS 防护**：对输出进行适当的转义和过滤

### 4.3 请求限制

- **请求频率限制**：
  - 实现 API 速率限制，防止恶意请求
  - 对不同用户角色设置不同的限制策略
- **请求大小限制**：限制请求体大小，防止 DoS 攻击
- **超时设置**：合理设置请求超时时间

## 5. 错误处理

### 5.1 错误码规范

- **HTTP 状态码**：使用标准 HTTP 状态码
- **业务错误码**：在响应体中提供更详细的业务错误码
- **错误码范围定义**：
  - 1000-1999：系统级错误
  - 2000-2999：用户相关错误
  - 3000-3999：商品相关错误
  - 4000-4999：订单相关错误
  - 5000-5999：支付相关错误

### 5.2 错误响应格式

统一的错误响应格式：

```json
{
  "code": 400,
  "message": "错误描述信息",
  "error": {
    "field": "字段名",
    "code": "错误码",
    "description": "详细错误描述"
  }
}
```

### 5.3 异常日志

- **日志记录**：记录所有异常和错误信息
- **日志级别**：合理使用不同的日志级别（ERROR、WARN、INFO 等）
- **敏感信息过滤**：日志中不记录敏感信息（如密码、Token 等）
- **上下文信息**：记录足够的上下文信息，便于问题排查

## 6. 代码规范

### 6.1 代码结构

- **模块化设计**：按功能模块组织代码
- **分层架构**：
  - 控制器层 (Controller)：处理请求和响应
  - 服务层 (Service)：实现业务逻辑
  - 数据访问层 (Repository/DAO)：负责数据操作
  - 实体层 (Model/Entity)：定义数据模型
  - 工具层 (Util)：提供通用工具方法

### 6.2 命名规范

- **文件命名**：使用小写字母和连字符，例如 `user-service.js`
- **类和函数命名**：
  - 类名使用大驼峰命名法：`UserService`
  - 函数名使用小驼峰命名法：`getUserInfo()`
  - 常量使用全大写和下划线：`MAX_RETRY_COUNT`
- **参数和变量**：使用小驼峰命名法：`userId`, `pageSize`

### 6.3 注释规范

- **文件头部**：包含文件描述、作者、创建日期等信息
- **函数注释**：为每个函数添加注释，说明功能、参数、返回值
- **复杂逻辑**：对复杂的业务逻辑添加注释说明
- **注释语言**：使用中文编写注释

## 7. 接口示例代码

### 7.1 基础 API 结构

```javascript
/**
 * 用户控制器
 * @module controllers/userController
 */
const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const authMiddleware = require('../middleware/auth');
const { validateUserInput } = require('../validators/userValidator');

/**
 * 获取用户列表
 * @route GET /api/v1/users
 * @group 用户管理 - 用户相关操作
 * @param {number} page.query - 页码
 * @param {number} pageSize.query - 每页数量
 * @returns {object} 200 - 用户列表和分页信息
 * @returns {Error} 401 - 未授权
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const result = await userService.getUserList({ page, pageSize });
    res.json({
      code: 200,
      message: 'success',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message || '服务器内部错误'
    });
  }
});

module.exports = router;
```

### 7.2 服务层实现

```javascript
/**
 * 用户服务
 * @module services/userService
 */
const UserModel = require('../models/user');

/**
 * 获取用户列表
 * @param {Object} options - 查询参数
 * @param {number} options.page - 页码
 * @param {number} options.pageSize - 每页数量
 * @returns {Promise<Object>} 用户列表和分页信息
 */
async function getUserList(options = {}) {
  const { page = 1, pageSize = 10 } = options;
  const skip = (page - 1) * pageSize;
  
  // 查询条件
  const query = {};
  
  try {
    // 获取总数
    const total = await UserModel.countDocuments(query);
    
    // 获取数据列表
    const list = await UserModel.find(query)
      .skip(skip)
      .limit(Number(pageSize))
      .sort({ createTime: -1 })
      .select('-password'); // 排除密码字段
    
    return {
      list,
      total,
      page,
      pageSize
    };
  } catch (error) {
    console.error('获取用户列表失败:', error);
    throw new Error('获取用户列表失败');
  }
}

module.exports = {
  getUserList
};
```

### 7.3 数据模型定义

```javascript
/**
 * 用户模型
 * @module models/user
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false // 默认不返回密码字段
  },
  nickName: {
    type: String,
    default: ''
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  gender: {
    type: Number,
    default: 0 // 0未知，1男，2女
  },
  birthdate: {
    type: Date
  },
  address: {
    province: String,
    city: String,
    district: String,
    detail: String
  },
  status: {
    type: Number,
    default: 1 // 1正常，0禁用
  },
  createTime: {
    type: Date,
    default: Date.now
  },
  updateTime: {
    type: Date,
    default: Date.now
  },
  lastLoginTime: {
    type: Date
  }
});

// 密码加密中间件
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    // 生成盐并加密密码
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 密码验证方法
UserSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
```

### 7.4 请求验证

```javascript
/**
 * 用户输入验证
 * @module validators/userValidator
 */
const Joi = require('joi');

/**
 * 验证用户注册输入
 * @param {Object} data - 用户输入数据
 * @returns {Object} 验证结果
 */
function validateUserRegister(data) {
  const schema = Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.base': '用户名必须是字符串',
        'string.alphanum': '用户名只能包含字母和数字',
        'string.min': '用户名长度不能小于3个字符',
        'string.max': '用户名长度不能大于30个字符',
        'any.required': '用户名是必填项'
      }),
    password: Joi.string()
      .pattern(/^[a-zA-Z0-9]{6,30}$/)
      .required()
      .messages({
        'string.pattern.base': '密码必须是6-30位字母或数字',
        'any.required': '密码是必填项'
      }),
    phone: Joi.string()
      .pattern(/^1[3-9]\d{9}$/)
      .allow('')
      .messages({
        'string.pattern.base': '手机号格式不正确'
      }),
    email: Joi.string()
      .email()
      .allow('')
      .messages({
        'string.email': '邮箱格式不正确'
      })
  });

  return schema.validate(data);
}

module.exports = {
  validateUserRegister
};
```

## 8. 测试规范

### 8.1 测试类型

- **单元测试**：测试单个函数或方法的正确性
- **集成测试**：测试多个组件或模块的协作
- **接口测试**：直接测试 API 接口的功能和性能
- **压力测试**：测试 API 在高负载下的性能表现

### 8.2 测试工具

- **单元测试**：Jest、Mocha
- **API 测试**：Supertest、Postman
- **性能测试**：Apache JMeter、k6

### 8.3 测试覆盖率

- **代码覆盖率**：核心业务逻辑的代码覆盖率应不低于 80%
- **测试用例**：
  - 正常流程测试
  - 边界条件测试
  - 错误处理测试
  - 安全相关测试

## 9. 文档规范

### 9.1 API 文档

- **文档格式**：使用 Markdown 格式编写
- **文档内容**：
  - 接口描述
  - 请求 URL
  - 请求方法
  - 请求参数（包括路径参数、查询参数、请求体）
  - 请求头
  - 响应格式
  - 示例请求和响应
  - 错误码说明

### 9.2 文档更新

- **开发前**：编写 API 设计文档
- **开发中**：根据实际实现调整文档
- **开发后**：确认文档与实际实现一致
- **变更时**：及时更新文档，反映 API 的变化

## 10. 性能优化

### 10.1 数据库优化

- **索引优化**：为频繁查询的字段创建适当的索引
- **查询优化**：优化查询语句，避免全表扫描
- **连接池**：使用数据库连接池管理数据库连接
- **批量操作**：使用批量插入和更新操作减少数据库交互次数

### 10.2 缓存策略

- **Redis 缓存**：使用 Redis 缓存热点数据
- **缓存失效策略**：合理设置缓存过期时间
- **缓存更新**：数据更新时同步更新缓存
- **缓存穿透防护**：对不存在的数据也进行短时间缓存

### 10.3 代码优化

- **异步处理**：使用异步非阻塞 I/O
- **惰性加载**：按需加载资源
- **资源复用**：避免重复创建和销毁资源
- **算法优化**：选择高效的算法和数据结构

## 11. 部署与监控

### 11.1 部署策略

- **环境隔离**：开发、测试、预发布、生产环境严格隔离
- **持续集成/部署**：使用 CI/CD 工具实现自动化部署
- **负载均衡**：关键服务使用负载均衡提高可用性
- **容器化部署**：使用 Docker 和 Kubernetes 实现容器化部署

### 11.2 监控与告警

- **服务监控**：监控 API 响应时间、成功率、错误率
- **系统监控**：监控服务器 CPU、内存、磁盘、网络等资源
- **数据库监控**：监控数据库性能和连接数
- **告警机制**：设置合理的告警阈值，及时发现问题

### 11.3 日志管理

- **集中式日志**：使用 ELK 等工具集中管理日志
- **日志级别**：根据重要性设置不同的日志级别
- **日志轮转**：合理设置日志轮转策略，避免日志过大
- **日志分析**：定期分析日志，发现潜在问题

## 12. 常见问题与解决方案

### 12.1 认证相关问题

- **Token 过期**：实现 Token 自动刷新机制
- **Token 失效**：服务端维护 Token 黑名单，支持主动失效
- **权限不足**：提供明确的错误信息，指导用户获取适当权限

### 12.2 性能相关问题

- **响应缓慢**：检查数据库查询，添加缓存，优化代码
- **并发问题**：使用锁机制或乐观锁解决并发修改冲突
- **内存泄漏**：定期进行内存分析，及时修复内存泄漏问题

### 12.3 安全相关问题

- **SQL 注入**：使用参数化查询或 ORM 框架
- **XSS 攻击**：对用户输入进行验证和转义
- **CSRF 攻击**：使用 CSRF Token 验证请求来源
- **敏感信息泄露**：避免在日志中记录敏感信息，使用 HTTPS 传输

---

*本文档将根据项目需求和最佳实践不断更新*
