# 苏铁微信小程序 (SutWxApp) 文档索引

> **文档版本**: v2.1.0
> **更新时间戳**: 2026-11-07
> **说明**: 本目录存放项目全部规范文档与任务清单。本文件是**文档体系入口**；工程规范以 `specs/development/spec.md` 为准，术语以 `GLOSSARY.md` 为准。

---

## 目录结构

```
docs/
├── README.md                # 本文件：文档索引与维护规则
├── AGENTS.md                # 贡献与 AI 助手指南（仓库地图、命令、红线、排障）
├── GLOSSARY.md              # 术语表（统一叫法，避免一词多义）
├── PROJECT_OVERVIEW.md      # 项目全景（面向新成员的第一读物）
├── 项目概述.md              # 简版项目概述（历史保留文件）
├── tasks.md                 # 活动任务清单（生产成熟度规划）
├── tasks-done.md            # 已完成任务归档
├── wordpress-plugin/        # WordPress 插件开发计划
│   └── DEVELOPMENT_PLAN.md
├── screenshots/             # README 引用的界面截图
└── specs/                   # 规范文档（按主题分目录）
    ├── api/                 # 接口契约（端点、请求/响应、错误码）
    ├── architecture/        # 架构设计（分层、模块边界、数据流）
    ├── backend/             # WordPress 插件规范（目录、路由、部署）
    ├── data/                # 数据模型（DTO 字段、状态机、映射规则）
    ├── design/              # 设计规范（令牌、组件、视觉）
    ├── development/         # 工程规范（单一事实来源）
    ├── features/            # 功能规范（页面与模块职责）
    ├── ops/                 # 运维规范（部署、监控、备份、故障处理）
    ├── project/             # 项目定位与技术栈（设计风格、术语表、附录）
    ├── testing/             # 测试规范（分层、策略、用例约定）
    └── user-guide/          # 用户指南（安装、使用、FAQ）
```

---

## 阅读路径

| 角色 | 建议顺序 |
|------|---------|
| 新加入的开发者 | `PROJECT_OVERVIEW.md` → `AGENTS.md` → `specs/development/spec.md` → `specs/architecture/spec.md` |
| 改小程序前端 | `specs/development/spec.md` → `specs/features/spec.md` → `specs/api/spec.md` → `specs/design/spec.md` |
| 改 WordPress 插件 | `specs/development/spec.md` → `specs/backend/spec.md` → `specs/data/spec.md` → `specs/api/spec.md` |
| 做发布准备 | `tasks.md` → `specs/ops/spec.md` → `specs/development/spec.md` |
| 排查线上问题 | `AGENTS.md` 排障速查 → `specs/ops/spec.md` → `specs/testing/spec.md` |

---

## 规范文档

| 文档 | 文件 | 内容要点 |
|------|------|---------|
| **工程规范** | `specs/development/spec.md` | 环境、目录组织、命名、编码风格、提交、分支、审查、测试、CI/CD、版本、文档管理 |
| 接口契约 | `specs/api/spec.md` | URL 结构、状态码、JWT 与归属校验、响应包络、端点清单、错误码、分页约定 |
| 架构设计 | `specs/architecture/spec.md` | 技术栈、分层结构、模块边界、数据流、安全与性能概览 |
| 后端插件 | `specs/backend/spec.md` | 插件目录、REST 路由、24 端点契约、鉴权与订单支付现状、部署 |
| 数据模型 | `specs/data/spec.md` | DTO 字段、订单状态机（0–5）、分页包络、映射规则 |
| 设计规范 | `specs/design/spec.md` | 设计令牌、色彩排版、组件视觉规则、违规对照 |
| 功能规范 | `specs/features/spec.md` | 已实现页面与模块、模块间关系、当前未实现能力清单 |
| 运维规范 | `specs/ops/spec.md` | 部署流程、配置常量、监控告警、日志、备份恢复、故障处理 |
| 测试规范 | `specs/testing/spec.md` | 测试分层、环境要求、用例约定、覆盖率口径、缺陷分级 |
| 用户指南 | `specs/user-guide/spec.md` | 安装准备、首次使用、功能操作、开发环境 FAQ |
| 项目规范 | `specs/project/spec.md` | 项目定位、技术栈、Apple 极简设计风格、术语表、附录 |

> **单一事实来源**：命名约定、提交信息、分支管理、代码审查、门禁命令**只在 `specs/development/spec.md` 定义**，其他文档以链接引用，不重复抄写。

---

## 任务与规划

| 文档 | 内容 |
|------|------|
| `tasks.md` | 活动任务：生产成熟度评估 + 12 项未完成最小模块任务（已完成批次见归档） |
| `tasks-done.md` | 已完成任务归档：完成日期、交付物、实现要点、验收结论 |
| `wordpress-plugin/DEVELOPMENT_PLAN.md` | WordPress 插件开发计划 |

---

## 文档维护规则

### 命名与格式

- **文件名**：英文 kebab-case（`specs/backend/spec.md`）；中文文件名仅保留历史文件 `项目概述.md`，不再新增
- **文档标题与正文**：中文
- **文档头部元信息**：文档版本、更新时间戳、定位/适用范围
- **引用**：文件用相对链接，代码位置用 `路径:行号`
- **禁止**：同一事实在多处定义（其他位置改为链接引用）

### 更新联动

| 改动 | 必须同步 |
|------|---------|
| 接口路径 / DTO 字段 | `specs/api/spec.md`、`specs/backend/spec.md`、`specs/data/spec.md`、`models/*`、契约测试 |
| 页面 / 组件 | `specs/features/spec.md`、`specs/user-guide/spec.md`、`app.json` |
| 设计令牌 / 样式 | `specs/design/spec.md`、`styles/*` |
| 工具链 / 脚本 / 门禁 | `specs/development/spec.md`、本文件 |
| 部署 / 监控 / 备份 | `specs/ops/spec.md` |
| 版本号 | `package.json`、`app.js`、文件头注释、`README.md` 徽章、`CHANGELOG.md`、插件 `readme.txt` |
| 任务状态 | `tasks.md` → 完成后移入 `tasks-done.md` |

### 文档版本

采用语义化版本 `MAJOR.MINOR.PATCH`：结构变更升 MAJOR，新增章节升 MINOR，文字修正升 PATCH。每次更新在文件头部更新时间戳。

### 评审与归档

- 文档改动与代码改动**同一个 PR** 提交，不在后续 PR 里「顺手补文档」
- 评审时按 `specs/development/spec.md` 的文档联动矩阵逐项核对
- 与代码严重脱节的文档视为缺陷，按 P1 处理

---

## 相关资源

- [项目仓库](https://github.com/sutchan/SutWxApp)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/)

## 联系方式

- 项目负责人：Sut
- 微信：sutwxapp
- GitHub：https://github.com/sutchan/SutWxApp

## 版本历史

| 版本 | 更新日期 | 更新内容 | 作者 |
|------|----------|----------|------|
| 2.1.0 | 2026-11-07 | 对齐 3.5.15 / 插件 0.7.1：活动任务改为 12 项未完成清单，规范要点描述同步（api 24 端点、features 未实现能力清单） | Sut |
| 2.0.0 | 2026-11-04 | 重建索引：补齐 11 份 spec 与 AGENTS/GLOSSARY/screenshot 目录，移除已废弃的 OpenSpec 引用，统一术语与维护规则 | Sut |
| 1.0.0 | 2025-12-26 | 初始版本，创建完整的规范文档体系 | Sut |
