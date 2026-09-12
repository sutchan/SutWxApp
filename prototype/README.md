# 原型目录（prototype/）

本目录是 SutWxApp（苏铁微信小程序）**唯一的原型目录**，所有高保真原型与组件库规范集中存放于此。文件均为单文件自包含 HTML，浏览器直接打开即可交互，无需构建或联网。

## 文件清单

| 文件 | 内容 | 说明 |
|------|------|------|
| [prototype.html](prototype.html) | 核心 6 页 | 首页 / 分类 / 商品详情 / 购物车 / 订单确认 / 我的。含骨架屏、加购飞入角标、banner Ken Burns、收藏涟漪等动效 |
| [prototype-extra.html](prototype-extra.html) | 扩展 5 页 | 订单列表 / 订单详情 / 地址管理 / 设置 / 帮助中心，hash 路由（#orders / #order-detail / #address / #settings / #help） |
| [wireframes.html](wireframes.html) | 组件库规范 | 基础组件 10 类 + 复合组件 6 类 + 业务组件 6 类 + 使用规则（Do/Don't、废弃色警示、token 速查） |

三份文件互相链接：核心原型「我的」页菜单可跳转扩展页，舞台区与页脚可跳转组件库；扩展页顶部可返回核心原型。

## 设计依据

- 权威设计规范：[openspec/specs/design/spec.md](../openspec/specs/design/spec.md)（v3.1.1）
- 设计令牌以规范 §4.1.2 `:root` 与 §4.1.4 渐变为准，原型内 `var(--*)` 引用，禁止硬编码色值
- 语义色策略：CTA / 选中态 / 角标 / 价格一律绿系（价格 `var(--primary-dark)` 粗体，原价 `var(--text-secondary)` 删除线）；红色仅限错误与危险确认；橙色仅限系统级提示
- 废弃色：#e93b3d / #ff6b6b / #ff9700 / #2a9d8f / #f4a261，禁止出现在任何渲染样式中

## 维护约定

1. 新增原型或改版一律写入本目录，不得再建于 `openspec/` 或其他位置。
2. 图片一律使用内联 SVG / CSS 渐变占位，禁止外链图片与字体，保证离线可打开。
3. 演示数据须在页面底部标注「演示数据」，不冒充真实业务数据。
4. 动效须支持 `prefers-reduced-motion: reduce` 降级，时长控制在 150 / 300 / 500ms 三档。
5. 改动后同步更新本索引与 [CHANGELOG.md](../CHANGELOG.md)。
