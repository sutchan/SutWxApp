# 苏铁微信小程序 (SutWxApp) 开发任务清单

> **文档版本**: v2.4.1
> **更新时间戳**: 2026-11-04 (UTC+8)
> **项目作者**: Sut
> **当前状态**: 小程序前端 `v3.5.10` · WordPress 插件 `v0.5.3`
> **关联规范**: [项目概述](./项目概述.md) · [功能规范](./specs/features/spec.md) · [后端规范](./specs/backend/spec.md) · [API 规范](./specs/api/spec.md) · [测试规范](./specs/testing/spec.md) · [运维规范](./specs/ops/spec.md)
> **归档**: 已完成任务与历史更新说明见 [tasks-done.md](./tasks-done.md)

---

## 进度总览

> 已完成任务（BE-001~007、FE-001~004、QA-001~005、OPS-001~003）与历次「本次更新说明」已全部归档至 [`tasks-done.md`](./tasks-done.md)，本文件仅保存**未完成任务**。

| 分类 | 总数 | 已完成 | 进行中 | 待开发 | 阻塞 |
|------|------|--------|--------|--------|------|
| 小程序前端 FE | 1 | 0 | 0 | 0 | 1 |

---

## 1. 后端插件 (sutwx-app-api)

> 全部 7 项（BE-001~007）已完成并归档，见 [`tasks-done.md`](./tasks-done.md)。
>
> 配套文档：[`docs/specs/backend/spec.md`](./specs/backend/spec.md) · [`docs/wordpress-plugin/DEVELOPMENT_PLAN.md`](./wordpress-plugin/DEVELOPMENT_PLAN.md)

## 2. 小程序前端 (SutWxApp)

| 编号 | 任务名称 | 优先级 | 状态 | 说明 | 依赖项 |
|------|----------|--------|------|------|--------|
| **FE-002-b** | i18n 补充 9 语种资源 | **P3（阻塞）** | 阻塞 | zh-CN/en-US 之外的 9 语种需专业翻译（外部资源，非代码问题） | FE-002（已归档） |

## 3. 测试与质量保障 (QA)

> 全部 5 项（QA-001~005）已完成并归档，见 [`tasks-done.md`](./tasks-done.md)。

## 4. 工程化与运维 (OPS)

> 全部 3 项（OPS-001~003）已完成并归档，见 [`tasks-done.md`](./tasks-done.md)。

---

## 5. 执行顺序（后续迭代）

```
P3  FE-002-b  9 语种 i18n 资源 ← 唯一活动项（待专业翻译，外部资源）
已完成并归档：BE-001~007、FE-001~004、QA-001~005、OPS-001~003（见 tasks-done.md）
```
