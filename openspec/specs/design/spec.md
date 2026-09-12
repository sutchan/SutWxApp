<!--
文件名: spec.md
版本号: 3.1.0
更新日期: 2026-09-12
作者: SutWxApp Design（彩格调 / Cai）
描述: SutWxApp 权威设计规范 v3.1.0 —— 以 app.wxss v3.0.0 代码为唯一事实来源，Apple 极简风格 + 自然绿品牌。本版本完成设计令牌权威化、语义色策略确立（品牌价签）、系统级红橙脏值纠正清单。
-->

# 苏铁微信小程序（SutWxApp）UI 设计规范

## 1. 文档信息

| 项目 | 内容 |
|------|------|
| 文件名 | openspec/specs/design/spec.md |
| 版本号 | v3.1.0 |
| 更新日期 | 2026-09-12 |
| 描述 | 权威设计规范：Apple 极简风格 + 自然绿品牌，含语义色策略与脏值纠正清单 |
| 作者 | SutWxApp Design |

## 2. 目的与适用边界

本规范以 `app.wxss v3.0.0` 的实际代码令牌为唯一事实来源，提炼、补全并纠正为权威设计规范。任何设计与实现与本规范冲突时，以本规范为准；本规范与 `app.wxss` 冲突时，以本规范声明的新令牌值与纠正决策为准，并同步回写代码。

适用边界：

- 微信小程序**原生开发框架**（非 uni-app / Taro），rpx 基准宽 750。
- **纯前端**设计规范，不涉及后端接口与数据结构。
- 覆盖核心 6 页流程：首页、分类、商品详情、购物车、订单确认、我的。
- 涉及原生 tabBar（首页/分类/购物车/我的）、原生导航栏（白色、标题"苏铁"）与全面屏安全区适配。

## 3. 设计原则

结合本项目定位（精品植物/园艺 C 端电商，受众偏好大图、低决策成本）：

1. **极简克制**：大面积留白、白色卡片浮于浅灰页面之上，每屏只强调一个视觉焦点（大图商品 / 一个主 CTA）。文字只用三级灰阶，不引入第四级。
2. **自然品牌**：绿色是品牌唯一的"强调色"——主操作、选中态、价格强调、tabBar 选中均归绿，让用户建立"绿色 = 苏铁"的品牌联想。除此之外不得出现任何第二强调色系（红色系仅作错误警示）。
3. **一致性**：同语义同色、同层级同间距、同交互同反馈。凡可引用 CSS 变量的地方必须引用变量，禁止新写硬编码色值。
4. **可用优先**：移动端新手友好——主 CTA 醒目（主色绿 + 白字）、价格信息清晰（品牌价签策略）、触控区 ≥ 88rpx、安全区不遮挡底部固定栏。

## 4. 视觉设计语言

### 4.1 色彩系统

#### 4.1.1 权威 Token 表

| Token | 色值 | 用途 | 语义色 |
|-------|------|------|--------|
| `--primary-color` | `#2E7D32` | 主色绿：主 CTA、选中态、链接、tabBar 选中、loading 指示 | 是（品牌主色） |
| `--primary-dark` | `#1B5E20` | 深绿：促销价/价格强调（"品牌价签"）、按压态 | 是（主色派生） |
| `--primary-light` | `#F1F8E9` | 浅绿：折扣标签底色、选中态浅底、按钮按压底 | 是（主色派生） |
| `--text-primary` | `#1D1D1F` | 主文字：标题、正文、价格数字（配合价签策略） | 是 |
| `--text-secondary` | `#86868B` | 次要文字：说明、原价（配删除线）、副标题 | 是 |
| `--text-tertiary` | `#AEAEB2` | 三级文字：占位符、禁用、极弱提示 | 是 |
| `--text-inverse` | `#FFFFFF` | 反白文字（主色/深色底上） | 是 |
| `--background-primary` | `#FFFFFF` | 卡片/表面背景 | 是 |
| `--background-secondary` | `#F5F5F7` | 页面背景（`page` 默认） | 是 |
| `--background-tertiary` | `#FAFAFA` | 三级背景：按压态、次级面板 | 是 |
| `--border-color` | `#E8E8ED` | 分隔线、描边 | 是 |
| `--error-color` | `#F44336` | 错误/警示：表单错误、删除确认、警示 toast。**禁止用于价格与品牌 CTA** | 是（受控语义色） |
| `--error-light` | `#FFEBEE` | 错误浅底 | 是 |
| `--success-color` | `#4CAF50` | 成功：下单成功、支付成功提示 | 是 |
| `--success-light` | `#E8F5E9` | 成功浅底 | 是 |
| `--warning-color` | `#FF9800` | 警告：库存紧张等系统级提示（非促销） | 是 |
| `--warning-light` | `#FFF3E0` | 警告浅底 | 是 |
| `--info-color` | `#2196F3` | 信息：物流信息等中性提示 | 是 |
| `--info-light` | `#E3F2FD` | 信息浅底 | 是 |

色彩占比约定：中性色（白/灰阶）≥ 85%，主色绿 ≤ 10%，状态语义色 ≤ 5%。

#### 4.1.2 合并后的 CSS 变量块（权威定义，已剔除脏值）

```css
page {
  /* ===== 品牌绿 ===== */
  --primary-color: #2E7D32;
  --primary-light: #F1F8E9;
  --primary-dark: #1B5E20;

  /* ===== 文字三级 ===== */
  --text-primary: #1D1D1F;
  --text-secondary: #86868B;
  --text-tertiary: #AEAEB2;
  --text-inverse: #FFFFFF;

  /* ===== 背景三级 / 边框 ===== */
  --background-primary: #FFFFFF;
  --background-secondary: #F5F5F7;
  --background-tertiary: #FAFAFA;
  --border-color: #E8E8ED;

  /* ===== 受控语义色（各含主+浅） ===== */
  --error-color: #F44336;
  --error-light: #FFEBEE;
  --success-color: #4CAF50;
  --success-light: #E8F5E9;
  --warning-color: #FF9800;
  --warning-light: #FFF3E0;
  --info-color: #2196F3;
  --info-light: #E3F2FD;

  /* ===== 字号 ===== */
  --font-size-xs: 10px;
  --font-size-sm: 12px;
  --font-size-md: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 18px;
  --font-size-xxl: 24px;
  --font-size-h1: 28px;
  --font-size-h2: 22px;
  --font-size-h3: 18px;

  /* ===== 间距 ===== */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 20px;
  --spacing-xxl: 24px;

  /* ===== 圆角 ===== */
  --border-radius-sm: 8px;
  --border-radius-md: 12px;
  --border-radius-lg: 16px;
  --border-radius-xl: 24px;

  /* ===== 阴影 ===== */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.1);

  /* ===== 过渡（统一曲线） ===== */
  --transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 0.5s cubic-bezier(0.4, 0, 0.2, 1);

  background-color: var(--background-secondary);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  font-size: var(--font-size-md);
  line-height: 1.5;
}
```

**废弃令牌**（禁止再引用）：`#2a9d8f`（青，原 `.bg-secondary` / `.btn-secondary`）、`#f4a261`（橙，原 `.bg-accent`）、`#e93b3d` / `#ff6b6b` / `#ff9700` / `#ff8e53`（旧版红橙促销系，见 §8 纠正清单）。

#### 4.1.3 语义色策略（核心决策）

1. **CTA / 主操作按钮** → 主色绿 `#2E7D32` + 白字。加购、立即购买、去支付、提交订单、确认规格等所有"推动转化"的按钮一律绿。同一屏最多一个实心绿大按钮（商品详情底栏允许"加购浅层 + 购买主色"的双绿组合，见 §5）。
2. **价格 / 促销强调（品牌价签策略）**：
   - 促销价/现价：主色**深绿 `#1B5E20`**，¥ 符号用小号、数字用大号加粗；不使用红色。
   - 原价：次要文字色 `#86868B` + 删除线。
   - 折扣标签/促销角标：浅绿底 `#F1F8E9` + 主色字 `#2E7D32`（或深绿底 + 白字，二选一全局统一，推荐前者）。
   - 购物车角标（badge）：主色绿 `#2E7D32` 底 + 白字（角标属品牌计数，非警示）。
3. **红色 `#F44336` 仅作错误/警示语义**：表单校验错误、删除/退出登录等危险操作确认、错误 toast。不得出现在价格、折扣、加购按钮、tabBar 角标、"我的"头部等品牌或营销场景。
4. **状态语义严格对号**：success 绿 / warning 橙 / error 红 / info 蓝，不跨语义混用；同一屏状态色不超过 2 种。

### 4.2 字体规范

字体栈（app.wxss 实际值，权威）：

```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC',
  'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
```

字号层级（px，代码实际值；rpx 换算按 1px = 2rpx）：

| Token | 值 | 用途 |
|-------|-----|------|
| `--font-size-xs` | 10px | 极小标签、badge 文字 |
| `--font-size-sm` | 12px | 辅助说明、原价、时间戳 |
| `--font-size-md` | 14px | **正文默认**（page 基准） |
| `--font-size-lg` | 16px | 次级标题、按钮大字号 |
| `--font-size-xl` | 18px | 模块标题（h3） |
| `--font-size-xxl` | 24px | 强调数字、区块标题 |
| `--font-size-h1` | 28px | 页面大标题 |
| `--font-size-h2` | 22px | 二级大标题 |
| `--font-size-h3` | 18px | 三级标题（=xl） |

字重：`font-light` 300 / `font-normal` 400 / `font-medium` 500（按钮、tabBar 选中、次级强调）/ `font-bold` 700（标题、价格数字、主 CTA 文字）。
行高：正文 1.5（page 默认）；多行描述 1.6；标题可收紧至 1.25。

### 4.3 间距系统

基准档位：4 / 8 / 12 / 16 / 20 / 24（`--spacing-xs` ~ `--spacing-xxl`，px）。

用途规则：

- **xs(4)**：图标与文字之间、badge 内边距。
- **sm(8)**：按钮内部图文间距、相关元素组内间距。
- **md(12)**：卡片默认内边距与卡片纵向间距、列表项内边距。
- **lg(16)**：页面左右安全留白（配合 30rpx 传统页可接受 32rpx，推荐归一为 16px）、区块间主间距。
- **xl(20)**：大区块内边距、页面级上下分隔。
- **xxl(24)**：页面顶部标题区、大间距分隔（如 banner 与内容区之间）。

禁止：未定义的魔法间距值（如 10/15/18/26rpx 一律就近归档到上述档位）。

### 4.4 圆角 / 阴影 / 过渡

| 类别 | Token | 值 | 典型用法 |
|------|-------|-----|----------|
| 圆角 | `--border-radius-sm` | 8px | 小按钮、tag、输入框、规格项 |
| 圆角 | `--border-radius-md` | 12px | 卡片、按钮、搜索栏（=24rpx） |
| 圆角 | `--border-radius-lg` | 16px | 大卡片、弹层顶部（=32rpx） |
| 圆角 | `--border-radius-xl` | 24px | 特大容器；胶囊/全圆按钮用 50% 或高度一半 |
| 阴影 | `--shadow-sm` | 0 1px 3px rgba(0,0,0,.05) | 卡片默认、tabBar 选中项 |
| 阴影 | `--shadow-md` | 0 4px 12px rgba(0,0,0,.08) | 吸顶栏、悬浮卡片 |
| 阴影 | `--shadow-lg` | 0 12px 32px rgba(0,0,0,.1) | 弹层、浮层容器 |
| 过渡 | `--transition-fast` | 0.15s | 按压反馈、颜色/透明度变化 |
| 过渡 | `--transition-normal` | 0.3s | 弹层出入场、展开收起 |
| 过渡 | `--transition-slow` | 0.5s | 大区块位移、banner 类氛围动画 |

所有过渡统一曲线 `cubic-bezier(0.4, 0, 0.2, 1)`，禁止 `ease-in-out`、`linear`（spin 骨架除外）等散落写法。

## 5. 组件设计规范

> 每个组件标注【合规基准】与【常见违规】。组件样式实现优先复用 `app.wxss` 基础类与 CSS 变量。

### 5.1 按钮（.btn 系列）

**合规基准**
- 主按钮 `.btn-primary`：背景 `--primary-color`，白字，圆角 md，字重 500，按压 `:active` → `opacity: .8; transform: scale(0.98)`（transition-fast）。
- 次按钮：白底 + `2rpx solid --border-color` 描边 + 主文字色（替代旧 `.btn-secondary` 青色填充）。
- 描边按钮 `.btn-outline`：透明底 + 2rpx 主色描边 + 主色字，按压底变 `--primary-light`。
- 危险按钮：`--error-color` 底 + 白字，仅用于删除/退出登录，必须有确认弹窗。
- 禁用 `.btn-disabled`：`opacity: .5` + not-allowed，不改色。
- 尺寸：sm（padding xs/md，字 sm）/ 默认（sm/lg，字 md）/ lg（md/xl，字 lg）；`.btn-block` 占满行。
- 底部固定栏主按钮高度 88rpx、全圆角（胶囊）。

**常见违规**
- ✗ `.btn-secondary` 使用青色 `#2a9d8f` 填充 → 改为白底描边次按钮（见 §8）。
- ✗ 加购/立即购买按钮使用 `#ff9700` / `#e93b3d` / `#ff6b6b` → 一律改 `.btn-primary` 绿。

### 5.2 输入框

**合规基准**：白底、`1rpx solid --border-color`、圆角 md、字 md、padding md；聚焦边框变 `--primary-color`；禁用态 `--background-tertiary` 底 + `--text-tertiary` 字。搜索栏为胶囊形态（圆角全圆、`--background-secondary` 底、含搜索图标与 placeholder 三级灰）。校验错误时边框/提示用 `--error-color`。
**常见违规**：✗ 聚焦用红色或蓝色边框；✗ 圆角小于 8px。

### 5.3 卡片（.card）

**合规基准**：`--background-primary` 白底、圆角 md、`--shadow-sm`、padding md、卡片间 margin-bottom md。按压卡片加 `.card-hover`（active scale 0.98）。
**常见违规**：✗ 卡片带彩色边框或彩色底；✗ 阴影过重（超 shadow-md）。

### 5.4 列表项（.list-item）

**合规基准**：白底、padding md、底部 `1rpx solid --border-color` 分隔（末项无）、active 背景变 `--background-tertiary`。左侧图标 48rpx + 右侧箭头（`--text-tertiary` 透明度处理）。
**常见违规**：✗ 分隔线用纯黑或带色分隔线；✗ "我的"页菜单项图标用红橙色。

### 5.5 商品卡（竖卡 340rpx / 横卡 160rpx 两形态）

**合规基准**
- 竖卡：图上 340rpx 方图，下方信息区（名称 2 行截断、价格行、销量）。圆角 md、白底、shadow-sm。
- 横卡：图左 160rpx，信息右侧。
- 价格：深绿 `#1B5E20` 数字加粗 + ¥ 小号；原价 `--text-secondary` 删除线。
- 折扣/促销标签：`--primary-light` 浅绿底 + 主色字，圆角 sm，置于图左上角。
- 加购按钮：圆形或小号 `.btn-primary` 绿底白字（或主色描边图标按钮），禁止红色。
- 名称用 `.text-ellipsis-2`。

**常见违规**
- ✗ `components/product-card/index.wxss` 价格 `color: #ff6b6b`、加购按钮 `background-color: #ff6b6b` → 价格改 `--primary-dark`，按钮改 `--primary-color`（P1，见 §8）。

### 5.6 购物车项

**合规基准**：白底行卡；左侧圆形勾选框；商品图 160rpx 圆角 sm；名称 1-2 行；规格文字 sm 灰；数量步进器靠下右；单价深绿加粗。左滑/长按删除走确认弹窗（error 语义仅限确认弹窗按钮）。
**常见违规**：✗ 单价用红色；✗ 勾选框未选/选中态用红橙。

### 5.7 订单卡

**合规基准**：白底圆角 md；头部（状态文字 + 时间）+ 商品缩略行 + 合计金额 + 底部操作按钮。状态色：待付款 → warning 橙、待发货 → info 蓝、待收货/待评价 → 主色绿、已完成 → success 绿、已取消 → `--text-tertiary`。主操作按钮（去支付等）为 `.btn-primary` 绿。
**常见违规**：✗ 状态与金额使用 `#ff6b6b`（order/index、order/detail、order/confirm 多处）→ 按状态色表与价签策略替换（P0/P1，见 §8）。

### 5.8 空状态（empty-state）

**合规基准**：居中布局，插画/图标 ≤ 200rpx，主文案 `--text-tertiary`（md），描述 `--text-secondary`（sm），可选操作用 `.btn-outline`。
**常见违规**：✗ `components/empty-state/index.wxss:26` 背景使用 `#ff6b6b` → 改 `--primary-light` 或 `--background-tertiary`（P1）。

### 5.9 tabBar（原生）

**合规基准**：`app.json` 配置 `color: #86868B`（未选中，对应 --text-secondary）、`selectedColor: #2E7D32`（选中，主色绿）、`backgroundColor: #FFFFFF`、`borderStyle: white/black`（推荐 white 配 1px --border-color 视觉）。图标提供选中/未选中两套 PNG（81x81 建议尺寸）。
**常见违规**：✗ 选中色用红/橙；✗ 用自定义 tabBar 破坏原生手势体验。

### 5.10 导航栏（原生）

**合规基准**：`navigationBarBackgroundColor: #FFFFFF`、`navigationBarTextStyle: black`、`navigationBarTitleText: "苏铁"`（首页），内页各自命名。不做自定义导航，让出胶囊区。
**常见违规**：✗ 页面级覆盖为彩色导航（如红色头部）；✗ 标题字号超 xl。

### 5.11 底部固定栏（结算/操作栏）

**合规基准**：`position: fixed; bottom: 0; left/right: 0`，白底，顶部 `1rpx` 边框或 `--shadow-md` 上投影，`z-index: 100`。内边距公式：

```css
padding: 16rpx 24rpx;
padding-bottom: calc(16rpx + constant(safe-area-inset-bottom));
padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
```

对应页面内容区需预留等高 padding-bottom（如 120rpx + 安全区）避免遮挡。主按钮 `height: 88rpx`、圆角 44rpx（胶囊）、`.btn-primary` 绿。
**常见违规**：✗ 忘记 `env(safe-area-inset-bottom)`；✗ 双按钮使用橙+红配对（商品详情页 `btn-add-cart #ff9700` / `btn-buy-now #e93b3d`）→ 双绿方案：加购 = 深绿 `#1B5E20`（或主色描边），立即购买 = 主色绿 `#2E7D32`，白字（P0）。

### 5.12 底部弹层（popup：规格 / 评价）

**合规基准**：复用 `.popup` / `.popup-mask` / `.popup-content` 体系——mask `rgba(0,0,0,.5)`、内容白底、顶部圆角 lg、`max-height: 80vh`、入场 `slideUp 0.3s`（transform 过渡），点 mask 关闭。规格项（spec-item）：默认 `--background-tertiary` 底 + 主文字色 + 圆角 sm；**选中态改 `--primary-color` 绿底白字**。弹层底部按钮区固定并含安全区 padding。
**常见违规**：✗ 规格选中态用 `#e93b3d` 红底（product/index.wxss:615）→ 改绿（P0）；✗ 弹层宽度不满屏、圆角朝下。

### 5.13 徽标（badge）

**合规基准**：`.badge` 胶囊（圆角 50%、padding 2rpx/8rpx、字号 xs、白字）。计数 badge 用 `.badge-primary` 主色绿。红点 `.badge-dot` 16rpx 纯圆，**保留 `--error-color` 红**（红点属警示语义，允许）。`content` 为空隐藏。
**常见违规**：✗ 商品详情页内 `cart-badge` 用 `#e93b3d` → 统一 `.badge-primary` 绿（P1）；✗ badge 底色随意用 accent 橙。

### 5.14 数量步进器

**合规基准**：`− / 数字输入 / ＋` 三段，按钮 56rpx 方形、`--background-tertiary` 底、圆角 sm 拼接（左右两端各自圆角），字号 md，触控区≥56rpx；禁用端 `opacity: .5`；最小 1、最大 maxQuantity，越界禁止并给轻提示。
**常见违规**：✗ 按钮底色用彩色；✗ 数字输入区无宽度约束。

### 5.15 勾选框（圆形 checkbox）

**合规基准**：40rpx 圆形；未选中 `2rpx solid --border-color` 白底；选中 `--primary-color` 绿底 + 白色对勾（或描边变主色圆点）；禁用 `--text-tertiary`。全选/单选行为一致，触控区≥88rpx（含 padding）。
**常见违规**：✗ 选中态用红/橙填充；✗ 勾选框触控区过小难点按。

## 6. 布局与栅格

- **基准宽**：750rpx；所有尺寸优先 rpx，字号 token 为 px（page 内 1px≈2rpx 换算使用）。
- **页面骨架**：`.container`（min-height 100vh，flex column）+ `.content`（flex:1，padding md）。
- **单列布局**：首页信息流、商品详情主体、购物车列表——纵向堆叠，卡片间 md。
- **双列布局**：商品网格（首页/分类）——`display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px`，竖卡 340rpx 图。
- **侧栏布局**：分类页——左侧分类导航（固定宽 ~180rpx，`--background-secondary` 底，选中项主色绿字+浅绿底/左侧主色竖条）+ 右侧商品滚动区。
- **安全区**：
  - 全局工具类 `.safe-area-top` / `.safe-area-bottom`（constant + env 双写法，代码已提供）。
  - 底部固定栏 padding 公式见 §5.11；涉及 tabBar 的页面无需额外处理（原生 tabBar 自带安全区）。
  - 自定义头部区域叠加在图片上时使用 `.safe-area-top`。
- **吸顶**：分类页侧栏/搜索栏可用 `position: sticky`（工具类 `.sticky`）。

## 7. 动效规范

| 场景 | 时长/曲线 | 说明 |
|------|-----------|------|
| 快速反馈（按压、颜色变化） | `--transition-fast` 0.15s | 按钮/卡片/列表项 ：active |
| 标准过渡（弹层、展开收起） | `--transition-normal` 0.3s | popup slideUp、mask 淡入 |
| 慢速氛围（banner、大区块） | `--transition-slow` 0.5s | 轮播、骨架屏 |
| 点击反馈 | scale(0.98) + transition-fast | 统一用 `.btn:active` / `.card-hover:active` 模式，禁止 scale < 0.95 |
| 弹层入场 | slideUp 0.3s（translateY 100%→0） | 退场反向或淡出 |
| 遮罩 | opacity 淡入 0.3s | rgba(0,0,0,.5) |
| 页面切换 | 微信原生转场 | 不自定义页面级动画 |

**加载**：
- `loading-spinner`：40rpx 圆环，`--border-color` 轨道 + `--primary-color` 高亮弧，spin 0.8s linear infinite（唯一允许 linear 场景）。
- 骨架屏：`--background-secondary` 底 + 呼吸/扫光动画，形状对齐目标内容（卡片矩形、圆形头像、商品图方块），禁止转圈代替骨架。
- `loading-overlay` 全屏遮罩（rgba 0.5, z-index 9999）仅用于提交订单等强阻塞操作。

## 8. 脏值纠正清单

> 优先级：**P0 = 系统级/核心转化路径**（app.wxss 类定义、商品详情页、组件库）；**P1 = 组件级/次级页面**（我的、订单、分类、组件内非转化元素）。

### 8.1 app.wxss 自身（P0，随 v3.1.0 立即回写）

| # | 位置 | 现状（脏值） | 建议替换 | 说明 |
|---|------|--------------|----------|------|
| 1 | `.bg-secondary`（L233） | `background-color: #2a9d8f`（青） | `var(--background-secondary)`（#F5F5F7） | 类名本意即"次级背景"，被误填品牌外青色 |
| 2 | `.btn-secondary`（L300） | `background-color: #2a9d8f`（青） | 改为白底 + `2rpx solid var(--border-color)` + 主文字色 | 次按钮语义为描边非彩色填充 |
| 3 | `.bg-accent`（L234） | `background-color: #f4a261`（橙） | `var(--primary-light)`（#F1F8E9）或直接删除该类 | 无橙 accent 语义；如需强调用绿系浅底 |
| 4 | `.badge-dot`（L379） | `#F44336` | 保留，但改写为 `var(--error-color)` | 红点属警示语义，允许保留，须变量化 |

### 8.2 商品详情页 pages/product/index.wxss（P0，核心转化路径）

| # | 行 | 选择器 | 脏值 | 建议替换 |
|---|-----|--------|------|----------|
| 1 | 91/97/103 | `.price-label` / `.price-symbol` / `.price-value` | `#e93b3d` | `var(--primary-dark)`（品牌价签） |
| 2 | 115 | `.discount-badge` | `#e93b3d` | `var(--primary-light)` 底 + 主色字 |
| 3 | 317 | `.load-more text` | `#e93b3d` | `var(--text-secondary)`（中性"加载更多"） |
| 4 | 405 | `.related-price` | `#e93b3d` | `var(--primary-dark)` |
| 5 | 453 | `.cart-badge` | `#e93b3d` | `var(--primary-color)` |
| 6 | 482 | `.btn-add-cart` | `#ff9700` | `var(--primary-dark)` 深绿白字（双绿底栏） |
| 7 | 487 | `.btn-buy-now` | `#e93b3d` | `var(--primary-color)` 绿白字 |
| 8 | 615 | `.spec-item.active` | `#e93b3d` | `var(--primary-color)` |
| 9 | 682 | `.btn-confirm` | `#e93b3d` | `var(--primary-color)` |

另：全页硬编码灰阶（#333/#666/#999/#f5f5f5/#eee）建议随重构统一映射到 `--text-*` / `--background-*` / `--border-color`。

### 8.3 组件（P1）

| # | 文件:行 | 脏值 | 建议替换 |
|---|---------|------|----------|
| 1 | components/product-card/index.wxss:80 | `color: #ff6b6b`（价格） | `var(--primary-dark)` |
| 2 | components/product-card/index.wxss:96 | `background-color: #ff6b6b`（加购按钮） | `var(--primary-color)` |
| 3 | components/empty-state/index.wxss:26 | `background-color: #ff6b6b`（插画底） | `var(--primary-light)` |

### 8.4 我的 / 订单 / 分类 / 订单确认（P1）

| # | 文件:行 | 现状 | 建议替换 |
|---|---------|------|----------|
| 1 | pages/user/index.wxss:19 | 头部 `linear-gradient(135deg, #e93b3d, #ff6b6b)` 红渐变 | `linear-gradient(135deg, #2E7D32, #1B5E20)` 绿渐变（品牌头部） |
| 2 | pages/user/index.wxss:178 | `.logout-btn` 文字 `#e93b3d` | **保留红**但改 `var(--error-color)`（退出登录 = 危险操作，语义正确） |
| 3 | pages/order/confirm.wxss:112/166/196 | `color: #ff6b6b`（金额/强调） | `var(--primary-dark)` |
| 4 | pages/order/confirm.wxss:205 | `background-color: #ff6b6b`（提交订单按钮） | `var(--primary-color)`（P0 级转化按钮，可与 P1 批次同改） |
| 5 | pages/order/detail.wxss:17 | 状态头部渐变 `#ff6b6b → #ff8e53` | 按状态色表：完成态用绿渐变 `#4CAF50 → #2E7D32`；取消态用 `--background-tertiary` 灰 |
| 6 | pages/order/detail.wxss:115/176/187 | `color: #ff6b6b` | 金额 `var(--primary-dark)`；状态文字按状态色表 |
| 7 | pages/order/detail.wxss:222 | `background-color: #ff6b6b`（操作按钮） | `var(--primary-color)` |
| 8 | pages/order/index.wxss:36/97/152/177 | `color: #ff6b6b` | 同上：金额深绿、状态按色表 |
| 9 | pages/order/index.wxss:45/203 | `background-color: #ff6b6b`（tab 指示/按钮） | 指示条/按钮 `var(--primary-color)` |
| 10 | pages/category/index.wxss:33/108 | `color: #ff6b6b`（分类选中/价格） | 选中文字 `var(--primary-color)`；价格 `var(--primary-dark)` |
| 11 | pages/category/index.wxss:45/117 | `background-color: #ff6b6b`（选中底/角标） | `var(--primary-color)` |

**纠正总原则**：红 → 绿（品牌 CTA/价格/选中/角标）、橙 → 绿或删除、青 → 中性灰/描边；仅危险确认类场景保留红且必须走 `--error-color` 变量。纠正完成后，全仓库禁止出现 `#e93b3d / #ff6b6b / #ff9700 / #ff8e53 / #2a9d8f / #f4a261`。

## 9. 版本历史

| 版本 | 更新日期 | 更新内容 | 作者 |
|------|----------|----------|------|
| 3.1.0 | 2026-09-12 | 以 app.wxss v3.0.0 代码为事实来源全面重写：确立绿系语义色策略（品牌价签/绿 CTA）、受控状态色、合并权威 CSS 变量块（剔除青/橙/红橙脏值）、补全 15 类组件规范（含合规基准与常见违规）、布局/动效落地规则，并输出系统级脏值纠正清单（P0/P1） | SutWxApp Design（彩格调） |
| 1.0.0 | 2025-12-27 | 初始版本（颜色/字号体系已过时，被本版取代） | Sut |
