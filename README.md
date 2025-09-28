# SUT微信小程序插件

[![GitHub release](https://img.shields.io/github/release/woniu336/SutWxApp.svg)](https://github.com/woniu336/SutWxApp/releases)
[![License](https://img.shields.io/github/license/woniu336/SutWxApp.svg)](https://github.com/woniu336/SutWxApp/blob/master/LICENSE)

SUT微信小程序插件是一个为WordPress网站提供微信小程序对接功能的插件，支持内容展示、电商功能、用户管理、消息推送等功能。

## 功能特性

- **内容同步**：将WordPress文章、页面、分类等内容同步到微信小程序
- **用户管理**：支持微信小程序用户登录、注册、个人信息管理等
- **电商功能**：与WooCommerce集成，支持商品展示、购物车、订单管理等
- **微信支付**：集成微信支付功能，支持小程序内支付
- **消息推送**：支持模板消息、订阅消息、客服消息等多种消息推送方式
- **积分系统**：内置积分系统，支持签到、评论、分享等行为获取积分
- **缓存管理**：内置缓存系统，提升小程序访问速度
- **数据统计**：提供用户增长、销售额等数据统计功能
- **多语言支持**：支持中文等多种语言

## 环境要求

- WordPress 4.7 或更高版本
- PHP 5.6 或更高版本
- MySQL 5.6 或更高版本
- 微信小程序账号
- 微信支付商户号（如需电商功能）
- WooCommerce 3.0 或更高版本（如需电商功能）

## 安装方法

### 方法一：直接上传安装

1. 下载插件的ZIP文件
2. 登录WordPress后台，进入"插件" > "安装插件"
3. 点击"上传插件"，选择下载的ZIP文件，点击"现在安装"
4. 安装完成后，点击"启用插件"

### 方法二：使用Git克隆

```bash
cd /path/to/wordpress/wp-content/plugins
 git clone https://github.com/woniu336/SutWxApp.git sut-wechat-mini
```

然后在WordPress后台启用插件。

## 配置说明

1. 安装并启用插件后，在WordPress后台侧边栏会出现"SUT微信小程序"菜单项
2. 点击进入"基础设置"页面，填写以下必要信息：
   - 小程序AppID：在微信公众平台获取
   - 小程序AppSecret：在微信公众平台获取
   - 微信支付商户号（MCH_ID）：如需电商功能，在微信支付商户平台获取
   - 微信支付API密钥：在微信支付商户平台设置
3. 保存设置后，插件将自动创建所需的数据库表
4. 如需启用消息推送功能，请配置相应的消息模板ID

## API接口文档

插件提供了丰富的API接口，供微信小程序调用。所有API接口的基础URL为：`http://your-site.com/sut-wechat-mini-api/`

### 基础API

- `ping`：检查API连接是否正常
- `login`：用户登录
- `user/profile`：获取用户信息

### 用户相关API

- `user/address/list`：获取用户地址列表
- `user/address/add`：添加用户地址
- `user/address/update`：更新用户地址
- `user/address/delete`：删除用户地址
- `user/favorite/list`：获取用户收藏列表
- `user/favorite/add`：添加收藏
- `user/favorite/delete`：取消收藏
- `user/signin`：用户签到
- `user/signin/history`：获取签到历史

### 内容相关API

- `content/articles`：获取文章列表
- `content/article/detail`：获取文章详情
- `content/article/search`：搜索文章
- `content/article/hot`：获取热门文章
- `content/article/latest`：获取最新文章
- `content/categories`：获取分类列表
- `content/category/articles`：获取分类下的文章
- `content/tags`：获取标签列表
- `content/tag/articles`：获取标签下的文章
- `content/pages`：获取页面列表
- `content/page/detail`：获取页面详情

### 电商相关API

（需要安装并启用WooCommerce）

- `product/list`：获取产品列表
- `product/detail`：获取产品详情
- `product/search`：搜索产品
- `product/categories`：获取产品分类
- `product/category/products`：获取分类下的产品
- `product/related`：获取相关产品
- `product/featured`：获取特色产品
- `product/sale`：获取促销产品
- `cart/add`：添加商品到购物车
- `cart/update`：更新购物车商品
- `cart/delete`：删除购物车商品
- `cart/list`：获取购物车列表
- `cart/clear`：清空购物车
- `order/create`：创建订单
- `order/list`：获取订单列表
- `order/detail`：获取订单详情
- `order/cancel`：取消订单
- `order/confirm`：确认收货
- `payment/create`：创建支付
- `payment/query`：查询支付结果
- `payment/refund`：申请退款

## 微信小程序端开发

为了使用本插件提供的功能，您需要开发对应的微信小程序。小程序端需要实现以下功能：

1. **用户登录**：调用`login`接口获取用户Token
2. **内容展示**：调用内容相关API获取和展示文章、页面等内容
3. **电商功能**：实现产品浏览、购物车、订单管理等功能
4. **支付功能**：调用支付相关API完成支付流程
5. **消息订阅**：实现消息订阅功能，接收各类通知

### 示例代码

以下是小程序端调用API的示例代码：

```javascript
// 调用登录接口
function login() {
  wx.login({
    success: res => {
      if (res.code) {
        // 发送 code 到后端换取 openId, sessionKey, unionId
        wx.request({
          url: 'https://your-site.com/sut-wechat-mini-api/login',
          method: 'POST',
          data: {
            code: res.code
          },
          success: result => {
            if (result.data.code === 0) {
              // 保存登录状态
              wx.setStorageSync('token', result.data.data.token);
              wx.setStorageSync('userInfo', result.data.data.userInfo);
            }
          }
        })
      }
    }
  })
}

// 获取文章列表
function getArticles(page = 1, category = 0) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://your-site.com/sut-wechat-mini-api/content/articles',
      data: {
        page: page,
        category: category
      },
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success: res => {
        if (res.data.code === 0) {
          resolve(res.data.data);
        } else {
          reject(res.data.message);
        }
      },
      fail: err => {
        reject(err);
      }
    })
  })
}
```

## 数据库表结构

插件安装后会自动创建以下数据库表：

- `{wp_prefix}_sut_wechat_mini_users`：存储小程序用户信息
- `{wp_prefix}_sut_wechat_mini_addresses`：存储用户地址信息
- `{wp_prefix}_sut_wechat_mini_favorites`：存储用户收藏信息
- `{wp_prefix}_sut_wechat_mini_signin`：存储用户签到信息
- `{wp_prefix}_sut_wechat_mini_points`：存储用户积分信息
- `{wp_prefix}_sut_wechat_mini_points_log`：存储积分变动日志
- `{wp_prefix}_sut_wechat_mini_messages`：存储用户消息
- `{wp_prefix}_sut_wechat_mini_cart`：存储购物车信息
- `{wp_prefix}_sut_wechat_mini_orders`：存储订单信息
- `{wp_prefix}_sut_wechat_mini_order_items`：存储订单项信息
- `{wp_prefix}_sut_wechat_mini_payments`：存储支付信息

## 缓存管理

插件内置了缓存系统，可以缓存常用的API响应数据，提升小程序访问速度。缓存默认有效期为1小时，可在设置页面调整。

插件会在以下情况下自动清理相关缓存：
- 文章/页面/产品更新时
- 订单状态变更时
- 用户信息更新时
- 每日定时清理过期缓存

## 日志记录

插件支持日志记录功能，可以记录API请求、错误信息等。日志功能默认关闭，可在设置页面启用。

日志文件存储在`wp-content/plugins/sut-wechat-mini/logs/`目录下，按日期命名。

## 常见问题

### Q: 启用插件后，在后台没有看到"SUT微信小程序"菜单？
A: 请确认您的WordPress版本是否符合要求（4.7或更高版本），以及您是否具有管理员权限。

### Q: 调用API时提示"未授权"？
A: 请确认您的小程序AppID和AppSecret是否正确配置，并且在调用需要授权的API时，是否正确传递了Token。

### Q: 支付功能无法使用？
A: 请确认您已正确配置微信支付商户号和API密钥，并且您的微信小程序已开通支付功能。

### Q: 内容无法同步到小程序？
A: 请确认您的内容是否已发布，并且没有设置为私有。

## 开发说明

如果您想扩展本插件的功能，可以按照以下方式进行开发：

1. **添加新的API接口**：在`includes/api/class-sut-wechat-mini-api.php`文件中添加新的API方法
2. **修改内容展示**：在`includes/content/class-sut-wechat-mini-content.php`文件中修改内容获取和格式化方法
3. **调整电商功能**：在`includes/woocommerce/class-sut-wechat-mini-woocommerce.php`文件中调整电商相关功能
4. **添加新的管理页面**：在`includes/admin/class-sut-wechat-mini-admin.php`文件中添加新的管理页面

## 版权信息

SUT微信小程序插件是基于GPLv2许可证开源的软件。

## 联系方式

如果您在使用过程中遇到问题，或者有任何建议，可以通过以下方式联系我们：

- GitHub: [https://github.com/woniu336/SutWxApp](https://github.com/woniu336/SutWxApp)
- 邮箱: woniu336@example.com

## 更新日志

### 1.0.0 (2023-xx-xx)
- 初始版本，包含所有基础功能
- 支持内容同步、用户管理、电商功能、支付集成、消息推送、积分系统等