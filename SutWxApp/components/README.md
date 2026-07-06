<!--
  文件名: README.md
  版本号: 3.0.0
  更新日期: 2026-07-06
  描述: SutWxApp 组件库规范文档，包含所有组件的使用说明、属性、事件和示例
-->

# SutWxApp 组件库

> 版本：3.0.0 | 更新日期：2026-07-06

基于设计系统规范的微信小程序组件库，参考 shadcn/ui 设计理念，采用深绿色主色调的极简风格。

## 目录

- [概述](#概述)
- [基础组件](#基础组件)
  - [Button 按钮](#button-按钮)
  - [Badge 徽章](#badge-徽章)
  - [Avatar 头像](#avatar-头像)
  - [Tag 标签](#tag-标签)
  - [Divider 分割线](#divider-分割线)
- [复合组件](#复合组件)
  - [EmptyState 空状态](#emptystate-空状态)
  - [ProductCard 商品卡片](#productcard-商品卡片)
- [业务组件](#业务组件)
  - [Price 价格](#price-价格)
  - [OrderCard 订单卡片](#ordercard-订单卡片)

---

## 概述

### 设计原则

- **清晰优先**：文字清晰可辨，图标精确易懂
- **遵从**：内容是界面核心，控件退居次位
- **深度**：通过视觉层次和叠加层传达层级关系
- **一致性**：相同功能使用相同视觉语言
- **反馈**：每一个操作都有即时视觉反馈

### 设计规范

- 主色调：深绿色 `#2E7D32`
- 间距基准：4px
- 圆角基准：8px / 12px / 16px
- 字体：系统字体栈，14px 正文基准

### 使用方式

在页面的 json 文件中引入组件：

```json
{
  "usingComponents": {
    "s-button": "/components/button/index",
    "s-badge": "/components/badge/index"
  }
}
```

---

## 基础组件

### Button 按钮

按钮是最基础的交互组件，用于触发操作。

**组件路径**：`/components/button/index`

#### 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| variant | String | `default` | 按钮变体：`primary` / `default` / `ghost` / `link` / `destructive` |
| size | String | `md` | 按钮尺寸：`sm` / `md` / `lg` |
| loading | Boolean | `false` | 是否加载中 |
| disabled | Boolean | `false` | 是否禁用 |
| block | Boolean | `false` | 是否块级元素（宽度 100%） |
| open-type | String | - | 微信开放能力，同原生 button |

#### 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| bind:tap | 点击按钮时触发 | event |

#### 变体说明

| 变体 | 样式 | 适用场景 |
|------|------|----------|
| primary | 主色背景 + 白色文字 | 主要操作、确认、提交 |
| default | 浅灰背景 + 主文字色 | 次要操作、取消、返回 |
| ghost | 透明背景 + 文字色 | 辅助操作、更多、查看详情 |
| link | 纯文字链接样式 | 文字链接、跳转操作 |
| destructive | 红色背景 + 白色文字 | 危险操作、删除、退出 |

#### 尺寸说明

| 尺寸 | 高度 | 内边距 | 字号 | 圆角 |
|------|------|--------|------|------|
| sm | 28px | 水平 12px | 12px | 8px |
| md | 40px | 水平 16px | 14px | 12px |
| lg | 48px | 水平 20px | 16px | 12px |

#### 示例

```xml
<!-- 主按钮 -->
<s-button variant="primary" bind:tap="onSubmit">提交</s-button>

<!-- 默认按钮 -->
<s-button bind:tap="onCancel">取消</s-button>

<!-- 幽灵按钮 -->
<s-button variant="ghost">查看详情</s-button>

<!-- 链接按钮 -->
<s-button variant="link">立即注册</s-button>

<!-- 危险按钮 -->
<s-button variant="destructive">删除</s-button>

<!-- 加载状态 -->
<s-button loading="{{true}}">加载中</s-button>

<!-- 禁用状态 -->
<s-button disabled="{{true}}">不可点击</s-button>

<!-- 不同尺寸 -->
<s-button size="sm">小按钮</s-button>
<s-button size="lg">大按钮</s-button>

<!-- 块级按钮 -->
<s-button block="{{true}}">全宽按钮</s-button>
```

---

### Badge 徽章

徽章用于标记状态、数量或提示。

**组件路径**：`/components/badge/index`

#### 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| variant | String | `default` | 徽章变体：`default` / `secondary` / `destructive` / `outline` |
| size | String | `md` | 徽章尺寸：`sm` / `md` |
| dot | Boolean | `false` | 是否显示为小圆点 |
| content | String / Number | `` | 徽章内容，dot 模式下无效 |
| max | Number | `99` | 最大数字，超过显示 + |

#### 变体说明

| 变体 | 样式 | 适用场景 |
|------|------|----------|
| default | 主色背景 + 白色文字 | 默认状态、主要标记 |
| secondary | 浅灰背景 + 次文字色 | 次要状态、普通标记 |
| destructive | 红色背景 + 白色文字 | 错误、警告、紧急 |
| outline | 透明背景 + 主色边框 + 主色文字 | 轮廓样式、轻量标记 |

#### 尺寸说明

| 尺寸 | 最小宽度 | 高度 | 字号 | 圆角 |
|------|----------|------|------|------|
| sm | 16px | 16px | 10px | 8px |
| md | 20px | 20px | 12px | 10px |

#### 示例

```xml
<!-- 默认徽章 -->
<s-badge content="5"></s-badge>

<!-- 不同变体 -->
<s-badge variant="secondary" content="新"></s-badge>
<s-badge variant="destructive" content="9"></s-badge>
<s-badge variant="outline" content="Hot"></s-badge>

<!-- 小圆点 -->
<s-badge dot="{{true}}"></s-badge>

<!-- 不同尺寸 -->
<s-badge size="sm" content="3"></s-badge>

<!-- 数字上限 -->
<s-badge content="100" max="{{99}}"></s-badge>
```

---

### Avatar 头像

头像用于展示用户或实体形象。

**组件路径**：`/components/avatar/index`

#### 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| size | String | `md` | 头像尺寸：`sm` / `md` / `lg` |
| src | String | `` | 头像图片地址 |
| text | String | `` | 文字头像（无图片时显示） |
| bg-color | String | `` | 文字头像背景色，默认自动计算 |

#### 尺寸说明

| 尺寸 | 大小 | 适用场景 |
|------|------|----------|
| sm | 32px | 评论、列表项 |
| md | 40px | 导航栏、列表项（默认） |
| lg | 56px | 用户中心、个人主页 |

#### 示例

```xml
<!-- 图片头像 -->
<s-avatar src="{{user.avatarUrl}}"></s-avatar>

<!-- 文字头像 -->
<s-avatar text="张三"></s-avatar>

<!-- 不同尺寸 -->
<s-avatar size="sm" src="{{avatar}}"></s-avatar>
<s-avatar size="lg" src="{{avatar}}"></s-avatar>

<!-- 自定义背景色 -->
<s-avatar text="苏铁" bg-color="#2E7D32"></s-avatar>
```

---

### Tag 标签

标签用于分类、标记属性或筛选条件。

**组件路径**：`/components/tag/index`

#### 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| variant | String | `default` | 标签变体：`default` / `primary` / `success` / `warning` / `error` |
| size | String | `md` | 标签尺寸：`sm` / `md` |
| plain | Boolean | `false` | 是否为镂空样式 |
| closable | Boolean | `false` | 是否可关闭 |

#### 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| bind:close | 点击关闭按钮时触发 | event |
| bind:tap | 点击标签时触发 | event |

#### 变体说明

| 变体 | 样式 | 适用场景 |
|------|------|----------|
| default | 灰色背景 + 主文字色 | 默认标签、普通分类 |
| primary | 主色背景 + 白色文字 | 主要分类、选中状态 |
| success | 绿色背景 + 白色文字 | 成功状态、已完成 |
| warning | 橙色背景 + 白色文字 | 警告状态、待处理 |
| error | 红色背景 + 白色文字 | 错误状态、已失效 |

#### 示例

```xml
<!-- 默认标签 -->
<s-tag>标签</s-tag>

<!-- 不同变体 -->
<s-tag variant="primary">精选</s-tag>
<s-tag variant="success">已完成</s-tag>
<s-tag variant="warning">待支付</s-tag>
<s-tag variant="error">已取消</s-tag>

<!-- 镂空样式 -->
<s-tag plain="{{true}}" variant="primary">可选择</s-tag>

<!-- 可关闭 -->
<s-tag closable="{{true}}" bind:close="onClose">标签</s-tag>

<!-- 小尺寸 -->
<s-tag size="sm">小标签</s-tag>
```

---

### Divider 分割线

分割线用于分隔内容区块或列表项。

**组件路径**：`/components/divider/index`

#### 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| direction | String | `horizontal` | 方向：`horizontal` / `vertical` |
| dashed | Boolean | `false` | 是否为虚线 |
| text | String | `` | 分割线中间文字 |
| text-position | String | `center` | 文字位置：`left` / `center` / `right` |

#### 示例

```xml
<!-- 水平分割线 -->
<s-divider></s-divider>

<!-- 虚线分割线 -->
<s-divider dashed="{{true}}"></s-divider>

<!-- 带文字的分割线 -->
<s-divider text="更多"></s-divider>

<!-- 文字在左侧 -->
<s-divider text="推荐" text-position="left"></s-divider>

<!-- 文字在右侧 -->
<s-divider text="查看更多" text-position="right"></s-divider>

<!-- 垂直分割线 -->
<view style="display: flex; align-items: center; height: 40px;">
  <text>选项1</text>
  <s-divider direction="vertical"></s-divider>
  <text>选项2</text>
</view>
```

---

## 复合组件

### EmptyState 空状态

空状态用于无数据时的展示和引导。

**组件路径**：`/components/empty-state/index`

#### 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| icon | String | `` | 图标名称或图标类型 |
| image | String | `` | 自定义图片地址 |
| title | String | `暂无数据` | 标题文字 |
| description | String | `` | 描述文字 |
| show-button | Boolean | `false` | 是否显示操作按钮 |
| button-text | String | `重新加载` | 按钮文字 |
| button-variant | String | `primary` | 按钮变体 |
| icon-position | String | `top` | 图标位置：`top` / `left` |

#### 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| bind:buttonTap | 点击操作按钮时触发 | event |
| bind:tap | 点击空状态区域时触发 | event |

#### 图标位置说明

| 位置 | 布局 | 适用场景 |
|------|------|----------|
| top | 图标在上，文字在下，垂直居中 | 全屏空状态、页面级空状态 |
| left | 图标在左，文字在右，水平排列 | 列表项空状态、局部空状态 |

#### 示例

```xml
<!-- 基础空状态 -->
<s-empty-state title="暂无订单"></s-empty-state>

<!-- 带描述 -->
<s-empty-state 
  title="暂无收藏" 
  description="快去收藏喜欢的商品吧"
></s-empty-state>

<!-- 带按钮 -->
<s-empty-state 
  title="加载失败"
  description="网络连接异常，请检查网络设置"
  show-button="{{true}}"
  button-text="重新加载"
  bind:buttonTap="onReload"
></s-empty-state>

<!-- 自定义图片 -->
<s-empty-state 
  image="/images/empty-cart.png"
  title="购物车是空的"
  description="去挑选心仪的商品吧"
  show-button="{{true}}"
  button-text="去逛逛"
></s-empty-state>

<!-- 左侧图标布局 -->
<s-empty-state 
  icon-position="left"
  title="暂无搜索结果"
  description="换个关键词试试吧"
></s-empty-state>
```

---

### ProductCard 商品卡片

商品卡片是电商核心组件，用于展示商品信息。

**组件路径**：`/components/product-card/index`

#### 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| layout | String | `vertical` | 布局方式：`vertical` / `horizontal` |
| product | Object | `{}` | 商品数据 |
| show-cart | Boolean | `true` | 是否显示加入购物车按钮 |
| show-tag | Boolean | `true` | 是否显示商品标签 |

#### 商品数据结构

```javascript
{
  id: '商品ID',
  name: '商品名称',
  desc: '商品描述',
  image: '商品图片地址',
  price: 99.9,           // 现价（数字）
  priceText: '99.90',    // 现价（文本）
  originPrice: 199.9,    // 原价（数字）
  originPriceText: '199.00', // 原价（文本）
  tag: '热销',           // 标签文字
  sales: 1000,           // 销量
  soldText: '已售 1000+' // 销量文本
}
```

#### 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| bind:productTap | 点击卡片时触发 | { product } |
| bind:addCartTap | 点击加购按钮时触发 | { product } |

#### 布局说明

| 布局 | 样式 | 适用场景 |
|------|------|----------|
| vertical | 图片在上，内容在下，纵向排列 | 网格视图、首页推荐 |
| horizontal | 图片在左，内容在右，横向排列 | 列表视图、搜索结果 |

#### 示例

```xml
<!-- 纵向布局（默认） -->
<s-product-card 
  product="{{product}}" 
  bind:productTap="onProductTap"
  bind:addCartTap="onAddCart"
></s-product-card>

<!-- 横向布局 -->
<s-product-card 
  layout="horizontal"
  product="{{product}}"
  bind:productTap="onProductTap"
></s-product-card>

<!-- 隐藏加购按钮 -->
<s-product-card 
  product="{{product}}" 
  show-cart="{{false}}"
></s-product-card>
```

---

## 业务组件

### Price 价格

价格组件用于统一展示商品价格。

**组件路径**：`/components/price/index`

#### 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| value | Number / String | `0` | 价格数值 |
| original | Number / String | `` | 原价数值 |
| size | String | `md` | 尺寸：`sm` / `md` / `lg` |
| color | String | `error` | 颜色变体：`primary` / `error` / `text` |
| symbol | String | `¥` | 货币符号 |
| show-symbol | Boolean | `true` | 是否显示货币符号 |
| show-decimal | Boolean | `true` | 是否显示小数部分 |

#### 颜色变体说明

| 颜色 | 色值 | 适用场景 |
|------|------|----------|
| primary | 主色 `#2E7D32` | 强调价格、会员价 |
| error | 错误色 `#F44336` | 商品价格、促销价（默认） |
| text | 主文字色 `#1D1D1F` | 普通价格、原价展示 |

#### 尺寸说明

| 尺寸 | 符号字号 | 整数字号 | 小数字号 |
|------|----------|----------|----------|
| sm | 10px | 14px | 10px |
| md | 12px | 18px | 12px |
| lg | 16px | 28px | 16px |

#### 示例

```xml
<!-- 基础价格 -->
<s-price value="99.90"></s-price>

<!-- 带原价 -->
<s-price value="99.90" original="199.00"></s-price>

<!-- 不同尺寸 -->
<s-price value="99.90" size="sm"></s-price>
<s-price value="99.90" size="lg"></s-price>

<!-- 不同颜色 -->
<s-price value="99.90" color="primary"></s-price>
<s-price value="99.90" color="text"></s-price>

<!-- 自定义符号 -->
<s-price value="99.90" symbol="$"></s-price>

<!-- 隐藏符号 -->
<s-price value="99.90" show-symbol="{{false}}"></s-price>

<!-- 隐藏小数 -->
<s-price value="99" show-decimal="{{false}}"></s-price>
```

---

### OrderCard 订单卡片

订单卡片用于展示订单信息和操作入口。

**组件路径**：`/components/order-card/index`

#### 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| order | Object | `{}` | 订单数据 |
| show-actions | Boolean | `true` | 是否显示操作按钮 |

#### 订单数据结构

```javascript
{
  id: '订单ID',
  orderNo: '订单编号',
  status: 'pending',      // 订单状态：pending/shipping/completed/cancelled
  statusText: '待支付',    // 状态文本
  items: [                // 商品列表
    {
      id: '商品ID',
      name: '商品名称',
      image: '商品图片',
      price: 99.9,
      quantity: 1
    }
  ],
  totalPrice: 99.9,       // 总价
  totalPriceText: '99.90', // 总价文本
  itemCount: 1,           // 商品总数
  createTime: '2026-07-06' // 创建时间
}
```

#### 订单状态说明

| 状态 | 颜色 | 说明 |
|------|------|------|
| pending | 警告色 `#FF9800` | 待支付 |
| shipping | 信息色 `#2196F3` | 待发货/配送中 |
| completed | 成功色 `#4CAF50` | 已完成 |
| cancelled | 次文字色 `#86868B` | 已取消 |

#### 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| bind:tap | 点击卡片时触发 | { order } |
| bind:action | 点击操作按钮时触发 | { order, action } |

#### 操作按钮说明

操作按钮根据订单状态动态显示，`action` 字段可能的值：

- `pay`：去支付（待支付状态）
- `cancel`：取消订单（待支付状态）
- `confirm`：确认收货（配送中状态）
- `review`：去评价（已完成状态）
- `rebuy`：再次购买（已完成/已取消状态）
- `delete`：删除订单（已取消状态）

#### 示例

```xml
<!-- 基础订单卡片 -->
<s-order-card 
  order="{{order}}" 
  bind:tap="onOrderTap"
  bind:action="onOrderAction"
></s-order-card>

<!-- 隐藏操作按钮 -->
<s-order-card 
  order="{{order}}" 
  show-actions="{{false}}"
></s-order-card>
```
