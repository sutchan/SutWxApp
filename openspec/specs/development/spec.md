 开发规范

## 目的
本规范定义了苏铁微信小程序（SutWxApp）项目的开发环境设置、配置和最佳实践，包括前端和后端环境要求、安装步骤、项目配置和开发指南。

## 环境要求

### 前端开发环境
- **微信开发者工具**：最新稳定版
- **Bun**：v1.0.0+
- **VS Code**：最新稳定版（用于代码编辑）
- **TypeScript**：v5.3.0+

### 后端开发环境
- **Bun**：v1.0.0+
- **MySQL**：v8.0+
- **Redis**：v7.0+
- **Git**：最新稳定版

## 项目安装

### 1. 克隆仓库
```bash
git clone https://github.com/sutchan/SutWxApp.git
cd SutWxApp
```

### 2. 安装依赖
- 使用 Bun 安装：`bun install`

## 项目配置

### 前端配置

1. **在 project.config.json 中设置 AppID**：
```json
{
  "appid": "your-app-id-here"
  // 其他配置
}
```

2. **在 app.js 中配置 API 基础 URL**：
```javascript
App({
  globalData: {
    apiBaseUrl: 'https://your-api-server.com/api/v1'
  }
  // 其他配置
})
```

### 后端配置

1. **数据库配置（config/database.js）**：
```javascript
module.exports = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'your-password',
  database: 'sutwxapp',
  charset: 'utf8mb4'
};
```

2. **Redis配置（config/redis.js）**：
```javascript
module.exports = {
  host: 'localhost',
  port: 6379,
  password: '',
  db: 0
};
```

3. **JWT配置（config/jwt.js）**：
```javascript
module.exports = {
  secret: 'your-jwt-secret-key',
  expiresIn: '7d'
};
```

## 开发工具配置

### VS Code 配置

**必需插件**：
- ESLint：代码检查
- Prettier：代码格式化
- Vetur：Vue.js支持（如果适用）
- 微信代码片段：微信小程序代码片段
- GitLens：Git增强功能

**VS Code 设置**：
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "prettier.singleQuote": true,
  "prettier.trailingComma": "es5",
  "prettier.tabWidth": 2
}
```

### 微信开发者工具配置
**必需设置**：
- 调试基础库：最新稳定版
- ES6转ES5：开启
- 增强编译：开启
- 代码压缩：开启
- 上传时自动压缩：开启

**域名白名单配置**：
1. 登录微信公众平台
2. 导航到开发 > 开发设置
3. 将API服务器域名添加到服务器域名列表

## 运行项目

### 前端
1. 打开微信开发者工具
2. 从`SutWxApp/SutWxApp`目录导入项目
3. 点击"编译"按钮运行项目
4. 点击"预览"按钮在真机上测试

### 后端
1. 导航到后端目录
2. 启动服务：
   - 生产环境：`npm start`
   - 开发环境（热重载）：`npm run dev`

## 代码规范

### 命名规范
- **变量/函数**：camelCase（小驼峰命名法）
- **类/构造函数**：PascalCase（大驼峰命名法）
- **常量**：UPPER_SNAKE_CASE（全大写，下划线分隔）
- **文件/目录**：kebab-case（短横线分隔）
- **组件**：PascalCase（大驼峰命名法）

### 代码格式化
- 使用2个空格进行缩进
- 每行代码不超过100个字符
- 文件末尾添加空行
- 在运算符周围添加空格
- 函数括号前添加空格
- 逗号后添加空格

### 注释规范
- 每个函数必须添加函数级注释
- 注释使用中文
- 复杂逻辑添加行内注释
- 文件头部添加文件说明注释

```javascript
/**
 * 文件名: example.js
 * 版本号: 1.0.0
 * 更新日期: 2025-12-26
 * 功能描述: 示例函数
 * @param {Object} options - 查询参数
 * @param {string} options.type - 类型
 * @returns {Promise<Object>} 结果
 */
async function exampleFunction(options = {}) {
  // 实现逻辑
}
```

### 代码质量
- 避免使用全局变量，使用const/let代替var
- 避免深层嵌套，保持代码扁平
- 函数职责单一，避免过长函数
- 使用模块化设计，提高代码复用性

## Git工作流

### 分支策略
- **main/master**：生产分支，保持稳定
- **develop**：集成分支，用于测试
- **feature/xxx**：功能开发分支
- **bugfix/xxx**：bug修复分支
- **hotfix/xxx**：紧急修复分支

### 提交规范
使用语义化提交消息，格式为：`<type>: <description>`

**类型说明**：
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码样式修改（不影响功能）
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建或辅助工具的变动

**示例**：
```
feat: 添加用户积分系统
fix: 修复购物车数量计算错误
docs: 更新API文档
```

### 分支合并
- feature → develop
- bugfix → develop 和 main
- release → main 和 develop

## 开发流程

1. **需求分析**：分析业务需求，确定解决方案，评估工作量，创建开发计划
2. **设计阶段**：进行架构设计、详细设计，编写设计文档，并评审设计文档
3. **开发阶段**：克隆仓库，创建功能分支，编写代码和单元测试，并提交更改
4. **测试阶段**：进行集成测试、系统测试、性能测试和安全测试
5. **部署阶段**：部署到测试环境，进行验收测试，部署到生产环境，并监控系统状态
6. **维护阶段**：修复生产问题，优化性能，添加新功能，并更新文档

## 最佳实践

### 代码复用
- 创建可复用组件，而不是重复代码
- 提取通用函数，而不是重复实现
- 使用工具类封装常用功能

### 错误处理
- 使用try-catch、Promises和async/await进行适当的错误处理
- 记录完整的错误信息，以便调试
- 向用户提供清晰、有帮助的错误提示

### 性能优化
- 优化图片大小和格式
- 实现懒加载和分页
- 合理使用缓存策略
- 优化API响应时间
- 减少不必要的网络请求

### 安全实践
- 验证和清理所有输入，防止SQL注入、XSS、CSRF等安全漏洞
- 对敏感数据和传输中的数据进行加密
- 使用适当的安全机制，如JWT和RBAC
- 定期更新依赖，修复安全漏洞

## 调试技巧

### 前端调试
- 使用微信开发者工具的调试器
- 使用console.log进行调试
- 利用微信开发者工具的网络面板查看请求
- 使用真机调试验证功能

### 后端调试
- 使用VS Code的调试功能
- 利用日志记录关键信息
- 使用Postman测试API
- 监控数据库查询性能

## 常见问题

### API连接问题
- 检查后端服务是否正在运行
- 验证API基础URL配置
- 确保服务器域名在白名单中
- 确认请求在允许的域名列表中

### 编译错误
- 验证Bun版本兼容性
- 必要时重新安装依赖：`bun install`
- 检查代码中的语法错误

### 页面加载缓慢
- 优化图片资源
- 实现懒加载和分页
- 优化缓存策略
- 提高API响应时间

## 代码审查

### 审查目的
- 提高代码质量
- 确保符合规范
- 发现潜在问题
- 提高性能和安全性

### 审查流程
1. 创建Pull Request
2. 团队成员进行审查并提供反馈
3. 在合并前进行修改
4. 至少有一个人批准后才能合并

### 审查要点
- 代码质量和可读性
- 符合命名规范情况
- 潜在问题
- 性能和安全性
- 测试覆盖率

## CI/CD

### 持续集成
- CI系统应自动运行测试、代码检查和构建
- 支持多环境构建
- 生成构建报告

### 持续部署
- CD系统应在通过测试后自动部署到目标环境
- 支持蓝绿部署或滚动更新
- 自动回滚失败部署

### CI/CD工具
- GitHub Actions
- GitLab CI/CD
- Jenkins
- CircleCI

## 版本管理

### 版本号格式
采用语义化版本号：MAJOR.MINOR.PATCH

- **MAJOR**：不兼容的API更改
- **MINOR**：向下兼容的功能性新增
- **PATCH**：向下兼容的问题修正

### 版本发布
1. 更新版本号
2. 编写发布说明
3. 执行构建和测试
4. 部署到生产环境
5. 创建版本标签

## 文档管理

### 文档更新
- 代码变更时同步更新相关文档
- 使用Markdown格式编写文档
- 保持文档结构清晰
- 定期审查和更新文档

### 文档类型
- 需求文档
- 设计文档
- API文档
- 测试文档
- 用户文档

## 协作规范

### 沟通方式
- 使用团队协作工具进行沟通
- 定期召开站会和评审会议
- 及时更新任务状态

### 代码共享
- 遵循Git工作流
- 及时提交和推送代码
- 避免长时间占用分支

### 知识共享
- 定期分享技术知识
- 记录和分享解决问题的经验
- 更新和维护技术文档
