<!--
文件名: spec.md
版本号: 3.0.0
更新日期: 2026-07-06
作者: Sut
描述: SutWxApp 项目开发规范文档，涵盖开发环境、代码规范、组件库规范、设计系统使用规范和安全编码规范
-->

# 开发规范

## 1. 概述

### 1.1 文档目的

本规范定义了苏铁微信小程序（SutWxApp）项目的开发环境设置、代码规范、组件库开发规范、设计系统使用规范和安全编码规范，旨在确保代码质量、提高开发效率、保障产品安全。

### 1.2 适用范围

本文档适用于 SutWxApp 项目的所有开发人员，涵盖前端小程序开发的各个方面。

## 2. 开发环境

### 2.1 环境要求

| 工具 | 版本要求 | 说明 |
|------|---------|------|
| 微信开发者工具 | 最新稳定版 | 小程序开发和调试 |
| Node.js | v16+ | 构建工具和脚本运行 |
| Bun | v1.0+ | 高性能 JavaScript 运行时 |
| VS Code | 最新稳定版 | 代码编辑 |
| Git | 最新稳定版 | 版本控制 |

### 2.2 VS Code 推荐插件

| 插件 | 说明 |
|------|------|
| ESLint | 代码检查 |
| Prettier | 代码格式化 |
| 微信小程序开发工具 | 小程序代码片段和提示 |
| GitLens | Git 增强功能 |
| Todo Tree | TODO 注释管理 |

### 2.3 微信开发者工具配置

**必需设置**：
- 调试基础库：最新稳定版
- ES6转ES5：开启
- 增强编译：开启
- 代码压缩：开启
- 上传时自动压缩：开启
- 域名校验：开发阶段可关闭，发布前必须开启

### 2.4 项目安装

```bash
# 克隆仓库
git clone https://github.com/sutchan/SutWxApp.git
cd SutWxApp

# 安装依赖（使用 Bun 或 npm）
bun install
# 或
npm install
```

## 3. 代码规范

### 3.1 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 变量/函数 | camelCase（小驼峰） | `userName`, `getUserInfo` |
| 类/构造函数 | PascalCase（大驼峰） | `UserService`, `ProductCard` |
| 常量 | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE`, `DEFAULT_LIMIT` |
| 文件/目录 | kebab-case（短横线） | `user-service.js`, `product-card` |
| 组件 | PascalCase（大驼峰） | `ProductCard`, `EmptyState` |
| CSS 类名 | kebab-case | `.product-card`, `.btn-primary` |
| CSS 变量 | kebab-case 双前缀 | `--primary-color`, `--spacing-md` |

### 3.2 代码格式化

- 缩进：2 个空格
- 每行最大字符数：100 字符
- 文件末尾添加空行
- 运算符周围添加空格
- 函数括号前添加空格
- 逗号后添加空格
- 使用单引号（字符串）
- 语句末尾不使用分号（可选，保持一致即可）

### 3.3 注释规范

#### 3.3.1 文件头注释

每个文件头部必须包含文件说明注释：

```javascript
/**
 * 文件名: example.js
 * 版本号: 3.0.0
 * 更新日期: 2026-07-06
 * 描述: 文件功能描述
 */
```

#### 3.3.2 函数注释

每个公共函数必须添加函数级注释：

```javascript
/**
 * 获取用户信息
 * @param {string} userId - 用户ID
 * @param {Object} options - 查询选项
 * @param {boolean} options.includeDetails - 是否包含详细信息
 * @returns {Promise<Object>} 用户信息对象
 */
async function getUserInfo(userId, options = {}) {
  // 实现逻辑
}
```

#### 3.3.3 行内注释

复杂逻辑处添加行内注释，说明为什么这么做而非做了什么。

### 3.4 JavaScript/TypeScript 规范

#### 3.4.1 变量声明

- 优先使用 `const`，其次使用 `let`
- 禁止使用 `var`
- 变量声明应尽量靠近使用位置

```javascript
// 好的写法
const userName = '张三';
let count = 0;

// 不好的写法
var userName = '张三';
```

#### 3.4.2 函数

- 函数职责单一，避免过长函数（建议不超过 50 行）
- 优先使用箭头函数（适用场景）
- 参数数量不宜过多，超过 3 个考虑使用对象参数

#### 3.4.3 异步编程

- 优先使用 async/await
- 正确处理错误（try-catch）
- 避免回调地狱

```javascript
// 好的写法
async function loadData() {
  try {
    const data = await fetchData();
    return data;
  } catch (error) {
    console.error('加载数据失败:', error);
    throw error;
  }
}
```

### 3.5 WXML 规范

- 使用语义化标签
- 缩进 2 个空格
- 属性名小写，使用连字符
- 布尔属性省略值（`<button disabled />`）
- 事件绑定使用 `bind:` 前缀

```xml
<view class="product-card" bind:tap="onProductTap">
  <image class="product-image" src="{{product.image}}" mode="aspectFill" />
  <view class="product-info">
    <text class="product-name">{{product.name}}</text>
    <text class="product-price">¥{{product.price}}</text>
  </view>
</view>
```

### 3.6 WXSS 规范

- 使用 BEM 命名法（可选，建议组件使用）
- 优先使用 CSS 变量（设计系统变量）
- 避免使用 ID 选择器
- 避免使用 `!important`
- 合理使用嵌套（不超过 3 层）

```css
.product-card {
  padding: var(--spacing-md);
  background-color: var(--background-primary);
  border-radius: var(--border-radius-lg);
}

.product-card__image {
  width: 100%;
  border-radius: var(--border-radius-md);
}
```

## 4. 组件库开发规范

### 4.1 组件目录结构

每个组件应包含以下文件：

```
components/
  component-name/
    index.js      # 组件逻辑
    index.json    # 组件配置
    index.wxml    # 组件模板
    index.wxss    # 组件样式
```

### 4.2 组件开发原则

#### 4.2.1 单一职责原则

每个组件只负责一个功能，保持组件的内聚性和可复用性。

#### 4.2.2 可配置性

通过 properties 对外提供配置接口，避免硬编码。

#### 4.2.3 事件通信

- 父传子：通过 properties
- 子传父：通过 triggerEvent 触发事件
- 事件命名：使用 kebab-case，如 `bind:item-tap`

### 4.3 组件配置规范

组件的 `.json` 配置文件：

```json
{
  "component": true,
  "usingComponents": {
    "s-button": "/components/button/index"
  }
}
```

### 4.4 组件属性规范

属性定义应包含类型、默认值和可选的 observer：

```javascript
Component({
  properties: {
    // 简单定义
    title: String,
    
    // 完整定义
    size: {
      type: String,
      value: 'md', // sm, md, lg
      observer: function(newVal, oldVal) {
        // 属性变化处理
      }
    },
    
    disabled: {
      type: Boolean,
      value: false
    }
  }
})
```

### 4.5 现有组件列表

| 组件名 | 路径 | 类型 | 状态 |
|--------|------|------|------|
| Button 按钮 | /components/button | 基础组件 | 已完成 |
| Badge 徽章 | /components/badge | 基础组件 | 已完成 |
| Avatar 头像 | /components/avatar | 基础组件 | 已完成 |
| Tag 标签 | /components/tag | 基础组件 | 已完成 |
| Divider 分割线 | /components/divider | 基础组件 | 已完成 |
| EmptyState 空状态 | /components/empty-state | 复合组件 | 已完成 |
| ProductCard 商品卡片 | /components/product-card | 业务组件 | 已完成 |
| Price 价格 | /components/price | 业务组件 | 已完成 |
| OrderCard 订单卡片 | /components/order-card | 业务组件 | 已完成 |

### 4.6 组件使用规范

在页面的 `.json` 文件中引入组件：

```json
{
  "usingComponents": {
    "s-button": "/components/button/index",
    "s-product-card": "/components/product-card/index"
  }
}
```

在 WXML 中使用：

```xml
<s-button variant="primary" size="lg" bind:tap="onSubmit">
  提交
</s-button>

<s-product-card 
  product="{{product}}" 
  bind:product-tap="onProductTap"
  bind:add-cart-tap="onAddCart"
/>
```

### 4.7 组件文档要求

每个组件应有完整的文档说明，包括：
- 组件功能描述
- 属性列表（名称、类型、默认值、说明）
- 事件列表（名称、回调参数、说明）
- 使用示例
- 不同变体/尺寸示例

## 5. 设计系统使用规范

### 5.1 设计系统概述

项目采用 Apple 极简设计风格，结合 shadcn/ui 设计理念，使用深绿色为主色调的设计系统。完整设计规范请参考 `design/spec.md`。

### 5.2 CSS 变量使用

所有颜色、间距、字体、圆角等设计令牌通过 CSS 变量使用，禁止硬编码具体值。

```css
/* ✅ 正确：使用 CSS 变量 */
.card {
  padding: var(--spacing-lg);
  background-color: var(--background-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
}

/* ❌ 错误：硬编码值 */
.card {
  padding: 16px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
```

### 5.3 颜色系统

#### 5.3.1 主色调

主色调为深绿色 `#2E7D32`，用于主要操作、强调文字、选中状态等。

| 变量名 | 用途 |
|--------|------|
| `--primary-color` | 品牌主色、主要按钮、强调文字 |
| `--primary-light` | 主色浅色调、选中态背景 |
| `--primary-dark` | 主色深色调、按下态 |

#### 5.3.2 语义色

| 变量名 | 用途 |
|--------|------|
| `--success-color` | 成功状态、已完成 |
| `--warning-color` | 警告状态、待处理 |
| `--error-color` | 错误状态、价格（电商场景） |
| `--info-color` | 信息状态、配送中 |

#### 5.3.3 文字色

| 变量名 | 用途 |
|--------|------|
| `--text-primary` | 标题、正文、主要文字 |
| `--text-secondary` | 次要说明、辅助文字 |
| `--text-tertiary` | 占位符、禁用文字 |

#### 5.3.4 背景色

| 变量名 | 用途 |
|--------|------|
| `--background-primary` | 卡片、弹窗、主要内容区域 |
| `--background-secondary` | 页面背景、分组背景 |
| `--background-tertiary` | 输入框背景、次要内容 |

### 5.4 间距系统

间距基于 4px 基准网格，使用预设间距值：

| 变量名 | 数值 | 用途 |
|--------|------|------|
| `--spacing-xs` | 4px | 图标与文字间距、极小空隙 |
| `--spacing-sm` | 8px | 组件内部小间距、标签间距 |
| `--spacing-md` | 12px | 组件内边距、卡片内边距 |
| `--spacing-lg` | 16px | 组件间距、列表项间距 |
| `--spacing-xl` | 20px | 区块内间距、内容区域边距 |
| `--spacing-xxl` | 24px | 区块间距、页面水平边距 |

### 5.5 字体系统

#### 5.5.1 字体栈

```css
page {
  --font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text',
    'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}
```

#### 5.5.2 字号层级

| 变量名 | 字号 | 用途 |
|--------|------|------|
| `--font-size-h1` | 28px | 页面大标题、重要数值 |
| `--font-size-h2` | 22px | 页面标题、区块标题 |
| `--font-size-h3` | 18px | 卡片标题、列表主标题 |
| `--font-size-lg` | 16px | 次级标题、重要正文 |
| `--font-size-md` | 14px | 正文基准、主要内容 |
| `--font-size-sm` | 12px | 辅助说明、标签、次要信息 |
| `--font-size-xs` | 10px | 角标、时间戳、极次要信息 |

### 5.6 圆角系统

| 变量名 | 数值 | 用途 |
|--------|------|------|
| `--border-radius-sm` | 8px | 小按钮、标签、小图标 |
| `--border-radius-md` | 12px | 按钮、输入框、卡片（默认） |
| `--border-radius-lg` | 16px | 大卡片、弹窗、图片容器 |
| `--border-radius-xl` | 24px | 大容器、底部弹窗 |

### 5.7 阴影系统

| 变量名 | 用途 |
|--------|------|
| `--shadow-sm` | 卡片、输入框、按钮（默认） |
| `--shadow-md` | 悬浮卡片、下拉菜单 |
| `--shadow-lg` | 弹窗、浮层、底部抽屉 |

### 5.8 动效系统

#### 5.8.1 过渡时长

| 变量名 | 时长 | 用途 |
|--------|------|------|
| `--duration-fast` | 150ms | 微交互、按钮反馈、颜色变化 |
| `--duration-normal` | 300ms | 标准过渡、页面切换、组件动画 |
| `--duration-slow` | 500ms | 大型动画、弹窗进出、页面转场 |

#### 5.8.2 缓动函数

```css
page {
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);  /* 标准 */
  --ease-out: cubic-bezier(0, 0, 0.2, 1);       /* 进入 */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);        /* 退出 */
}
```

### 5.9 设计规范检查清单

开发页面或组件时，请对照以下清单：

- [ ] 所有颜色使用 CSS 变量，无硬编码色值
- [ ] 间距使用预设间距变量
- [ ] 字体使用预设字号变量
- [ ] 圆角使用预设圆角变量
- [ ] 阴影使用预设阴影变量
- [ ] 动画使用预设时长和缓动变量
- [ ] 遵循设计系统的组件样式规范
- [ ] 文字颜色对比度满足可访问性要求

## 6. 安全编码规范

### 6.1 概述

安全编码规范基于项目安全报告（security_best_practices_report.md）制定，旨在指导开发人员编写安全的代码，避免常见安全漏洞。

### 6.2 数据安全

#### 6.2.1 敏感数据存储

**要求**：
- 敏感数据（Token、用户隐私信息）禁止明文存储
- 必须使用加密存储（注意：当前 Base64 编码不是加密，需升级为 AES 等真正的加密算法）
- 敏感数据展示时进行脱敏处理

**正确示例**：
```javascript
// 存储前加密
const encryptedToken = securityUtil.encrypt(token);
wx.setStorageSync('token', encryptedToken);

// 读取后解密
const encryptedToken = wx.getStorageSync('token');
const token = securityUtil.decrypt(encryptedToken);
```

**错误示例**：
```javascript
// ❌ 明文存储
wx.setStorageSync('token', token);
wx.setStorageSync('userInfo', userInfo);
```

#### 6.2.2 数据脱敏

敏感信息展示时必须脱敏：

```javascript
// 手机号脱敏
function maskPhone(phone) {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

// 身份证脱敏
function maskIdCard(idCard) {
  return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
}
```

### 6.3 加密与签名

#### 6.3.1 加密算法要求

- 禁止使用 Base64 作为加密（Base64 是编码，不是加密）
- 对称加密使用 AES-256
- 哈希算法使用 SHA-256 或以上
- 禁止使用 MD5、SHA-1 等已破解算法

**当前问题**：
- `security.ts` 中的 `encrypt()` 实际是 Base64 编码，需要修复
- `generateSign()` 使用弱哈希算法，需要升级到 SHA-256

#### 6.3.2 随机数生成

- CSRF Token、密钥等安全敏感的随机数必须使用密码学安全的随机数生成器
- 禁止使用 `Math.random()` 生成安全相关的随机数
- 使用 `crypto.getRandomValues()` 生成安全随机数

**正确示例**：
```javascript
function generateSecureToken(length = 32) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
```

**错误示例**：
```javascript
// ❌ 不安全的随机数
function generateToken() {
  return Math.random().toString(36).substring(2);
}
```

### 6.4 输入验证与过滤

#### 6.4.1 XSS 防护

- 所有用户输入的 HTML 内容必须经过 XSS 过滤
- 优先使用小程序的 `rich-text` 组件的安全模式
- 避免直接使用 `wxParse` 等可能引入 XSS 的库

**防护措施**：
```javascript
function sanitizeHtml(html) {
  // 移除危险标签
  const dangerousTags = ['script', 'iframe', 'object', 'embed', 'link'];
  // 移除危险属性
  const dangerousAttrs = ['onerror', 'onload', 'onclick', 'onmouseover'];
  // 过滤处理...
  return sanitizedHtml;
}
```

#### 6.4.2 SQL 注入防护

- 前端进行基本的输入验证，防止明显的注入尝试
- 主要防护在后端（使用参数化查询、ORM 等）
- 前端检测到疑似注入时记录日志并拒绝请求

**注意**：SQL 注入检测不能过于严格，避免误报正常用户输入（如搜索 "select a product"）。

#### 6.4.3 输入验证

所有用户输入必须进行验证：

| 输入类型 | 验证规则 |
|---------|---------|
| 手机号 | 11位数字，1开头 |
| 邮箱 | 符合邮箱格式 |
| 姓名 | 2-20个字符 |
| 身份证 | 18位，格式正确 |
| 密码 | 6-20位，包含字母和数字 |

**验证示例**：
```javascript
function validatePhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

### 6.5 接口安全

#### 6.5.1 请求签名

- 所有需要认证的接口必须携带签名
- 签名算法使用 SHA-256（当前需要从 MD5 升级）
- 签名包含时间戳，防止重放攻击

#### 6.5.2 CSRF 防护

- 所有修改操作（POST/PUT/DELETE）必须携带 CSRF Token
- CSRF Token 使用安全随机数生成
- Token 存储在内存或安全存储中

#### 6.5.3 认证与授权

- 使用 JWT Token 进行身份认证
- Token 过期自动刷新或重新登录
- 401 状态码统一处理：清除本地数据，跳转登录
- 敏感操作需要二次验证（如支付密码）

### 6.6 错误处理与日志

#### 6.6.1 错误日志

- 生产环境禁止输出详细错误信息到控制台
- 错误日志不得包含敏感数据（Token、用户隐私、密码等）
- 使用监控工具上报错误时，对敏感数据脱敏

**正确示例**：
```javascript
try {
  // 业务逻辑
} catch (error) {
  console.error('[Module] 操作失败'); // 不输出敏感数据
  monitorUtil.error('操作失败', { errorType: error.type }); // 脱敏上报
}
```

**错误示例**：
```javascript
// ❌ 输出敏感信息
console.error('登录失败:', { userInput, token, error });
```

#### 6.6.2 用户提示

- 错误提示应对用户友好，不暴露技术细节
- 网络错误："网络连接失败，请检查网络设置"
- 服务器错误："服务器繁忙，请稍后再试"
- 不向用户显示具体的 SQL 错误、堆栈跟踪等

### 6.7 页面跳转安全

#### 6.7.1 白名单机制

- 内部页面跳转使用白名单机制
- 禁止跳转到未注册的页面
- 外部链接必须经过用户确认

**实现示例**：
```javascript
const REGISTERED_PAGES = [
  '/pages/home/index',
  '/pages/category/index',
  // ...
];

function safeNavigate(url) {
  const isRegistered = REGISTERED_PAGES.some(p => url.indexOf(p) === 0);
  if (isRegistered) {
    wx.navigateTo({ url });
  } else {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  }
}
```

### 6.8 安全检查清单

代码提交前，请对照以下安全检查清单：

- [ ] 敏感数据存储是否加密
- [ ] 敏感信息展示是否脱敏
- [ ] 加密算法是否使用安全算法（AES、SHA-256）
- [ ] 随机数是否使用安全随机数生成器
- [ ] 用户输入是否进行验证和过滤
- [ ] XSS 防护是否到位
- [ ] CSRF Token 是否正确使用
- [ ] 请求签名是否使用强哈希算法
- [ ] 错误日志是否包含敏感信息
- [ ] 页面跳转是否使用白名单机制
- [ ] 是否使用了 HTTPS（生产环境）
- [ ] Token 过期是否正确处理

## 7. Git 工作流

### 7.1 分支策略

| 分支 | 说明 |
|------|------|
| main | 生产分支，保持稳定 |
| develop | 集成分支，用于测试 |
| feature/xxx | 功能开发分支 |
| bugfix/xxx | Bug 修复分支 |
| hotfix/xxx | 紧急修复分支 |

### 7.2 提交规范

使用语义化提交消息，格式为：`<type>: <description>`

**类型说明**：

| 类型 | 说明 |
|------|------|
| feat | 新功能 |
| fix | 修复 bug |
| docs | 文档更新 |
| style | 代码样式修改（不影响功能） |
| refactor | 代码重构 |
| perf | 性能优化 |
| test | 测试相关 |
| chore | 构建或辅助工具的变动 |
| security | 安全相关修复 |

**示例**：
```
feat: 添加收货地址管理功能
fix: 修复购物车数量计算错误
docs: 更新功能规范文档
style: 优化按钮样式
security: 修复加密算法安全漏洞
```

### 7.3 代码审查

- 所有代码提交前必须进行代码审查
- 至少一人批准后才能合并
- 审查重点：代码质量、安全性、可维护性、是否符合规范

## 8. 开发流程

### 8.1 需求分析

1. 分析业务需求
2. 确定功能范围
3. 评估工作量
4. 创建开发计划

### 8.2 设计阶段

1. 架构设计
2. UI/UX 设计
3. 编写设计文档
4. 设计评审

### 8.3 开发阶段

1. 创建功能分支
2. 编写代码
3. 单元测试
4. 本地测试
5. 代码审查
6. 合并到 develop

### 8.4 测试阶段

1. 集成测试
2. 功能测试
3. 性能测试
4. 安全测试
5. 兼容性测试

### 8.5 发布阶段

1. 版本号更新
2. 发布说明编写
3. 代码合并到 main
4. 打版本标签
5. 小程序上传发布

## 9. 性能优化规范

### 9.1 前端性能优化

- 图片优化：压缩图片、使用合适格式、懒加载
- 代码分包：使用小程序分包加载
- 首屏优化：减少首屏请求、骨架屏
- 列表优化：虚拟列表、图片懒加载
- 减少 setData 调用：批量更新、局部更新

### 9.2 代码优化

- 避免频繁的 setData 调用
- 合理使用缓存
- 减少不必要的页面渲染
- 事件防抖和节流

## 10. 版本历史

| 版本号 | 更新日期 | 更新内容 | 作者 |
|--------|----------|----------|------|
| 3.0.0 | 2026-07-06 | 全面更新开发规范，补充组件库开发规范、设计系统使用规范、安全编码规范 | Sut |
| 2.0.0 | 2026-06-08 | 采用Apple极简设计风格，更新全局样式和页面样式 | Sut |
| 1.0.0 | 2025-12-26 | 初始版本，完成开发规范文档 | Sut |
