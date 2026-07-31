# Recipe Planner & Meal Sharing Assistant 🥗

<p align="center">
  <strong>Cross-platform meal planner · recipe sharing · smart shopping-list generator for families and individuals</strong>
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

**Recipe Planner & Sharing Assistant** is a high-performance, cross-platform (Web + iOS + Android) meal-planning and recipe-sharing system built on **Turborepo + pnpm Workspaces**.

Individuals and families face four recurring pain points when managing day-to-day eating:

1. **Low signal-to-noise recipe discovery.** Recipes on the open web are scattered and wildly inconsistent in quality; there's no easy place to keep a private, re-editable personal recipe library.
2. **Tedious weekly scheduling.** Calendar-style meal planning requires manually writing down the recipe, the portion count, and the ingredient quantities for every meal slot.
3. **No live nutrition totals.** You can't tell in real time how your week stacks up in macronutrients (calories / protein / carbs / fat) or key micronutrients.
4. **Repeatedly rebuilding the shopping list.** Every time you plan meals you end up hand-counting ingredients across recipes — inevitably forgetting something, double-buying, or mixing incompatible units.

Recipe Planner App solves **all four problems in one go** with a unified data model plus a monorepo full of cross-platform shared packages. Use the Web app at your desk to browse recipes and plan the week; use the mobile app at the supermarket to tick things off.

---

## ✨ Key Features

| # | Feature | Details | Contextual Note |
|---|---------|---------|-----------------|
| 1 | **🧭 Recipe discovery & creation** | Browse community recipes, favourite, edit steps in Markdown rich text, multi-photo covers, search by category / tag / keyword. | One-click import from external recipe URLs is planned for v0.2. |
| 2 | **📅 Smart weekly meal planning** | Drag-and-drop calendar board for breakfast / lunch / dinner; auto-scales ingredient quantities on portion changes; supports whole-week template cloning. | Meal plans can be exported as iCalendar events. |
| 3 | **📊 Live nutrition totals** | Aggregates macro + micronutrients by day / week against the USDA FDC nutrition database; supports configurable goal thresholds with in-app warnings. | Per-food nutrition values can be hand-overridden if the source data is wrong. |
| 4 | **🛒 Smart shopping-list generator** | One-click collapses every ingredient across an entire weekly meal plan, **groups items by category** (produce / meat & seafood / dairy & eggs / pantry staples / other), normalises units across recipes, and merges duplicate ingredients. Tick items off as you go. | Shopping lists are shareable with family members for collaborative editing. |
| 5 | **📱 Identical UX on Web + Mobile** | Next.js 14 SSR web front-end + React Native Expo iOS/Android app; the shared Zod validation schemas, Prisma DB client, base UI primitives, and TypeScript interfaces all live under `packages/*` so both platforms behave exactly the same. | Roughly **65 % of the code is shared** between the two runtimes. |
| 6 | **🔐 NextAuth authentication** | Email + OAuth (GitHub / Google, extensible) login; JWT sessions; role-based enforcement of recipe public / private visibility. Per-user ownership acts as a lightweight RLS at the application layer. |

---

## 🟢 Requirements

| Dependency | Minimum Version |
|------------|------------------|
| **Node.js** | 18.18 LTS (20.x recommended) |
| **pnpm** | 8.6.10 |
| **PostgreSQL** | 14.0 (15.x recommended) |
| **Docker & Compose v2** | 24.0 (Option A only) |
| **Expo Go** | For mobile dev only, available on App Store / Play Store |

---

## 📦 Installation

Two paths are provided. **If you just want things up as fast as possible, jump straight to Option A (Docker one-command Postgres + local monorepo dev).**

---

### Option A · Docker Compose for PostgreSQL + local monorepo (recommended)

Fastest path: start a health-checked PostgreSQL 15 container with Docker, then run every application-layer service (Web / Mobile / Prisma Client generation) locally with native pnpm — because native gives you the absolute fastest hot reload.

```bash
# 1. Clone & enter
git clone https://github.com/MeiSiristhebest/recipe-planner-app.git
cd recipe-planner-app

# 2. One command: start PostgreSQL 15 (long-running; healthy before the app tries to connect)
docker compose up -d db
# `docker ps` should show the `recipe_planner_db_local` container listening on port 5432.

# 3. Install the entire monorepo's dependencies (pnpm 10.10, aligned with packageManager; ~ 800 MB)
pnpm install

# 4. Copy the env template (see "Configuration" later in this file for every field)
cp .env.example .env
# Edit: DATABASE_URL (default matches docker compose, usually fine), NEXTAUTH_URL, NEXTAUTH_SECRET, OAuth providers.

# 5. Generate Prisma Client → push the schema to Postgres → seed demo data (recipes / tags / categories)
pnpm db:generate
pnpm db:push
pnpm db:seed
```

✅ You're installed — skip ahead to **Quick Start** to run both platforms.

---

### Option B · Use a remote PostgreSQL (no local Docker at all)

Use this if you already have a Supabase / Neon / self-hosted Postgres instance:

```bash
git clone https://github.com/MeiSiristhebest/recipe-planner-app.git
cd recipe-planner-app

# Write the DATABASE_URL straight into .env, pointing at your existing Postgres:
# DATABASE_URL="postgresql://user:password@your-db-host:5432/recipe_planner"

pnpm install
pnpm db:generate
pnpm db:push      # First time: creates tables. For ongoing migrations, use pnpm db:migrate:dev.
pnpm db:seed      # Optional: populates the demo dataset.
```

---

### 🔧 Configuration · mandatory fields in `.env`

```env
# ========== Database ==========
# Matches the docker-compose.yml PostgreSQL 15 credentials from Option A.
DATABASE_URL="postgresql://recipe_user:recipe_password@localhost:5432/recipe_planner_dev"

# ========== NextAuth ==========
# Absolute URL of the Web app (localhost:3000 for dev; your real domain in production)
NEXTAUTH_URL="http://localhost:3000"
# Generate with:  openssl rand -hex 32
NEXTAUTH_SECRET="your-nextauth-secret-key-64-char-hex"

# ========== OAuth Providers (optional — keep email at minimum) ==========
# GITHUB_ID=xxx
# GITHUB_SECRET=xxx
# GOOGLE_ID=xxx
# GOOGLE_SECRET=xxx
```

> 📌 If a `.env.example` template was never committed to the repo, the block above is the authoritative template. Copy/paste it verbatim.

---

## 🚀 Quick Start

> Prerequisites: every step in **Installation → Option A** completed (Postgres container healthy, `pnpm install` + `db:push` + `db:seed` all green).

### Boot the dual-platform dev servers

```bash
# Style 1 — start Web + Mobile together (two ports, one Turbo scheduler)
pnpm dev
# Style 2 — Web only (the most common debug path)
pnpm dev --filter web
# Style 3 — Mobile only (Expo Dev Server + QR code)
pnpm dev --filter mobile
```

### Expected endpoints & what to check

| Target | URL / how to access | Smoke test |
|--------|--------------------|------------|
| **Next.js Web App** | [`http://localhost:3000`](http://localhost:3000) | Open the homepage → "Recipe discovery" or "Login" renders; seeded recipes browse correctly. |
| **Expo Mobile App** | Terminal prints a QR code + `exp://<your-lan-ip>:8081` | Install Expo Go on your phone → scan the QR → home screen loads. (Phone and laptop on the same Wi-Fi.) |
| **Prisma Studio (DB GUI)** | (2nd terminal) `pnpm db:studio` → [`http://localhost:5555`](http://localhost:5555) | Browse User / Recipe / MealPlan / ShoppingListItem tables; seed data is queryable. |
| **Turborepo full build** | `pnpm build` | Prints "Tasks: 2 successful, 0 cached, 0 failed" on a clean first run. |

### Five-minute end-to-end walkthrough (generate a weekly shopping list)

1. Browser → `http://localhost:3000` → top-right **Sign up** → sign in with email or GitHub OAuth.
2. Homepage **Recipe discovery** → open the seeded recipe **🍝 Creamy Bacon Carbonara** → click **Favourite**.
3. Go to **Meal Planner** → calendar view → drag favourite recipes onto breakfast/lunch/dinner slots Mon–Sun (or use "Clone last week's template" to fill it in one click).
4. Click the top-right **🛒 Generate this week's shopping list**. Under the hood the system:
   - walks every `MealPlanItem`, loads each `Recipe.ingredients`,
   - **normalises units** (15 ml soy sauce + 5 ml soy sauce = 20 ml soy sauce),
   - **groups by aisle** (produce / meat & seafood / dairy & eggs / pantry staples / other),
   - writes rows into the `ShoppingList` + `ShoppingListItem` tables.
5. You're redirected to the shopping-list detail page where you can tick items off on desktop or scan the same URL into the Expo mobile app to tick items on the go.

---

## 🏗️ Architecture Highlights

### 1. Monorepo topology dependency graph

```mermaid
graph TD
    subgraph Apps [Application layer · Apps]
      W[apps/web · Next.js 14 App Router]
      M[apps/mobile · React Native + Expo SDK]
    end

    subgraph Pkgs [Shared packages · packages]
      UI[packages/ui · Shadcn/Tailwind cross-platform base UI kit]
      DB[packages/prisma-db · Prisma Client + Schema]
      V [packages/validators  · Zod Schemas (shared form validation)]
      T[packages/types · TypeScript shared interfaces]
      U[packages/utils · Helper functions]
      L[packages/eslint-config-custom · Unified lint rules]
    end

    W --> UI; W --> DB; W --> V; W --> T; W --> U
    M --> UI; M --> V; M --> T; M --> U
    DB --> T
```

Thanks to **pnpm Workspaces** + **Turborepo incremental builds**, changing a shared package only invalidates the apps that depend on it; everything else returns sub-second from `node_modules/.cache/turbo`. End result: consistent sub-second incremental compile across both platforms.

**Key source entry points:**
- [turbo.json — Build pipeline (build / lint / dev tasks)](turbo.json)
- [package.json — pnpm workspace aliases + root scripts `pnpm db:*`](package.json)
- [packages/prisma-db/ — shared Prisma Client instance](packages/prisma-db/)
- [packages/validators/ — shared Zod schemas](packages/validators/)
- [packages/ui/ — shared UI component library](packages/ui/)

---

### 2. Meal plan + shopping-list aggregation engine

```mermaid
sequenceDiagram
    actor User as User (Web/Mobile)
    participant UI as UI (MealPlanView)
    participant API as Server Router (RSC Actions / React Query)
    participant DB as Prisma (PostgreSQL)
    participant Engine as Shopping-list aggregation engine (services/shopping-list.ts)

    Note over User,Engine: Step 1 — User drags recipes onto the calendar
    User->>UI: Select recipe → drop onto week calendar (MealPlanItem: date, meal, portions)
    UI->>API: Submit MealPlan transaction
    API->>DB: Cascade upsert MealPlan + MealPlanItem (w/ portions)

    Note over User,Engine: Step 2 — User clicks "Generate this week's shopping list"
    User->>UI: Click Generate Shopping List
    UI->>API: POST /api/shopping-lists/generate?week=2026-W31
    API->>DB: Query all MealPlanItem rows for the week → JOIN Recipe.ingredients + Unit + Category
    API->>Engine: ① unit normalisation ② identical ingredients summed  ③ aisle grouping (produce/meat/dairy/pantry/other)
    Engine-->>API: ShoppingListItem[] = [{ingredient_id, name, total_qty, unit, category, checked:false}]
    API->>DB: Batch insert ShoppingList + ShoppingListItem rows
    DB-->>UI: Returns the newly created shopping list (shareable URL)
```

**Key source entry points:**
- [prisma/schema.prisma — MealPlanItem ↔ RecipeIngredient ↔ Category relation declarations](prisma/schema.prisma)
- [packages/validators/ — Meal-plan submission + shopping-list Zod schemas](packages/validators/)

---

### 3. Unified data model (ER diagram)

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

**Key source entry points:**
- [prisma/schema.prisma — Full PostgreSQL schema declaration + index optimisation comments](prisma/schema.prisma)

---

## 📂 Project Structure

```text
recipe-planner-app/
├── apps/                             # Application layer
│   ├── web/                          # Next.js 14 Web app
│   └── mobile/                       # React Native + Expo mobile app
├── packages/                         # Cross-platform shared packages
│   ├── prisma-db/                    # Prisma Client + Schema
│   ├── types/                        # Global TypeScript interfaces
│   ├── ui/                           # Cross-platform UI component library
│   ├── utils/                        # Utility functions
│   ├── validators/                   # Zod schemas
│   └── eslint-config-custom/         # Shared ESLint config
├── prisma/                           # Data layer
│   ├── schema.prisma                 # PostgreSQL Schema
│   └── seed.ts                       # Seed data
├── public/                           # Static assets
├── docker-compose.yml                # PostgreSQL dev container
├── turbo.json                        # Turborepo config
├── pnpm-workspace.yaml               # pnpm workspace declarations
├── package.json
├── tsconfig.json
├── README.md
└── README_EN.md
```

---

## 📊 Technology Stack Summary

| Layer | Choice | Role |
|:----|:----|:----|
| **Monorepo build** | Turborepo 1.12 + pnpm 10 Workspaces | Incremental build cache + unified multi-package dependency management |
| **Web framework** | Next.js 14 (App Router) + React 18 | SSR / RSC / Server Actions for high-performance rendering |
| **Mobile framework** | React Native + Expo SDK | Native iOS / Android cross-platform builds with Expo Go on-device debugging |
| **Database & ORM** | PostgreSQL 15 + Prisma ORM 5.10 + @prisma/client 5.22 | Strongly typed data access + migration management + Studio GUI |
| **State management** | Zustand (client globals) + TanStack Query v5 (API caching) | Zero-friction consumption of shared TypeScript types across packages |
| **UI & styling** | TailwindCSS + Shadcn/ui (Radix UI primitives) + responsive design system | Accessible, cross-platform consistent UI components (Web reuses `packages/ui` directly) |
| **Cross-platform validation** | Zod 3 | One `packages/validators` schema powers both Web and Mobile form validation |
| **Authentication** | NextAuth.js v5 | Email + OAuth (GitHub / Google — extensible), JWT sessions |
| **Release management** | Changesets | Semantic versioning + changelogs across every package in the monorepo |
| **Code quality** | ESLint 8 + Prettier 3 (pinned in `packages/eslint-config-custom`) | Identical lint / format behaviour on Web and Mobile |

---

## 🤝 Contributing

A complete contributor guide ships at [`CONTRIBUTING.md`](CONTRIBUTING.md). First-time contributors please read it first; it formalises:

- Full dev environment setup (Fork → Clone → pnpm install → Prisma initialisation)
- **Branch naming convention:** `feature/xxx` / `fix/xxx` / `docs/xxx` / `refactor/xxx`
- **Commit message convention:** Conventional Commits (`feat:` / `fix:` / `docs:` / `refactor:` / `perf:` / `test:` / `chore:`)
- Adding cross-monorepo dependencies: `pnpm add <pkg> --filter @recipe-planner/<package-name>`
- How to create a brand-new shared package
- **PR lifecycle:** branch → `pnpm lint` → `pnpm test` → open PR → review → squash merge
- Changesets release management: `pnpm changeset` generates a changelog entry committed with the code

> 💡 Small contribution ideas? [`CONTRIBUTING.md`](CONTRIBUTING.md) keeps a Good First Issue list sized for first-time open-source contributors.

---

## 🔒 Security

- **Production deployments checklist:**
  - `NEXTAUTH_URL` must be the real production domain — **never `localhost`**.
  - `NEXTAUTH_SECRET` must be 64 hex chars generated by `openssl rand -hex 32`.
  - Postgres should only accept connections from your application server IP — never expose on `0.0.0.0`.
  - Enable Prisma middleware + Postgres Row Level Security policies (planned v0.2).
- **Disclosing vulnerabilities:** Email **`recipe-planner-security [at] googlegroups [dot] com`**. First response within 48 hours; critical bugs get a patch within 72 hours. **Never detail an unfixed vulnerability in a public GitHub Issue.**

---

## 📄 License

Released under the **MIT License**.

- ✅ Free to use commercially / modify / distribute (open or closed source)
- ✅ Just keep the copyright notice below + a copy of the MIT license alongside derivative works
- ❌ The authors accept no liability for any direct or indirect damages arising from use

**Copyright:** Copyright (c) 2025–2026 Recipe Planner App Contributors. All Rights Reserved.

Full license text: [`LICENSE`](LICENSE).
