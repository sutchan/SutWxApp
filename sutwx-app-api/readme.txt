=== 苏铁小程序 API ===
Contributors: sut
Tags: rest-api, woocommerce, weapp, headless
Requires at least: 6.0
Tested up to: 6.6
Requires PHP: 7.4
Stable tag: 0.7.1
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

为「苏铁」微信小程序提供 headless REST API（/api/* 路径、{code,data} 包络）。含 wx.login → JWT 鉴权、订单管理、微信支付 V3 与商家发货能力。

== Description ==

* 注册 REST 命名空间 `sutwx/v1`，提供内容端点（`product/list`、`product/detail`、`post/list`、`post/detail`、`category/list`、`category/detail`、`theme`）与鉴权/订单/支付端点
* 将 `/api/*` 重写到 REST 层，小程序 `baseUrl` 指向站点根即可直连（备选直连 `wp-json/sutwx/v1`）
* 统一响应包络 `{code, message, data, timestamp, requestId}`，兼容小程序 `utils/api.unwrap`
* 内容端点免鉴权；`/api/users/*`、`/api/order/*`、`/api/pay/*` 需 Bearer JWT（`wx.login` 换取）
* JWT 双 Token（access/refresh）刷新与吊销、IP 限频、Transients 缓存（内容变更精准失效）
* 订单：创建/列表/详情/取消/确认收货/商家发货；微信支付 V3 预支付、异步通知与主动查单
* 商品/分类数据源为 WooCommerce（需启用），文章为 WP 核心

== Installation ==

1. 上传 `sutwx-app-api/` 到 `/wp-content/plugins/` 并启用（需先启用 WooCommerce）。
2. 进入「设置 → 固定链接」点击一次「保存更改」，刷新 `/api/*` 重写规则。
3. 小程序侧 `SutWxApp/app.js` 的 `globalData.baseUrl` 设为站点根（如 `https://example.com`），`productSource` 切为 `"woocommerce"`。

备选方式（重写不生效时）：`baseUrl` 直接设为 `https://example.com/wp-json/sutwx/v1`，跳过 `/api/*` 重写层。

验证（P0 验收）：浏览器访问 `https://example.com/api/theme`，应返回 `{"code":200,...,"data":{"presetId":"sut-green"}}`。

注意：若固定链接为「朴素」格式，`/api/*` 重写不可用，请改用备选方式或更换固定链接结构。

== Frequently Asked Questions ==

= /api/theme 返回 404？ =

重写规则未刷新：进入「设置 → 固定链接」重新保存一次；或临时改用 `wp-json/sutwx/v1/theme` 直连。

= 主题预设如何修改？ =

P2 阶段提供后台「设置 → 小程序设置」页；当前默认返回 `sut-green`，可用 WP-CLI 修改 option `sutwx_theme`。

== Changelog ==

= 0.7.1 =
* 按职责拆分超过 200 行的运行时源码：限频计数器、支付/退款回调通知、下单流程、订单状态流转分别拆为 trait，并在 `class-modules.php` 加载清单登记；对外方法与调用方式不变。
* 修复：`POST /api/order/create` 失败路径（商品为空/库存不足/落库失败）未释放 `clientRequestId` 幂等短锁，导致用户 10 秒内重试被误判「订单正在创建中」。

= 0.5.3 =
* 代码质量与可维护性：将超过 200 行的类按职责拆分为 trait / 独立类（鉴权服务、JWT 编码、缓存失效、限频 IP、支付凭证写入、订单装配与发货、模块加载清单），对外方法与调用方式保持不变。
* 修复：订单列表筛选 `status=0`（全部）被真值判断吞掉；SQL 校验不再误杀门牌号与备注中的 `#`/`--`。

= 0.5.2 =
* 下单库存校验：`POST /api/order/create` 聚合同商品数量，缺货/超库存返回明确 409 错误（`sutwx_out_of_stock` / `sutwx_insufficient_stock`）。

= 0.5.1 =
* 订单生命周期补全：注册 WooCommerce 自定义状态 `wc-shipped`（待收货）；新增 `POST /api/order/ship`（商家 `manage_woocommerce` 权限）标记发货；确认收货兼容待发货/待收货；订单 DTO 新增 `deliveryTime` 发货时间。
* 修复下单收货地址省/市/区丢失：创建订单写入 `billing_state`/`billing_city`/`billing_address_2`，地址 DTO 不再丢省/市。

= 0.5.0 =
* 订单与支付（BE-006/007）：订单创建/列表/详情/取消、微信支付 V3 预支付/异步通知/查单；新增订单/支付独立单测。

= 0.4.0 =
* 鉴权基建（BE-003）：`wx.login` → JWT、双 Token 刷新与吊销、Bearer 中间件；新增鉴权单测。

= 0.3.0 =
* P2 主题后台配置：新增 `includes/class-settings.php`（主题配置读写 + 颜色/预设校验，与小程序 `models/theme.js` 对齐）、`admin/settings-page.php`（后台「设置 → 小程序设置」页，预设下拉 + 自定义色选择器），`/api/theme` 返回经清洗的配置；新增单测 `tests/run-settings-tests.php`。

= 0.2.0 =
* P1 内容只读 MVP：新增 `includes/mappings/`（map-product/map-post/map-category，DTO 与小程序 models 对齐）与 `includes/sanitize.php` 字段净化辅助。
* 6 个内容端点接入真实查询：product/list+detail（WP_Query→wc_get_product）、post/list+detail（WP_Query→映射，含特色图）、category/list+detail（get_terms(product_cat)）；支持 page/pageSize/categoryId/parentId/keyword，pageSize 强制 ≤50。
* 新增独立映射单测 `tests/run-mapping-tests.php`（无需 WP/WC 环境，`php tests/run-mapping-tests.php`）。

= 0.1.0 =
* P0 脚手架：插件入口、Loader、REST 基类（包络）、7 个路由骨架、`/api/*` 重写。
* `/api/theme` 已返回真实默认主题配置；商品/文章/分类端点为占位包络（P1 实现映射）。
