<!--
文件名: spec.md
版本号: 3.0.0
更新日期: 2026-07-06
作者: Sut
描述: SutWxApp 微信小程序设计系统规范文档，参考 Apple Human Interface Guidelines 与 shadcn/ui 设计理念，定义完整的视觉语言、组件标准与交互规范
-->

# SutWxApp 设计系统规范

## 概述

SutWxApp 设计系统是一套面向微信小程序的完整设计语言体系，旨在为苏铁电商平台提供统一、精致、国际化水准的视觉与交互标准。本规范参考 Apple Human Interface Guidelines 的极简主义设计哲学，结合 shadcn/ui 的组件化设计理念，深度适配微信小程序技术栈特性。

### 设计原则

**1. 清晰优先 (Clarity First)**
文字在任何背景下都清晰可辨，图标精确易懂，装饰性元素服务于功能而非喧宾夺主。通过留白、字体层级和色彩对比建立清晰的视觉层次。

**2. 遵从 (Deference)**
界面协助用户理解内容并与之互动，而不是成为障碍。内容是界面的核心，框架和控件应退居次位，让用户专注于内容本身。

**3. 深度 (Depth)**
通过视觉层次和叠加层传达层级关系，赋予界面活力，帮助用户理解什么是重要的、什么是可交互的。微妙的阴影、圆角和半透明效果创造深度感。

**4. 一致性 (Consistency)**
相同的功能使用相同的视觉语言，相同的模式在不同场景下产生相同的结果。用户的知识和技能可以在产品的不同部分之间迁移。

**5. 反馈 (Feedback)**
每一个操作都有即时的视觉反馈。状态变化有明确的过渡动画，用户的每一个动作都能感知到系统的响应。

### 设计基调

- **风格**: 极简精致，克制优雅
- **感受**: 信赖、品质、自然
- **节奏**: 呼吸感强，留白充足
- **动效**: 平滑自然，恰到好处

---

## 色彩系统

色彩系统基于深绿色主色调构建，采用系统化的色阶设计，确保在各种场景下的一致性和可访问性。

### 主色调 (Primary)

深绿色象征自然、生机与品质，是苏铁品牌的核心识别色。

| 色阶 | 色值 | 用途 |
|------|------|------|
| 50 | #E8F5E9 | 最浅背景、选中态背景 |
| 100 | #C8E6C9 | 浅背景、禁用态背景 |
| 200 | #A5D6A7 | 边框、分割线 |
| 300 | #81C784 | 弱强调、辅助图标 |
| 400 | #66BB6A | 悬停态、次级按钮 |
| **500** | **#2E7D32** | **品牌主色、主要按钮、强调文字** |
| 600 | #2E7D32 | 标准主色（同500） |
| 700 | #1B5E20 | 按下态、深色背景文字 |
| 800 | #1B5E20 | 深色主色（同700） |
| 900 | #0D3D10 | 最深、极端强调 |

```css
page {
  --primary-50: #E8F5E9;
  --primary-100: #C8E6C9;
  --primary-200: #A5D6A7;
  --primary-300: #81C784;
  --primary-400: #66BB6A;
  --primary-500: #2E7D32;
  --primary-600: #2E7D32;
  --primary-700: #1B5E20;
  --primary-800: #1B5E20;
  --primary-900: #0D3D10;
  
  --primary-color: #2E7D32;
  --primary-light: #F1F8E9;
  --primary-dark: #1B5E20;
}
```

**使用场景**:
- 主按钮、主要操作、关键链接
- 选中状态、激活状态
- 品牌标识、重要标签
- 进度条、图表主色

### 语义色 (Semantic Colors)

语义色用于传达明确的状态信息，帮助用户快速识别界面反馈。

#### 成功色 (Success)

| 色阶 | 色值 | 用途 |
|------|------|------|
| 50 | #E8F5E9 | 成功态背景 |
| 100 | #C8E6C9 | 浅成功背景 |
| 400 | #66BB6A | 弱成功强调 |
| **500** | **#4CAF50** | **成功主色** |
| 600 | #43A047 | 成功按下态 |
| 700 | #388E3C | 深成功色 |

```css
page {
  --success-50: #E8F5E9;
  --success-100: #C8E6C9;
  --success-400: #66BB6A;
  --success-500: #4CAF50;
  --success-600: #43A047;
  --success-700: #388E3C;
  
  --success-color: #4CAF50;
  --success-light: #E8F5E9;
}
```

#### 警告色 (Warning)

| 色阶 | 色值 | 用途 |
|------|------|------|
| 50 | #FFF8E1 | 警告态背景 |
| 100 | #FFECB3 | 浅警告背景 |
| 400 | #FFB74D | 弱警告强调 |
| **500** | **#FF9800** | **警告主色** |
| 600 | #FB8C00 | 警告按下态 |
| 700 | #F57C00 | 深警告色 |

```css
page {
  --warning-50: #FFF8E1;
  --warning-100: #FFECB3;
  --warning-400: #FFB74D;
  --warning-500: #FF9800;
  --warning-600: #FB8C00;
  --warning-700: #F57C00;
  
  --warning-color: #FF9800;
  --warning-light: #FFF8E1;
}
```

#### 错误色 (Error)

| 色阶 | 色值 | 用途 |
|------|------|------|
| 50 | #FFEBEE | 错误态背景 |
| 100 | #FFCDD2 | 浅错误背景 |
| 400 | #EF5350 | 弱错误强调 |
| **500** | **#F44336** | **错误主色** |
| 600 | #E53935 | 错误按下态 |
| 700 | #D32F2F | 深错误色 |

```css
page {
  --error-50: #FFEBEE;
  --error-100: #FFCDD2;
  --error-400: #EF5350;
  --error-500: #F44336;
  --error-600: #E53935;
  --error-700: #D32F2F;
  
  --error-color: #F44336;
  --error-light: #FFEBEE;
}
```

#### 信息色 (Info)

| 色阶 | 色值 | 用途 |
|------|------|------|
| 50 | #E3F2FD | 信息态背景 |
| 100 | #BBDEFB | 浅信息背景 |
| 400 | #64B5F6 | 弱信息强调 |
| **500** | **#2196F3** | **信息主色** |
| 600 | #1E88E5 | 信息按下态 |
| 700 | #1976D2 | 深信息色 |

```css
page {
  --info-50: #E3F2FD;
  --info-100: #BBDEFB;
  --info-400: #64B5F6;
  --info-500: #2196F3;
  --info-600: #1E88E5;
  --info-700: #1976D2;
  
  --info-color: #2196F3;
  --info-light: #E3F2FD;
}
```

### 中性色 (Neutral Colors)

中性色构成界面的基础框架，用于文字、背景、边框等元素，确保内容的可读性和界面的层次感。

#### 文字色阶

| 名称 | 色值 | 用途 | 对比度 (白色背景) |
|------|------|------|-------------------|
| Primary | #1D1D1F | 标题、正文、主要文字 | 15.8:1 |
| Secondary | #86868B | 次要说明、辅助文字 | 3.5:1 |
| Tertiary | #AEAEB2 | 占位符、禁用文字 | 2.3:1 |
| Quaternary | #C7C7CC | 极次要文字、分割线 | 1.7:1 |
| Inverse | #FFFFFF | 深色背景上的文字 | - |

```css
page {
  --text-primary: #1D1D1F;
  --text-secondary: #86868B;
  --text-tertiary: #AEAEB2;
  --text-quaternary: #C7C7CC;
  --text-inverse: #FFFFFF;
}
```

#### 背景色阶

| 名称 | 色值 | 用途 |
|------|------|------|
| Primary | #FFFFFF | 卡片、弹窗、主要内容区域背景 |
| Secondary | #F5F5F7 | 页面背景、分组背景 |
| Tertiary | #FAFAFA | 输入框背景、次要内容背景 |
| Elevated | #FFFFFF | 浮层、下拉菜单背景（同 primary，但有阴影） |

```css
page {
  --background-primary: #FFFFFF;
  --background-secondary: #F5F5F7;
  --background-tertiary: #FAFAFA;
  --background-elevated: #FFFFFF;
}
```

#### 边框/分隔线色阶

| 名称 | 色值 | 用途 |
|------|------|------|
| Default | #E8E8ED | 主要边框、分割线 |
| Light | #F2F2F7 | 浅边框、细分割线 |
| Dark | #D1D1D6 | 深边框、强调分割线 |

```css
page {
  --border-color: #E8E8ED;
  --border-light: #F2F2F7;
  --border-dark: #D1D1D6;
}
```

### 渐变色 (Gradients)

渐变用于需要视觉强调的特殊场景，如品牌区、活动Banner等。

| 名称 | 渐变方向 | 色值 | 用途 |
|------|----------|------|------|
| Primary | 135° | #2E7D32 → #66BB6A | 主按钮渐变、品牌区 |
| Success | 135° | #4CAF50 → #81C784 | 成功状态渐变 |
| Soft | 180° | #F1F8E9 → #FFFFFF | 柔和背景渐变 |
| Overlay | 0° | rgba(0,0,0,0.6) → transparent | 图片文字遮罩 |

```css
page {
  --gradient-primary: linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%);
  --gradient-success: linear-gradient(135deg, #4CAF50 0%, #81C784 100%);
  --gradient-soft: linear-gradient(180deg, #F1F8E9 0%, #FFFFFF 100%);
  --gradient-overlay: linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 100%);
}
```

### 色彩使用规范

**色彩比例**
- 主色调: 约 10%（强调区域）
- 中性色: 约 85%（文字、背景、边框）
- 语义色: 约 5%（状态提示）

**可访问性标准**
- 正文文字对比度 ≥ 4.5:1（WCAG AA）
- 大号文字（≥18px 或 ≥14px 加粗）对比度 ≥ 3:1
- 图标颜色与背景对比度 ≥ 3:1
- 不仅依赖颜色传达信息，需配合文字或图标

**深色模式预留**
- 所有颜色变量支持深色模式扩展
- 使用语义化命名而非具体色值命名
- 未来可通过 `prefers-color-scheme` 切换

---

## 字体系统

字体系统遵循清晰易读的原则，建立统一的字号层级和字重体系，确保信息传达的效率和美感。

### 字体栈

```css
page {
  --font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text',
    'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  --font-mono: 'SF Mono', 'Fira Code', 'Consolas', 'Courier New', monospace;
}
```

**字体说明**:
- **iOS**: SF Pro Display (标题) / SF Pro Text (正文) / PingFang SC (中文)
- **Android**: Roboto / 思源黑体 / 小米兰亭 / 华为黑体
- **微信小程序**: 使用系统字体，确保最佳性能和一致性

### 字号层级

字号采用模块化层级，从 12px 到 28px 分为 8 级，建立清晰的视觉层次。

| 级别 | 变量名 | 字号 | 行高 | 字重 | 用途 |
|------|--------|------|------|------|------|
| H1 | --font-size-h1 | 28px | 1.2 (34px) | 700 Bold | 页面大标题、重要数值 |
| H2 | --font-size-h2 | 22px | 1.25 (28px) | 600 Semibold | 页面标题、区块标题 |
| H3 | --font-size-h3 | 18px | 1.3 (24px) | 600 Semibold | 卡片标题、列表主标题 |
| XL | --font-size-xl | 18px | 1.4 (25px) | 500 Medium | 强调正文、按钮文字 |
| LG | --font-size-lg | 16px | 1.5 (24px) | 500 Medium | 次级标题、重要正文 |
| **MD** | **--font-size-md** | **14px** | **1.5 (21px)** | **400 Regular** | **正文基准、主要内容** |
| SM | --font-size-sm | 12px | 1.5 (18px) | 400 Regular | 辅助说明、标签、次要信息 |
| XS | --font-size-xs | 10px | 1.4 (14px) | 400 Regular | 角标、时间戳、极次要信息 |

```css
page {
  --font-size-h1: 28px;
  --font-size-h2: 22px;
  --font-size-h3: 18px;
  --font-size-xl: 18px;
  --font-size-lg: 16px;
  --font-size-md: 14px;
  --font-size-sm: 12px;
  --font-size-xs: 10px;
  --font-size-xxl: 24px;
}
```

### 字重体系

| 字重 | 变量名 | 数值 | 用途 |
|------|--------|------|------|
| Light | --font-weight-light | 300 | 超大号标题的细体、装饰性文字 |
| Regular | --font-weight-regular | 400 | 正文、辅助文字、标签 |
| Medium | --font-weight-medium | 500 | 按钮文字、次级标题、强调文字 |
| Semibold | --font-weight-semibold | 600 | 标题、重要文字、列表主项 |
| Bold | --font-weight-bold | 700 | 大标题、关键数值、强调文字 |

```css
page {
  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-normal: 400;
}
```

### 行高体系

| 类型 | 变量名 | 比例 | 用途 |
|------|--------|------|------|
| Tight | --line-height-tight | 1.2 | 大标题、单行文字 |
| Normal | --line-height-normal | 1.5 | 正文、多行文字 |
| Relaxed | --line-height-relaxed | 1.75 | 长文本、阅读型内容 |

```css
page {
  --line-height-tight: 1.2;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}
```

### 字间距

| 类型 | 变量名 | 数值 | 用途 |
|------|--------|------|------|
| Tight | --letter-spacing-tight | -0.5px | 大号标题 |
| Normal | --letter-spacing-normal | 0 | 正文、常规文字 |
| Wide | --letter-spacing-wide | 0.5px | 标签、小字号大写 |

```css
page {
  --letter-spacing-tight: -0.5px;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.5px;
}
```

### 字体使用规范

**层级构建**
- 通过字号、字重、颜色三者配合建立层级
- 重要内容: 大字号 + 中字重 + 主文字色
- 次要内容: 小字号 + 常规字重 + 次文字色
- 避免仅依赖颜色区分层级

**中文排版**
- 中英文混排时，英文与中文之间留一个空格
- 数字与中文之间留一个空格
- 标点符号使用全角中文标点
- 避免行首出现标点符号

**数字排版**
- 价格、数量等数字使用等宽数字特性（font-variant-numeric: tabular-nums）
- 金额整数部分加粗，小数部分保持常规字重
- 大数字使用千分位分隔符

---

## 间距系统

间距系统基于 4px 基准网格，确保界面元素的对齐一致性和视觉节奏感。

### 间距刻度

| 级别 | 变量名 | 数值 | 用途 |
|------|--------|------|------|
| 0 | --spacing-0 | 0px | 无边距 |
| XS | --spacing-xs | 4px | 图标与文字间距、极小空隙 |
| SM | --spacing-sm | 8px | 组件内部小间距、标签间距 |
| MD | --spacing-md | 12px | 组件内边距、卡片内边距 |
| LG | --spacing-lg | 16px | 组件间距、列表项间距 |
| XL | --spacing-xl | 20px | 区块内间距、内容区域边距 |
| XXL | --spacing-xxl | 24px | 区块间距、页面水平边距 |
| 3XL | --spacing-3xl | 32px | 大区块间距、页面上下间距 |
| 4XL | --spacing-4xl | 48px | 页面顶部/底部大间距 |
| 5XL | --spacing-5xl | 64px | 极端大间距、特殊场景 |

```css
page {
  --spacing-0: 0px;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 20px;
  --spacing-xxl: 24px;
  --spacing-3xl: 32px;
  --spacing-4xl: 48px;
  --spacing-5xl: 64px;
}
```

### 间距使用规范

**内边距模式**

| 组件类型 | 水平内边距 | 垂直内边距 |
|----------|-----------|-----------|
| 小按钮 | 12px | 6px |
| 中按钮 | 16px | 10px |
| 大按钮 | 20px | 14px |
| 输入框 | 12px | 10px |
| 卡片 | 16px | 16px |
| 列表项 | 16px | 12px |
| 页面内容 | 20px | - |

**外边距模式**

| 元素关系 | 间距 | 示例 |
|----------|------|------|
| 标题与正文 | 8px | 卡片标题与描述 |
| 正文与正文 | 12px | 段落之间 |
| 组件与组件 | 16px | 卡片之间、输入框之间 |
| 区块与区块 | 24px | 内容模块之间 |
| 页面顶/底部 | 32px | 页面首/末元素与边缘 |

**间距黄金法则**
- 优先使用预设间距值，避免随意数值
- 垂直间距大于水平间距（阅读流方向）
- 相关元素间距小，无关元素间距大
- 对称布局使用对称间距，非对称布局保持视觉平衡

---

## 圆角系统

圆角系统采用渐进式设计，元素越大圆角越大，营造柔和、友好的视觉感受。

### 圆角刻度

| 级别 | 变量名 | 数值 | 用途 |
|------|--------|------|------|
| None | --radius-none | 0px | 无圆角、直角元素 |
| SM | --radius-sm | 8px | 小按钮、标签、小图标 |
| **MD** | **--radius-md** | **12px** | **按钮、输入框、卡片（默认）** |
| LG | --radius-lg | 16px | 大卡片、弹窗、图片容器 |
| XL | --radius-xl | 24px | 大容器、底部弹窗、特殊组件 |
| Full | --radius-full | 9999px | 圆形按钮、头像、药丸标签 |

```css
page {
  --radius-none: 0px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
  
  --border-radius-sm: 8px;
  --border-radius-md: 12px;
  --border-radius-lg: 16px;
  --border-radius-xl: 24px;
}
```

### 圆角使用规范

**圆角与尺寸的关系**
- 元素尺寸越小，圆角越小
- 元素尺寸越大，圆角越大
- 保持圆角与元素尺寸的比例协调

**嵌套元素的圆角**
- 外层容器圆角 > 内层元素圆角
- 内层元素紧贴外层时，应减去边框/间距
- 例如：卡片圆角 16px，卡片内图片圆角 12px

**特殊场景**
- 全屏弹窗: 顶部圆角 24px，底部直角
- 底部操作栏: 顶部圆角 16px，底部直角
- 头像、徽章: 使用全圆角 (50%)

---

## 阴影系统

阴影系统用于创造深度感和层级关系，采用柔和的多层阴影设计。

### 阴影刻度

| 级别 | 变量名 | 值 | 用途 |
|------|--------|-----|------|
| None | --shadow-none | none | 无阴影 |
| **SM** | **--shadow-sm** | **0 1px 3px rgba(0, 0, 0, 0.05)** | **卡片、输入框、按钮（默认）** |
| MD | --shadow-md | 0 4px 12px rgba(0, 0, 0, 0.08) | 悬浮卡片、下拉菜单 |
| LG | --shadow-lg | 0 12px 32px rgba(0, 0, 0, 0.1) | 弹窗、浮层、底部抽屉 |
| XL | --shadow-xl | 0 20px 48px rgba(0, 0, 0, 0.12) | 模态框、全屏弹窗 |

```css
page {
  --shadow-none: none;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 48px rgba(0, 0, 0, 0.12);
}
```

### 阴影使用规范

**阴影与层级**
- 层级越高，阴影越大越深
- 卡片使用 sm 阴影
- 悬浮元素使用 md 阴影
- 弹窗浮层使用 lg 阴影

**阴影动画**
- 悬停/激活态阴影变化应有过渡
- 过渡时长与主过渡时长一致
- 阴影变化配合轻微位移，增强立体感

**注意事项**
- 避免在小元素上使用大阴影
- 深色模式下阴影透明度适当降低
- 性能敏感的列表项避免使用阴影（可用边框替代）

---

## 图标系统

图标采用线性风格，保持简洁、清晰、一致的视觉语言。

### 图标风格

- **风格**: 线性图标 (Outline)
- **线条粗细**: 1.5px (24px 基准)
- **圆角**: 圆角端点 (Round Cap)、圆角连接 (Round Join)
- **网格**: 24×24px 基准网格，内边距 2px
- **视觉重量**: 保持一致，不因形状不同而失衡

### 图标尺寸

| 尺寸 | 变量名 | 数值 | 用途 |
|------|--------|------|------|
| XS | --icon-size-xs | 16px | 小标签、角标旁 |
| SM | --icon-size-sm | 20px | 列表项、按钮内图标 |
| **MD** | **--icon-size-md** | **24px** | **导航栏、工具栏、默认尺寸** |
| LG | --icon-size-lg | 32px | 空状态、大按钮 |
| XL | --icon-size-xl | 48px | 插画式图标、特殊展示 |

```css
page {
  --icon-size-xs: 16px;
  --icon-size-sm: 20px;
  --icon-size-md: 24px;
  --icon-size-lg: 32px;
  --icon-size-xl: 48px;
}
```

### 图标颜色规范

| 状态 | 颜色 | 场景 |
|------|------|------|
| Default | --text-primary | 默认图标、主要功能图标 |
| Secondary | --text-secondary | 次要功能、辅助图标 |
| Tertiary | --text-tertiary | 禁用态、占位图标 |
| Primary | --primary-color | 激活态、选中态、强调图标 |
| Inverse | --text-inverse | 深色背景上的图标 |

### 图标来源与使用

**推荐来源**
- 微信小程序原生图标组件
- IconPark (字节跳动开源图标库)
- Phosphor Icons (精致线性图标)
- 自定义 SVG 图标（需符合设计规范）

**使用规范**
- 图标与文字并排时，垂直居中对齐
- 图标与文字间距: 4-8px
- 可点击图标尺寸不小于 24×24px (热区 44×44px)
- 状态变化应有过渡动画

---

## 动效系统

动效系统遵循自然、流畅、克制的原则，为用户提供愉悦的交互反馈。

### 缓动函数

| 名称 | 变量名 | 值 | 用途 |
|------|--------|-----|------|
| Ease In | --ease-in | cubic-bezier(0.4, 0, 1, 1) | 元素消失、退出动画 |
| Ease Out | --ease-out | cubic-bezier(0, 0, 0.2, 1) | 元素出现、进入动画 |
| **Ease In Out** | **--ease-in-out** | **cubic-bezier(0.4, 0, 0.2, 1)** | **标准过渡、状态切换** |
| Ease Out Back | --ease-out-back | cubic-bezier(0.34, 1.56, 0.64, 1) | 弹性出现、强调动画 |
| Linear | --ease-linear | linear | 匀速动画、旋转动画 |

```css
page {
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-linear: linear;
}
```

### 时长分级

| 级别 | 变量名 | 时长 | 用途 |
|------|--------|------|------|
| Fast | --duration-fast | 150ms | 微交互、按钮反馈、颜色变化 |
| **Normal** | **--duration-normal** | **300ms** | **标准过渡、页面切换、组件动画** |
| Slow | --duration-slow | 500ms | 大型动画、弹窗进出、页面转场 |
| Slower | --duration-slower | 800ms | 骨架屏渐变、特殊展示动画 |

```css
page {
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --duration-slower: 800ms;
  
  --transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 过渡类型

**1. 淡入淡出 (Fade)**
- 用于: 模态框遮罩、提示条、状态切换
- 时长: 150-300ms
- 缓动: ease-in-out

**2. 滑入滑出 (Slide)**
- 向上滑入: 底部弹窗、抽屉
- 向下滑入: 下拉菜单、通知
- 向左/右滑入: 页面切换、轮播
- 时长: 300ms
- 缓动: ease-out

**3. 缩放 (Scale)**
- 用于: 按钮点击反馈、图标状态切换
- 缩放比例: 0.95-1.05
- 时长: 150ms
- 缓动: ease-in-out

**4. 位移 (Translate)**
- 用于: 列表项移动、元素位置变化
- 配合淡入淡出使用
- 时长: 300ms
- 缓动: ease-out

### 动效设计原则

**克制原则**
- 动效服务于功能，不为动效而动效
- 避免过度动画干扰用户注意力
- 长列表、频繁触发的元素慎用复杂动画

**性能原则**
- 优先使用 transform 和 opacity 属性
- 避免触发重排 (reflow) 的属性动画
- 列表项动画使用 will-change 优化

**可访问性**
- 尊重用户的"减少动效"偏好
- 重要信息不依赖动效传达
- 动画时长适中，不造成等待焦虑

---

## 组件库规范

组件库是设计系统的核心载体，确保界面元素的一致性和可复用性。

### 基础组件

#### Button 按钮

按钮是最基础的交互组件，用于触发操作。

**按钮类型**

| 类型 | 样式 | 适用场景 |
|------|------|----------|
| Primary | 主色背景 + 白色文字 | 主要操作、确认、提交 |
| Secondary | 浅灰背景 + 主文字色 | 次要操作、取消、返回 |
| Outline | 透明背景 + 主色边框 + 主色文字 | 次要强调、选择操作 |
| Ghost | 透明背景 + 文字色 | 辅助操作、更多、查看详情 |
| Danger | 红色背景 + 白色文字 | 危险操作、删除、退出 |
| Link | 纯文字 | 文字链接、跳转操作 |

**按钮尺寸**

| 尺寸 | 高度 | 内边距 | 字号 | 圆角 |
|------|------|--------|------|------|
| SM | 28px | 水平 12px | 12px | 8px |
| **MD** | **40px** | **水平 16px** | **14px** | **12px** |
| LG | 48px | 水平 20px | 16px | 12px |
| Block | 48px | 水平 20px | 16px | 12px |

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: 10px 16px;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  border: none;
  outline: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
}

.btn-primary {
  background-color: var(--primary-color);
  color: #FFFFFF;
}

.btn-primary:active {
  background-color: var(--primary-dark);
  transform: scale(0.98);
}

.btn-primary:disabled {
  background-color: var(--primary-light);
  color: var(--text-tertiary);
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background-color: var(--background-tertiary);
  color: var(--text-primary);
}

.btn-secondary:active {
  background-color: var(--border-light);
  transform: scale(0.98);
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}

.btn-outline:active {
  background-color: var(--primary-light);
}

.btn-ghost {
  background-color: transparent;
  color: var(--primary-color);
}

.btn-ghost:active {
  background-color: var(--primary-light);
}

.btn-danger {
  background-color: var(--error-color);
  color: #FFFFFF;
}

.btn-danger:active {
  background-color: var(--error-600);
  transform: scale(0.98);
}

.btn-sm {
  height: 28px;
  padding: 0 12px;
  font-size: var(--font-size-sm);
  border-radius: var(--border-radius-sm);
}

.btn-lg {
  height: 48px;
  padding: 0 20px;
  font-size: var(--font-size-lg);
}

.btn-block {
  width: 100%;
  height: 48px;
  font-size: var(--font-size-lg);
}
```

**使用规范**
- 一个操作区域内主按钮不超过 1 个
- 按钮高度与输入框保持一致
- 禁用状态不响应点击，视觉上弱化
- 加载状态显示加载图标，文字可改为"加载中"

#### Input 输入框

输入框用于接收用户文本输入。

**输入框类型**

| 类型 | 样式 | 适用场景 |
|------|------|----------|
| Default | 边框 + 白色背景 | 表单输入、搜索 |
| Filled | 填充背景 + 无边框 | 登录表单、深色背景 |
| Underline | 底部边框 | 极简风格、设置项 |

**输入框状态**

| 状态 | 边框色 | 背景色 |
|------|--------|--------|
| Default | --border-color | --background-primary |
| Focus | --primary-color | --background-primary |
| Hover | --border-dark | --background-primary |
| Disabled | --border-light | --background-tertiary |
| Error | --error-color | --background-primary |

```css
.input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  color: var(--text-primary);
  background-color: var(--background-primary);
  outline: none;
  transition: all var(--transition-fast);
  box-sizing: border-box;
}

.input::placeholder {
  color: var(--text-tertiary);
}

.input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-50);
}

.input:disabled {
  background-color: var(--background-tertiary);
  color: var(--text-tertiary);
  cursor: not-allowed;
}

.input-error {
  border-color: var(--error-color);
}

.input-error:focus {
  box-shadow: 0 0 0 3px var(--error-50);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper .input {
  flex: 1;
  border: none;
  box-shadow: none;
}

.input-icon {
  width: var(--icon-size-sm);
  height: var(--icon-size-sm);
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.input-icon-left {
  margin-right: var(--spacing-sm);
}

.input-icon-right {
  margin-left: var(--spacing-sm);
}
```

**使用规范**
- 输入框高度与按钮高度一致 (40px md)
- 标签文字放在输入框上方，间距 8px
- 必填项标签后加红色星号 *
- 错误提示放在输入框下方，间距 4px，使用错误色 12px 文字
- 帮助文字放在输入框下方，使用次文字色 12px

#### Badge 徽章

徽章用于标记状态、数量或提示。

**徽章类型**

| 类型 | 样式 | 适用场景 |
|------|------|----------|
| Dot | 小圆点 | 消息提示、新内容标记 |
| Number | 圆形 + 数字 | 消息数量、购物车数量 |
| Text | 圆角矩形 + 文字 | 状态标签、分类标记 |

**徽章尺寸**

| 尺寸 | 大小 | 字号 | 适用场景 |
|------|------|------|----------|
| SM | 16px | 10px | 紧凑布局、小图标旁 |
| **MD** | **20px** | **12px** | **默认尺寸、列表项** |
| LG | 24px | 12px | 突出显示、导航栏 |

```css
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  color: #FFFFFF;
  box-sizing: border-box;
}

.badge-primary {
  background-color: var(--primary-color);
}

.badge-success {
  background-color: var(--success-color);
}

.badge-warning {
  background-color: var(--warning-color);
}

.badge-error {
  background-color: var(--error-color);
}

.badge-info {
  background-color: var(--info-color);
}

.badge-dot {
  width: 8px;
  height: 8px;
  min-width: 8px;
  padding: 0;
  border-radius: 50%;
}

.badge-sm {
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  font-size: 10px;
  border-radius: 8px;
}

.badge-lg {
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  font-size: var(--font-size-sm);
  border-radius: 12px;
}
```

#### Tag 标签

标签用于分类、标记属性或筛选条件。

**标签类型**

| 类型 | 样式 | 适用场景 |
|------|------|----------|
| Filled | 填充背景 + 白色文字 | 主要分类、选中状态 |
| Light | 浅色背景 + 深色文字 | 次要分类、普通标签 |
| Outline | 透明背景 + 边框 | 可选择标签、筛选条件 |

```css
.tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 10px;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  line-height: 1;
  box-sizing: border-box;
}

.tag-filled {
  background-color: var(--primary-color);
  color: #FFFFFF;
}

.tag-light {
  background-color: var(--primary-light);
  color: var(--primary-color);
}

.tag-outline {
  background-color: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.tag-outline-active {
  border-color: var(--primary-color);
  color: var(--primary-color);
}
```

#### Avatar 头像

头像用于展示用户或实体形象。

**头像尺寸**

| 尺寸 | 大小 | 适用场景 |
|------|------|----------|
| SM | 32px | 评论、列表项 |
| **MD** | **40px** | **导航栏、列表项（默认）** |
| LG | 56px | 用户中心、个人主页 |
| XL | 80px | 个人资料页、大展示 |

```css
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--background-tertiary);
  flex-shrink: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.avatar-sm { width: 32px; height: 32px; }
.avatar-lg { width: 56px; height: 56px; }
.avatar-xl { width: 80px; height: 80px; }
```

#### Divider 分割线

分割线用于分隔内容区块或列表项。

**分割线类型**

| 类型 | 样式 | 适用场景 |
|------|------|----------|
| Horizontal | 水平线 | 列表项分隔、区块分隔 |
| Vertical | 垂直线 | 水平排列元素分隔 |
| Dashed | 虚线 | 次要分隔、占位区分 |

```css
.divider {
  height: 1px;
  background-color: var(--border-light);
  margin: var(--spacing-md) 0;
}

.divider-dashed {
  background: none;
  border-top: 1px dashed var(--border-color);
}

.divider-vertical {
  width: 1px;
  height: auto;
  align-self: stretch;
  margin: 0 var(--spacing-md);
}

.divider-with-text {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

.divider-with-text::before,
.divider-with-text::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: var(--border-light);
}
```

---

### 复合组件

#### Card 卡片

卡片是承载内容的容器组件，用于将相关信息组织在一起。

**卡片类型**

| 类型 | 样式 | 适用场景 |
|------|------|----------|
| Elevated | 带阴影 + 圆角 | 商品卡片、内容卡片（默认） |
| Outlined | 边框 + 无阴影 | 次要内容、分组容器 |
| Filled | 填充背景 | 信息块、提示卡片 |

```css
.card {
  background-color: var(--background-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
  overflow: hidden;
}

.card-outlined {
  box-shadow: none;
  border: 1px solid var(--border-color);
}

.card-filled {
  box-shadow: none;
  background-color: var(--background-tertiary);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.card-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: 2px;
}

.card-content {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-light);
}

.card-hover:active {
  transform: scale(0.98);
  transition: transform var(--transition-fast);
}
```

**使用规范**
- 卡片间距: 16px (同组), 24px (不同组)
- 卡片内边距: 16px (标准), 20px (大卡片)
- 卡片圆角: 16px (标准), 12px (小卡片)
- 卡片内的图片圆角: 12px

#### List 列表

列表用于展示多项同类信息。

**列表类型**

| 类型 | 样式 | 适用场景 |
|------|------|----------|
| Basic | 文字 + 箭头 | 导航列表、设置项 |
| Thumbnail | 图片 + 文字 | 商品列表、搜索结果 |
| Rich | 多元素复杂布局 | 订单列表、消息列表 |

```css
.list {
  background-color: var(--background-primary);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
}

.list-item {
  display: flex;
  align-items: center;
  min-height: 52px;
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--background-primary);
  transition: background-color var(--transition-fast);
  position: relative;
}

.list-item:active {
  background-color: var(--background-tertiary);
}

.list-item + .list-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: var(--spacing-lg);
  right: 0;
  height: 1px;
  background-color: var(--border-light);
}

.list-item-thumbnail {
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius-md);
  margin-right: var(--spacing-md);
  object-fit: cover;
  flex-shrink: 0;
}

.list-item-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.list-item-title {
  font-size: var(--font-size-md);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-item-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-item-extra {
  margin-left: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.list-item-arrow {
  width: 16px;
  height: 16px;
  margin-left: var(--spacing-sm);
  color: var(--text-tertiary);
  flex-shrink: 0;
}
```

#### NavBar 导航栏

导航栏是页面顶部的标题栏，承载页面标题和核心操作。

```css
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 var(--spacing-md);
  background-color: var(--background-primary);
  position: relative;
}

.navbar-title {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.navbar-left,
.navbar-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 80px;
  z-index: 1;
}

.navbar-right {
  justify-content: flex-end;
}

.navbar-back {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-sm);
}

.navbar-back:active {
  background-color: var(--background-tertiary);
}
```

#### TabBar 标签栏

底部标签栏用于页面间的主导航切换。

```css
.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background-color: var(--background-primary);
  border-top: 1px solid var(--border-light);
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 100;
}

.tabbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 0;
  gap: 2px;
  transition: all var(--transition-fast);
}

.tabbar-icon {
  width: 24px;
  height: 24px;
  color: var(--text-tertiary);
  transition: color var(--transition-fast);
}

.tabbar-label {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  transition: color var(--transition-fast);
}

.tabbar-item.active .tabbar-icon,
.tabbar-item.active .tabbar-label {
  color: var(--primary-color);
}

.tabbar-item:active {
  opacity: 0.7;
}
```

#### SearchBar 搜索栏

搜索栏用于输入搜索关键词。

```css
.search-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--background-primary);
}

.search-bar-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 12px;
  background-color: var(--background-secondary);
  border-radius: var(--border-radius-md);
  gap: var(--spacing-sm);
  transition: all var(--transition-fast);
}

.search-bar-input {
  flex: 1;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--font-size-md);
  color: var(--text-primary);
}

.search-bar-input::placeholder {
  color: var(--text-tertiary);
}

.search-bar-icon {
  width: 18px;
  height: 18px;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.search-bar-cancel {
  font-size: var(--font-size-md);
  color: var(--primary-color);
  padding: 0 4px;
  white-space: nowrap;
}
```

#### EmptyState 空状态

空状态用于无数据时的展示和引导。

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-5xl) var(--spacing-xxl);
  text-align: center;
}

.empty-state-icon {
  width: 100px;
  height: 100px;
  margin-bottom: var(--spacing-lg);
  color: var(--text-quaternary);
}

.empty-state-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.empty-state-description {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  line-height: var(--line-height-normal);
  max-width: 280px;
}

.empty-state-action {
  margin-top: var(--spacing-lg);
}
```

---

### 业务组件

#### ProductCard 商品卡片

商品卡片是电商核心组件，用于展示商品信息。

**布局类型**
- 横向布局: 列表视图，图片在左，内容在右
- 纵向布局: 网格视图，图片在上，内容在下

```wxml
<!-- 纵向布局商品卡片 -->
<view class="product-card">
  <view class="product-card-image-wrapper">
    <image class="product-card-image" src="{{product.image}}" mode="aspectFill" />
    <view class="product-card-tag" wx:if="{{product.tag}}">{{product.tag}}</view>
  </view>
  <view class="product-card-content">
    <view class="product-card-name">{{product.name}}</view>
    <view class="product-card-desc" wx:if="{{product.desc}}">{{product.desc}}</view>
    <view class="product-card-footer">
      <view class="product-card-price">
        <text class="product-card-price-symbol">¥</text>
        <text class="product-card-price-value">{{product.price}}</text>
      </view>
      <view class="product-card-sales" wx:if="{{product.sales}}">
        已售 {{product.sales}}
      </view>
    </view>
  </view>
</view>
```

```css
.product-card {
  background-color: var(--background-primary);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.product-card-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 100%;
  background-color: var(--background-tertiary);
}

.product-card-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-card-tag {
  position: absolute;
  top: var(--spacing-sm);
  left: var(--spacing-sm);
  height: 20px;
  padding: 0 8px;
  background-color: var(--error-color);
  color: #FFFFFF;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
}

.product-card-content {
  padding: var(--spacing-md);
}

.product-card-name {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  line-height: var(--line-height-tight);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 40px;
}

.product-card-desc {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin-top: var(--spacing-xs);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-card-footer {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: var(--spacing-sm);
}

.product-card-price {
  display: flex;
  align-items: baseline;
  color: var(--error-color);
}

.product-card-price-symbol {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.product-card-price-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin-left: 1px;
}

.product-card-sales {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}
```

#### OrderCard 订单卡片

订单卡片用于展示订单信息和操作入口。

```css
.order-card {
  background-color: var(--background-primary);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-md);
}

.order-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
}

.order-card-order-no {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.order-card-status {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.order-card-status-pending { color: var(--warning-color); }
.order-card-status-shipping { color: var(--info-color); }
.order-card-status-completed { color: var(--success-color); }
.order-card-status-cancelled { color: var(--text-tertiary); }

.order-card-items {
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  gap: var(--spacing-sm);
}

.order-card-item-image {
  width: 64px;
  height: 64px;
  border-radius: var(--border-radius-md);
  object-fit: cover;
  background-color: var(--background-tertiary);
}

.order-card-item-more {
  width: 64px;
  height: 64px;
  border-radius: var(--border-radius-md);
  background-color: var(--background-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.order-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--border-light);
}

.order-card-total {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.order-card-total-price {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-left: var(--spacing-xs);
}

.order-card-actions {
  display: flex;
  gap: var(--spacing-sm);
}
```

#### AddressCard 地址卡片

地址卡片用于展示收货地址信息。

```css
.address-card {
  background-color: var(--background-primary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.address-card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.address-card-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.address-card-phone {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
}

.address-card-tag {
  margin-left: auto;
  height: 20px;
  padding: 0 8px;
  background-color: var(--primary-light);
  color: var(--primary-color);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
}

.address-card-detail {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
}

.address-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-light);
}

.address-card-default {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.address-card-actions {
  display: flex;
  gap: var(--spacing-lg);
}

.address-card-action {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}
```

#### Price 价格组件

价格组件用于统一展示商品价格。

```css
.price {
  display: inline-flex;
  align-items: baseline;
  color: var(--error-color);
}

.price-symbol {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.price-integer {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
}

.price-decimal {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.price-original {
  margin-left: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  text-decoration: line-through;
}

.price-large .price-symbol {
  font-size: var(--font-size-lg);
}

.price-large .price-integer {
  font-size: var(--font-size-h1);
}

.price-large .price-decimal {
  font-size: var(--font-size-lg);
}

.price-small .price-symbol {
  font-size: var(--font-size-xs);
}

.price-small .price-integer {
  font-size: var(--font-size-md);
}

.price-small .price-decimal {
  font-size: var(--font-size-xs);
}
```

---

## 交互标准

交互标准定义了产品的基本交互模式和反馈机制，确保用户体验的一致性和可预测性。

### 导航模式

#### 页面层级

小程序采用三级导航结构：

**一级导航 - TabBar**
- 3-5 个主要页面
- 底部固定位置
- 切换时页面不销毁，状态保留
- 示例: 首页、分类、购物车、我的

**二级导航 - 页面跳转**
- 从 TabBar 页面进入的详情页、列表页
- 左滑返回或点击返回按钮
- 页面栈深度建议不超过 5 层

**三级导航 - 浮层/弹窗**
- 筛选、选择、确认等操作
- 不增加页面栈深度
- 点击遮罩或关闭按钮退出

#### 导航返回

**返回方式**
- 导航栏左侧返回按钮 (主要方式)
- 左滑手势 (iOS 标准交互)
- 操作完成后自动返回

**返回时机**
- 返回上一页: 常规返回
- 返回首页: 多层级后的快捷返回
- 返回指定页: 特定流程完成后

### 反馈机制

#### Toast 轻提示

用于展示简短的操作反馈，2-3 秒后自动消失。

**适用场景**
- 操作成功提示 (如: 添加成功、已收藏)
- 操作失败提示 (如: 网络错误)
- 信息提示 (如: 已复制、无更多数据)

**设计规范**
- 位置: 屏幕中央偏上
- 时长: 成功/信息 2s，错误 3s
- 样式: 深色半透明背景 + 白色文字 + 图标
- 圆角: 12px
- 最小宽度: 120px，最大宽度: 80% 屏幕宽

```
┌─────────────────────┐
│      ✓ 操作成功       │
└─────────────────────┘
```

#### Modal 模态框

用于需要用户确认或输入的重要操作。

**适用场景**
- 危险操作确认 (如: 删除、退出登录)
- 重要信息确认 (如: 提交订单)
- 简单表单输入 (如: 输入昵称)

**设计规范**
- 位置: 屏幕中央
- 宽度: 80% 屏幕宽，最大 320px
- 圆角: 16px
- 按钮: 水平排列 2 个按钮，或垂直排列多个
- 遮罩: 50% 黑色半透明

**按钮排布**
- 确认操作: 右侧主色按钮，左侧浅色按钮
- 危险操作: 右侧红色按钮，左侧浅色按钮
- 按钮高度: 44px

#### Loading 加载状态

用于数据加载过程中的等待提示。

**类型**

| 类型 | 适用场景 | 样式 |
|------|----------|------|
| 全屏加载 | 页面初始加载 | 居中加载图标 + 文字 |
| 局部加载 | 组件内加载 | 小尺寸加载图标 |
| 下拉刷新 | 列表顶部刷新 | 系统样式或自定义 |
| 上拉加载 | 列表底部加载 | 加载图标 + "加载中" |
| 骨架屏 | 内容加载预览 | 灰色占位块 + 渐变动画 |

**设计规范**
- 加载图标: 圆形旋转动画
- 主色调: --primary-color
- 尺寸: 24px (小), 32px (中), 48px (大)
- 加载文字: 12px，次文字色

### 错误状态

#### 网络错误

**表现形式**
- 全屏错误页 (页面加载失败)
- Toast 提示 (操作失败)
- 错误占位图 (局部加载失败)

**设计规范**
- 图标: 网络错误图标
- 标题: "网络连接失败"
- 描述: "请检查网络设置后重试"
- 操作: "重新加载" 按钮

#### 服务器错误

**表现形式**
- 5xx 错误页
- Toast 提示 "服务器繁忙，请稍后再试"

#### 表单错误

**表现形式**
- 输入框边框变红
- 下方显示错误提示文字
- 提交按钮置灰或点击时提示

**错误文字规范**
- 简洁明确，说明问题
- 提供解决方案或下一步操作
- 避免技术性词汇

### 空状态

#### 空状态分类

| 类型 | 场景 | 引导动作 |
|------|------|----------|
| 内容为空 | 暂无订单、暂无收藏 | 去逛逛、去添加 |
| 搜索无结果 | 搜索关键词无匹配 | 修改关键词、推荐热门 |
| 筛选无结果 | 筛选条件太严格 | 重置筛选、放宽条件 |
| 列表到底 | 已加载全部内容 | 返回顶部 |

#### 空状态设计

- 插图: 简约线条风格，与主题相关
- 标题: 16px 中字重，主文字色
- 描述: 12px，次文字色
- 操作按钮: 可选，主按钮或边框按钮
- 间距: 插图与标题 24px，标题与描述 8px，描述与按钮 24px

### 加载状态

#### 加载类型

| 类型 | 触发时机 | 消失时机 |
|------|----------|----------|
| 首次加载 | 进入页面 | 数据加载完成 |
| 下拉刷新 | 下拉手势 | 刷新完成 |
| 上拉加载 | 滚动到底部 | 加载完成 |
| 操作加载 | 点击按钮 | 操作完成 |

#### 骨架屏规范

- 形状: 圆角矩形，与真实内容形状对应
- 颜色: 浅灰背景 (--background-tertiary)
- 动画: 从左到右的渐变高光动画
- 时长: 1.5s 循环
- 首次加载使用骨架屏，后续加载使用 Loading

---

## 布局规范

### 页面结构

标准页面从上到下依次为：

```
┌───────────────────────┐
│      状态栏 (系统)      │
├───────────────────────┤
│      导航栏 NavBar     │
├───────────────────────┤
│                       │
│                       │
│      内容区域          │
│                       │
│                       │
├───────────────────────┤
│   标签栏 TabBar (可选)  │
│   + 安全区域           │
└───────────────────────┘
```

### 安全区域适配

**顶部安全区域**
- 状态栏高度: 20px (非全面屏) / 44px (全面屏)
- 导航栏高度: 44px
- 使用 `env(safe-area-inset-top)` 适配

**底部安全区域**
- TabBar 高度: 50px
- 底部安全区域: 0px (非全面屏) / 34px (全面屏)
- 使用 `env(safe-area-inset-bottom)` 适配

```css
.safe-area-top {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
```

### 内容区域边距

- 页面左右边距: 20px
- 内容区块上下间距: 24px
- 卡片之间间距: 16px

### 栅格系统

双列网格布局用于商品列表等场景：

```css
.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 0 16px;
}
```

- 列间距: 12px
- 行间距: 12px
- 左右边距: 16px
- 卡片宽度自适应

---

## 版本历史

| 版本 | 更新日期 | 更新内容 | 作者 |
|------|----------|----------|------|
| 3.0.0 | 2026-07-06 | 设计系统全面升级，参考 Apple HIG 与 shadcn/ui 理念，新增完整色阶、字重体系、动效系统，重构组件规范 | Sut |
| 2.0.0 | 2026-03-15 | 优化色彩系统，更新组件样式，新增业务组件规范 | Sut |
| 1.0.0 | 2025-12-27 | 初始版本，完成 UI 设计规范文档 | Sut |
