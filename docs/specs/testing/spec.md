<!--
文件名: spec.md
版本号: 1.0.1
更新日期: 2026-09-12
作者: Sut
描述: SutWxApp 项目测试规范文档，涵盖测试策略、测试环境、测试用例编写标准、测试执行流程、覆盖率要求与 GitHub Actions 持续集成
-->

# 测试规范

## 目的

本规范定义了苏铁微信小程序（SutWxApp）项目的测试策略、测试环境配置、测试用例编写标准、测试执行流程和测试覆盖率要求，以确保产品质量和代码可靠性。本规范基于 Jest 编写，涵盖单元测试、集成测试、端到端测试、性能测试和安全测试等多个方面。

## 测试策略

### 测试金字塔

项目采用测试金字塔模型进行测试策略规划，从底层到顶层依次为单元测试、集成测试、端到端测试。测试金字塔强调底层测试数量多、执行速度快、覆盖范围广，顶层测试数量少但更接近真实用户场景。这一策略能够在保证测试覆盖率的同时，维持合理的测试执行时间和维护成本。

单元测试作为金字塔的基石，应当覆盖所有核心业务逻辑函数、公共工具函数和数据处理函数。单元测试应当独立运行，不依赖外部服务或网络连接，每个测试用例验证单一功能点。集成测试验证模块间的交互是否正确，包括服务层与数据访问层的交互、API 接口与业务逻辑的集成等。端到端测试模拟真实用户操作，验证完整功能流程，包括用户登录、商品浏览、订单创建、支付流程等关键业务场景。

### 测试类型定义

**单元测试**应当覆盖以下场景：工具函数的功能验证、数据转换和格式化函数的正确性、业务逻辑函数的边界条件和异常处理、配置解析和环境变量处理的准确性。单元测试应当使用 Mock 技术隔离外部依赖，确保测试的稳定性和可重复性。每个单元测试文件应当对应源代码文件，测试文件命名格式为 `[源文件名].test.ts`，存放于 `tests/` 目录下的对应子目录中。

**集成测试**应当覆盖以下场景：服务层与数据访问层的交互验证、API 接口的请求处理和响应格式化、缓存机制的读写操作正确性、会话管理和认证授权的流程验证。集成测试可以使用真实的数据库连接或内存数据库，但应当避免对外部服务的真实调用。测试数据应当在每个测试用例执行前初始化，执行后清理，确保测试环境的独立性。

**端到端测试**应当覆盖以下场景：用户注册和登录流程、商品搜索和浏览流程、购物车添加和修改流程、订单创建和支付流程、积分获取和使用流程。端到端测试应当模拟真实用户操作，使用微信小程序模拟器或真实设备执行测试。测试数据应当使用测试账号，避免对生产数据产生影响。

**性能测试**应当关注以下指标：API 接口的响应时间、数据库查询的执行时间、并发请求的处理能力、内存使用情况。性能测试应当在独立的测试环境中执行，避免与其他测试相互干扰。测试结果应当与基准值对比，识别性能退化或优化空间。

**安全测试**应当覆盖以下场景：身份认证的安全性、权限校验的正确性、输入验证的有效性、敏感数据的保护措施。安全测试应当模拟常见的攻击场景，如 SQL 注入、XSS 攻击、CSRF 攻击等。安全测试应当由专门的安全测试人员或第三方机构执行，并生成详细的测试报告。

## 测试环境配置

### 小程序测试体系

微信小程序的前端测试分为两个层面：

1. **开发者工具手动/自动化测试**：微信开发者工具提供模拟器、真机预览与「自动化测试」能力（基于 miniprogram-automator），用于端到端流程验证。
2. **逻辑层单元测试**：纯 JS 工具与 Service 可使用 Node 环境下的测试运行器（如 Jest / Vitest）执行，不依赖小程序运行时。

> 本项目为纯前端小程序，**无需 Bun 或数据库**。单元测试建议采用 Jest（或项目既有 Node 测试工具），配置在 `SutWxApp/package.json` 的 `scripts.test`。

```json
{
  "scripts": {
    "test": "jest --passWithNoTests",
    "test:coverage": "jest --coverage",
    "test:unit": "jest tests/unit"
  }
}
```

### 测试数据与环境隔离

- 单元测试使用独立的 Mock 数据与本地存储桩，避免对生产/开发数据产生影响
- 通过环境变量或测试配置区分测试基址（`baseUrl`），不写死到代码
- 测试结束后清理临时写入的本地存储（`wx.setStorageSync` 的桩实现）

### Mock 服务配置

对于外部依赖（微信登录、后端 REST API），应当使用 Mock 进行模拟，保证测试稳定可重复。可在 `tests/mocks/` 下提供可控的测试数据：

```javascript
// tests/mocks/wechat-api.js
export const mockWechatLogin = (openid, sessionKey) => ({
  errcode: 0,
  errmsg: 'ok',
  openid,
  session_key: sessionKey,
});

export const mockUserInfo = (userId) => ({
  userId,
  nickname: '测试用户',
  avatar: 'https://example.com/avatar.png',
});
```

## 测试文件组织

### 目录结构

测试统一放在受版本控制的 `SutWxApp/__tests__/` 目录（根 `tests/` 已被 `.gitignore` 忽略，不可放测试）：

```
SutWxApp/
├── __tests__/                 # Jest 用例（CommonJS，与被测模块同风格）
│   ├── request.test.js        # 请求层：重试、缓存、取消、队列
│   ├── request-auth.test.js   # 鉴权层：401 刷新与重放
│   ├── auth-token.test.js     # 令牌：过期预判、刷新锁
│   ├── store.test.js          # 轻量状态管理
│   ├── i18n.test.js           # 多语言
│   ├── offline-snapshot.test.js # 离线快照降级
│   ├── order.test.js          # 订单服务与 DTO 映射
│   ├── pay-service.test.js    # 支付流程
│   ├── integration.test.js    # 跨模块集成
│   └── regression-2026-11.test.js # 缺陷回归（按月份命名）
├── scripts/
│   └── e2e/                   # E2E（miniprogram-automator，需开发者工具）
│       ├── run-e2e.js         # 入口：npm run test:e2e
│       ├── e2e-config.js      # 环境与端口配置
│       ├── e2e-home.js / e2e-product.js / e2e-cart.js / e2e-auth.js
└── ../sutwx-app-api/tests/    # PHP 单测（独立运行，不依赖 WordPress）
    ├── bootstrap.php          # 引导：桩与常量
    ├── stubs-runtime.php      # WP/WC 运行时桩
    └── run-*-tests.php        # mapping / settings / auth / cache / order / pay
```

Jest 配置位于 `SutWxApp/package.json` 的 `jest` 字段：`rootDir` 为仓库根，`testMatch` 覆盖 `SutWxApp/__tests__/**/*.test.js`，测试环境为 `node`。

### 测试文件命名规范

- 单元与集成测试：`<主题>.test.js`，置于 `SutWxApp/__tests__/`，与被测模块同名或主题一致（如 `order.test.js` 对应 `services/orderService.js`）。
- 缺陷回归：按月份归档，如 `regression-2026-11.test.js`，一个文件覆盖该批次的全部回归点。
- 后端单测：`sutwx-app-api/tests/run-<主题>-tests.php`，一个主题一套件，可独立 `php` 执行。
- E2E：`SutWxApp/scripts/e2e/e2e-<场景>.js`，由 `run-e2e.js` 统一编排。

> 项目为纯 JavaScript（无 TypeScript），测试文件一律 `.js`，不使用 `.ts`。

## 测试用例编写标准

### 测试结构规范

每个测试文件应当包含清晰的测试结构，使用 `describe` 块组织相关测试，使用 `it` 或 `test` 定义单个测试用例。测试用例应当遵循 Arrange-Act-Assert 模式：首先准备测试数据（Arrange），然后执行被测功能（Act），最后验证结果是否符合预期（Assert）。

```javascript
// tests/unit/utils/date-helper.test.ts

describe('日期处理工具', () => {
  describe('formatDate', () => {
    it('应当正确格式化日期为 YYYY-MM-DD 格式', () => {
      // Arrange
      const date = new Date('2025-12-27T10:30:00');
      
      // Act
      const result = formatDate(date, 'YYYY-MM-DD');
      
      // Assert
      expect(result).toBe('2025-12-27');
    });

    it('应当正确格式化日期为 YYYY年MM月DD日 格式', () => {
      // Arrange
      const date = new Date('2025-12-27');
      
      // Act
      const result = formatDate(date, 'YYYY年MM月DD日');
      
      // Assert
      expect(result).toBe('2025年12月27日');
    });

    it('应当处理无效日期输入', () => {
      // Arrange
      const invalidDate = null;
      
      // Act & Assert
      expect(() => formatDate(invalidDate, 'YYYY-MM-DD')).toThrow();
    });
  });

  describe('parseDate', () => {
    it('应当正确解析 YYYY-MM-DD 格式的日期字符串', () => {
      // Arrange
      const dateString = '2025-12-27';
      
      // Act
      const result = parseDate(dateString);
      
      // Assert
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(11);
      expect(result.getDate()).toBe(27);
    });
  });
});
```

### 测试数据管理

测试数据应当独立管理，避免在测试用例中硬编码。常用的测试数据管理方式包括：使用常量定义固定测试数据、使用测试夹具（Fixtures）加载外部数据文件、使用工厂函数动态生成测试数据。测试数据应当在每个测试用例执行前初始化，执行后清理，确保测试的独立性。

```javascript
// tests/fixtures/users.ts
export const testUsers = [
  {
    id: 'user_001',
    nickname: '测试用户1',
    email: 'test1@example.com',
    points: 1000,
  },
  {
    id: 'user_002',
    nickname: '测试用户2',
    email: 'test2@example.com',
    points: 2000,
  },
];

export const createTestUser = (overrides = {}) => {
  return {
    id: `user_${Date.now()}`,
    nickname: '新测试用户',
    email: `user_${Date.now()}@example.com`,
    points: 0,
    ...overrides,
  };
};
```

### Mock 和 Stub 使用

对于外部依赖（如文件系统、网络请求、数据库连接），应当使用 Mock 或 Stub 进行隔离。Mock 技术可以控制外部依赖的行为，确保测试的稳定性和可重复性。项目统一使用 Jest 内置能力（jest.fn() / jest.spyOn() / jest.mock()），不额外引入 Mock 库。

```javascript
// tests/unit/services/points-service.test.ts
describe('积分服务', () => {
  describe('getUserPoints', () => {
    it('应当返回用户当前积分', async () => {
      // Arrange
      const mockUserRepository = {
        findById: vi.fn().mockResolvedValue({
          id: 'user_001',
          points: 1500,
        }),
      };
      const pointsService = new PointsService(mockUserRepository);
      
      // Act
      const result = await pointsService.getUserPoints('user_001');
      
      // Assert
      expect(result).toBe(1500);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user_001');
    });

    it('应当处理用户不存在的情况', async () => {
      // Arrange
      const mockUserRepository = {
        findById: vi.fn().mockResolvedValue(null),
      };
      const pointsService = new PointsService(mockUserRepository);
      
      // Act
      const result = await pointsService.getUserPoints('nonexistent');
      
      // Assert
      expect(result).toBe(0);
    });
  });
});
```

### 异步测试规范

异步测试应当正确处理 Promise 和 async/await 语法。Jest 原生支持 async/await 与 Promise，用例可直接写成 `async () => {}`。异步测试应当包含错误处理，确保 Promise rejected 情况能够被正确捕获和验证。

```javascript
// tests/integration/api/user-api.test.ts
describe('用户 API', () => {
  describe('GET /api/v1/users/:id', () => {
    it('应当返回用户信息', async () => {
      // Arrange
      const testUser = await createTestUser();
      await userRepository.create(testUser);
      
      // Act
      const response = await fetch(`http://localhost:3000/api/v1/users/${testUser.id}`);
      const body = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      expect(body.data.userId).toBe(testUser.id);
      expect(body.data.nickname).toBe(testUser.nickname);
    });

    it('应当处理用户不存在的情况', async () => {
      // Act
      const response = await fetch('http://localhost:3000/api/v1/users/nonexistent');
      const body = await response.json();
      
      // Assert
      expect(response.status).toBe(404);
      expect(body.code).toBe('USER_NOT_FOUND');
    });

    it('应当处理服务器错误', async () => {
      // Arrange
      vi.spyOn(userRepository, 'findById').mockRejectedValue(new Error('Database error'));
      
      // Act
      const response = await fetch(`http://localhost:3000/api/v1/users/user_001`);
      const body = await response.json();
      
      // Assert
      expect(response.status).toBe(500);
      expect(body.code).toBe('INTERNAL_ERROR');
    });
  });
});
```

## 测试覆盖率要求

### 覆盖率指标

项目设定了以下测试覆盖率指标，确保代码质量：

| 覆盖率类型 | 最低要求 | 目标值 | 说明 |
|-----------|---------|--------|------|
| 行覆盖率 | ≥80% | ≥90% | 被测试用例覆盖的代码行数比例 |
| 分支覆盖率 | ≥70% | ≥80% | 条件分支（如 if/else）覆盖比例 |
| 函数覆盖率 | ≥90% | ≥95% | 被调用的函数比例 |
| 路径覆盖率 | ≥60% | ≥70% | 代码执行路径覆盖比例 |

### 覆盖率报告

测试覆盖率报告通过 `npm run test:coverage` 命令生成，报告文件存放在 `coverage/` 目录下。覆盖率报告支持多种格式，包括 HTML、LCov 和 JSON。HTML 报告提供可视化的代码覆盖率展示，便于识别未覆盖的代码区域。

```bash
# 运行测试并生成覆盖率报告
npm run test:coverage

# 查看 HTML 覆盖率报告
open coverage/index.html
```

### 覆盖率检查

持续集成流程应当包含覆盖率检查步骤，确保新代码的提交不会降低整体覆盖率。覆盖率检查可以通过以下方式实现：使用 Codecov、Coveralls 等覆盖率托管服务；在 Pull Request 中显示覆盖率变化；设置覆盖率阈值，不达标则阻断合并。

```yaml
# .github/workflows/test.yml
- name: Run tests with coverage
  run: npm run test:coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
    fail_ci_if_error: true
```

## 测试执行流程

### 本地测试执行

开发人员在本地环境中应当按照以下流程执行测试：

首先，运行完整测试套件验证代码变更是否影响现有功能：

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage
```

其次，针对变更的模块运行单元测试，缩短反馈周期：

```bash
# 运行特定模块的测试
npx jest SutWxApp/__tests__/order.test.js
```

最后，运行集成测试验证模块间的交互：

```bash
# 运行集成测试
npm test
```

### 持续集成测试

项目已建立 GitHub Actions 持续集成流水线（`.github/workflows/ci.yml`），运行环境为 `ubuntu-latest` + Node.js 20，工作目录为 `SutWxApp/`；同一分支的重复推送会取消上一次未完成的运行。流水线包含五个 Job，任一失败即阻断合并：

> `SutWxApp/package-lock.json` 已入库，`lint` 与 `test` Job 均可正常执行 `npm ci`。

**第一阶段：代码检查**。执行 `npm run lint`（ESLint），在测试前快速发现代码规范问题，无需等待测试执行。

**第二阶段：单元测试**。执行 `npm run test:coverage`（Jest），运行 `SutWxApp/__tests__/` 下的用例并生成覆盖率报告，报告以 Artifact 形式归档 7 天。

**第三阶段：一致性校验**。执行 `npm run check`，校验版本号单一来源一致性（`package.json` / `app.js` / README 徽章 / `CHANGELOG.md`）与小程序配置完整性（JSON 可解析、页面四件套齐全、tabBar 图标不超过 40KB、分包与 sitemap 指向文件存在）。

CI 不依赖数据库或外部服务：单元测试通过 Mock 隔离微信 API 与后端接口，保证可重复执行。

```yaml
# .github/workflows/ci.yml（节选）
name: CI

on:
  push:
    branches: [main, dev, "feature/**", "fix/**", "hotfix/**"]
  pull_request:
    branches: [main, dev]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: SutWxApp/package-lock.json

      - name: 安装依赖
        run: npm ci
        working-directory: SutWxApp

      - name: 运行 ESLint
        run: npm run lint
        working-directory: SutWxApp

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: SutWxApp/package-lock.json

      - name: 安装依赖
        run: npm ci
        working-directory: SutWxApp

      - name: 单元测试与覆盖率
        run: npm run test:coverage
        working-directory: SutWxApp
```

> 说明：本节为项目实际流水线的事实描述，测试以 `SutWxApp/__tests__/` 下的 Jest 用例为准，本地可用 `npm test` 复现 CI 结果。

### 测试失败处理

测试失败时，应当按照以下流程处理：

首先，分析测试失败的原因，区分是测试用例问题还是代码问题。测试用例问题包括测试数据不正确、测试逻辑有误、测试环境未正确配置等。代码问题包括功能实现有缺陷、代码逻辑错误、边界条件未处理等。

其次，针对不同的问题类型采取相应的解决措施。测试用例问题应当修复测试用例本身；代码问题应当修复代码实现，并确保修复后所有相关测试通过。

最后，记录测试失败的根因和解决措施，便于团队成员参考和学习。对于反复出现的测试失败问题，应当分析根本原因，优化测试策略或代码实现。

## 小程序特定测试

### 组件测试

微信小程序组件的测试需要使用专门的小程序测试工具。项目推荐使用 `miniprogram-simulate` 或类似的测试库进行组件测试。组件测试应当验证组件的渲染正确性、事件处理、属性传递和生命周期方法。

```javascript
// tests/unit/components/card.test.ts
import { simulate } from 'miniprogram-simulate';

describe('商品卡片组件', () => {
  it('应当正确渲染商品信息', async () => {
    // Arrange
    const product = {
      id: 'prod_001',
      name: '测试商品',
      price: 99.9,
      image: 'https://example.com/image.png',
    };
    
    // Act
    const component = simulate.render(product);
    component.attach(document.createElement('parent'));
    
    // Assert
    expect(component.data.name).toBe('测试商品');
    expect(component.data.price).toBe(99.9);
  });

  it('应当正确处理点击事件', async () => {
    // Arrange
    const product = { id: 'prod_001', name: '测试商品', price: 99.9 };
    let clickedProductId = null;
    
    const component = simulate.render(product, {
      onItemClick: (id) => { clickedProductId = id; },
    });
    component.attach(document.createElement('parent'));
    
    // Act
    component.dispatchEvent('tap');
    
    // Assert
    expect(clickedProductId).toBe('prod_001');
  });
});
### 页面测试

小程序页面的测试需要模拟页面生命周期和路由参数。页面测试应当验证页面的初始化逻辑、数据加载、用户交互和页面跳转。

```javascript
// tests/unit/pages/home.test.ts
import { simulate } from 'miniprogram-simulate';

describe('首页', () => {
  it('应当正确加载首页数据', async () => {
    // Arrange
    const mockBanners = [{ id: 1, image: 'banner1.png' }];
    const mockProducts = [{ id: 1, name: '商品1', price: 99 }];
    
    vi.spyOn(bannerService, 'getBanners').mockResolvedValue(mockBanners);
    vi.spyOn(productService, 'getRecommendProducts').mockResolvedValue(mockProducts);
    
    // Act
    const page = simulate.render('/pages/home/index');
    await page.instance.onLoad();
    
    // Assert
    expect(page.data.banners).toEqual(mockBanners);
    expect(page.data.products).toEqual(mockProducts);
  });

  it('应当正确处理下拉刷新', async () => {
    // Arrange
    const page = simulate.render('/pages/home/index');
    await page.instance.onLoad();
    
    vi.spyOn(productService, 'getRecommendProducts').mockResolvedValue([
      { id: 2, name: '新商品', price: 199 },
    ]);
    
    // Act
    await page.instance.onPullDownRefresh();
    
    // Assert
    expect(productService.getRecommendProducts).toHaveBeenCalled();
  });
});
```

## 版本历史

| 版本 | 更新日期 | 更新内容 | 作者 |
|------|----------|----------|------|
| 1.0.1 | 2026-09-12 | 「持续集成测试」章节改写为项目实际 GitHub Actions 流水线（Node.js 20 + ESLint + Jest + 一致性校验），移除失效的 Bun 示例 | Sut |
| 1.0.0 | 2025-12-27 | 初始版本，完成测试规范文档 | Sut |
