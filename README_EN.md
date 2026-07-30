# 🥗 Recipe Planner & Meal Sharing Assistant

[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-black.svg?style=for-the-badge)](README_EN.md)
[![React Native](https://img.shields.io/badge/React_Native-Expo_SDK-61DAFB.svg?style=for-the-badge)](README_EN.md)
[![Prisma](https://img.shields.io/badge/ORM-Prisma_%7C_PostgreSQL-2D3748.svg?style=for-the-badge)](README_EN.md)

[🇨🇳 中文](README.md) | [🇺🇸 English](README_EN.md)

---

## 📖 Introduction

**Recipe Planner & Sharing Assistant** is a modern, high-performance, cross-platform (Web + Mobile) meal planning and recipe discovery solution engineered inside a **Turborepo** monorepo architecture.

It achieves maximum code sharing between the Web client (Next.js 14 App Router) and Mobile application (React Native / Expo), consolidating shared UI component libraries (Shadcn/Tailwind), Zod validation schemas, TypeScript contracts, and Prisma PostgreSQL ORM database clients.

The system addresses key daily nutritional workflow challenges: recipe creation & discovery, automated weekly meal planning, dynamic calorie/macro tracking, and intelligent shopping list compilation categorized by market departments.

---

## 🛠️ Microservice Core Architecture & Engineering Design

All architectural components below are fully implemented in this repository. Click any source code link to inspect exact implementation details:

### 1. Modular Monorepo Architecture & Code Reuse 📦

*   **Architectural Evolution**: Decouples application clients from core backend domain logic. Shared utilities, Prisma models, and Zod validators reside in isolated `packages/` modules. Build steps leverage Turborepo caching pipelines for rapid incremental compilation across platforms.
*   **Monorepo Topology Graph**:

```mermaid
graph TD
    subgraph Applications [Application Delivery Layer]
        Web[apps/web - Next.js 14 App Router]
        Mobile[apps/mobile - React Native / Expo]
    end

    subgraph Packages [Shared Modules Layer]
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

*   **📂 Direct Source Code Links**:
    - [turbo.json (Turborepo Incremental Task Pipeline Config)](turbo.json)
    - [package.json (pnpm Workspace Alias & Dependency Graph)](package.json)
    - [packages/prisma-db/ (Shared Prisma ORM Client Package)](packages/prisma-db/)
    - [packages/validators/ (Cross-Platform Zod Form Validation Package)](packages/validators/)
    - [packages/ui/ (Shared Shadcn/Tailwind UI Component Library)](packages/ui/)

---

### 2. Meal Planning & Smart Shopping List Aggregation Engine 🛒

*   **Engine Design**: Users assign recipes to weekly slots (Breakfast, Lunch, Dinner). The system parses ingredient lists from scheduled recipes, calculates metric totals, normalizes units, and categorizes items into department groups (Produce, Meats, Dairy, Pantry) to render an interactive checkable shopping list.
*   **Business Flowchart**:

```mermaid
sequenceDiagram
    actor User as User / Client App
    participant Web as Web/Mobile UI (MealPlanView)
    participant API as Server Router / React Query
    participant Prisma as Prisma ORM (PostgreSQL)
    participant Engine as Shopping List Aggregation Engine

    User->>Web: Select recipes & assign to weekly calendar (MealPlanItem)
    Web->>API: Submit MealPlan mutation
    API->>Prisma: Cascade save MealPlanItem (Date, MealTime, Servings)
    User->>Web: Click "Generate Weekly Shopping List"
    Web->>API: Request ShoppingList generation
    API->>Prisma: Query all MealPlanItems & Recipe.ingredients in target Week
    API->>Engine: Perform unit normalization & department grouping
    Engine-->>API: Return categorized ShoppingListItem payload
    API->>Prisma: Batch insert ShoppingList & ShoppingListItems
    Prisma-->>Web: Return newly generated ShoppingList object
```

*   **📂 Direct Source Code Links**:
    - [prisma/schema.prisma (MealPlan & ShoppingList Relation Models)](prisma/schema.prisma#L87-L135)
    - [packages/validators/ (Recipe & MealPlan Submission Validators)](packages/validators/)

---

### 3. Unified Data Schema & Entity Relationships 🗄️

*   **Design Rationale**: Leverages PostgreSQL for relational storage paired with Prisma ORM for strong typing. The schema handles multi-to-multi joins (`CategoryOnRecipe`, `TagOnRecipe`), cascade evictions, and composite indices for fast query evaluation.
*   **Entity Relationship Diagram (ERD)**:

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

*   **📂 Direct Source Code Links**:
    - [prisma/schema.prisma (Complete PostgreSQL Schema File)](prisma/schema.prisma)

---

## 📂 Project Structure

```text
recipe-planner-app/
├── apps/                    # Application Layer
│   ├── web/                 # Web App (Next.js 14 App Router, React 18, NextAuth)
│   └── mobile/              # Mobile App (React Native / Expo SDK)
├── packages/                # Shared Package Modules
│   ├── prisma-db/           # Shared Prisma DB Client Instance
│   ├── types/               # Global TypeScript Interfaces
│   ├── ui/                  # Cross-Platform UI Component Library
│   ├── utils/               # Shared Utility Helpers
│   ├── validators/          # Shared Zod Runtime Schemas
│   └── eslint-config-custom/# Unified ESLint Rules
├── prisma/                  # Schema Declarations & Migration Scripts
│   └── schema.prisma        # Database Schema
├── turbo.json               # Turborepo Build Pipeline
└── package.json             # Root Dependencies & Workspace Setup
```

---

## 📊 Technology Stack Matrix

| Layer | Core Technology | Role |
|:------|:-----------|:--------|
| **Monorepo Build** | Turborepo + pnpm Workspaces | Incremental Build & Package Management |
| **Web Framework** | Next.js 14 (App Router) + React 18 | High-Performance Web SSR / SSG |
| **Mobile Framework**| React Native + Expo SDK | Native Cross-Platform iOS / Android |
| **Database & ORM** | PostgreSQL + Prisma ORM | Relational Data Storage & Strong Typing |
| **State Engine** | Zustand + TanStack Query v5 | Client Global State & Server Query Cache |
| **UI & Styling** | TailwindCSS + Shadcn/ui (Radix UI) | Responsive Modern Design System |
| **Validation** | Zod | Cross-Platform Runtime Schema Validation |
| **Auth System** | NextAuth.js | Web JWT Authentication & Session Maintenance |

---

## 🏃 Quick Start Guide

### 1. Prerequisites
- **Node.js**: 18.18 or higher
- **pnpm**: 8.6.10 or higher
- **PostgreSQL**: 14.0 or higher

### 2. Installation
```bash
git clone https://github.com/MeiSiristhebest/recipe-planner-app.git
cd recipe-planner-app
pnpm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/recipe_planner"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"
```

### 4. Database Migration & Seeding
```bash
pnpm db:generate
pnpm db:push
pnpm db:seed
```

### 5. Start Development Servers
```bash
# Start all apps (Web + Mobile)
pnpm dev

# Start Web only (Next.js)
pnpm dev --filter web

# Start Mobile only (Expo)
pnpm dev --filter mobile
```

---

## 📜 License

Licensed under the [MIT License](LICENSE).
