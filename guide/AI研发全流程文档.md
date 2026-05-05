# AI 助手研发全流程文档

| 项目 | 内容 |
|------|------|
| 文档版本 | V1.0 |
| 编写日期 | 2026-05-06 |
| 项目名称 | 简易手机银行核心业务系统 - AI 智能助手模块 |
| 文档性质 | AI 研发全流程记录文档 |
| 适用范围 | AI 功能研发、测试、维护人员 |

### 修订记录

| 版本 | 修改日期 | 操作人 | 修改内容 |
|------|---------|--------|---------|
| V1.0 | 2026-05-06 17:00:00 | AI 需求评审 | 初始版本：完整记录 AI 助手从需求分析到落地的全流程 |

---

## 目录

1. [项目背景与需求分析](#1-项目背景与需求分析)
2. [技术选型与架构设计](#2-技术选型与架构设计)
3. [MCP-Skill 方法论设计](#3-mcp-skill-方法论设计)
4. [后端实现](#4-后端实现)
5. [前端实现](#5-前端实现)
6. [数据库变更](#6-数据库变更)
7. [测试策略](#7-测试策略)
8. [部署方案](#8-部署方案)
9. [常见问题与解决方案](#9-常见问题与解决方案)

---

## 1. 项目背景与需求分析

### 1.1 业务背景

手机银行系统需要具备 AI 智能助手能力，用户可以通过自然语言完成余额查询、交易记录查询、转账等银行核心操作。AI 助手需满足以下核心要求：

- **BR-AI-001**：AI 助手只能查询类操作可自动响应，资金类操作必须经用户二次确认
- **BR-AI-002**：转账等资金操作须用户输入交易密码后方可执行
- **BR-AI-003**：AI 助手须返回结构化数据，前端支持卡片式渲染

### 1.2 需求要点

| 需求编号 | 需求名称 | 类型 | 安全等级 | 说明 |
|---------|---------|------|---------|------|
| FR-AI-01 | 余额查询 | 查询 | QUERY | 查询名下所有银行卡总余额 |
| FR-AI-02 | 交易记录查询 | 查询 | QUERY | 按时间范围查询交易记录 |
| FR-AI-03 | 转账预执行 | 资金 | OPERATION | 提取转账参数，生成确认卡片，实际转账跳转至标准确认页 |
| FR-AI-04 | 消费分析 | 查询 | QUERY | 对交易记录进行分类汇总 |
| FR-AI-05 | 银行卡列表查询 | 查询 | QUERY | 查询用户绑定的所有银行卡 |

### 1.3 技术难点

1. **意图识别准确性**：用户自然语言输入变化多样，需准确映射到具体功能
2. **架构可扩展性**：后续新增 AI 功能时，不能改动已有代码
3. **安全性**：资金类操作必须有两阶段确认机制，防止误操作
4. **结构化数据渲染**：AI 回复需包含结构化数据供前端渲染卡片

### 1.4 方案亮点

1. **MCP-Skill 方法论**：通过标准化接口 + 动态注册，实现功能解耦与热插拔
2. **LLM 意图识别 + 参数提取**：利用 AI 对话能力识别用户意图并提取参数，调用对应 Skill
3. **卡片式渲染**：前端根据结构化数据自动渲染不同类型的卡片（余额卡、交易列表卡、转账预览卡等）
4. **两阶段安全确认**：资金类操作仅做参数提取，不执行实际操作

---

## 2. 技术选型与架构设计

### 2.1 技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 后端框架 | Spring Boot | 2.7.18 | 稳定版本，兼容 JDK 1.8 |
| JDK | Java | 1.8 | 项目环境限制 |
| 数据库 | MySQL | 8.0 | 容器化部署 |
| 缓存 | Redis | 7.x | 容器化部署，需密码认证 |
| ORM | MyBatis-Plus | 3.5.5 | 简化数据库操作 |
| 前端框架 | Vue | 2.x | 移动端 H5 |
| UI 组件库 | Vant | 2.x | 轻量级移动端组件 |
| AI 交互 | 自定义 LLM 集成 | — | 通过 AiController 实现对话交互 |

### 2.2 整体架构

```
┌─────────────────────────────────────────────────────┐
│                    前端 (Vue 2 + Vant)                │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐   │
│  │ 对话页面   │  │ 卡片渲染  │  │ 转账/缴费确认页   │   │
│  └──────────┘  └──────────┘  └───────────────────┘   │
└────────────────────┬────────────────────────────────┘
                     │ REST API (JSON)
                     ▼
┌─────────────────────────────────────────────────────┐
│                  后端 (Spring Boot)                   │
│  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │  AiController    │  │  其他功能 Controller       │  │
│  └────────┬─────────┘  └──────────────────────────┘  │
│           │                                           │
│           ▼                                           │
│  ┌──────────────────┐                                │
│  │  AiChatServiceImpl│                                │
│  │  ┌──────────────┐ │                                │
│  │  │ 意图识别引擎   │ │  ← 正则 + LLM 双模式匹配     │
│  │  └──────┬───────┘ │                                │
│  │         ▼         │                                │
│  │  ┌──────────────┐ │                                │
│  │  │  McpGateway  │ │  ← 参数校验 + Skill 路由      │
│  │  └──────┬───────┘ │                                │
│  │         ▼         │                                │
│  │  ┌──────────────┐ │                                │
│  │  │ Skill 注册表  │ │  ← 动态注册所有 Skill         │
│  │  └──────────────┘ │                                │
│  └──────────────────┘                                │
│           │                                           │
│           ▼                                           │
│  ┌────────────────────────────────────────────────┐  │
│  │  Skill 实现层                                    │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌────────┐  │  │
│  │  │QueryBalance  │ │QueryTransact │ │Transfr │  │  │
│  │  │Skill         │ │ionsSkill     │ │Prepare │  │  │
│  │  └──────────────┘ └──────────────┘ └────────┘  │  │
│  └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 3. MCP-Skill 方法论设计

### 3.1 核心接口定义

```
McpSkill (接口)
├── getMeta() → SkillMeta     // 返回 Skill 元数据（名称、描述、参数 Schema）
├── execute(userId, params) → SkillResult  // 执行业务逻辑

SkillMeta
├── name                    // 唯一标识名称，如 "query_balance"
├── description              // 自然语言描述，供 LLM 路由决策
├── securityLevel            // QUERY（查）或 OPERATION（资金操作）
├── parameters (Map)         // 参数 Schema 定义

SkillResult
├── reply                    // AI 回复文本
├── structuredData (可选)     // 结构化数据，用于前端卡片渲染
│   ├── type                 // 卡片类型（balance_card/transaction_list/transfer_preview）
│   ├── data                 // 卡片数据
│   └── items                // 卡片列表项
├── action (可选)             // 操作建议
    ├── type                 // 操作类型（navigate）
    ├── route                // 跳转路由
    └── params               // 跳转参数
```

### 3.2 安全等级设计

| 等级 | 说明 | 行为 |
|------|------|------|
| QUERY | 查询类操作 | 直接执行并返回结果 |
| OPERATION | 资金类操作 | 提取参数→生成确认卡片→用户确认→跳转标准确认页→输入交易密码→执行 |

### 3.3 动态注册机制

Spring Boot 启动时，`@Component` 标注的 Skill 通过 `McpSkillConfig` 自动注册到 `McpSkillRegistry`（基于 `ConcurrentHashMap`）。新增 Skill 只需实现 `McpSkill` 接口 + `@Component` 注解，无需修改任何已有代码。

### 3.4 调用网关设计

`McpGateway` 是统一的 Skill 调用入口：
1. 根据 Skill 名称从注册表获取 Skill
2. 根据 Parameter Schema 校验参数类型
3. 调用 Skill.execute()
4. 异常统一处理，返回友好错误信息

---

## 4. 后端实现

### 4.1 文件清单

| 文件路径 | 说明 |
|---------|------|
| `com/bank/mcp/McpSkill.java` | Skill 核心接口 |
| `com/bank/mcp/SkillMeta.java` | Skill 元数据定义 |
| `com/bank/mcp/SkillResult.java` | Skill 统一返回结果 |
| `com/bank/mcp/McpSkillRegistry.java` | Skill 注册中心 |
| `com/bank/mcp/McpGateway.java` | MCP 调用网关 |
| `com/bank/mcp/McpSkillConfig.java` | Spring Boot 自动注册配置 |
| `com/bank/mcp/skill/QueryBalanceSkill.java` | 余额查询 Skill |
| `com/bank/mcp/skill/QueryTransactionsSkill.java` | 交易记录查询 Skill |
| `com/bank/mcp/skill/TransferPrepareSkill.java` | 转账预执行 Skill |
| `com/bank/controller/AiController.java` | AI 对话接口 |
| `com/bank/service/AiChatService.java` | AI 对话服务接口 |
| `com/bank/service/impl/AiChatServiceImpl.java` | AI 对话服务实现 |

### 4.2 AiChatServiceImpl 流程

```
用户输入 → 意图识别 → 参数提取 → McpGateway 调用 Skill → SkillResult 组装
   ↓                                  ↓
保存聊天记录                     结构化数据 + 回复文本
   ↓                                  ↓
返回给前端                       前端根据 type 渲染卡片
```

意图识别逻辑：
1. 正则快速匹配（如"查余额"→ query_balance）
2. LLM 语义匹配（复杂输入，通过预设提示词识别意图和提取参数）
3. 匹配失败 → 友好提示用户重新输入

### 4.3 JDK 1.8 兼容要点

| 特性 | 替代方案 | 涉及文件 |
|------|---------|---------|
| switch 表达式 (Java 14+) | 传统 switch-case-break | McpGateway, QueryTransactionsSkill |
| .toList() (Java 16+) | .collect(Collectors.toList()) | McpSkillConfig, McpSkillRegistry |
| Map.of() (Java 9+) | Collections.singletonMap() / new HashMap<>() | QueryBalanceSkill, QueryTransactionsSkill |
| List.of() (Java 9+) | Arrays.asList() | QueryTransactionsSkill |

---

## 5. 前端实现

### 5.1 页面结构

| 页面路径 | 说明 |
|---------|------|
| `/ai` | AI 助手对话主页面 |
| `/transfer/confirm` | 转账确认页面（输入交易密码） |
| `/payment/confirm` | 缴费确认页面（输入交易密码） |

### 5.2 卡片渲染机制

前端接收到 `functionCalled`（JSON 字符串）后：
1. 判断是否以 `{` 开头 → 是结构化数据
2. `JSON.parse()` 解析 → 取 `structuredData` 部分
3. 根据 `type` 渲染对应卡片

| 卡片类型 | 渲染内容 |
|---------|---------|
| `balance_card` | 资产概览、总余额、各卡余额列表 |
| `transaction_list` | 最近交易记录列表，含金额符号、类型、时间 |
| `transfer_preview` | 转账确认卡片（收款人、金额、银行）+ 去转账按钮 |
| `card_list` | 银行卡列表 |

### 5.3 金额符号规范

银行系统金额显示规范：

| 交易类型 | 金额符号 | 颜色 | 示例 |
|---------|---------|------|------|
| 转账（支出） | 负号（-） | 黑色 | -500.00 |
| 缴费（支出） | 负号（-） | 黑色 | -100.00 |
| 收入（入账） | 正号（+） | 绿色 | +5000.00 |

后端 `TransactionServiceImpl` 的 `transfer()` 和 `payBill()` 方法存储负值金额，前端直接渲染即可。

### 5.4 交易密码输入框规范

| 要求 | 说明 |
|------|------|
| 自动弹出 | 页面加载后自动弹出数字键盘 |
| 视觉明显 | 锁定图标 + 加粗标签 + 圆角边框 + 聚焦蓝色高亮 |
| 交互反馈 | 输入数字时显示●掩码，聚焦时边框蓝色高亮 |
| 点击唤起 | 点击密码输入区域可重新唤起键盘 |

---

## 6. 数据库变更

### 6.1 变更记录

| 版本 | 变更内容 | 操作时间 |
|------|---------|---------|
| V2.2 | `chat_message.function_called` 从 VARCHAR(50) 扩展为 TEXT | 2026-05-06 |

### 6.2 变更原因

旧字段 `VARCHAR(50)` 仅能存储简短函数名（如 "listCards"）。MCP-Skill 重构后需存储完整的 `SkillResult` JSON，长度可达数百字符，需扩展为 `TEXT`。

### 6.3 迁移脚本

```sql
ALTER TABLE `chat_message`
  MODIFY COLUMN `function_called` TEXT DEFAULT NULL COMMENT 'MCP-Skill 调用结果（纯字符串或 SkillResult JSON）';
```

---

## 7. 测试策略

### 7.1 测试层级

| 层级 | 工具 | 测试范围 |
|------|------|---------|
| 单元测试 | JUnit 5 + Mockito | MCP 核心组件、Skill 实现 |
| 接口测试 | Postman / 手动 | 前后端联调 |
| 端到端测试 | 手动 | 完整业务链路 |

### 7.2 测试重点

1. Skill 意图识别准确性（正则匹配 + LLM 匹配）
2. 转账两阶段确认流程
3. 金额正负符号正确性
4. 交易密码验证流程
5. 结构化数据 JSON 格式正确性
6. JDK 1.8 兼容性

### 7.3 测试工具

`pom.xml` 已包含 `spring-boot-starter-test`，依赖如下：
- JUnit 5 (Jupiter)
- Mockito
- Spring Test
- JSON Assert

---

## 8. 部署方案

### 8.1 容器化环境

| 服务 | 容器 | 端口映射 | 数据持久化 |
|------|------|---------|-----------|
| MySQL 8.0 | bank-mysql | 3306:3306 | bank_data |
| Redis 7.x | bank-redis | 6379:6379 | bank_redis |
| 后端应用 | bank-backend (Dockerfile) | 8080:8080 | — |

### 8.2 Docker Compose

启动命令：
```bash
docker-compose up -d
```

Redis 需配置密码认证，通过 `redis.conf` 和 `docker-compose.yml` 中的环境变量 `REDIS_PASSWORD` 控制。

---

## 9. 常见问题与解决方案

### 9.1 JDK 1.8 兼容问题

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| switch 表达式编译错误 | JDK 14+ 特性 | 改为传统 switch-case-break |
| .toList() 编译错误 | JDK 16+ 特性 | 改为 .collect(Collectors.toList()) |
| Map.of() 编译错误 | JDK 9+ 特性 | 改为 Collections.singletonMap() 或 new HashMap<>() |
| List.of() 编译错误 | JDK 9+ 特性 | 改为 Arrays.asList() |

### 9.2 金额符号错误

**现象**：缴费、转账显示为 `+100.00`，应为 `-100.00`

**原因**：`TransactionServiceImpl.transfer()` 和 `payBill()` 直接存储正数金额

**解决方案**：改为存储 `request.getAmount().negate()`，前端直接渲染负值

### 9.3 function_called 字段溢出

**现象**：数据库报错 "Data too long for column 'function_called'"

**原因**：VARCHAR(50) 无法容纳 SkillResult JSON

**解决方案**：改为 TEXT 类型，并执行 ALTER TABLE 迁移
