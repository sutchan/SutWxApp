 运维与部署规范

## 目的
本规范定义了苏铁微信小程序（SutWxApp）项目的运维与部署指南，包括环境要求、系统配置、权限管理、部署流程、日常运维、监控方法和故障处理程序，以确保系统稳定运行。

## 环境要求

### 服务器配置

| 环境类型 | CPU | 内存 | 存储 | 操作系统 |
|---------|-----|------|------|----------|
| 开发环境 | 4C  | 8G   | 100G | Ubuntu 22.04 |
| 测试环境 | 8C  | 16G  | 200G | Ubuntu 22.04 |
| 生产环境 | 16C | 32G  | 500G | Ubuntu 22.04 |

### 软件依赖

| 软件 | 版本 | 用途 |
|------|------|------|
| Bun | 1.0.0+ | 后端开发和运行时 |
| 微信开发者工具 | 指定版本 | 小程序开发和测试 |
| MySQL | 8.0+ | 关系型数据库 |
| Redis | 7.0+ | 缓存和会话管理 |
| MongoDB | 6.0+ | 非关系型数据库 |
| Docker | 24.0.0+ | 容器化 |
| Docker Compose | 2.20.0+ | 开发环境容器编排 |
| Kubernetes | 1.28.0+ | 生产环境容器编排 |
| Nginx | 1.24.0+ | 反向代理和负载均衡 |

## 系统配置

### 环境变量配置

项目使用 `.env` 文件存储环境变量。以下是一个示例配置：

```dotenv
# 服务器配置
PORT=3000
HOST=localhost
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=sutwxapp
DB_PASSWORD=password
DB_NAME=sutwxapp

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# 微信小程序配置
APPID=wx1234567890abcdef
APPSECRET=1234567890abcdef1234567890abcdef

# JWT配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# 文件上传配置
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### 配置说明

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| PORT | Number | 3000 | 服务器端口 |
| HOST | String | localhost | 服务器主机 |
| NODE_ENV | String | development | 运行环境 (development/production/test) |
| DB_HOST | String | localhost | 数据库主机 |
| DB_PORT | Number | 3306 | 数据库端口 |
| DB_USER | String | sutwxapp | 数据库用户名 |
| DB_PASSWORD | String | password | 数据库密码 |
| DB_NAME | String | sutwxapp | 数据库名称 |
| REDIS_HOST | String | localhost | Redis主机 |
| REDIS_PORT | Number | 6379 | Redis端口 |
| REDIS_PASSWORD | String | | Redis密码 |
| APPID | String | | 微信小程序APPID |
| APPSECRET | String | | 微信小程序APPSECRET |
| JWT_SECRET | String | | JWT密钥 |
| JWT_EXPIRES_IN | String | 7d | JWT过期时间 |
| UPLOAD_PATH | String | ./uploads | 文件上传路径 |
| MAX_FILE_SIZE | Number | 5242880 | 最大文件大小（字节） |

### 配置步骤

1. **复制配置文件**
   ```bash
   cp .env.example .env
   ```

2. **编辑配置文件**
   ```bash
   nano .env
   ```
   根据实际环境修改配置项。

3. **重启服务**
   修改配置后，重启服务使配置生效：
   ```bash
   npm run server
   ```

### 配置验证

- **数据库连接**：检查日志中是否有 `Database connected successfully` 消息
- **Redis连接**：检查日志中是否有 `Redis connected successfully` 消息
- **微信小程序配置**：通过测试从小程序登录验证

## 权限管理

### 权限管理原则

- **最小权限原则**：用户只拥有完成工作所需的最小权限
- **职责分离原则**：不同角色的用户拥有不同的权限
- **权限审计原则**：所有权限操作都被记录
- **定期审查原则**：定期检查用户权限，确保合理分配

### 角色定义

| 角色名称 | 说明 |
|----------|------|
| 超级管理员 | 拥有所有系统权限 |
| 管理员 | 拥有系统管理权限，包括用户管理和角色管理 |
| 开发人员 | 拥有开发权限，包括代码提交和测试 |
| 运维人员 | 拥有运维权限，包括部署和监控 |
| 普通用户 | 拥有基本使用权限 |

### 权限分类

| 权限分类 | 说明 |
|----------|------|
| 系统管理 | 包括用户管理、角色管理和系统配置 |
| 内容管理 | 包括产品管理、订单管理和内容发布 |
| 数据分析 | 包括数据统计和报表生成 |
| 开发权限 | 包括代码提交、测试和部署 |

### 权限分配流程

1. 创建角色并定义其权限
2. 创建用户并将其分配到相应的角色
3. 用户从其角色继承权限

### 权限管理操作

#### 角色管理

1. **创建角色**
   - 登录系统管理后台
   - 进入"角色管理"页面
   - 点击"创建角色"按钮
   - 输入角色名称、描述和权限
   - 点击"保存"按钮

2. **编辑角色**
   - 登录系统管理后台
   - 进入"角色管理"页面
   - 找到要编辑的角色并点击"编辑"按钮
   - 修改角色名称、描述和权限
   - 点击"保存"按钮

3. **删除角色**
   - 登录系统管理后台
   - 进入"角色管理"页面
   - 找到要删除的角色并点击"删除"按钮
   - 确认删除

#### 用户管理

1. **创建用户**
   - 登录系统管理后台
   - 进入"用户管理"页面
   - 点击"创建用户"按钮
   - 输入用户信息，包括用户名、密码和邮箱
   - 选择用户角色
   - 点击"保存"按钮

2. **编辑用户**
   - 登录系统管理后台
   - 进入"用户管理"页面
   - 找到要编辑的用户并点击"编辑"按钮
   - 修改用户信息和角色
   - 点击"保存"按钮

3. **删除用户**
   - 登录系统管理后台
   - 进入"用户管理"页面
   - 找到要删除的用户并点击"删除"按钮
   - 确认删除

4. **重置密码**
   - 登录系统管理后台
   - 进入"用户管理"页面
   - 找到要重置密码的用户并点击"重置密码"按钮
   - 输入新密码
   - 点击"保存"按钮

### 权限审计

#### 日志记录

系统记录所有与权限相关的操作，包括：
- 用户登录/退出
- 角色创建/编辑/删除
- 用户创建/编辑/删除
- 权限分配/修改

#### 日志查询

1. 登录系统管理后台
2. 进入"日志管理"页面
3. 选择查询条件，包括时间范围、操作类型和用户
4. 点击"查询"按钮
5. 查看查询结果

## 系统架构

### 整体架构

```
+----------------+    +----------------+    +----------------+    +----------------+
| 微信小程序前端   |    |      Nginx      |    |    Bun API      |    |    MySQL       |
|  (微信开发者工具) |    |  反向代理/负载均衡 |    |    服务          |    |                |
|                |    |                |    |                 |    |                |
+----------------+    +----------------+    +----------------+    +----------------+
         |                     |                        |                     |
         |                     |                        |                     |
         |                     |                        |                     |
         |                     |                        |                     |
+----------------+    +----------------+    +----------------+    +----------------+
|  CDN资源        |    |      Redis      |    |    MongoDB      |    | 第三方服务      |
|                |    |  缓存/会话管理   |    |  日志/活动数据   |    | (微信支付, 物流) |
|                |    |                |    |                |    |                |
+----------------+    +----------------+    +----------------+    +----------------+
```

### 环境配置

| 环境类型 | 服务器配置 | 操作系统 | 部署方式 |
|---------|-----------|----------|----------|
| 开发环境 | 4C8G       | Ubuntu 22.04 | Docker Compose |
| 测试环境 | 8C16G      | Ubuntu 22.04 | Docker Compose |
| 生产环境 | 16C32G     | Ubuntu 22.04 | Kubernetes |

## 部署流程

### 开发环境部署

1. **安装依赖**
   ```bash
   # 安装Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # 安装Docker Compose
   curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   chmod +x /usr/local/bin/docker-compose
   ```

2. **克隆仓库**
   ```bash
   git clone https://github.com/sutchan/SutWxApp.git
   cd SutWxApp
   ```

3. **配置环境**
   ```bash
   cp .env.example .env
   # 编辑.env文件配置数据库连接、Redis连接等
   ```

4. **启动服务**
   ```bash
   docker-compose up -d
   ```

5. **验证部署**
   ```bash
   # 检查服务状态
   docker-compose ps
   
   # 测试API服务
   curl http://localhost:3000/api/v1/health
   
   # 查看日志
   docker-compose logs -f
   ```

### 生产环境部署

1. **准备环境**
   - 使用kubeadm安装Kubernetes集群
   - 配置网络插件（例如，Calico）
   - 配置存储类（例如，Ceph、EFS）
   - 安装Helm
   ```bash
   curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
   ```

2. **配置CI/CD流水线**
   - 使用GitHub Actions或GitLab CI进行自动化部署
   - 配置Docker镜像仓库（例如，Harbor、Docker Hub）

3. **部署应用**
   ```bash
   # 创建命名空间
   kubectl create namespace sutwxapp
   
   # 部署MySQL
   helm repo add bitnami https://charts.bitnami.com/bitnami
   helm install mysql bitnami/mysql -n sutwxapp -f mysql-values.yaml
   
   # 部署Redis
   helm install redis bitnami/redis -n sutwxapp -f redis-values.yaml
   
   # 部署MongoDB
   helm install mongodb bitnami/mongodb -n sutwxapp -f mongodb-values.yaml
   
   # 构建并推送API镜像
   docker build -t sutwxapp-api:v1.0.0 .
   docker push sutwxapp-api:v1.0.0
   
   # 部署API服务
   kubectl apply -f k8s/api-deployment.yaml -n sutwxapp
   kubectl apply -f k8s/api-service.yaml -n sutwxapp
   
   # 部署Nginx Ingress
   kubectl apply -f k8s/nginx-ingress.yaml -n sutwxapp
   ```

4. **验证部署**
   ```bash
   # 检查Pods
   kubectl get pods -n sutwxapp
   
   # 检查服务
   kubectl get services -n sutwxapp
   
   # 测试API服务
   curl https://api.sutwxapp.com/api/v1/health
   ```

## 日常运维

### 系统监控

#### 监控指标

- **服务器指标**：CPU使用率、内存使用率、磁盘使用率、网络流量
- **应用指标**：API响应时间、请求成功率、并发连接数、错误率
- **数据库指标**：查询响应时间、连接数、缓存命中率、查询量

#### 监控工具

- **Prometheus**：指标收集
- **Grafana**：指标可视化
- **Alertmanager**：告警管理

#### 告警规则

| 告警类型 | 阈值 | 严重程度 | 通知方式 |
|----------|------|----------|----------|
| CPU使用率 | >80% | 警告 | 邮件、Slack |
| 内存使用率 | >85% | 警告 | 邮件、Slack |
| 磁盘使用率 | >90% | 严重 | 邮件、Slack、电话 |
| API响应时间 | >2s | 警告 | 邮件、Slack |
| 请求错误率 | >5% | 严重 | 邮件、Slack、电话 |

### 日志管理

#### 日志类型

- **应用日志**：Node.js API服务日志
- **数据库日志**：MySQL、Redis、MongoDB日志
- **Nginx日志**：请求日志、错误日志
- **系统日志**：服务器系统日志

#### 日志收集

使用 ELK Stack 进行日志管理：
- **Logstash**：从各种来源收集日志
- **Elasticsearch**：存储日志数据
- **Kibana**：查询和可视化日志数据

#### 日志保留

- 设置日志保留策略为30天
- 定期清理过期日志

### 数据备份

#### 备份策略

| 数据类型 | 备份频率 | 备份方式 | 保留期限 |
|---------|---------|---------|---------|
| MySQL数据 | 每日 | 全量备份 | 30天 |
| Redis数据 | 每小时 | 快照 | 7天 |
| MongoDB数据 | 每日 | 全量备份 | 30天 |
| 配置文件 | 每次修改 | 版本控制 | 永久 |

#### 备份命令

1. **MySQL备份**
   ```bash
   mysqldump -u root -p --all-databases > mysql_backup_$(date +%Y%m%d).sql
   ```

2. **Redis备份**
   ```bash
   redis-cli BGSAVE
   ```

3. **MongoDB备份**
   ```bash
   mongodump --out mongodb_backup_$(date +%Y%m%d)
   ```

#### 恢复命令

1. **MySQL恢复**
   ```bash
   mysql -u root -p < mysql_backup_20251226.sql
   ```

2. **Redis恢复**
   ```bash
   cp dump.rdb /var/lib/redis/
   systemctl restart redis
   ```

3. **MongoDB恢复**
   ```bash
   mongorestore --dir mongodb_backup_20251226
   ```

### 安全管理

1. **定期系统更新**
   ```bash
   apt update && apt upgrade -y
   ```

2. **防火墙配置**
   ```bash
   ufw allow 22/tcp
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw enable
   ```

3. **HTTPS配置**
   - 配置SSL证书
   - 启用HTTPS访问

4. **定期安全扫描**
   ```bash
   # 使用nmap进行端口扫描
   nmap -sV -p- 192.168.1.100
   
   # 使用OpenVAS进行漏洞扫描
   openvas-start
   ```

## 故障处理

### 常见故障

#### API服务不可用

**症状**：
- API请求返回500错误
- 监控告警显示API服务不可用

**处理流程**：
1. 检查API服务日志
   ```bash
   docker-compose logs api
   # 或
   kubectl logs -f deployment/api -n sutwxapp
   ```

2. 验证数据库连接
   ```bash
   mysql -u root -p -h localhost
   redis-cli ping
   mongo
   ```

3. 检查服务器资源
   ```bash
   top
   df -h
   ```

4. 重启API服务
   ```bash
   docker-compose restart api
   # 或
   kubectl rollout restart deployment/api -n sutwxapp
   ```

#### 数据库连接失败

**症状**：
- API服务日志显示数据库连接失败
- 应用无法访问数据库

**处理流程**：
1. 检查数据库服务状态
   ```bash
   systemctl status mysql
   systemctl status redis
   systemctl status mongod
   ```

2. 验证连接配置
   ```bash
   cat .env
   ```

3. 检查数据库权限
   ```bash
   mysql -u root -p -e "SHOW GRANTS FOR 'sutwxapp'@'%';"
   ```

4. 重启数据库服务
   ```bash
   systemctl restart mysql
   ```

#### CPU使用率高

**症状**：
- 监控告警显示CPU使用率高
- 系统响应缓慢

**处理流程**：
1. 识别占用CPU最高的进程
   ```bash
   top
   ```

2. 分析CPU使用率高的原因
   ```bash
   # 使用strace分析进程
   strace -p <pid>
   
   # 使用perf分析性能
   perf top -p <pid>
   ```

3. 优化应用代码或增加服务器资源

### 故障记录

每次故障处理后，记录以下信息：

| 字段 | 说明 |
|------|------|
| 故障时间 | 故障发生的时间 |
| 故障类型 | 故障类型 |
| 故障描述 | 故障的详细描述 |
| 影响范围 | 受故障影响的范围 |
| 处理流程 | 详细的处理步骤 |
| 根本原因 | 故障的根本原因 |
| 预防措施 | 防止类似故障的措施 |
| 处理人 | 处理故障的人员 |

## 系统升级

### 升级流程

1. **准备**：
   - 备份数据
   - 测试升级版本
   - 制定回滚方案

2. **升级执行**：
   - 停止当前服务
   - 部署新服务
   - 执行数据库迁移
   - 启动新服务
   - 验证升级结果

3. **回滚方案**：
   - 如果升级失败，停止新服务
   - 恢复旧服务
   - 恢复数据备份

### 版本发布

1. **版本命名**：使用语义化版本控制（MAJOR.MINOR.PATCH）
2. **发布说明**：编写详细的发布说明，包括新功能、bug修复和升级说明
3. **发布流程**：
   - 代码审查
   - 自动化测试
   - 构建镜像
   - 部署到测试环境
   - 测试验证
   - 部署到生产环境

## 灾难恢复

### 灾难类型

- 服务器故障
- 数据库故障
- 网络故障
- 自然灾害

### 恢复目标

- **RTO（恢复时间目标）**：1小时
- **RPO（恢复点目标）**：1小时

### 恢复流程

1. **评估影响**：评估灾难的程度及其影响
2. **启动恢复计划**：启动预定的灾难恢复程序
3. **恢复备份设施**：配置备份服务器和基础设施
4. **恢复数据**：从备份中恢复数据
5. **验证系统功能**：测试所有系统组件
6. **恢复服务**：逐步向用户恢复服务

### 备份和恢复

1. **数据备份**：
   - 异地备份
   - 数据库主从复制
   - 数据同步

2. **服务备份**：
   - 多可用区部署
   - 负载均衡
   - 自动故障转移

## 常用命令

### Docker命令

```bash
# 检查容器状态
docker ps

# 查看容器日志
docker logs -f <container_id>

# 进入容器
docker exec -it <container_id> bash
```

### Kubernetes命令

```bash
# 检查Pod状态
kubectl get pods

# 检查服务状态
kubectl get services

# 查看日志
kubectl logs -f <pod_name>
```

### 数据库命令

```bash
# 检查MySQL进程
mysqladmin -u root -p processlist

# 检查Redis信息
redis-cli info

# 检查MongoDB状态
mongo --eval "db.stats()"
```

## 配置文件

- **.env**：环境变量配置
- **docker-compose.yml**：Docker Compose配置
- **k8s/**：Kubernetes配置文件
- **nginx.conf**：Nginx配置

## 联系方式

| 角色 | 姓名 | 邮箱 | 电话 |
|------|------|------|------|
| 运维支持 | Sut | sut@example.com | 13800138000 |
| 开发负责人 | Dev | dev@example.com | 13800138001 |
| 系统管理员 | Admin | admin@example.com | 13800138002 |
