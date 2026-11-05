 API规范

## 目的
本规范定义了苏铁微信小程序（SutWxApp）项目的API设计和使用，包括API结构、设计原则、认证机制、核心接口、错误处理和版本管理。

> 后端为 **WordPress 网站（headless CMS）**。小程序通过 REST API 消费网站内容，当前接口以 `/api/*` 暴露（对应 WP 侧由配套插件注册的自定义 REST 命名空间，如 `wp-json/<plugin>/v1/`；核心 `wp-json/wp/v2/` 亦可复用），鉴权走 `/auth/*`（微信 `wx.login` code 换取的 token 或 JWT）。下文端点约定以小程序实际调用路径为准；若后续改为直连 WP REST，可将 `/api/*` 映射为对应命名空间路由。参考实现：微慕 Minapper / Watch-Life（`https://github.com/iamxjb/winxin-app-watch-life.net`）。

## 设计原则

### 1. RESTful设计
- 遵循RESTful API设计原则
- 使用HTTP方法表示操作类型
- 资源路径使用名词复数形式
- 状态码表示操作结果

### 2. 简洁易用
- 接口命名简洁明了
- 减少不必要的参数
- 提供清晰的错误信息
- 支持常见的请求格式

### 3. 高可靠性
- 提供适当的超时机制
- 实现幂等性设计
- 支持重试机制
- 提供合理的缓存策略

### 4. 安全性
- 防止常见的安全漏洞
- 实现适当的认证和授权
- 加密敏感数据
- 限制请求频率

### 5. 可扩展性
- 支持版本管理
- 模块化设计
- 支持参数扩展
- 考虑未来需求

### 6. 一致性
- 统一的命名规范
- 一致的响应格式
- 统一的错误处理
- 一致的认证方式

### 7. 文档化
- 提供完整的API文档
- 包含示例请求和响应
- 描述参数和返回值
- 更新及时

## API结构

### URL结构
```
https://api.example.com/v{version}/{resource}/{id}?{query_parameters}
```

- **version**: API版本号，如v1, v2
- **resource**: 资源名称，使用复数形式，如users, products
- **id**: 资源ID，用于标识特定资源
- **query_parameters**: 查询参数，用于过滤、排序等

### HTTP方法

| HTTP方法 | 描述 | 幂等性 |
|----------|------|--------|
| GET | 获取资源 | 是 |
| POST | 创建资源 | 否 |
| PUT | 更新资源 | 是 |
| PATCH | 部分更新资源 | 是 |
| DELETE | 删除资源 | 是 |

### 状态码

| 状态码 | 描述 | 说明 |
|--------|------|------|
| 200 | OK | 请求成功 |
| 201 | Created | 资源创建成功 |
| 204 | No Content | 请求成功，无内容返回 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证 |
| 403 | Forbidden | 无权限 |
| 404 | Not Found | 资源不存在 |
| 500 | Internal Server Error | 服务器内部错误 |
| 502 | Bad Gateway | 网关错误 |
| 503 | Service Unavailable | 服务不可用 |
| 504 | Gateway Timeout | 网关超时 |

## 认证与授权

### JWT认证
- 所有需要认证的 API 请求必须在 `Authorization` 头中携带 JWT 令牌
- 令牌格式：`Authorization: Bearer {token}`
- 令牌由 `wx.login` → `code2session` → `openid` 换取后签发，**无用户名密码体系**
- 访问令牌有效期 2 小时（`expiresIn: 7200`），刷新令牌用于静默续期
- 刷新机制：访问令牌过期返回 401 → `utils/request-auth.js` 用刷新令牌换新令牌并重放原请求
- 登出后令牌 `jti` 进入黑名单（`includes/auth/class-auth-token-store.php`），无法继续使用

### 授权与归属校验
- **无角色体系（不使用 RBAC）**：小程序侧只有「登录用户」一种身份
- 越权防护依赖**资源归属校验**：订单、地址等资源按 `openid` 校验归属，非本人访问返回 403/404
- 管理能力（发货、退款、凭证配置）不暴露给小程序端，仅在 WordPress 后台或服务端内部调用
- 写操作端点（`/api/order/create|cancel|confirm|ship`、`/api/pay/prepay`）必须校验归属与状态机

## 请求格式

### URL参数
- 用于标识资源或过滤、排序
- 示例：`/api/product/list?page=1&pageSize=20&categoryId=3&keyword=绿萝`

### 查询参数
- 用于过滤、排序、分页等
- 支持多种比较运算符：=, >, <, >=, <=, in, like
- 支持逻辑运算符：and, or

### JSON请求体
- 用于创建或更新资源
- 示例：
```json
{
  "username": "test",
  "password": "password",
  "email": "test@example.com",
  "phone": "13800138000"
}
```

## 响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": 1609459200000,
  "requestId": "uuid"
}
```

### 列表响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "pageSize": 10
  },
  "timestamp": 1609459200000,
  "requestId": "uuid"
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "参数错误",
  "data": null,
  "timestamp": 1609459200000,
  "requestId": "uuid",
  "errors": [
    {
      "field": "username",
      "message": "用户名不能为空"
    },
    {
      "field": "email",
      "message": "邮箱格式不正确"
    }
  ]
}
```

## 核心API接口

### 认证API

> 账号体系为**微信静默授权**：`wx.login` 换取 `code` → 后端 `code2session` 换取 `openid` → 签发 JWT。**没有用户名密码注册/登录流程**，小程序不采集手机号与邮箱。
> 全部端点由 `includes/rest/class-rest-auth.php` 注册，命名空间 `/api/v1`，小程序侧路径为 `/api/auth/*`。

#### 微信登录
- **URL**: `POST /api/auth/login`
- **认证**: 不需要
- **请求体**:
  ```json
  { "code": "081Xyz...", "nickname": "苏小糖", "avatarUrl": "https://..." }
  ```
  - `code`：`wx.login()` 返回的临时凭证，5 分钟内有效且只能消费一次
  - `nickname` / `avatarUrl`：可选，仅用于首登建档
- **响应**（`data` 为令牌对象）:
  ```json
  {
    "code": 200,
    "data": {
      "token": "<access_token>",
      "refreshToken": "<refresh_token>",
      "expiresIn": 7200,
      "userInfo": { "id": 12, "nickname": "苏小糖", "avatarUrl": "https://..." }
    }
  }
  ```

#### 刷新令牌
- **URL**: `POST /api/auth/refresh-token`
- **认证**: 不需要
- **请求体**: `{ "refreshToken": "<refresh_token>" }`
- **响应**: 同「微信登录」的 `data` 结构（新令牌对）
- **说明**: access token 过期（401）时由 `utils/request-auth.js` 自动调用并重放原请求，用户无感

#### 登出
- **URL**: `POST /api/auth/logout`
- **认证**: 需要（Bearer）
- **请求体**: `{}`
- **响应**: `{ "code": 200, "data": { "ok": true } }`
- **说明**: 服务端将令牌 `jti` 加入黑名单（`includes/auth/class-auth-token-store.php`），前端在 `finally` 中清除本地登录态

#### 获取当前用户信息
- **URL**: `GET /api/user/info`
- **认证**: 需要（Bearer）
- **响应**: `{ "code": 200, "data": { "id": 12, "nickname": "苏小糖", "avatarUrl": "https://...", "points": 320, "createdAt": "2026-01-01 00:00:00" } }`
- **说明**: 小程序用户中心据此渲染真实资料与积分，网络异常时回退本地缓存

### 监控上报API（规划中）

> 前端监控模块 `SutWxApp/utils/monitor*.js` 已就绪（网络/FPS/内存/页面加载/API 五类采集器 + 自动上报调度），上报目标为 `/api/monitor/data`，**后端接收端点尚未实现**（见 `docs/tasks.md` BE-013）。当前该请求返回 404，监控数据不会落地。

- **URL**: `POST /api/monitor/data`
- **认证**: 不需要（匿名上报，字段中不得含用户标识）
- **请求体**: `{ "type": "error|performance|behavior", "payload": { }, "systemInfo": { } }`
- **约束**: 限频 10 次/分钟；字段长度上限；服务端需做字段白名单校验

### 产品API

#### 获取产品列表
- **URL**: `GET /api/v1/products`
- **描述**: 获取产品列表，支持分页和搜索
- **查询参数**: 
  - `page`: 页码，默认1
  - `pageSize`: 每页数量，默认20
  - `categoryId`: 用于过滤的分类ID
  - `keyword`: 搜索关键词
- **响应**: 
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "list": [
        {
          "id": 1,
          "name": "产品1",
          "price": 100,
          "categoryId": 1,
          "createdAt": "2025-12-01T00:00:00.000Z"
        },
        {
          "id": 2,
          "name": "产品2",
          "price": 200,
          "categoryId": 1,
          "createdAt": "2025-12-01T00:00:00.000Z"
        }
      ],
      "total": 2,
      "page": 1,
      "pageSize": 10
    },
    "timestamp": 1609459200000,
    "requestId": "uuid"
  }
  ```

#### 获取产品详情
- **URL**: `GET /api/v1/products/{id}`
- **描述**: 获取产品详细信息
- **响应**: 
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "id": 1,
      "name": "产品1",
      "price": 100,
      "categoryId": 1,
      "description": "产品描述",
      "images": ["image1.jpg", "image2.jpg"],
      "createdAt": "2025-12-01T00:00:00.000Z"
    },
    "timestamp": 1609459200000,
    "requestId": "uuid"
  }
  ```

### WooCommerce 商品接口（数据源：WordPress + WooCommerce 插件）

小程序商品数据可来自 WooCommerce。配套 WP 插件将 WooCommerce REST（`wp-json/wc/v3/products`）映射为小程序命名空间端点，由 `services/productService.js` 消费并经 `models/product.js` 映射为统一 DTO。

- **获取商品列表**
  - **URL**: `GET /api/product/list`
  - **查询参数**: `page`、`pageSize`、`categoryId`、`keyword`（与现有列表筛选一致）
  - **响应**: `{ "list": [ <WooCommerce 商品> ], "total": 100, "page": 1, "pageSize": 20 }` 或数组；字段经 `mapWooCommerceProduct` 映射
- **获取商品详情**
  - **URL**: `GET /api/product/detail?id={id}`
  - **响应**: 单个 <WooCommerce 商品> 对象（映射为 DTO）

> 若后端直接返回已映射的 DTO，则 `mapWooCommerceProduct` 幂等透传；若返回原始 WooCommerce JSON，则自动转换。接口无需鉴权（`needAuth: false`）。商品数据源由 `app.js` 的 `globalData.productSource`（`mock` 默认 / `woocommerce`）切换。

### 主题接口（WordPress 后台可配置小程序主题）

小程序主题由微信侧内置多套默认配色预设，并支持 WordPress 后台下发自定义配置。配套 WP 插件在 `/api/theme` 暴露当前主题，由 `services/themeService.js` 拉取并经 `models/theme.js` 解析合并为统一色值。

- **获取主题配置**
  - **URL**: `GET /api/theme`
  - **认证**: 不需要
  - **响应**（可直接返回对象，或包络 `{ code, data }`）：
    ```json
    {
      "presetId": "sky-blue",
      "custom": {
        "primaryColor": "#E91E63",
        "primaryLight": "#FCE4EC",
        "primaryDark": "#AD1457"
      }
    }
    ```
  - `presetId`：内置预设 id（`sut-green` / `sky-blue` / `sunny-orange` / `violet` / `graphite`），缺省用 `sut-green`。
  - `custom`：可选，按字段覆盖主题色值（仅接受合法十六进制色），支持 `primaryColor`、`primaryLight`、`primaryDark` 等。
  - 解析后的色值经 `toCssVars` 转为 CSS 变量声明字符串，绑定到各页面根容器；同时下发到导航栏（`wx.setNavigationBarColor`）与 tabBar（`wx.setTabBarStyle`）。

> 后端不可用时回退内置默认预设；主题配置在 `app.js` 启动时加载并缓存到本地（`appTheme`）。

### 文章 API（数据源：WordPress 文章）

小程序文章来自 WordPress `wp_posts`（post 类型）。配套 WP 插件将 `wp-json/wp/v2/posts` 映射为小程序命名空间端点，由 `services/postService.js` 消费并经 `models/post.js` 的 `mapWpPost` 映射为统一 DTO（正文为 HTML，小程序侧用 `rich-text` + `sanitizeArticleHtml` 安全渲染）。

- **获取文章列表**
  - **URL**: `GET /api/post/list`
  - **查询参数**: `page`、`pageSize`、`categoryId`、`keyword`（与列表筛选一致）
  - **响应**: `{ "list": [ <WP 文章> ], "total": 100, "page": 1, "pageSize": 20 }`；字段经 `mapWpPost` 映射
- **获取文章详情**
  - **URL**: `GET /api/post/detail?id={id}`
  - **响应**: 单个 <WP 文章> 对象（映射为 DTO）

> 接口免鉴权（`needAuth: false`）。正文为 HTML，由小程序 `rich-text` 组件渲染。

### 分类 API（数据源：WooCommerce 商品分类）

小程序分类来自 WooCommerce 商品分类（`product_cat`）。配套 WP 插件将 WC 分类映射为小程序命名空间端点，由 `services/categoryService.js` 消费并经 `models/category.js` 的 `mapWooCommerceCategory` 映射为统一 DTO。

- **获取分类列表**
  - **URL**: `GET /api/category/list`
  - **响应**: `{ "list": [ <WC 分类> ], "total": 20, "page": 1, "pageSize": 50 }` 或数组；字段经 `mapWooCommerceCategory` 映射
- **获取分类详情**
  - **URL**: `GET /api/category/detail?id={id}`
  - **响应**: 单个 <WC 分类> 对象（映射为 DTO）

> 接口免鉴权（`needAuth: false`）。

### 端点与后端命名空间映射

小程序调用路径统一为 `/api/*`（见上文各端点）。后端为 WordPress 配套插件，落地方式二选一：

- **推荐（路径直连）**：插件注册 WP REST 命名空间 `sutwx/v1`（路由 `product/list`、`post/list`、`theme` 等），并用 `add_rewrite_rule` 将 `/api/(.*)` 重写到 `rest_route=/sutwx/v1/$1`；小程序 `globalData.baseUrl` 设为站点根（如 `https://example.com`）。这样 `/api/*` 即为真实可访问路径。
- **备选（直连 wp-json）**：小程序 `baseUrl` 设为 `https://example.com/wp-json/sutwx/v1`，跳过重写层。

> 鉴权接口（`/api/auth/login`、`/api/auth/refresh-token`、`/api/auth/logout`、`/api/user/info`）需 Bearer JWT（`wx.login` 换取）；写操作（`/api/order/create|cancel|confirm|ship`）与支付（`/api/pay/prepay|notify|query`）需鉴权；内容端点（product/post/category/theme）仍免登录。完整清单见 `../backend/spec.md`。

### 端点总览（与后端代码一一对应）

> 本表由 `SutWxApp/scripts/check-docs.js` 在 CI 中巡检：后端每新增一个 `register_rest_route`，本表与会话端点小节必须同步更新，否则 CI 失败。

| 方法 | 路径 | 鉴权 | 限频档 | 说明 |
|------|------|------|--------|------|
| POST | `/api/auth/login` | 免鉴权 | 公开 | `wx.login` code 换取 access/refresh 双令牌 |
| POST | `/api/auth/refresh-token` | 免鉴权 | 公开 | 用 refresh token 换新 access token |
| POST | `/api/auth/logout` | 需鉴权 | 鉴权 | 令牌加入黑名单 |
| GET | `/api/user/info` | 需鉴权 | 鉴权 | 当前用户资料 |
| GET | `/api/theme` | 免鉴权 | 公开 | 小程序主题色配置 |
| GET | `/api/product/list` | 免鉴权 | 公开 | 商品列表（分页 / 分类 / 关键词） |
| GET | `/api/product/detail` | 免鉴权 | 公开 | 商品详情（`id`） |
| GET | `/api/category/list` | 免鉴权 | 公开 | 商品分类列表 |
| GET | `/api/category/detail` | 免鉴权 | 公开 | 分类详情（`id`） |
| GET | `/api/post/list` | 免鉴权 | 公开 | 文章列表 |
| GET | `/api/post/detail` | 免鉴权 | 公开 | 文章详情（`id`） |
| GET | `/api/banner/list` | 免鉴权 | 公开 | 运营轮播位（后台可配置） |
| GET | `/api/order/list` | 需鉴权 | 鉴权 | 本人订单分页列表（`status` 状态码过滤） |
| GET | `/api/order/detail` | 需鉴权 | 鉴权 | 本人订单详情（`id`） |
| POST | `/api/order/create` | 需鉴权 | 鉴权 | 创建订单（`clientRequestId` 幂等，10 秒窗口） |
| POST | `/api/order/cancel` | 需鉴权 | 鉴权 | 取消订单；已支付订单触发整单退款 |
| POST | `/api/order/confirm` | 需鉴权 | 鉴权 | 确认收货（待发货 / 待收货） |
| POST | `/api/order/ship` | 需鉴权（管理员） | 鉴权 | 后台发货，`manage_woocommerce` 权限 |
| POST | `/api/pay/prepay` | 需鉴权 | 支付 | 发起 JSAPI 预支付，返回 `wx.requestPayment` 参数 |
| POST | `/api/pay/query` | 需鉴权 | 支付 | 主动查单并同步支付状态（掉单兜底手动触发） |
| POST | `/api/pay/notify` | 免鉴权（验签） | 豁免 | 微信支付结果通知；平台证书验签 + 金额校验 + 幂等 |
| POST | `/api/pay/refund-notify` | 免鉴权（验签） | 豁免 | 微信退款结果通知；按 `out_refund_no` 落「已退款」 |
| GET | `/api/health` | 免鉴权 | 公开 | 健康检查：`version/php/wcActive/payConfigured` |
| POST | `/api/monitor/data` | 免鉴权 | 监控 | 客户端监控批量上报（≤20 条，字段白名单） |

**订单状态码**：`0` 已取消 · `1` 待付款 · `2` 待发货 · `3` 待收货 · `4` 已完成 · `5` 已退款。

**支付异常约定**：

- 通知/退款回调验签失败返回 `{code:"FAIL"}` 且**不落库**，微信侧会重试；
- 通知金额与订单金额不一致时拒绝落库（`apply_paid` 返回 false）；
- 重复通知幂等：仅「待付款 / 挂起 / 失败」状态可推进为「待发货」，终态不回退；
- 退款金额上限等于订单实付，不接受客户端传入金额；
- 掉单由 `Sutwx_Pay_Cron` 每 5 分钟查单兜底（`sutwx_pay_query_cron`）。

### 订单API

#### 创建订单
- **URL**: `POST /api/v1/orders`
- **描述**: 创建新订单
- **认证**: 需要
- **请求体**: 
  ```json
  {
    "products": [
      {
        "productId": 1,
        "quantity": 2
      },
      {
        "productId": 2,
        "quantity": 1
      }
    ],
    "paymentMethod": "wechat_pay"
  }
  ```

> 订单 `status` 为数字：`0` 已取消 / `1` 待付款 / `2` 待发货 / `3` 待收货 / `4` 已完成 / `5` 已退款；`statusText` 为其中文文案；金额单位为元。
- **响应**: 
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "id": 1024,
      "orderNo": "1024",
      "status": 1,
      "statusText": "待付款",
      "totalPrice": 400.00,
      "productPrice": 380.00,
      "shippingFee": 20.00,
      "totalQuantity": 3,
      "createTime": "2026-11-04 10:20:30",
      "products": [
        {
          "productId": 1,
          "name": "绿萝盆栽",
          "price": 100.00,
          "quantity": 2
        }
      ],
      "address": {
        "name": "张三",
        "phone": "13800138000",
        "province": "广东省",
        "city": "深圳市",
        "district": "南山区",
        "address1": "科技园路 1 号",
        "address2": "A#301"
      },
      "remark": "尽快发货",
      "payTime": "",
      "deliveryTime": "",
      "completeTime": ""
    },
    "timestamp": 1609459200000,
    "requestId": "uuid"
  }
  ```

## 错误处理

### 错误类型

后端统一以 `WP_Error` 返回，`data.status` 决定 HTTP 状态码；`code` 为字符串错误码（默认 `sutwx_error`）。

| HTTP 状态码 | 含义 | 典型场景 |
|------------|------|---------|
| 400 | 参数错误 | 缺少必填参数、参数格式非法、分页越界 |
| 401 | 未认证 / 认证过期 / 令牌无效 | 未带 `Authorization`、令牌过期或已被登出加入黑名单 |
| 403 | 无权限 | 访问非本人订单等越权资源 |
| 404 | 资源不存在 | 商品/文章/订单不存在或已删除 |
| 429 | 触发限频 | 超出 `X-RateLimit-Limit` 阈值 |
| 500 | 服务器错误 | 未预期异常（第三方服务失败由具体端点返回 502/503） |

### 错误响应格式

```json
{
  "code": "sutwx_error",
  "message": "参数错误：缺少 productId",
  "data": { "status": 400 }
}
```

### 分页与查询约定

- 分页参数统一为 `page`（从 1 起）与 `pageSize`（默认 20，上限 50）
- 列表响应：`{ "list": [...], "total": 100, "page": 1, "pageSize": 20 }`
- 搜索关键词参数 `keyword`，服务端 trim 且截断至 64 字符
- 空结果返回 `list: []` 与 `total: 0`，不返回 `null`

## 版本管理

### 版本格式
- **语义化版本号**: MAJOR.MINOR.PATCH（例如：v1.0.0）

### 版本控制
- **命名空间版本控制**: WordPress REST 命名空间为 `sutwx/v1`；小程序侧统一访问 `/api/*`（由 `add_rewrite_rule` 重写到 `rest_route=/sutwx/v1/$1`），路径本身不带版本号

### 升级策略
- **MAJOR**: 破坏性变更，与以前版本不兼容
- **MINOR**: 新功能，向后兼容
- **PATCH**: 错误修复，向后兼容

### 版本支持
- 同时支持2个主要版本
- 旧版本在新版本发布后6个月内支持
- 提供版本迁移指南

## API测试

### 手动测试工具
- **Postman**: 用于交互式API测试
- **Swagger UI**: 用于API文档和测试
- **curl**: 命令行HTTP客户端

### 自动化测试
- **Jest**（`SutWxApp/__tests__/`）：小程序侧单元与集成测试，`npm test`
- **PHP 自研 runner**（`sutwx-app-api/tests/run-*.php`）：后端映射/设置/鉴权/缓存/订单/支付六套件，独立运行不依赖 WordPress
- **契约校验**（`npm run check:contract`）：比对后端 `mappings/*.php` 与前端 `models/*` 的字段与分页包络
- **E2E**（`npm run test:e2e`）：基于 `miniprogram-automator` 的四套件，需本地微信开发者工具开启自动化端口

### 测试示例

```javascript
const request = require('../utils/request');
const { unwrap } = require('../utils/api');

describe('认证接口', () => {
  let token;

  // 微信登录换取令牌（后端 code2session 需真实 code，单测中以桩替代）
  beforeAll(async () => {
    token = 'test-token';
  });

  it('登录后应返回令牌与用户资料', async () => {
    const data = await request({
      url: '/api/auth/login',
      method: 'POST',
      data: { code: 'stub-code' },
      needAuth: false,
    }).then(unwrap);

    expect(data).toHaveProperty('token');
    expect(data).toHaveProperty('refreshToken');
    expect(data).toHaveProperty('userInfo');
  });

  it('带令牌访问用户信息应返回资料', async () => {
    const data = await request({
      url: '/api/user/info',
      method: 'GET',
    }).then(unwrap);

    expect(data).toHaveProperty('id');
  });
});
```

## API使用示例

> 本项目为**微信小程序**，不使用 Axios / Fetch / localStorage。统一走 `SutWxApp/utils/request.js` 封装（基于 `wx.request`），令牌由请求层自动注入。

### 在服务层调用（推荐）

```javascript
const request = require("../utils/request");
const { unwrap } = require("../utils/api");

// 公开数据（无需鉴权）
async function fetchProducts(page = 1, pageSize = 20) {
  // request 层返回 {code,data} 包络，unwrap 后交给 models/ 映射
  const data = await request({
    url: "/api/product/list",
    method: "GET",
    data: { page, pageSize },
    needAuth: false,
  }).then(unwrap);
  return (data && data.list) || [];
}

// 鉴权数据（令牌由 request 层自动附加）
async function fetchUserInfo() {
  return request({ url: "/api/user/info", method: "GET" }).then(unwrap);
}
```

### 页面/组件中调用

```javascript
const authService = require("../../services/authService");

// 登录：内部已处理 /api 前缀与包络解包，成功回调收到解包后的令牌对象
authService.login({ code, nickname, avatarUrl }, (result) => {
  wx.showToast({ title: "登录成功", icon: "success" });
});
```

### 直接使用 wx.request（仅限脚本与调试）

```javascript
wx.request({
  url: "https://api.example.com/api/product/list?page=1&pageSize=20",
  method: "GET",
  header: { Authorization: `Bearer ${wx.getStorageSync("token")}` },
  success(res) {
    if (res.data.code !== 200) {
      console.error("接口失败:", res.data.message);
      return;
    }
    console.log(res.data.data.list);
  },
  fail(err) {
    console.error("网络失败:", err);
  },
});
```

### 约定

- 请求路径**必须带 `/api` 前缀**（后端 rewrite 仅匹配 `^api/`）
- 业务代码拿到的应是**解包后**的 `data`；忘记 `unwrap` 是最常见的「接口成功但页面为空」原因
- `needAuth: false` 仅用于公开端点（商品/文章/分类/主题）；其余端点必须带鉴权
- 失败分支必须给出可定位的信息（`console.error` 打印错误码与上下文），不得静默吞掉

## 性能优化

### 请求优化
- 减少请求次数
- 使用批量请求
- 合理使用缓存
- 压缩请求数据

### 响应优化
- 只返回必要数据
- 压缩响应数据
- 使用适当的数据格式
- 优化数据库查询

### 并发控制
- 限制请求频率
- 使用队列处理高并发
- 实现熔断机制
- 使用负载均衡

## 安全措施

### 认证与授权
- 使用 JWT 进行认证（HS256，密钥经 `class-credentials.php` 治理）
- 无角色体系：写操作一律做**资源归属校验**（按 `openid`）
- 定期更换密钥（轮换流程见 `specs/ops/spec.md`）
- 限制令牌有效期（访问令牌 2 小时，登出即进黑名单）

### 数据安全
- 加密敏感数据
- 使用HTTPS
- 防止SQL注入
- 防止XSS攻击
- 防止CSRF攻击

### 访问控制
- IP白名单
- 限制请求频率
- 防止DDoS攻击
- 监控异常访问

## 监控与日志

### 监控指标
- 请求量
- 响应时间
- 错误率
- 成功率
- 并发数

### 日志记录
- 请求日志
- 响应日志
- 错误日志
- 性能日志

### 日志格式

```json
{
  "timestamp": "2025-12-01T00:00:00.000Z",
  "requestId": "uuid",
  "method": "GET",
  "url": "/api/user/info",
  "statusCode": 200,
  "responseTime": 100,
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0",
  "userId": 1
}
```

## 变更管理

### 变更流程
1. 提出API变更需求
2. 设计API变更方案
3. 编写API文档
4. 实现API变更
5. 测试API变更
6. 发布API变更
7. 更新API文档
8. 通知相关方

### 变更类型
- **新增API**: 添加新的API端点
- **修改API**: 修改现有API的行为
- **废弃API**: 标记API为废弃
- **删除API**: 移除不再使用的API

## 最佳实践

1. **使用RESTful设计原则**
2. **保持API简洁易用**
3. **提供完整的文档**
4. **实现适当的认证和授权**
5. **处理错误和异常**
6. **支持版本管理**
7. **优化性能**
8. **确保安全性**
9. **测试API**
10. **监控和日志**

## 版本历史

| 版本 | 更新日期 | 更新内容 | 作者 |
|------|----------|----------|------|
| 1.0.0 | 2025-12-26 | 初始版本 | Sut |