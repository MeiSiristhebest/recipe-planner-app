# Recipe Planner & Meal Sharing Assistant 🥗

<p align="center">
  <strong>跨平台膳食规划、食谱分享与智能购物清单生成助手</strong>
</p>

<p align="center">
  <a href="https://github.com/MeiSiristhebest/recipe-planner-app/actions/workflows/ci.yml"><img src="https://github.com/MeiSiristhebest/recipe-planner-app/actions/workflows/ci.yml/badge.svg?branch=master" alt="CI Status" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" /></a>
  <a href="https://turbo.build/"><img src="https://img.shields.io/badge/Monorepo-Turborepo_1.12-EF4444?style=flat-square" alt="Turborepo" /></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Web-Next.js_14_App_Router-black?style=flat-square&logo=next.js" alt="Next.js" /></a>
  <a href="https://expo.dev/"><img src="https://img.shields.io/badge/Mobile-React_Native_(Expo_SDK)-61DAFB?style=flat-square&logo=react" alt="React Native" /></a>
  <a href="https://www.prisma.io/"><img src="https://img.shields.io/badge/ORM-Prisma_%7C_PostgreSQL-2D3748?style=flat-square" alt="Prisma" /></a>
  <a href="https://pnpm.io/"><img src="https://img.shields.io/badge/packageManager-pnpm_10.10-F69220?style=flat-square" alt="pnpm" /></a>
</p>

<p align="center">
  <a href="README.md">🇨🇳 中文</a> &nbsp;·&nbsp; <a href="README_EN.md">🇺🇸 English</a>
</p>

---

## 📖 About

**Recipe Planner & Sharing Assistant** 是一款基于 **Turborepo + pnpm Workspaces** 构建的高性能、跨端（Web + iOS/Android）膳食规划与食谱分享平台。

个人与家庭在日常饮食管理中，普遍面临四个重复出现的痛点：
1. **食谱探索效率低** — 网上食谱分散且质量参差，缺乏一个自己可收藏、可二次编辑的私有食谱库
2. **一周膳食排程繁琐** — 日历式排程需要手动记录每个餐次的食谱、份数与食材量
3. **营养信息统计缺失** — 无法实时汇总一周的宏量营养素（热量/蛋白/碳水/脂肪）和微量元素
4. **购物清单反复凑单** — 每次按计划买菜都要手动数食谱用到的食材，还经常漏买、重复买、单位不一致

Recipe Planner App 用一套统一的数据模型 + Monorepo 跨端共享包，**一次性解决上述四个痛点**：Web 端适合在桌面端探索食谱与规划一周膳食，移动端适合在超市里打开购物清单打勾。

---

## ✨ Key Features

| # | Feature | Details | Contextual Note |
|---|---------|---------|-----------------|
| 1 | **🧭 食谱探索与创作** | 浏览社区食谱、收藏、基于 Markdown 富文本编辑步骤、多图封面上传、按分类/标签/关键词检索 | 支持一键导入外部食谱 URL（计划 v0.2） |
| 2 | **📅 智能一周膳食排程** | 日历看板拖拽式安排早/午/晚餐，自动按份数缩放食材用量，支持模板化整周复制 | 膳食计划可导出 iCalendar 事件 |
| 3 | **📊 实时营养成分统计** | 基于 USDA FDC 营养数据库，按天/周维度聚合宏量与微量元素，支持目标阈值预警 | 食材营养数据可人工修订覆盖 |
| 4 | **🛒 智能购物清单生成** | 一键将整周 MealPlan 中所有食谱的 Ingredient 列表**按品类分组聚合**（蔬菜水果、肉类海鲜、乳制品蛋类、调味品、其他），自动完成单位归一化与同食材多食谱合并，支持逐项打勾完成 | 购物清单可分享给家人共同编辑 |
| 5 | **📱 Web + Mobile 一致体验** | Next.js 14 SSR Web 端 + React Native Expo iOS/Android 端，UI 基础组件库、Zod 表单校验、Prisma DB Client、TypeScript 接口全部在 `packages/*` 共享，双端开发体验完全一致 | 两套端共用的代码占比约 65% |
| 6 | **🔐 NextAuth 身份认证** | 邮件 + OAuth（GitHub/Google，可扩展）登录，JWT Session，基于角色的食谱公开/私有范围控制 | RLS 基于 User 关系做数据隔离 |

---

## 🌿 环境要求

| 依赖 | 最低版本 |
|------|---------|
| **Node.js** | 18.18 LTS（推荐 20.x） |
| **pnpm** | 8.6.10 |
| **PostgreSQL** | 14.0（推荐 15.x） |
| **Docker & Compose v2** | 24.0（仅 Option A 需要） |
| **Expo Go** | 移动端开发用，App Store / 应用宝下载 |

---

## 📦 Installation

我们提供两种启动方式。**想先快速跑起来的用户直接选 Option A（Docker 一键起 DB + pnpm 本地起双端）**。

---

### Option A：Docker Compose 起 PostgreSQL + 本地 Monorepo 开发（推荐）

这是最快的启动方式：用 Docker 起一个带健康检查的 PostgreSQL 15，其他应用层（Web/Mobile/生成 Prisma Client）全部本地 pnpm 开发调试（热更新最快）。

```bash
# 1. Clone & 进入
git clone https://github.com/MeiSiristhebest/recipe-planner-app.git
cd recipe-planner-app

# 2. 一键起 PostgreSQL 15（持续运行；健康检查通过后才 ready）
docker compose up -d db
# docker ps 应看到 recipe_planner_db_local 容器 (port 5432)

# 3. 安装 monorepo 全依赖（pnpm 10.10；~800MB）
pnpm install

# 4. 复制环境变量模板（下文 "Configuration" 有详细字段说明）
cp .env.example .env
# 编辑 DATABASE_URL（默认已对齐 docker compose 中的 DB 账号密码，通常无需改）、NEXTAUTH_URL、NEXTAUTH_SECRET、OAuth Providers

# 5. 生成 Prisma Client + 推送 Schema 到 Pg + 填种子数据（示例食谱+标签+分类）
pnpm db:generate
pnpm db:push
pnpm db:seed
```

✅ 安装完成，接下来跳到 **Quick Start** 直接跑双端。

---

### Option B：使用远程 PostgreSQL（本地完全不装 Docker）

适合你已经有一个现成的 Supabase / Neon / 自己的 Pg 实例：

```bash
git clone https://github.com/MeiSiristhebest/recipe-planner-app.git
cd recipe-planner-app

# 直接写 .env 的 DATABASE_URL 指向你的 Pg
# DATABASE_URL="postgresql://user:password@your-db-host:5432/recipe_planner"

pnpm install
pnpm db:generate
pnpm db:push   # 第一次建表；后续迁移用 pnpm db:migrate:dev
pnpm db:seed   # 可选，填充示例数据
```

---

### 🔧 Configuration（.env 必填字段）

```env
# ========== Database ==========
# 对齐 Option A 中 docker-compose.yml 的 Postgres 15 账号
DATABASE_URL="postgresql://recipe_user:recipe_password@localhost:5432/recipe_planner_dev"

# ========== NextAuth ==========
# Web 端的绝对地址（开发默认 localhost:3000；生产改为你的域名）
NEXTAUTH_URL="http://localhost:3000"
# 生成密钥：openssl rand -hex 32
NEXTAUTH_SECRET="your-nextauth-secret-key-64-char-hex"

# ========== OAuth Providers（可选，至少留一个 Email 方式可用）==========
# GITHUB_ID=xxx
# GITHUB_SECRET=xxx
# GOOGLE_ID=xxx
# GOOGLE_SECRET=xxx
```

> 📌 如果 `.env.example` 文件不存在（仓库中没提交模板），直接复制上面这一版即可。

---

## 🚀 Quick Start

> 前提：Installation → Option A 全部执行完毕（Postgres 容器 up + pnpm install + db:push + db:seed 全部通过）。

### 启动双端开发服务器

```bash
# 方式 1：同时起 Web + Mobile（两个端口，Turbo 统一调度）
pnpm dev
# 方式 2：只起 Web 端（更常用的调试场景）
pnpm dev --filter web
# 方式 3：只起 Mobile 端（Expo Dev Server + 扫码）
pnpm dev --filter mobile
```

### 预期访问结果

| Target | URL / How to access | 验证 |
|--------|--------------------|------|
| **Next.js Web App** | [`http://localhost:3000`](http://localhost:3000) | 浏览器打开首页 → 看到「食谱探索」或「登录」页 → 种子食谱可正常浏览 |
| **Expo Mobile App** | 终端里显示一个 QR Code + `exp://<your-lan-ip>:8081` | 手机安装 Expo Go → 扫 QR → 加载出首页（手机与电脑需同一 Wi-Fi）|
| **Prisma Studio（DB GUI）** | （另开一个终端）`pnpm db:studio` → [`http://localhost:5555`](http://localhost:5555) | 看到 User / Recipe / MealPlan / ShoppingListItem 等表，并可查询种子数据 |
| **Turborepo 全量构建** | `pnpm build` | 终端输出 Tasks：2 build, 2 successful, 0 cached, 0 failed（首次）|

### 5 分钟端到端 Walkthrough（创建一周购物清单）

1. 浏览器 → `http://localhost:3000` → 右上角「注册」→ 用邮箱 / GitHub OAuth 登录
2. 首页「食谱探索」→ 打开种子食谱「🍝 奶油培根意面」→ 收藏
3. 进入「膳食计划」→ 日历视图 → 本周周一到周日拖拽分配食谱（早餐/午餐/晚餐每顿可任意填，也可点「一键复制上一周模板」）
4. 点右上角「🛒 生成本周购物清单」→ 系统自动做：
   - 遍历所有 MealPlanItem → 拉取每条 Recipe.ingredients
   - 归一化单位（15ml 酱油 + 5ml 酱油 = 20ml 酱油）
   - 按品类分组（蔬菜水果 / 肉类海鲜 / 乳制品蛋类 / 调味品 / 其他）
   - 写入 ShoppingList + ShoppingListItem 表
5. 浏览器跳到购物清单详情页 → 即可逐项打勾，或手机端 Expo App 扫码同步打开边走边勾

---

## 🏗️ Architecture Highlights（架构与核心工程实践）

### 1. Monorepo 拓扑依赖图

```mermaid
graph TD
    subgraph Apps [应用层 · Apps]
      W[apps/web · Next.js 14 App Router]
      M[apps/mobile · React Native + Expo SDK]
    end

    subgraph Pkgs [共享包层 · packages]
      UI[packages/ui · Shadcn/Tailwind 跨端 UI 基础组件]
      DB[packages/prisma-db · Prisma Client + Schema]
      V[packages/validators  · Zod Schemas（跨端表单校验）]
      T[packages/types · TypeScript Shared Interfaces]
      U[packages/utils · Helper Functions]
      L[packages/eslint-config-custom · 统一 Lint 规范]
    end

    W --> UI; W --> DB; W --> V; W --> T; W --> U
    M --> UI; M --> V; M --> T; M --> U
    DB --> T
```

通过 `pnpm Workspaces` + `Turborepo 增量构建`，任意共享包变更只会影响依赖它的应用，未变的应用从 `node_modules/.cache/turbo` 秒级命中缓存，实现跨端一致的秒级增量编译体验。

**核心源码入口**：
- [turbo.json（构建任务流水线：build/lint/dev）](turbo.json)
- [package.json（pnpm workspace 别名 + 根级脚本：`pnpm db:*`）](package.json)
- [packages/prisma-db/（共享 Prisma Client 实例）](packages/prisma-db/)
- [packages/validators/（跨端 Zod 校验）](packages/validators/)
- [packages/ui/（共享 UI 组件库）](packages/ui/)

---

### 2. 膳食计划 + 智能购物清单聚合引擎

```mermaid
sequenceDiagram
    actor User as 用户（Web/Mobile）
    participant UI as UI（MealPlanView）
    participant API as Server Router（RSC Actions / React Query）
    participant DB as Prisma（PostgreSQL）
    participant Engine as 购物清单聚合引擎（services/shopping-list.ts）

    Note over User,Engine: Step 1：用户拖拽排程
    User->>UI: 选择食谱 → 拖到周历某一天（MealPlanItem：date, meal, 份数）
    UI->>API: 提交 MealPlan 变更事务
    API->>DB: 级联 upsert MealPlan + MealPlanItem（带份数）

    Note over User,Engine: Step 2：用户点「一键生成本周购物清单」
    User->>UI: 点击 Generate Shopping List
    UI->>API: POST /api/shopping-lists/generate?week=2026-W31
    API->>DB: 查询本周范围内所有 MealPlanItem → join Recipe.ingredients + Unit + Category
    API->>Engine: ①单位归一化 ②同食材聚合累加 ③按品类分组（蔬菜/肉类/乳制品/调味品/其他）
    Engine-->>API: 返回 ShoppingListItem[]（结构：{ingredient_id, name, total_qty, unit, category, checked:false}）
    API->>DB: 批量写入 ShoppingList + ShoppingListItem
    DB-->>UI: 返回新生成的购物清单对象（可分享 URL）
```

**核心源码入口**：
- [prisma/schema.prisma（MealPlanItem ↔ RecipeIngredient ↔ Category 关联定义）](prisma/schema.prisma)
- [packages/validators/（膳食计划提交 & 购物清单生成 Zod schemas）](packages/validators/)

---

### 3. 统一数据模型架构（ER Diagram）

```mermaid
erDiagram
    User ||--o{ Recipe : "author of"
    User ||--o{ Favorite : "favorited"
    User ||--o{ MealPlan : "created"
    User ||--o{ ShoppingList : "owns"
    User ||--o{ RecentlyViewedRecipe : "viewed"

    Recipe ||--o{ CategoryOnRecipe : "categorized"
    Recipe ||--o{ TagOnRecipe : "tagged"
    Recipe ||--o{ RecipeIngredient : "has"
    Recipe ||--o{ MealPlanItem : "included in"

    MealPlan ||--o{ MealPlanItem : "contains"
    ShoppingList ||--o{ ShoppingListItem : "contains"
    ShoppingListItem }o--|| RecipeIngredient : "aggregates"

    Category ||--o{ CategoryOnRecipe : "has"
    Tag ||--o{ TagOnRecipe : "has"
    IngredientCategory ||--o{ RecipeIngredient : "categorizes"
    IngredientCategory ||--o{ ShoppingListItem : "groups"
```

**核心源码入口**：
- [prisma/schema.prisma（完整 PostgreSQL Schema 声明 + 索引优化注释）](prisma/schema.prisma)

---

## 📂 项目结构

```text
recipe-planner-app/
├── apps/                             # 应用层
│   ├── web/                          # Next.js 14 Web 端
│   └── mobile/                       # React Native + Expo 移动端
├── packages/                         # 跨端共享包
│   ├── prisma-db/                    # Prisma Client + Schema
│   ├── types/                        # 全局 TypeScript 接口
│   ├── ui/                           # 跨端 UI 组件库
│   ├── utils/                        # 工具函数
│   ├── validators/                   # Zod 数据校验
│   └── eslint-config-custom/         # 共享 ESLint 配置
├── prisma/                           # 数据层
│   ├── schema.prisma                 # PostgreSQL Schema
│   └── seed.ts                       # 种子数据
├── public/                           # 静态资源
├── docker-compose.yml                # PostgreSQL 开发容器
├── turbo.json                        # Turborepo 配置
├── pnpm-workspace.yaml               # pnpm workspace 声明
├── package.json
├── tsconfig.json
├── README.md
└── README_EN.md
```

---

## 📊 Technology Stack Summary

| 层级 | 选型 | 作用 |
|:----|:----|:----|
| **Monorepo 构建** | Turborepo 1.12 + pnpm 10 Workspaces | 增量构建缓存 + 多包依赖统一管理 |
| **Web 框架** | Next.js 14（App Router）+ React 18 | SSR / RSC / Server Actions 高性能渲染 |
| **移动端框架** | React Native + Expo SDK | iOS / Android 原生跨平台构建，Expo Go 扫码真机调试 |
| **数据库 & ORM** | PostgreSQL 15 + Prisma ORM 5.10 + @prisma/client 5.22 | 强类型 Data Access + Migration 管理 + Studio GUI |
| **状态管理** | Zustand（客户端全局）+ TanStack Query v5（API 缓存） | 与共享包 TS 类型无缝衔接 |
| **UI & 样式** | TailwindCSS + Shadcn/ui（Radix UI 基础）+ 响应式设计系统 | 跨端一致的无障碍 UI 组件（Web 直接复用 packages/ui）|
| **跨端数据校验** | Zod 3 | packages/validators 一套 schema Web/Mobile 双端共用 |
| **身份认证** | NextAuth.js v5 | Email + OAuth（GitHub/Google 可扩展）、JWT Session |
| **版本管理** | Changesets | Monorepo 多包语义化版本发布与 Changelog |
| **代码质量** | ESLint 8 + Prettier 3（统一在 packages/eslint-config-custom） | 双端 Lint / Format 行为完全一致 |

---

## 🤝 Contributing

本项目已经有一份完整的贡献指南，建议所有第一次贡献的开发者先读 [CONTRIBUTING.md](CONTRIBUTING.md)，里面详细规定了：

- 开发环境完整配置（Fork → Clone → pnpm install → Prisma 初始化）
- **分支命名惯例**：`feature/xxx` / `fix/xxx` / `docs/xxx` / `refactor/xxx`
- **提交消息惯例**：Conventional Commits（`feat:` / `fix:` / `docs:` / `refactor:` / `perf:` / `test:` / `chore:`）
- Monorepo 跨包加依赖：`pnpm add <pkg> --filter @recipe-planner/<package-name>`
- 创建新共享包的步骤
- **PR 流程**：建分支 → `pnpm lint` → `pnpm test` → 提交 PR → Review → squash merge
- Changesets 版本管理：`pnpm changeset` 生成变更记录并与代码一起提交

> 💡 快速小贡献：[CONTRIBUTING.md](CONTRIBUTING.md) 里有「Good First Issue」级别的小任务，适合第一次参与开源。

---

## 🔒 Security

- 生产部署建议：
  - `NEXTAUTH_URL` 必须写真实域名，绝不能写 localhost
  - `NEXTAUTH_SECRET` 必须用 `openssl rand -hex 32` 生成 64 字符随机串
  - PostgreSQL 对外只允许从应用服务器 IP 连接，不要 0.0.0.0
  - 启用 Prisma 中间件 / Row Level Security（RLS）策略（v0.2 计划）
- **漏洞上报**：请发送邮件至 **recipe-planner-security [at] googlegroups [dot] com**，48 小时内首次回复，关键漏洞 72 小时内修复。**不要在公开 Issue 里披露未修复漏洞细节**。

---

## 📄 License

本项目基于 **MIT License** 开源。

- ✅ 商用 / 修改 / 分发（闭源或开源）自由
- ✅ 保留版权声明 + MIT 原文即可
- ❌ 作者不对使用后果承担任何责任

**版权声明**：Copyright (c) 2025–2026 Recipe Planner App Contributors. All Rights Reserved.

完整许可证原文请参阅仓库根目录下的 [`LICENSE`](LICENSE) 文件。