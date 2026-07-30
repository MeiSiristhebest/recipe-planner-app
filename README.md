# 🥗 Recipe Planner & Meal Sharing Assistant (食谱规划与膳食管理助手)

[🇨🇳 中文](#-中文) | [🇺🇸 English](#-english)

---

## 🇨🇳 中文

### 📖 项目简介

**Recipe Planner & Sharing Assistant** 是一款基于 **Turborepo** 架构构建的高性能、跨平台（Web + Mobile）膳食规划与食谱分享助手。项目采用现代化的 Monorepo 组织形式，实现了 Web 端（Next.js 14 App Router）与移动端（React Native / Expo）的极高代码复用，共享 UI 组件库、Zod 数据校验规则、TypeScript 类型定义及 Prisma 数据库客户端。

系统核心解决个人与家庭在日常饮食管理中的四大痛点：食谱探索与创作、智能一周膳食计划排程、动态营养成分统计、以及按类别自动聚合的智能购物清单生成。

---

## 🛠️ 核心架构设计与工程实践 (Architecture & Design)

以下架构模块均在本项目中进行了完整的实现与落地，点击对应模块中的源码直链，即可查阅底层的核心代码实现细节：

### 1. 模块化 Monorepo 依赖关系与代码复用 (Monorepo Architecture) 📦

*   **架构演进与思考**：将 Web 和 Mobile 应用拆分为独立的应用层，同时将数据库 Access、数据校验、UI 基础库下沉至 `packages/` 共享包。通过 `pnpm Workspaces` 与 `Turborepo` 的缓存构建管道，实现了跨端开发体验的一致性与秒级增量编译。
*   **Monorepo 拓扑依赖图**：

```mermaid
graph TD
    subgraph Applications [应用层]
        Web[apps/web - Next.js 14 App Router]
        Mobile[apps/mobile - React Native / Expo]
    end

    subgraph Packages [共享依赖层]
        UI[packages/ui - Shared Shadcn/Tailwind UI]
        DB[packages/prisma-db - Prisma Client & Schema]
        Validators[packages/validators - Shared Zod Schemas]
        Types[packages/types - Shared TypeScript Interfaces]
        Utils[packages/utils - Shared Helper Functions]
    end

    Web --> UI
    Web --> DB
    Web --> Validators
    Web --> Types
    Web --> Utils

    Mobile --> UI
    Mobile --> Validators
    Mobile --> Types
    Mobile --> Utils
    DB --> Types
```

*   **📂 核心源码直链**：
    - [turbo.json (Turborepo 增量构建任务流水线配置)](turbo.json)
    - [package.json (pnpm Workspace 别名及依赖图谱声明)](package.json)
    - [packages/prisma-db/ (Prisma ORM 共享客户端包)](packages/prisma-db/)
    - [packages/validators/ (基于 Zod 的跨端表单校验规则包)](packages/validators/)
    - [packages/ui/ (基准 Shadcn/Tailwind UI 共享组件库)](packages/ui/)

---

### 2. 膳食计划排程与智能购物清单生成引擎 (Meal Planning & Aggregation Engine) 🛒

*   **设计思路**：用户在日历看板中自由规划一周七天（早餐、午餐、晚餐）的食谱安排。系统实时根据食谱依赖的 `Ingredient` 列表，自动计算全周所需食材总量，并按市场品类（如“蔬菜水果”、“肉类海鲜”、“乳制品蛋类”）进行归类合并，生成可打勾标记的智能购物清单。
*   **业务逻辑流程图**：

```mermaid
sequenceDiagram
    actor User as 用户/客户端
    participant Web as Web/Mobile UI (MealPlanView)
    participant API as Server Router / React Query
    participant Prisma as Prisma ORM (PostgreSQL)
    participant Engine as 购物清单聚合引擎

    User->>Web: 选择食材配方并分配至周历 (MealPlanItem)
    Web->>API: 提交 MealPlan 变更事务
    API->>Prisma: 级联保存 MealPlanItem (日期、餐次、份数)
    User->>Web: 点击“一键生成本周购物清单”
    Web->>API: 请求生成 ShoppingList
    API->>Prisma: 查询当前 Week 范围内所有 MealPlanItem 及关联 Recipe.ingredients
    API->>Engine: 执行单位归一化与品类分组 (分类: 蔬菜/肉类/调味品)
    Engine-->>API: 返回分类聚合后的 ShoppingListItem 列表
    API->>Prisma: 批量写入 ShoppingList 与 ShoppingListItem 表
    Prisma-->>Web: 返回新生成的购物清单对象
```

*   **📂 核心源码直链**：
    - [prisma/schema.prisma (MealPlan 与 ShoppingList 关联模型定义)](prisma/schema.prisma#L87-L135)
    - [packages/validators/ (食谱与膳食计划提交校验 schema)](packages/validators/)

---

### 3. 多端统一的数据模型与关系架构 (Data Schema Architecture) 🗄️

*   **设计思路**：采用 PostgreSQL 作为关系型存储，结合 Prisma ORM 保证强类型强约束的数据读写。数据模型覆盖了多对多关联（如 `CategoryOnRecipe`、`TagOnRecipe`）、级联清理（Cascade Deletion）以及针对高频查询（如用户浏览历史）的联合索引优化。
*   **数据模型核心关系图 (ER Diagram)**：

```mermaid
erDiagram
    User ||--o{ Recipe : "author of"
    User ||--o{ Favorite : "favorited"
    User ||--o{ MealPlan : "created"
    User ||--o{ ShoppingList : "owns"
    User ||--o{ RecentlyViewedRecipe : "viewed"
    
    Recipe ||--o{ CategoryOnRecipe : "categorized"
    Recipe ||--o{ TagOnRecipe : "tagged"
    Recipe ||--o{ MealPlanItem : "included in"
    
    MealPlan ||--o{ MealPlanItem : "contains"
    ShoppingList ||--o{ ShoppingListItem : "contains"
    
    Category ||--o{ CategoryOnRecipe : "has"
    Tag ||--o{ TagOnRecipe : "has"
```

*   **📂 核心源码直链**：
    - [prisma/schema.prisma (完整 PostgreSQL Schema 声明文件)](prisma/schema.prisma)

---

## 📂 项目结构 (Project Structure)

```text
recipe-planner-app/
├── apps/                    # 应用交付层
│   ├── web/                 # Web 应用 (Next.js 14 App Router, React 18, NextAuth)
│   └── mobile/              # 移动应用 (React Native / Expo SDK)
├── packages/                # 共享模块层
│   ├── prisma-db/           # 共享 Prisma 数据库 Client 实例
│   ├── types/               # 全局 TypeScript 接口定义
│   ├── ui/                  # 跨端 UI 基础组件库 (Tailwind / Radix)
│   ├── utils/               # 通用工具函数库
│   ├── validators/          # 基于 Zod 的统一数据验证规则
│   └── eslint-config-custom/# 统一代码 Lint 规范
├── prisma/                  # 数据库架构声明与 Migration 脚本
│   └── schema.prisma        # 关系型数据库 Schema
├── turbo.json               # Turborepo 构建任务配置
└── package.json             # 根级依赖与 pnpm workspace 配置
```

---

## 📊 技术栈选型 (Technology Stack)

| 层级 | 核心技术 | 作用 |
|:------|:-----------|:--------|
| **Monorepo 构建** | Turborepo + pnpm Workspaces | 增量构建与多包依赖依赖管理 |
| **Web 框架** | Next.js 14 (App Router) + React 18 | Web 端高性能 SSR / SSG 渲染 |
| **移动端框架** | React Native + Expo | iOS / Android 原生跨平台构建 |
| **数据库 & ORM** | PostgreSQL + Prisma ORM | 关系型数据库存储与强类型 Data Access |
| **状态管理** | Zustand + TanStack Query v5 | 客户端全局状态与服务端 API 数据缓存 |
| **UI & 样式** | TailwindCSS + Shadcn/ui (Radix UI) | 响应式现代化设计系统 |
| **数据校验** | Zod | 跨端统一的 Schema 运行时校验 |
| **身份认证** | NextAuth.js | Web 端安全 JWT 登录认证与 Session 维护 |

---

## 🏃 开发环境快速启动指南

### 1. 环境准备
- **Node.js**: 18.18 或更高版本
- **pnpm**: 8.6.10 或更高版本
- **PostgreSQL**: 14.0 或更高版本

### 2. 初始化与依赖安装
```bash
# 克隆仓库
git clone https://github.com/MeiSiristhebest/recipe-planner-app.git
cd recipe-planner-app

# 安装项目全局依赖
pnpm install
```

### 3. 环境变量配置
在根目录下创建 `.env` 文件，配置 PostgreSQL 连接串与 NextAuth 密钥：
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/recipe_planner"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"
```

### 4. 数据库 Migration 与种子数据填充
```bash
# 生成 Prisma Client
pnpm db:generate

# 推送 Schema 到数据库
pnpm db:push

# 填充初始测试数据
pnpm db:seed
```

### 5. 启动开发服务器
```bash
# 启动所有应用 (Web + Mobile)
pnpm dev

# 仅启动 Web 端 (Next.js)
pnpm dev --filter web

# 仅启动 移动端 (Expo)
pnpm dev --filter mobile
```

---

## 🇺🇸 English

### 📖 Introduction

**Recipe Planner & Sharing Assistant** is a modern, high-performance, cross-platform (Web + Mobile) meal planning and recipe sharing solution engineered inside a **Turborepo** monorepo. It achieves maximum code sharing between the Web client (Next.js 14 App Router) and Mobile application (React Native / Expo), consolidating shared UI component libraries, Zod validation schemas, TypeScript contracts, and Prisma database interfaces.

The system addresses key daily nutritional workflow challenges: recipe creation & discovery, automated weekly meal planning, dynamic calorie/macro tracking, and intelligent shopping list compilation categorized by market departments.

---

## 🛠️ Architecture & Design Highlights

### 1. Monorepo Dependency Isolation & Code Sharing 📦
*   **Architecture Evolution**: Decouples application clients from core backend domain logic. Shared utilities, Prisma models, and Zod validators reside in isolated `packages/` modules. Build steps leverage Turborepo caching pipelines for rapid incremental compilation across platforms.
*   **Topology Graph**: See the [Monorepo Dependency Diagram](#1-模块化-monorepo-依赖关系与代码复用-monorepo-architecture-) above.

### 2. Meal Planning & Smart Shopping List Aggregation 🛒
*   **Engine Design**: Users assign recipes to weekly slots (Breakfast, Lunch, Dinner). The system parses ingredient lists from scheduled recipes, calculates metric totals, normalizes units, and categorizes items into department groups (Produce, Meats, Dairy, Pantry) to render an interactive checkable shopping list.
*   **Sequence Diagram**: See the [Weekly Meal Planning Flow](#2-膳食计划排程与智能购物清单生成引擎-meal-planning--aggregation-engine-) above.

---

## 📊 Tech Stack Matrix

- **Monorepo Architecture**: Turborepo, pnpm Workspaces
- **Web App**: Next.js 14 (App Router), React 18, TypeScript, NextAuth.js
- **Mobile App**: React Native, Expo SDK, TypeScript
- **Database & ORM**: PostgreSQL, Prisma ORM
- **State Engine**: TanStack Query v5, Zustand
- **Styling & UI**: TailwindCSS, Shadcn/ui (Radix UI)
- **Validation**: Zod (Shared runtime validation schemas)

---

## 📜 License

Licensed under the [MIT License](LICENSE).
