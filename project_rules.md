# SutWxApp 微信小程序项目规范
## 1. 项目说明

- **项目名称**: 速特微信小程序 (SutWxApp)
- **项目仓库**: https://github.com/sutchan
- **默认署名**: Sut
- **开发环境**: Windows

## 2. 文件结构规范

### 2.1 主目录结构
```
SutWxApp/
├── app.js              # 小程序入口文件
├── app.json            # 全局配置
├── app.wxss            # 全局样式
├── assets/             # 公共资源
│   └── images/         # 图片资源
├── components/         # 自定义组件
├── images/             # 图片文件
├── pages/              # 页面文件
│   ├── article/        # 文章相关页面
│   ├── user/           # 用户相关页面
│   └── ...             # 其他功能模块页面
├── services/           # 服务层
├── tests/              # 测试文件
├── utils/              # 工具类
└── docs/               # 项目文档
```

### 2.2 特殊目录用途
- **docs/**: 存放项目文档
- **build/**: 多平台构建源代码
- **dist/**: 构建产物
- **tests/**: 测试代码
- **.trae/**: Trae AI 配置

## 3. 代码规范

### 3.1 代码风格

- 使用 2 个空格进行缩进
- 每行代码不超过 100 个字符
- 文件末尾添加空行
- 使用 `const` 和 `let`，避免使用 `var`
- 函数命名使用小驼峰命名法
- 类和构造函数使用大驼峰命名法
- 常量使用全大写字母，单字间用下划线分隔

### 3.2 注释规范

- 每个函数必须添加函数级注释
- 注释使用中文
- 复杂逻辑添加行内注释
- 文件顶部添加文件说明注释

```javascript
/**
 * 文件名: project_rules.md
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 获取用户积分任务列表
 * @param {Object} options - 查询参数
 * @param {string} options.type - 任务类型: all/once/daily/weekly/monthly
 * @param {string} options.status - 任务状态: all/pending/completed/unclaimed
 * @param {number} options.page - 页码，默认为1
 * @param {number} options.pageSize - 每页数量，默认为20
 * @returns {Promise<Object>} 任务列表和分页信息
 */
async function getPointsTasks(options = {}) {
  // 实现逻辑
}
```

## 4. 命名规范

### 4.1 文件命名

- 页面文件: 使用小驼峰命名法，如 `pointsTasks.js`
- 组件文件: 使用小驼峰命名法，如 `lazyImage.js`
- 服务文件: 使用小驼峰命名法，如 `userService.js`
- 测试文件: 使用小驼峰命名法，后缀为 `.test.js`，如 `pointsTasks.test.js`

### 4.2 变量和函数命名
- 变量名: 使用小驼峰命名法，如 `userInfo`
- 函数名: 使用小驼峰命名法，如 `getUserInfo`
- 类名: 使用大驼峰命名法，如 `UserManager`
- 常量: 使用全大写字母，单字间用下划线分隔，如 `MAX_RETRY_COUNT`

## 5. 多语言支持

### 5.1 本地化文件
- 英文文件: `sut-wechat-mini-en_US.po`
- 中文文件: `sut-wechat-mini-zh_CN.po`
- 模板文件: `sut-wechat-mini.pot`

### 5.2 字符串处理
- 所有用户界面字符串必须添加到 `.pot` 文件中
- 同时修改 `.pot` 和 `.po` 的字符串，确保多语言字符串一致
- 只在 PHP/JS 文件中加入字符串，排除 `.md` `.txt` 等非代码文件

## 6. 构建和部署
### 6.1 版本管理

- 所有代码文件自动同步版本号
- 每次构建项目时，先清理工作区缓存文件
- 每次构建默认升级最小版本号，并写入版本历史文档
- 每天自动同步工作区文件版本号

### 6.2 构建流程

1. 清理工作区缓存文件
2. 执行代码检查和测试
3. 构建项目
4. 部署到目标环境

## 7. 开发规范
### 7.1 代码审查

- 所有代码提交前必须进行代码审查
- 出现文件待审查请求时，自动全部接受审查请求

### 7.2 缓存管理

- 空闲60分钟则自动开始清理冗余文件和缓存文件
- 使用 `cache-service.js` 管理应用内缓存

### 7.3 自动修复

- 自动修复发现的代码问题
- 自动检查语法及闭合标签

## 8. 安全规范

### 8.1 禁止使用的命令
- 禁止使用以下命令：`groupadd`, `groupdel`, `groupmod`, `ifdown`, `ifup`, `killall`, `lvremove`, `mount`, `passwd`, `pkill`, `pvremove`, `reboot`, `route`, `service`, `shutdown`, `su`, `sysctl`, `systemctl`, `umount`, `useradd`, `userdel`, `usermod`, `vgremove`

### 8.2 敏感信息保护

- 不得在代码中硬编码敏感信息
- API 密钥和认证信息必须通过环境变量或配置文件管理

## 9. 测试规范

- 为每个主要功能模块编写单元测试
- 测试文件存放在 `tests/` 目录中

## 10. 性能优化

- 图片资源使用适当的格式和大小
- 使用 `lazy-image` 组件实现图片懒加载
- 避免不必要的网络请求
- 合理使用缓存机制

## 11. 其他规范

- 优先使用 Gemini 模型，如果 Gemini 模型不可用再切换到自动模式
- 模型思考次数达到上限时，自动输入“继续”并回车
- 输出过长时，自动点击“继续”获取完整输出
- 折叠思考过程，只显示最终结果
- 空闲1分钟则参考项目文档，继续开发未完善的代码
- 空闲10分钟则自动开始修复问题
- 空闲60分钟则自动开始清理冗余文件和缓存文件
- 版本号采用语义化版本规范（SemVer）：MAJOR.MINOR.PATCH，其中 MAJOR 用于不兼容的破坏性变更，MINOR 用于向下兼容的新功能，PATCH 用于向下兼容的问题修复
- 每次构建都默认升级最小版本号，并写入版本历史文档
- 在每个代码文件头添加文件名/版本号/更新日期等实用注释
- 审查项目时生成报告放在docs目录下，并删除旧报告，生成的报告文件名格式为：项目审查报告_YYYYMMDD_HHMM.md