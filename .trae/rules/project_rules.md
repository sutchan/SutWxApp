# SutWxApp 项目规则

## 1. 项目说明

- **名称**: 苏铁微信小程序 (SutWxApp)
- **仓库**: https://github.com/sutchan
- **默认署名**: Sut

## 2. 文件结构

```
SutWxApp/
├── app.js/.json/.wxss      # 入口和全局配置
├── assets/images/           # 第三方图片资源
├── components/              # 自定义组件
├── images/                  # 图片文件
├── pages/                   # 页面文件
├── services/                # 服务层
├── tests/                   # 测试文件
├── utils/                   # 工具类
└── docs/                    # 项目文档
```

## 3. 代码规范

### 3.1 代码风格

- 缩进: 2 空格
- 行宽: 100 字符
- 末尾空行
- 使用 `const`/`let`，避免 `var`

### 3.2 命名规则

| 类型 | 规则 | 示例 |
|------|------|------|
| 文件/变量/函数 | 小驼峰 | `userInfo`, `getUserInfo` |
| 类/构造函数 | 大驼峰 | `UserManager` |
| 常量 | 全大写下划线 | `MAX_RETRY_COUNT` |
| 测试文件 | `[模块名].test.js` | `userService.test.js` |

### 3.3 注释规范

- 每个函数必须添加注释
- 注释使用中文
- 文件头部添加说明注释

## 4. 多语言支持

- 文件: `sut-wechat-mini-{locale}.po`, `sut-wechat-mini.pot`
- 规则: 用户界面字符串必须添加到 `.pot` 文件

## 5. 构建和部署

1. 清理缓存文件
2. 执行代码检查和测试：`bun run test`
3. 构建项目：`bun run build`
4. 部署到目标环境
5. 记录版本历史

## 6. 开发规则

- 代码提交前必须审查
- 空闲 60 分钟自动清理缓存
- 自动修复代码问题

## 7. 安全规范

**禁止命令**: `groupadd`, `groupdel`, `killall`, `mount`, `passwd`, `reboot`, `shutdown`, `su`, `useradd` 等

**敏感信息**: 必须通过环境变量或配置文件管理，禁止硬编码

## 8. 测试规范

- 为每个主要功能模块编写单元测试
- 测试文件存放在 `tests/` 目录

## 9. 性能优化

- 图片使用适当格式和大小
- 使用 `lazy-image` 组件实现懒加载
- 避免不必要的网络请求
- 合理使用缓存策略

## 10. AI 辅助规则

- 优先使用 Gemini 模型
- 模型调用达上限时自动输入"继续"
- 输出过长时自动点击"继续"
- 空闲 1 分钟继续开发未完善代码
- 空闲 10 分钟自动开始修复问题
