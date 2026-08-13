<!--
文件名: spec.md
版本号: 3.0.1
更新日期: 2026-08-13
作者: Sut
描述: SutWxApp 数据规范文档，涵盖前端数据模型设计、本地存储、接口数据校验与数据安全管理规范
-->

# 数据规范

## 目的

本规范定义了苏铁微信小程序（SutWxApp）项目的数据管理标准，包括前端数据模型设计原则、本地存储规范、前后端接口数据校验规则和数据安全管理要求。

> 本项目为纯前端微信小程序，不含后端数据库。数据由外部 REST API 提供，前端通过 `services/*` 读取与提交；本地仅持久化 Token、用户信息、购物车等轻量数据。因此本规范聚焦「前端数据实体建模」「本地存储」「接口数据契约」与「数据安全」，不涉及数据库建表、事务与索引。

数据是电商系统的核心资产，规范的数据管理对于保障业务稳定运行至关重要。本规范从数据模型设计入手，定义了实体命名、属性规范、关系设计等基本原则；然后阐述了前端本地存储的封装方式、缓存策略等最佳实践；接着制定了前后端接口数据的校验分工和规则；最后明确了本地数据安全、访问控制、敏感信息保护等要求。所有参与项目开发的成员都应当熟悉并遵循本规范的内容。

## 数据模型设计

### 命名规范

#### 实体命名规范

前端数据实体的命名应当遵循统一原则，确保与后端接口字段保持一致。实体名称使用英文，遵循以下约定：

- **接口字段**：使用小写字母和下划线组合的蛇形命名法（snake_case），与后端 REST API 返回字段保持一致，例如 `user_name`、`order_id`、`product_sku`。
- **前端变量/JS 标识符**：使用小驼峰命名法（camelCase），例如 `userName`、`orderId`；在 `services/*` 做 snake_case ↔ camelCase 的转换。
- **页面数据**：页面 `data` 中的字段使用语义化小驼峰命名。

对于关联实体，命名应当体现关系。例如用户与地址使用 `user_addresses`，订单明细使用 `order_items`。

以下是常用前端数据实体的命名示例：

| 业务实体 | 表名称 | 说明 |
|---------|--------|------|
| 用户 | `users` | 存储用户基本信息 |
| 用户地址 | `user_addresses` | 存储用户收货地址 |
| 角色 | `roles` | 存储角色定义 |
| 用户角色 | `user_roles` | 用户与角色关联 |
| 商品分类 | `categories` | 存储商品分类 |
| 商品 | `products` | 存储商品信息 |
| 商品规格 | `product_skus` | 存储商品规格 |
| 商品库存 | `product_inventory` | 存储库存数量 |
| 购物车 | `carts` | 存储购物车项 |
| 订单 | `orders` | 存储订单主信息 |
| 订单明细 | `order_items` | 存储订单商品明细 |
| 支付记录 | `payments` | 存储支付流水 |
| 积分流水 | `points_logs` | 存储积分变动记录 |
| 优惠券 | `coupons` | 存储优惠券信息 |
| 用户优惠券 | `user_coupons` | 用户领取的优惠券 |

#### 属性命名规范

数据表字段和文档属性的命名同样采用蛇形命名法，使用小写字母和下划线组合。字段命名应当准确反映字段的含义，避免使用缩写或模糊的名称。例如，用户姓名字段命名为 `user_name` 而非 `name` 或 `un`，手机号字段命名为 `phone_number` 而非 `mobile` 或 `tel`。

主键字段统一命名为 `id`，使用自增整数或 UUID 作为主键值。对于分布式系统或需要全局唯一标识的场景，推荐使用雪花算法生成的 64 位整数作为主键。复合主键应当尽量避免，优先使用单一主键。如果确实需要使用复合主键，字段按照业务重要性排序，命名遵循 `xxx_id` 的格式。

外键字段命名应当遵循 `{关联实体}_id` 的格式，确保名称能够清晰表明关联关系。例如，`user_id` 表明关联 `users` 表，`order_id` 表明关联 `orders` 表。如果一张表有多个外键指向同一张表，应当使用有区分度的别名，如 `creator_id` 和 `updater_id` 都指向 `users` 表但表示不同的业务含义。

时间戳字段统一使用 `_at` 后缀，如 `created_at`、`updated_at`、`deleted_at`。状态字段使用 `_status` 后缀，如 `order_status`、`payment_status`。标志字段使用 `is_` 前缀，如 `is_active`、`is_deleted`、`is_default`。金额字段使用 `_amount` 后缀，精确到分。数量字段使用 `_count` 后缀。

#### 本地存储键命名规范

前端通过 `wx.setStorageSync` / `wx.getStorageSync` 持久化的数据，键名使用大写蛇形命名法（SCREAMING_SNAKE_CASE），避免与页面 `data` 字段混淆。例如：

| 存储键 | 内容 | 说明 |
|--------|------|------|
| `TOKEN` | 登录令牌 | `Authorization: Bearer <token>` 使用 |
| `OPENID` | 微信 openid | 用户唯一标识 |
| `USER_INFO` | 用户基本信息 | 昵称、头像等 |
| `CART` | 购物车项 | 本地购物车缓存 |
| `LANGUAGE` | 当前语言 | `zh_CN` / `en_US` |

敏感信息（token、openid）仅存于微信安全存储，**禁止**写入日志或 `globalData` 后透传至第三方。

### 关系设计

#### 关系类型定义

数据实体之间存在多种关系类型，设计时应当明确关系的基数和方向。一对一关系用于一个实体只关联另一个实体的一个实例，如用户与用户档案的关系。设计时可以合并为一张表，也可以使用外键分开存储。合并存储适用于查询频繁且数据量较小的场景；分开存储适用于字段较多或部分字段更新频繁的场景。

一对多关系用于一个实体可以关联多个另一个实体的实例，如一个用户可以有多个收货地址。这种关系在多的一方存储外键，如 `user_addresses` 表存储 `user_id` 外键。多对一关系是一对多关系的反向，如多个地址属于一个用户。

多对多关系用于两个实体互相可以关联多个实例，如用户和角色、商品和标签。多对多关系需要通过中间表实现，中间表包含两个外键字段。对于需要存储关联属性的中间表，如用户角色关联表需要存储授权时间，则中间表作为独立的实体处理。

#### 关系约束设计

外键约束用于维护数据的引用完整性。在 MySQL 中使用 InnoDB 存储引擎支持外键约束，定义外键时应当同时设置 `ON DELETE` 和 `ON UPDATE` 行为。对于级联删除场景（如删除用户时同时删除其地址），使用 `CASCADE`；对于禁止删除场景（如删除商品分类时检查是否有商品），使用 `RESTRICT` 或 `NO ACTION`。

索引用于加速关系查询，外键字段应当创建索引。复合索引的字段顺序应当遵循最左前缀原则，将选择性高的字段放在前面。唯一约束用于保证字段值的唯一性，用户邮箱、手机号等字段应当添加唯一约束。检查约束用于限制字段值的范围，如订单状态只能是指定的值之一。

软删除是电商系统的常见需求，通过 `deleted_at` 字段标记记录是否被删除。软删除的记录在查询时应当过滤掉已删除的记录，必要时可以通过 `IS NOT NULL` 条件恢复数据。软删除不会释放存储空间，应当定期清理历史数据或归档到历史表。

### 字段类型规范

#### 数值类型选择

整数字段根据取值范围选择合适的数据类型。`TINYINT` 适合存储状态码、标志位等小范围数值，取值范围为 -128 到 127（无符号为 0 到 255）。`SMALLINT` 适合存储分类 ID 等中等范围数值，取值范围为 -32768 到 32767（无符号为 0 到 65535）。`INT` 适合存储大多数业务 ID，取值范围为 -2147483648 到 2147483647（无符号为 0 到 4294967295）。`BIGINT` 适合存储需要大范围数值的场景，如雪花算法生成的 ID。

小数字段使用 `DECIMAL` 类型而非 `FLOAT` 或 `DOUBLE`，确保金额计算的精确性。`DECIMAL` 的精度定义为 `DECIMAL(precision, scale)`，其中 precision 是总位数，scale是小数位数。例如，`DECIMAL(10,2)` 表示最多 10 位数字，其中 2 位小数，适合存储金额。金额字段统一使用 `DECIMAL(12,2)`，精度足够表示最大 9999999999.99 元的金额。

#### 字符串类型选择

定长字符串使用 `CHAR` 类型，适合存储固定长度的数据，如状态码、类型码等。变长字符串使用 `VARCHAR` 类型，适合存储长度变化的数据。`VARCHAR` 的最大长度根据实际需求设置，MySQL 中 `VARCHAR` 最大支持 65535 字节，但受行大小限制。普通字符串字段使用 `VARCHAR(255)` 即可满足大多数需求。

长文本字段使用 `TEXT` 类型，适合存储商品描述、用户评论等内容。`TEXT` 类型有四种变体：`TINYTEXT`（255 字节）、`TEXT`（65535 字节）、`MEDIUMTEXT`（16777215 字节）和 `LONGTEXT`（4294967295 字节）。根据预估的最大内容长度选择合适的类型，避免使用过大的类型浪费存储空间。

JSON 字段使用 `JSON` 类型，MySQL 5.7.8 及以上版本支持原生 JSON 类型。JSON 类型提供了验证、查询和修改 JSON 文档的功能，比存储字符串更高效。对于结构不固定的配置数据、扩展属性等，可以使用 JSON 类型存储。但应当避免在 JSON 字段上创建索引，查询性能较差。

#### 日期时间类型选择

日期字段使用 `DATE` 类型，格式为 'YYYY-MM-DD'，适合存储出生日期、活动日期等不需要时间的值。日期时间字段使用 `DATETIME` 或 `TIMESTAMP` 类型。`DATETIME` 适合存储绝对时间，如订单创建时间，范围为 '1000-01-01 00:00:00' 到 '9999-12-31 23:59:59'。`TIMESTAMP` 适合存储需要自动更新的时间，如记录更新时间，范围为 '1970-01-01 00:00:01' 到 '2038-01-19 03:14:07'，会自动转换为 UTC 存储。

创建时间和更新时间字段应当设置默认值和自动更新。`created_at` 设置 `DEFAULT CURRENT_TIMESTAMP`，`updated_at` 设置 `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`。时区敏感的时间字段应当存储 UTC 时间，展示时根据用户时区转换。

## 数据访问规范

### 服务层封装（services/）

前端通过 `services/*` 统一封装各业务域的网络请求，屏蔽接口细节，页面不直接调用 `wx.request`。

- 每个业务域对应一个 Service 文件（如 `authService.js`、`orderService.js`）
- Service 负责：拼接接口路径、携带 Token、做 snake_case ↔ camelCase 字段转换、统一错误处理
- 所有请求经 `utils/request.js` 发出，享受拦截器、重试、缓存、取消、并发控制
- Service 方法返回领域对象（camelCase），不暴露原始响应包络

```javascript
// services/productService.js
const request = require('../utils/request');

function getProductDetail(id) {
  return request.get(`/products/${id}`, { cache: true });
}
```

### 请求构建与防注入

- 查询参数通过 `utils/request.js` 的 `data` 字段传递，由底层做参数化编码，避免手工拼接 URL 引发注入/编码问题
- 列表查询支持分页（`page` / `pageSize`）、排序（`sort` / `order`）参数，由后端解释
- 写操作（POST/PUT/DELETE）不进入 GET 缓存，且自动失效相关缓存

### 一致性原则

- 前端以服务端返回为唯一可信数据源；本地存储仅作缓存/离线兜底
- 下单、改购物车等写操作后，应主动刷新本地缓存或重新拉取，避免脏数据
- 登录态失效（401）时，清空 `TOKEN` / `USER_INFO` 等本地数据并跳转登录
    }

    // 创建订单
    const order = await this.orderRepository.create({
      userId,
      items,
      status: OrderStatus.PENDING_PAYMENT,
    }, conn);

    // 扣减库存
    for (const item of items) {
      await this.inventoryRepository.decreaseCount(item.skuId, item.quantity, conn);
    }

    return order;
  });
}
```

#### 事务传播行为

事务传播行为定义了当一个事务方法被另一个事务方法调用时，事务如何传播。Spring 框架定义了多种传播行为，JavaScript 生态的事务库通常支持类似的行为。`REQUIRED` 是默认行为，如果当前存在事务，则加入该事务，否则创建一个新事务。

对于只读操作，可以使用 `READ_ONLY` 传播行为，提示数据库优化器进行只读优化。对于必须在独立事务中执行的操作（如日志记录），可以使用 `REQUIRES_NEW` 传播行为，挂起当前事务并创建新事务。嵌套事务使用 `NESTED` 传播行为，在当前事务中创建 savepoint，可以部分回滚。

### 批量操作规范

#### 批量写入本地存储

前端批量写入（如批量更新购物车、批量缓存商品列表）应遵循：

- 合并为单次 `wx.setStorageSync` 写入，避免循环多次调用造成性能损耗
- 单次写入数据量控制在合理范围（≤ 1MB），过大时分批或只缓存关键字段
- 批量写入应提供失败兜底（catch 异常并提示），避免阻塞主流程

```javascript
// utils/store.js 批量写入购物车示例
function saveCart(items) {
  try {
    wx.setStorageSync('CART', items);
  } catch (e) {
    console.error('[store] 保存购物车失败', e);
  }
}
```

#### 批量请求规范

- 多个独立接口请求应使用 `Promise.all` 并发，受 `utils/request.js` 并发队列约束（默认最大 5）
- 合并可聚合的查询参数，减少请求次数
- 批量请求失败时应区分「整体失败」与「部分失败」，给出明确反馈

### 本地存储与缓存策略

#### 本地存储设计原则

小程序本地存储（`wx.setStorageSync` / `wx.getStorageSync`）用于持久化轻量数据（Token、用户信息、购物车、语言偏好）。遵循原则：

- 仅缓存读多写少、体积小的数据，避免存储大对象或列表
- 单条存储体积建议 ≤ 1MB（微信单 key 上限约 1MB，总上限约 10MB）
- 敏感数据（token、openid）只存本地存储，禁止写入日志或外传第三方
- 提供统一的存取封装（如 `utils/store.js`），避免散落 `wx.setStorageSync` 调用

#### 请求缓存（utils/request.js）

网络层内置 LRU 缓存，用于减少重复请求、提升弱网体验：

- 默认缓存 50 条，TTL 5 分钟，可按接口配置 `cache` 选项
- 仅对 GET 等幂等请求启用缓存；写操作（POST/PUT/DELETE）自动失效相关缓存
- 失效策略采用「写后删除」而非「写后更新」，避免脏数据

#### 缓存键命名

本地存储键使用大写蛇形命名（见「本地存储键命名规范」），请求缓存键由 `method + url + 参数` 归一化生成，避免冲突。

## 数据校验规范

### 前端校验

#### 表单校验规则

前端校验用于提供即时的用户反馈，提升用户体验。前端校验应当与后端校验保持一致，但前端校验不能替代后端校验。前端校验的校验规则应当在共享的校验模块中定义，确保前端和后端使用相同的校验逻辑。

表单字段的校验在用户输入时实时触发，或在表单提交时统一校验。校验结果通过错误提示展示给用户，错误提示应当清晰说明问题所在和修正建议。以下是常用字段的校验规则定义：

| 字段类型 | 校验规则 | 错误提示 |
|---------|---------|----------|
| 手机号 | 正则验证 /^1[3-9]\d{9}$/ | 请输入正确的手机号 |
| 邮箱 | 正则验证 /^[^\s@]+@[^\s@]+\.[^\s@]+$/ | 请输入正确的邮箱地址 |
| 密码 | 长度 6-20 位，包含字母和数字 | 密码需为 6-20 位字母和数字组合 |
| 姓名 | 长度 2-20 位，中文或英文 | 请输入 2-20 位的姓名 |
| 金额 | 正数，精确到分 | 请输入正确的金额 |
| 数量 | 正整数 | 请输入正确的数量 |

```typescript
// validators/user-validator.ts
interface ValidationRule {
  required?: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  message: string;
}

const phoneRule: ValidationRule = {
  required: true,
  pattern: /^1[3-9]\d{9}$/,
  message: '请输入正确的手机号',
};

const passwordRule: ValidationRule = {
  required: true,
  minLength: 6,
  maxLength: 20,
  pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/,
  message: '密码需为 6-20 位字母和数字组合',
};

function validateField(value: any, rules: ValidationRule[]): string | null {
  for (const rule of rules) {
    if (rule.required && (value === undefined || value === null || value === '')) {
      return rule.message;
    }
    if (value !== undefined && value !== null && value !== '') {
      if (rule.pattern && !rule.pattern.test(String(value))) {
        return rule.message;
      }
      if (rule.minLength && String(value).length < rule.minLength) {
        return rule.message;
      }
      if (rule.maxLength && String(value).length > rule.maxLength) {
        return rule.message;
      }
      if (rule.min !== undefined && Number(value) < rule.min) {
        return rule.message;
      }
      if (rule.max !== undefined && Number(value) > rule.max) {
        return rule.message;
      }
    }
  }
  return null;
}
```

### 后端校验

#### DTO 校验

后端校验是数据安全的最后一道防线，所有从客户端传入的数据都必须在后端进行校验。后端校验使用数据传输对象（DTO）封装请求数据，DTO 中定义校验规则，校验框架自动执行校验。校验失败时返回明确的错误信息，帮助客户端定位问题。

项目使用 class-validator 库进行 DTO 校验，配合 class-transformer 进行对象转换。DTO 类使用装饰器定义校验规则，控制器在处理请求前自动执行校验。以下是用户注册 DTO 的校验定义示例：

```typescript
// dto/user.dto.ts
import {
  IsString,
  IsPhoneNumber,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterUserDTO {
  @IsPhoneNumber('CN', { message: '请输入正确的手机号' })
  phoneNumber: string;

  @IsNotEmpty({ message: '验证码不能为空' })
  @IsString()
  verificationCode: string;

  @IsNotEmpty({ message: '昵称不能为空' })
  @IsString()
  @MinLength(2, { message: '昵称至少 2 个字符' })
  @MaxLength(20, { message: '昵称最多 20 个字符' })
  nickname: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  @IsIn(['male', 'female', 'unknown'], { message: '性别参数无效' })
  gender?: string;
}

export class UpdateUserDTO {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: '昵称至少 2 个字符' })
  @MaxLength(20, { message: '昵称最多 20 个字符' })
  nickname?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: '个人简介最多 200 个字符' })
  bio?: string;
}
```

#### 业务校验规则

业务校验用于验证数据是否符合业务规则，业务校验在校验框架的通用校验之后执行。例如，验证用户手机号是否已被注册、验证商品库存是否充足、验证订单金额是否正确等。业务校验在服务层实现，校验失败时抛出业务异常。

业务校验应当遵循以下原则：校验逻辑应当内聚在对应的服务类中，避免校验逻辑分散；校验失败时返回有意义的错误码和错误信息；关键业务校验应当记录日志，便于问题排查。

```typescript
// services/user-service.ts
async function registerUser(data: RegisterUserDTO): Promise<User> {
  // 1. 验证手机号是否已被注册
  const existingUser = await this.userRepository.findByPhone(data.phoneNumber);
  if (existingUser) {
    throw new BusinessError('该手机号已注册', 'PHONE_ALREADY_REGISTERED');
  }

  // 2. 验证验证码
  const verifyResult = await this.verificationService.verifyCode(
    data.phoneNumber,
    data.verificationCode
  );
  if (!verifyResult.valid) {
    throw new BusinessError('验证码错误或已过期', 'INVALID_VERIFICATION_CODE');
  }

  // 3. 创建用户
  const user = await this.userRepository.create({
    phoneNumber: data.phoneNumber,
    nickname: data.nickname,
    avatar: data.avatar,
    gender: data.gender,
  });

  return user;
}

async function createOrder(userId: string, items: CreateOrderItemDTO[]): Promise<Order> {
  // 1. 验证商品信息
  for (const item of items) {
    const product = await this.productRepository.findById(item.productId);
    if (!product) {
      throw new BusinessError(`商品不存在: ${item.productId}`, 'PRODUCT_NOT_FOUND');
    }
    if (product.status !== ProductStatus.ON_SALE) {
      throw new BusinessError(`商品已下架: ${product.name}`, 'PRODUCT_OFFLINE');
    }

    // 2. 验证库存
    const inventory = await this.inventoryRepository.findBySkuId(item.skuId);
    if (!inventory || inventory.count < item.quantity) {
      throw new BusinessError(`商品库存不足: ${product.name}`, 'INSUFFICIENT_STOCK');
    }

    // 3. 验证价格
    if (item.price !== inventory.price) {
      throw new BusinessError(`商品价格已变更: ${product.name}`, 'PRICE_CHANGED');
    }
  }

  // 4. 计算订单金额
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // 5. 创建订单
  // ...
}
```

## 数据安全管理

### 数据分类分级

#### 数据敏感等级定义

项目数据按照敏感程度分为四个等级，不同等级的数据有不同的保护要求。公开数据是指可以对外公开的数据，如商品信息、分类信息等，这类数据不需要特殊保护，但应当确保数据准确性。内部数据是指仅限内部人员访问的数据，如订单统计、用户行为分析等，这类数据需要访问权限控制。敏感数据是指涉及用户隐私的数据，如用户手机号、收货地址、支付信息等，这类数据需要加密存储和传输。机密数据是指最高级别的数据，如管理员密码、系统密钥等，这类数据需要最严格的保护措施。

| 敏感等级 | 数据示例 | 保护要求 |
|---------|---------|----------|
| 公开级 | 商品信息、分类信息 | 数据准确性校验 |
| 内部级 | 订单统计、销售报表 | 访问权限控制 |
| 敏感级 | 手机号、地址、支付信息 | 加密存储、脱敏展示 |
| 机密级 | 密码、密钥、配置信息 | 加密存储、最小权限访问 |

#### 数据脱敏规则

敏感数据在展示时应当进行脱敏处理，防止信息泄露。用户手机号展示时只显示前三位和后四位，中间用星号代替。用户姓名展示时只显示第一个字符，其余用星号代替。收货地址展示时只显示省市区和详细地址的门牌号部分。支付账号展示时只显示前四位和后四位。

```typescript
// utils/data-masking.ts
function maskPhone(phone: string): string {
  if (!phone || phone.length < 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

function maskName(name: string): string {
  if (!name || name.length < 2) return name;
  return name[0] + '*'.repeat(name.length - 1);
}

function maskAddress(address: string): string {
  if (!address) return address;
  // 只显示省市区和门牌号
  const match = address.match(/^(.+?(?:省|市|自治区))(.+?(?:市|区|县))(.+)$/);
  if (match) {
    return `${match[1]}${match[2]}****`;
  }
  return address.substring(0, Math.min(10, address.length)) + '***';
}

function maskIdCard(idCard: string): string {
  if (!idCard || idCard.length < 15) return idCard;
  return idCard.replace(/(\d{3})\d{10}(\d{4})/, '$1**********$2');
}

function maskBankCard(bankCard: string): string {
  if (!bankCard || bankCard.length < 10) return bankCard;
  return bankCard.replace(/(\d{4})\d+(\d{4})/, '$1**********$2');
}
```

### 数据加密存储

#### 加密算法选择

敏感数据的存储应当使用加密算法保护。项目使用 AES-256-GCM 算法进行对称加密，用于加密用户手机号、详细地址等结构化数据。AES-256 提供足够的安全强度，GCM 模式提供完整性校验。加密密钥通过环境变量或密钥管理服务获取，不应硬编码在代码中。

密码使用 bcrypt 算法进行单向哈希加密，bcrypt 算法具有自适应成本因子，可以抵御暴力破解。用户登录时，将输入的密码进行哈希后与存储的哈希值比较。对于需要可逆加密的数据（如手机号），使用 AES-256 加密存储。

```typescript
// utils/encryption.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function encrypt(text: string, key: Buffer): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return iv.toString('hex') + authTag.toString('hex') + encrypted;
}

function decrypt(encryptedText: string, key: Buffer): string {
  const iv = Buffer.from(encryptedText.substring(0, IV_LENGTH * 2), 'hex');
  const authTag = Buffer.from(encryptedText.substring(IV_LENGTH * 2, IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2), 'hex');
  const encrypted = encryptedText.substring(IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2);
  
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### 数据备份与恢复

#### 备份策略

数据备份是灾难恢复的基础，应当制定完善的备份策略。项目采用全量备份和增量备份相结合的方式：每日凌晨业务低峰期执行全量备份，每小时执行增量备份。备份数据存储在独立的存储介质或云存储服务中，与生产环境物理隔离。

MySQL 数据库使用 mysqldump 或 mysqlpump 工具进行逻辑备份，生成 SQL 脚本文件。备份时使用 `--single-transaction` 参数确保一致性，使用 `--routines` 备份存储过程，使用 `--triggers` 备份触发器。备份文件应当压缩并加密后存储。

```bash
#!/bin/bash
# backup-mysql.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/mysql"
DB_HOST="localhost"
DB_USER="backup"
DB_PASS="backup_password"
DATABASES="sutwxapp"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行全量备份
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASS \
  --single-transaction \
  --routines \
  --triggers \
  --databases $DATABASES \
  | gzip > $BACKUP_DIR/full_backup_$DATE.sql.gz

# 验证备份文件
gunzip -t $BACKUP_DIR/full_backup_$DATE.sql.gz

# 删除 7 天前的备份
find $BACKUP_DIR -name "full_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: full_backup_$DATE.sql.gz"
```

#### 恢复流程

数据恢复是备份策略的重要组成部分，应当定期演练恢复流程，确保备份数据的可用性。恢复流程分为以下步骤：首先评估损坏范围，确定需要恢复的数据和时间点；其次准备恢复环境，包括数据库服务器和备份文件；然后执行恢复操作，从备份文件恢复数据；最后验证数据完整性，确认业务功能正常。

```bash
#!/bin/bash
# restore-mysql.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file.sql.gz>"
  exit 1
fi

DB_HOST="localhost"
DB_USER="root"
DB_PASS="your_password"
DB_NAME="sutwxapp"

# 解压备份文件
gunzip -c $BACKUP_FILE | mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME

# 验证恢复结果
echo "Restore completed. Verifying..."

# 检查表数量
TABLE_COUNT=$(mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$DB_NAME'")
echo "Tables restored: $TABLE_COUNT"

# 检查关键数据
USER_COUNT=$(mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME -N -e "SELECT COUNT(*) FROM users")
echo "Users restored: $USER_COUNT"

echo "Restore verification completed."
```

### 访问控制

#### 数据库访问控制

数据库访问应当遵循最小权限原则，只授予完成工作所需的最小权限。不同角色的用户使用不同的数据库账号：应用服务使用应用账号，拥有读写数据的权限；运维人员使用运维账号，拥有管理表结构和备份恢复的权限；开发人员在测试环境使用开发账号，拥有读写权限，在生产环境只读。

生产环境的数据库账号应当限制访问来源，只能从应用服务器访问。禁止使用 root 或其他高权限账号连接生产数据库。数据库操作应当记录审计日志，记录操作人员、操作时间和操作内容。

```sql
-- 创建应用账号
CREATE USER 'sutwxapp_app'@'%' IDENTIFIED BY 'strong_password_here';
GRANT SELECT, INSERT, UPDATE, DELETE ON sutwxapp.* TO 'sutwxapp_app'@'%';

-- 创建只读账号
CREATE USER 'sutwxapp_readonly'@'%' IDENTIFIED BY 'readonly_password_here';
GRANT SELECT ON sutwxapp.* TO 'sutwxapp_readonly'@'%';

-- 创建运维账号
CREATE USER 'sutwxapp_dba'@'%' IDENTIFIED BY 'dba_password_here';
GRANT ALL PRIVILEGES ON sutwxapp.* TO 'sutwxapp_dba'@'%';
GRANT PROCESS, RELOAD, SHUTDOWN ON *.* TO 'sutwxapp_dba'@'%';
```

## 版本历史

| 版本 | 更新日期 | 更新内容 | 作者 |
|------|----------|----------|------|
| 1.0.0 | 2025-12-27 | 初始版本，完成数据规范文档 | Sut |
