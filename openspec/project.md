# Project Context

## Purpose
Sut Flutter App - 跨平台移动应用，用于提供商品展示、购物车、订单管理、积分系统等功能

## Tech Stack
- Dart 3.x
- Flutter 3.x
- GetX (状态管理、路由、依赖注入)
- Dio (网络请求)
- Hive (本地存储)
- Flutter Localizations (国际化)
- WebSocket (实时通信)

## Project Conventions

### Code Style
- 遵循Dart官方代码风格指南
- 使用dart format进行代码格式化
- 类名使用大驼峰命名法 (PascalCase)
- 方法名和变量名使用小驼峰命名法 (camelCase)
- 私有成员使用下划线前缀 (_privateMember)
- 文件名使用下划线分隔 (snake_case)

### Architecture Patterns
- MVVM架构模式
- 分层设计：UI层、业务逻辑层、数据层
- 依赖注入：使用GetX的依赖管理
- 状态管理：使用GetX的响应式状态管理
- 路由管理：使用GetX的命名路由

### Testing Strategy
- 单元测试：使用flutter_test框架
- 集成测试：使用integration_test包
- 测试覆盖率不低于80%
- 每次提交前运行所有测试

### Git Workflow
- main：主分支，用于发布稳定版本
- dev：开发分支，用于集成新功能
- feature/功能名：功能分支，用于开发新功能
- fix/问题描述：修复分支，用于修复bug
- 提交消息格式：<类型>: <描述>，如 feat: 添加新功能，fix: 修复bug

## Domain Context
- 电商平台：商品展示、购物车、订单管理
- 积分系统：积分获取、积分兑换、积分排行榜
- 社交功能：关注、点赞、评论
- 通知系统：实时通知、消息推送

## Important Constraints
- 跨平台支持：iOS和Android
- 性能要求：流畅的用户体验，启动时间不超过3秒
- 兼容性：支持iOS 13+和Android 6.0+
- 数据安全：敏感数据加密存储

## External Dependencies
- 后端API服务
- WebSocket服务
- 第三方支付服务
- 第三方登录服务
