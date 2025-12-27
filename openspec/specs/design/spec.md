<!--
文件名: spec.md
版本号: 1.0.0
更新日期: 2025-12-27
作者: Sut
描述: SutWxApp 项目 UI 设计规范文档，涵盖视觉设计语言、组件使用标准、响应式适配规则和动效设计原则
-->

# UI 设计规范

## 目的

本规范定义了苏铁微信小程序（SutWxApp）项目的视觉设计语言、组件使用标准、响应式适配规则和动效设计原则，旨在确保小程序界面的统一性、一致性和美观性。规范基于微信小程序原生开发框架和 WeUI 组件库，结合项目的品牌定位和用户特征，制定了完整的设计体系。本规范适用于产品设计、前端开发、测试和运维等各个环节，所有参与界面设计和开发的人员都应当遵循本规范的要求。

苏铁微信小程序作为面向普通消费者的电商平台，界面设计直接影响用户体验和转化率。统一的视觉语言能够强化品牌形象，降低用户的学习成本；规范的组件使用能够保证界面的一致性，提高开发效率；合理的响应式适配能够适配不同尺寸的屏幕，提供良好的跨设备体验；恰当的动效设计能够增强交互反馈，提升用户满意度。本规范将从色彩、字体、组件、布局、动效等多个维度进行详细阐述，为设计和开发提供明确的指导。

## 视觉设计语言

### 设计原则

项目界面设计遵循四项核心原则，这些原则指导所有界面设计和交互决策。第一项原则是简洁清晰，界面设计应当去除冗余元素，突出核心内容和操作入口，让用户能够快速找到所需信息和功能。信息层级应当清晰分明，通过视觉差异区分重要程度，避免信息过载导致的认知负担。

第二项原则是一致性，同类功能和相似场景应当使用相同的设计模式，降低用户的学习成本。视觉元素（如颜色、字体、图标）应当保持统一的风格，形成完整的视觉语言系统。交互模式应当一致，相同操作在不同场景下应当产生相同或相似的反馈。

第三项原则是可用性，界面设计应当符合用户的认知习惯和操作直觉，减少用户的思考成本。重要操作应当突出展示，次要操作应当适度收敛。错误提示应当明确指出问题和解决方案，引导用户完成操作。界面应当具备良好的可访问性，考虑不同用户群体的需求。

第四项原则是品牌表达，设计应当体现苏铁品牌的核心价值和精神内涵，在符合行业规范的基础上形成差异化的视觉特征。品牌色彩和视觉元素应当贯穿整个产品，在用户心智中建立统一的品牌形象。

### 色彩系统

#### 主色调定义

品牌主色调选择深绿色作为核心视觉元素，深绿色（色值 #2E7D32）象征自然、生机和品质，与苏铁品牌的定位相契合。主色调用于关键操作按钮、重要状态提示、品牌标识等需要强调的场景。主色调应当控制使用面积，避免大面积使用造成的视觉疲劳。

```css
:root {
  --primary-color: #2E7D32;
  --primary-hover: #1B5E20;
  --primary-active: #388E3C;
  --primary-light: #E8F5E9;
  --primary-dark: #1B5E20;
}
```

主色调的明度变化形成完整的色彩系列。悬停状态使用略浅的色值（#388E3C），激活状态使用略深的色值（#1B5E20）。浅色背景（#E8F5E9）用于选中状态或强调区域。深色（#1B5E20）用于需要更高对比度的场景。

#### 辅助色定义

辅助色包括功能性色彩和调节性色彩两大类。功能性色彩用于传达状态信息，具有明确的语义含义。成功状态使用绿色（#4CAF50），警告状态使用橙色（#FF9800），错误状态使用红色（#F44336），提示状态使用蓝色（#2196F3）。这些色彩应当在对应场景下使用，帮助用户快速理解界面状态。

```css
:root {
  --success-color: #4CAF50;
  --success-light: #E8F5E9;
  --warning-color: #FF9800;
  --warning-light: #FFF3E0;
  --error-color: #F44336;
  --error-light: #FFEBEE;
  --info-color: #2196F3;
  --info-light: #E3F2FD;
}
```

调节性色彩用于丰富视觉层次，包括中性色和点缀色。中性色从纯白（#FFFFFF）到深灰（#212121）分为五个层级，用于文字、边框、背景等场景。点缀色用于特定的交互场景或活动推广，可根据具体需求选择。

```css
:root {
  --text-primary: #212121;
  --text-secondary: #757575;
  --text-disabled: #BDBDBD;
  --text-inverse: #FFFFFF;
  
  --border-color: #E0E0E0;
  --border-light: #EEEEEE;
  --border-dark: #BDBDBD;
  
  --bg-page: #F5F5F5;
  --bg-card: #FFFFFF;
  --bg-body: #FFFFFF;
  
  --shadow-color: rgba(0, 0, 0, 0.1);
}
```

#### 色彩使用规范

色彩使用应当遵循以下规范，确保界面色彩的合理性和一致性。功能性色彩（成功、警告、错误、提示）应当严格按照语义使用，不应当随意混用。同一界面中功能性色彩不应超过三种，避免造成信息混乱。主色调和辅助色的使用面积比例应当控制在 7:2:1 左右，即主色调占 70%，辅助色占 20%，点缀色占 10%。

文字色彩应当根据背景色选择合适的对比度，确保可读性。在浅色背景上使用深色文字，在深色背景上使用浅色文字。正文内容使用主文字色（#212121），次要说明使用次要文字色（#757575），禁用状态使用禁用文字色（#BDBDBD）。文字与背景的对比度应当满足 WCAG 2.1 标准的要求，正文对比度不低于 4.5:1，大标题对比度不低于 3:1。

### 字体规范

#### 字体家族定义

项目使用系统默认字体作为首选字体，在不同操作系统上回退到相应的无衬线字体。中文使用苹方（PingFang SC）或思源黑体（Source Han Sans），英文使用 SF Pro 或 Segoe UI。字体家族定义应当包含完整的回退机制，确保在不同设备上都有良好的显示效果。

```css
:root {
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial,
    sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
}
```

等宽字体用于代码展示和数字对齐场景，使用系统等宽字体或专用等宽字体。

```css
:root {
  --font-mono: 'SF Mono', 'Fira Code', 'Consolas', 'Courier New', monospace;
}
```

#### 字号层级定义

字号设计采用模数系统，以 2px 为基础递进单位，形成完整的字号层级。主字号为 14px，用于正文内容，是界面中占比最大的字号。标题使用更大的字号，通过字重变化进一步区分层级。

```css
:root {
  --font-size-xs: 10px;
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 18px;
  --font-size-2xl: 20px;
  --font-size-3xl: 24px;
  --font-size-4xl: 30px;
  --font-size-5xl: 36px;
}
```

各字号的使用场景定义如下：10px 用于提示文字和标签；12px 用于辅助说明和次要信息；14px 用于正文内容；16px 用于标题和强调文字；18px 用于页面主标题；20px 用于弹窗标题；24px 用于区块标题；30px 和 36px 用于页面大标题。

#### 字重与行高

字重分为三个级别：Regular（400）用于正文内容，Medium（500）用于次要标题和强调文字，Semibold（600）用于主要标题和按钮文字。字重的选择应当与字号配合，较大的字号可以使用较细的字重，较小的字号应当使用较粗的字重以保证可读性。

```css
:root {
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

行高根据字号和内容类型确定。正文内容的行高为字号的 1.5 倍，确保多行文字的阅读舒适度。标题行高可以适当缩小，节省垂直空间。固定高度的元素应当根据高度设置合适的行高，实现垂直居中。

```css
:root {
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}
```

### 图标规范

#### 图标风格定义

项目图标采用线性图标风格，线条粗细为 1px 或 1.5px，圆角半径为 2px。图标尺寸基准为 24x24px，根据使用场景可以缩放为 16x16px、20x20px、32x32px 或 48x48px。图标应当保持统一的视觉大小，不同图标的实际像素尺寸可能略有差异，但视觉重量应当一致。

图标线条应当使用主文字色（#212121），悬停或激活状态可以改为主色调（#2E7D32）。禁用状态的图标使用禁用文字色（#BDBDBD）。图标的线条端点应当统一为圆角或直角，项目选择圆角端点，与整体风格保持一致。

#### 图标命名规范

图标文件命名使用短横线分隔的小写字母，格式为 `{模块}-{功能}.png` 或 `{模块}-{功能}.svg`。例如，用户图标命名为 `user.png`，购物车图标命名为 `cart.png`，首页图标命名为 `home.png`。同一功能的多种状态使用后缀区分，如 `cart-active.png` 表示选中状态的购物车图标。

图标存放在 `images/icons/` 目录下，按照功能模块组织子目录。常用图标应当制作成图标字体或 SVG Sprite，提高加载性能。图标资源应当包含 2x 和 3x 分辨率版本，支持视网膜屏幕的高清显示。

```css
.icon {
  width: 24px;
  height: 24px;
  display: inline-block;
  vertical-align: middle;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.icon-cart {
  background-image: url('/images/icons/cart.png');
}

@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 2dppx) {
  .icon-cart {
    background-image: url('/images/icons/cart@2x.png');
  }
}
```

## 组件设计规范

### 基础组件

#### 按钮组件

按钮是最常用的交互组件，项目定义了五种按钮类型。主按钮使用主色调背景和白色文字，用于页面中最重要的操作，如提交、购买、登录等。次按钮使用边框样式，背景为透明，用于次要操作，如取消、返回等。文字按钮没有边框和背景，仅使用文字样式，用于辅助操作，如查看更多、取消等。危险按钮使用红色背景，用于删除、退出等危险操作。幽灵按钮使用浅色背景和深色文字，用于在深色背景上的操作。

```css
:root {
  --btn-height-sm: 28px;
  --btn-height-md: 36px;
  --btn-height-lg: 44px;
  --btn-padding-horizontal: 16px;
  --btn-border-radius: 4px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: var(--btn-height-md);
  padding: 0 var(--btn-padding-horizontal);
  border-radius: var(--btn-border-radius);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  outline: none;
}

.btn-primary {
  background-color: var(--primary-color);
  color: #FFFFFF;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}

.btn-primary:active {
  background-color: var(--primary-active);
}

.btn-primary:disabled {
  background-color: var(--primary-light);
  color: var(--text-disabled);
  cursor: not-allowed;
}

.btn-secondary {
  background-color: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background-color: var(--bg-page);
}

.btn-danger {
  background-color: var(--error-color);
  color: #FFFFFF;
}
```

按钮尺寸分为三种：小号按钮高度 28px，用于表格操作或紧凑布局；中号按钮高度 36px，是默认尺寸，用于大多数场景；大号按钮高度 44px，用于页面主要操作或需要强调的场景。按钮宽度根据内容自动调整，最大宽度为 100%，超长文本使用省略号处理。

#### 输入框组件

输入框用于接收用户输入的信息，项目定义了多种输入框类型。基础输入框用于单行文本输入，如用户名、地址等。文本域用于多行文本输入，如备注、评价等。数字输入框用于数字输入，配置数字键盘和增减按钮。搜索输入框用于搜索场景，配置搜索图标和清除按钮。密码输入框用于密码输入，配置显示或隐藏密码的切换按钮。

```css
:root {
  --input-height-md: 36px;
  --input-height-lg: 44px;
  --input-padding-horizontal: 12px;
  --input-border-color: var(--border-color);
  --input-focus-color: var(--primary-color);
}

.input {
  height: var(--input-height-md);
  padding: 0 var(--input-padding-horizontal);
  border: 1px solid var(--input-border-color);
  border-radius: var(--btn-border-radius);
  font-size: var(--font-size-base);
  color: var(--text-primary);
  background-color: #FFFFFF;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input:focus {
  border-color: var(--input-focus-color);
  box-shadow: 0 0 0 2px var(--primary-light);
}

.input:disabled {
  background-color: var(--bg-page);
  color: var(--text-disabled);
  cursor: not-allowed;
}

.input-error {
  border-color: var(--error-color);
}

.input-error:focus {
  box-shadow: 0 0 0 2px var(--error-light);
}

.input-wrapper {
  display: flex;
  align-items: center;
}

.input-wrapper .input {
  flex: 1;
  border: none;
  outline: none;
}

.input-wrapper .input:focus {
  box-shadow: none;
}
```

输入框应当配合标签使用，标签位于输入框上方或左侧，标识输入项的含义。必填项应当在标签后添加红色星号（*）。输入框下方应当显示占位符示例或帮助文字，引导用户正确输入。验证错误时应当在输入框下方显示错误提示，文字使用错误色。

#### 卡片组件

卡片是承载内容的容器组件，用于展示一组相关的信息。商品卡片用于展示商品信息，包括商品图片、名称、价格、销量等。订单卡片用于展示订单信息，包括订单编号、状态、金额、商品列表等。用户卡片用于展示用户信息，包括头像、昵称、等级等。

```css
:root {
  --card-padding: 16px;
  --card-bg: #FFFFFF;
  --card-border-radius: 8px;
  --card-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card {
  background-color: var(--card-bg);
  border-radius: var(--card-border-radius);
  box-shadow: var(--card-shadow);
  padding: var(--card-padding);
}

.card-hover:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.card-content {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-light);
}
```

卡片内部应当有明确的信息层级结构。标题应当突出显示，正文使用常规字重和颜色，辅助信息使用次要颜色。重要操作按钮应当放置在卡片底部或右下角，与卡片内容有明显区分。卡片之间的间距应当保持一致，推荐使用 8px 或 16px 的间距。

#### 列表组件

列表用于展示多项同类信息，支持点击操作进入详情或执行操作。基础列表用于展示简单的信息列表，每个列表项包含标题和副标题。图文列表用于展示带图片的信息列表，每个列表项包含图片、标题和副标题。操作列表用于展示可执行操作的列表，每个列表项包含操作说明和操作图标。

```css
:root {
  --list-item-height: 56px;
  --list-item-padding-horizontal: 16px;
  --list-item-border-color: var(--border-light);
}

.list {
  background-color: #FFFFFF;
}

.list-item {
  display: flex;
  align-items: center;
  height: var(--list-item-height);
  padding: 0 var(--list-item-padding-horizontal);
  border-bottom: 1px solid var(--list-item-border-color);
}

.list-item:last-child {
  border-bottom: none;
}

.list-item:active {
  background-color: var(--bg-page);
}

.list-item-thumbnail {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  margin-right: 12px;
  object-fit: cover;
}

.list-item-content {
  flex: 1;
  overflow: hidden;
}

.list-item-title {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-item-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: 2px;
}

.list-item-extra {
  margin-left: 12px;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.list-item-arrow {
  margin-left: 8px;
  width: 16px;
  height: 16px;
  color: var(--text-disabled);
}
```

列表应当配合分隔线使用，分隔线位于列表项之间。分组列表应当在组标题和组内容之间添加分隔线，组标题使用较浅的背景色或较小的字号。列表应当有明确的首项和末项样式，与页面背景有明显的区分。

### 业务组件

#### 商品卡片组件

商品卡片是电商小程序的核心组件，用于展示商品信息并引导用户进行购买操作。商品卡片应当包含以下核心信息：商品主图、 商品名称、商品价格、 商品规格或属性、操作按钮（加入购物车、立即购买）。可选信息包括：销量、评价数、收藏状态、促销标签。

```typescript
// components/product-card/product-card.js
Component({
  properties: {
    product: {
      type: Object,
      value: {
        id: '',
        name: '',
        price: 0,
        originalPrice: 0,
        image: '',
        sales: 0,
        tags: []
      }
    },
    showAddCart: {
      type: Boolean,
      value: true
    }
  },

  data: {
    isCollected: false
  },

  methods: {
    onTap() {
      this.triggerEvent('tap', { productId: this.data.product.id });
    },

    onAddCart() {
      this.triggerEvent('addcart', { productId: this.data.product.id });
    },

    onCollect() {
      this.setData({ isCollected: !this.data.isCollected });
      this.triggerEvent('collect', { 
        productId: this.data.product.id,
        collected: this.data.isCollected
      });
    }
  }
});
```

商品卡片的布局应当根据展示场景选择合适的样式。列表展示时使用水平布局，图片在左，内容在右；网格展示时使用垂直布局，图片在上，内容在下。商品名称应当限制行数，超出部分使用省略号处理。价格应当突出显示，原价使用删除线样式。促销标签应当使用醒目的背景色，放置在商品图片左上角。

#### 购物车项组件

购物车项组件用于展示购物车中的单个商品，支持数量调整和规格切换操作。购物车项应当包含：商品图片、 商品名称、 商品规格、 商品单价、 数量选择器、 小计金额、 删除按钮。

```typescript
// components/cart-item/cart-item.js
Component({
  properties: {
    item: {
      type: Object,
      value: {
        id: '',
        productId: '',
        skuId: '',
        name: '',
        image: '',
        price: 0,
        quantity: 1,
        maxQuantity: 99,
        selected: true
      }
    }
  },

  data: {
    tempQuantity: 1
  },

  observers: {
    'item.quantity': function(quantity) {
      this.setData({ tempQuantity: quantity });
    }
  },

  methods: {
    onSelect() {
      this.triggerEvent('select', { 
        itemId: this.data.item.id,
        selected: !this.data.item.selected
      });
    },

    onQuantityChange(e) {
      const { value } = e.detail;
      this.triggerEvent('quantitychange', {
        itemId: this.data.item.id,
        quantity: Math.max(1, Math.min(value, this.data.item.maxQuantity))
      });
    },

    onDelete() {
      wx.showModal({
        title: '确认删除',
        content: '确定要从购物车中删除该商品吗？',
        success: (res) => {
          if (res.confirm) {
            this.triggerEvent('delete', { itemId: this.data.item.id });
          }
        }
      });
    }
  }
});
```

数量选择器应当限制最小值和最大值，防止数量超出合理范围。数量变化时应当实时更新小计金额。小计金额应当使用加粗字体显示，金额较大时可以考虑使用主色调。删除按钮应当有确认提示，防止误操作。

#### 订单卡片组件

订单卡片用于展示订单信息，支持订单操作和状态追踪。订单卡片应当包含：订单编号、 订单状态、 商品列表、 订单金额、 下单时间、 操作按钮（去支付、查看物流、确认收货、评价）。

```typescript
// components/order-card/order-card.js
Component({
  properties: {
    order: {
      type: Object,
      value: {
        id: '',
        status: '',
        statusText: '',
        amount: 0,
        productCount: 0,
        products: [],
        createTime: ''
      }
    }
  },

  methods: {
    onTap() {
      this.triggerEvent('tap', { orderId: this.data.order.id });
    },

    onPrimaryAction() {
      const { status } = this.data.order;
      const actionMap = {
        'pending_payment': 'pay',
        'pending_ship': 'remind',
        'pending_receive': 'confirm',
        'completed': 'review'
      };
      this.triggerEvent('action', { 
        orderId: this.data.order.id,
        action: actionMap[status]
      });
    }
  }
});
```

订单状态应当使用语义化的色彩区分。待付款状态使用警告色，待发货状态使用信息色，待收货和待评价状态使用主色，已完成状态使用成功色，已取消状态使用灰色。订单商品列表应当折叠显示，鼠标悬停或点击时展开查看详情。订单金额应当包含商品总额、运费、优惠等信息。

## 布局与间距规范

### 页面布局

#### 标准页面结构

小程序页面采用标准的布局结构，从上到下依次为状态栏、导航栏、内容区、标签栏（可选）。状态栏由微信小程序系统提供，高度为 24px 或 44px（全面屏设备），开发时需要适配不同设备。导航栏由微信小程序原生支持，高度为 44px，可以自定义样式或使用默认样式。内容区是页面主体内容的容器，应当占据屏幕的主要空间。标签栏用于多标签页面切换，高度为 50px 或 80px（全面屏设备）。

```css
page {
  min-height: 100vh;
  background-color: var(--bg-page);
  box-sizing: border-box;
}

.status-bar {
  height: var(--status-bar-height, 24px);
  background-color: #FFFFFF;
}

.navbar {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #FFFFFF;
  border-bottom: 1px solid var(--border-light);
}

.content {
  min-height: calc(100vh - var(--status-bar-height, 24px) - 44px);
  padding: 16px;
}

.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(var(--tabbar-height, 50px) + safe-area-inset-bottom));
  background-color: #FFFFFF;
  border-top: 1px solid var(--border-light);
  display: flex;
}
```

#### 内容布局模式

内容区采用固定宽度布局，最大宽度为 750rpx（微信小程序默认宽度），在所有设备上保持一致的显示效果。内容区内的元素按照功能分区布局，常见布局模式包括：单列布局、双列布局、卡片布局、列表布局。

单列布局用于首页、商品详情等需要突出主体内容的场景，内容居中显示，左右留白。双列布局用于商品列表、订单列表等需要并排展示多项内容的场景，使用 Grid 或 Flex 布局实现等宽双列。卡片布局用于信息卡片集合，使用间距分隔卡片，卡片内部采用固定结构。列表布局用于信息流展示，每项内容垂直排列，使用分隔线区分。

```css
.container {
  max-width: 750rpx;
  margin: 0 auto;
  padding: 0 16px;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.flex-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.flex-col {
  display: flex;
  flex-direction: column;
}
```

### 间距系统

#### 间距基准与增量

间距系统采用 4px 为基础增量，形成完整的间距层级。这一数值基于中文排版的特点和移动端界面的阅读习惯，能够保证元素之间的呼吸感，同时不会浪费有限的屏幕空间。

```css
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 40px;
  --space-3xl: 48px;
}
```

间距的使用应当遵循一致的规则。组件内部元素间距使用较小层级（4px、8px、16px），如图标与文字之间使用 4px，按钮内部文字与图标之间使用 8px。组件之间的间距使用中等层级（16px、24px），如卡片之间使用 16px，区块之间使用 24px。页面区块之间的间距使用较大层级（32px、40px），如主要功能区块之间使用 32px，页面上下内容之间使用 40px。

```css
/* 组件内部间距 */
.btn-text-icon {
  margin-left: var(--space-xs);
}

.card-item {
  padding: var(--space-md);
}

/* 组件间距 */
.card + .card {
  margin-top: var(--space-md);
}

.section {
  margin-bottom: var(--space-lg);
}

/* 页面间距 */
.page-header {
  margin-bottom: var(--space-xl);
}

.page-content {
  padding: var(--space-md);
}
```

#### 安全区域适配

全面屏设备需要在底部预留安全区域，避免内容被屏幕圆角或底部手势区域遮挡。微信小程序提供了 safe-area 相关的 CSS 变量和布局方案，应当在需要底部定位的元素上使用。

```css
.container {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.fixed-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  background-color: #FFFFFF;
}
```

## 响应式适配规范

### 屏幕尺寸适配

#### 宽度适配方案

微信小程序使用 rpx（Responsive Pixel）作为尺寸单位，1rpx 等于屏幕宽度的 1/750。这一特性使得开发者无需关心设备像素比，只需按照设计稿的尺寸开发，即可在所有设备上按比例缩放。设计稿通常以 iPhone 6 的 750x1334 像素为基准，设计稿中的 px 数值直接转换为 rpx 数值即可。

```css
.element {
  width: 750rpx;
  padding: 20rpx;
  font-size: 28rpx;
  border-radius: 10rpx;
}
```

对于需要固定尺寸的元素（如图标），应当在保持宽高比例的前提下使用 rpx 单位。如果需要在不同设备上显示不同的尺寸，可以通过 JS 获取设备信息后动态设置样式。

```javascript
wx.getSystemInfo({
  success: (res) => {
    const scale = res.windowWidth / 750;
    const iconSize = Math.round(32 * scale);
    this.setData({ iconSize });
  }
});
```

#### 字体大小适配

字体大小使用 rpx 单位可以保证在不同设备上的显示比例一致。但对于极小或极大的字体，可能需要在不同设备上进行微调，以获得更好的阅读体验。项目定义了字体大小的基准值，并在必要时根据设备像素比进行调整。

```css
/* 基础字体大小 */
page {
  font-size: 28rpx;
}

/* 大屏幕设备适当增大字体 */
@media screen and (min-width: 400px) {
  page {
    font-size: 30rpx;
  }
}

/* 小屏幕设备适当减小字体 */
@media screen and (max-width: 320px) {
  page {
    font-size: 26rpx;
  }
}
```

### 像素比适配

#### 图片资源适配

高分辨率屏幕（如 Retina 屏幕）需要更高分辨率的图片资源，以避免图片模糊。微信小程序会自动根据设备像素比选择合适的图片资源，开发者需要提供 @2x 和 @3x 分辨率版本的图片。图片文件名使用 `@2x.png` 或 `@3x.png` 后缀区分。

```css
.product-image {
  width: 200rpx;
  height: 200rpx;
}

@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 2dppx) {
  .product-image {
    background-image: url('/images/product@2x.png');
  }
}

@media (-webkit-min-device-pixel-ratio: 3), (min-resolution: 3dppx) {
  .product-image {
    background-image: url('/images/product@3x.png');
  }
}
```

#### 边框适配

在某些高分辨率设备上，1px 边框可能显示过粗或显示不清晰。可以使用 CSS transform 缩放技术实现更细的边框，或者使用 hairline 组件实现物理像素级别的边框。

```css
.hairline-border {
  position: relative;
}

.hairline-border::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 200%;
  transform: scale(0.5);
  transform-origin: 0 0;
  border: 1px solid var(--border-color);
  pointer-events: none;
}
```

## 动效设计规范

### 过渡动画

#### 页面过渡动画

页面切换时应当使用过渡动画，增强空间感和连续性。项目使用微信小程序原生提供的页面转场动画，通过配置 app.json 中的 `pageStyle` 实现。页面进入动画使用从右向左滑入，页面退出动画使用从左向右滑出。

```json
{
  "pageStyle": {
    "navigationStyle": "custom",
    "backgroundTextStyle": "dark"
  },
  "window": {
    "backgroundTextStyle": "dark",
    "navigationBarBackgroundColor": "#FFFFFF",
    "navigationBarTitleText": "苏铁商城",
    "navigationBarTextStyle": "black"
  }
}
```

自定义页面转场动画可以在页面的 JSON 配置中声明，然后使用动画 API 实现。页面进入和退出应当使用对称的动画效果，动画时长控制在 250ms 到 300ms 之间。

```javascript
// page-transition.js
const pageTransition = {
  enter: {
    duration: 300,
    timingFunction: 'ease-out',
    delay: 0
  },
  exit: {
    duration: 250,
    timingFunction: 'ease-in',
    delay: 0
  }
};
```

#### 元素过渡动画

界面元素的显示隐藏、状态变化应当使用过渡动画，提供视觉反馈。常见场景包括：按钮悬停和点击、列表项加载和删除、弹窗显示和关闭、开关状态切换。过渡动画应当平滑自然，动画时长控制在 150ms 到 300ms 之间。

```css
.fade-enter {
  opacity: 0;
}

.fade-enter-active {
  opacity: 1;
  transition: opacity 300ms ease-out;
}

.fade-exit {
  opacity: 1;
}

.fade-exit-active {
  opacity: 0;
  transition: opacity 250ms ease-in;
}

.slide-up-enter {
  transform: translateY(20px);
  opacity: 0;
}

.slide-up-enter-active {
  transform: translateY(0);
  opacity: 1;
  transition: all 300ms ease-out;
}
```

### 交互动效

#### 点击反馈动效

可交互元素应当提供即时的点击反馈，增强操作的确定感。常见的点击反馈包括：缩放效果、波纹效果、颜色变化。缩放效果适用于按钮等较大的交互区域，点击时元素略微缩小，释放时恢复。波纹效果适用于卡片等较大面积的交互区域，点击位置产生扩散的水波纹效果。

```css
.press-scale:active {
  transform: scale(0.95);
  transition: transform 0.1s ease;
}

.press-highlight {
  transition: background-color 0.1s ease;
}

.press-highlight:active {
  background-color: var(--bg-page);
}
```

```javascript
// ripple.js
function createRipple(event, color) {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  const ripple = document.createElement('span');
  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    background: ${color};
    border-radius: 50%;
    transform: scale(0);
    animation: ripple 0.6s linear;
    pointer-events: none;
  `;
  
  button.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}
```

#### 加载动效

数据加载过程中应当显示加载动效，给用户明确的等待反馈。骨架屏用于展示内容的预期布局，在真实数据加载前显示。旋转加载图标用于小范围的加载状态，如按钮加载、下拉刷新。进度条用于展示加载进度的场景，如文件上传、下载。

```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-page) 25%,
    var(--border-light) 50%,
    var(--bg-page) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

## 无障碍设计规范

### 语义化标签

#### 结构语义化

界面元素应当使用语义化的标签，便于屏幕阅读器正确解读页面结构。页面标题使用 `view` 容器配合适当的层级结构，而非全部使用 `div`。交互元素使用 `button` 而非 `view` 加点击事件。表单元素使用 `input`、`picker` 等原生组件，而非自定义模拟组件。

```html
<!-- 正确写法 -->
<view class="header">
  <view class="title">页面标题</view>
</view>

<button bindtap="onSubmit">提交</button>

<input type="text" placeholder="请输入" />

<!-- 错误写法 -->
<view class="title" bindtap="onTitleTap">页面标题</view>

<view class="button" bindtap="onSubmit">提交</view>

<view class="input" bindinput="onInput">请输入</view>
```

#### ARIA 属性

对于自定义组件或复杂交互，应当添加 ARIA 属性，使屏幕阅读器能够正确识别组件的功能和状态。常用的 ARIA 属性包括：aria-label 提供元素的可访问名称，aria-describedby 关联描述元素，aria-expanded 指示展开状态，aria-selected 指示选中状态，aria-disabled 指示禁用状态。

```html
<view 
  class="collapse-item" 
  aria-expanded="{{isExpanded}}"
  aria-controls="collapse-content"
  bindtap="toggle"
>
  <text class="collapse-title">折叠面板标题</text>
  <image 
    class="arrow" 
    src="/images/arrow.svg" 
    aria-hidden="true"
  />
</view>
<view 
  id="collapse-content" 
  class="collapse-content {{isExpanded ? 'show' : ''}}"
  aria-hidden="{{!isExpanded}}"
>
  折叠面板内容
</view>
```

### 色彩对比度

#### 对比度标准

界面元素的色彩对比度应当满足 WCAG 2.1 标准的要求，确保视力障碍用户能够清晰阅读。正文文字与背景的对比度应当不低于 4.5:1，大号文字（18px 以上或 14px 加粗）与背景的对比度应当不低于 3:1。功能性色彩（按钮、链接、图标）应当满足同样的对比度要求。

```css
/* 高对比度文字样式 */
.text-primary {
  color: var(--text-primary);
  background-color: #FFFFFF;
}

.text-secondary {
  color: var(--text-secondary);
  background-color: #FFFFFF;
}

/* 确保链接色彩满足对比度要求 */
.link {
  color: #1976D2;
}

.link:hover {
  color: #1565C0;
}
```

#### 视觉提示补充

对于依赖色彩传达信息的场景，应当提供额外的视觉提示，如形状、文字或图标。状态指示器不应仅使用颜色区分，还应包含文字或图标。图表中的数据系列不应仅通过颜色区分，还应添加标签或图例。错误提示不应仅使用红色，还应包含错误图标和文字说明。

```html
<!-- 状态标签示例 -->
<view class="status-tag {{status === 'success' ? 'success' : 'error'}}">
  <image 
    class="status-icon" 
    src="/images/{{status === 'success' ? 'check' : 'close'}}.svg"
    aria-hidden="true"
  />
  <text>{{statusText}}</text>
</view>
```

## 版本历史

| 版本 | 更新日期 | 更新内容 | 作者 |
|------|----------|----------|------|
| 1.0.0 | 2025-12-27 | 初始版本，完成 UI 设计规范文档 | Sut |
