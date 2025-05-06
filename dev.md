### **Recipe Planner and Sharing Assistant (Monorepo Edition): Detailed Development Guide**

**Project Name:** `recipe-planner-app` (Monorepo)

**Core Concept:** To build a modern, cross-platform application integrating recipe discovery, sharing, personalized weekly meal planning, and intelligent shopping list generation. Utilizing Turborepo for Monorepo management enables code sharing and efficient development for both Web (Next. Js) and Mobile (React Native) platforms.

---

#### **1. Tech Stack**

*   **Monorepo & Build:**
    *   Turborepo: High-performance build system
    *   pnpm Workspaces: Package management and dependency sharing
*   **Web Application (`apps/web`):**
    *   Next. Js 14+ (using App Router)
    *   React 18+
    *   TypeScript
*   **Mobile Application (`apps/mobile`):**
    *   React Native (Assuming Expo based on `package.json`)
    *   React 18+
    *   TypeScript
*   **Shared UI Components (`packages/ui`):**
    *   React
    *   TailwindCSS (Requires cross-package configuration to work effectively)
    *   Shadcn/ui style components (Based on Radix UI & Tailwind)
    *   `class-variance-authority`, `clsx`, `tailwind-merge`
*   **State Management:**
    *   Zustand (For global client-side state, e.g., UI state, user preferences) - Used within each App
    *   React Query (TanStack Query v 5) (For server state management, caching, data synchronization) - Used within each App
*   **Database & ORM (`packages/prisma-db` & `prisma/`):**
    *   PostgreSQL (or other SQL database)
    *   Prisma (ORM)
*   **Authentication (Web):**
    *   NextAuth. Js (Implemented in `apps/web`)
*   **Form Handling (`packages/validators` & within Apps):**
    *   React Hook Form (Used within each App)
    *   Zod (Shared validation logic)
*   **Interaction (Added as needed within Apps):**
    *   DnD Kit (For drag-and-drop, e.g., meal planner)
    *   Framer Motion (For animations)
*   **Code Style (`packages/eslint-config-custom`):**
    *   ESLint
    *   Prettier
*   **Type Definitions (`packages/types`):**
    *   TypeScript
*   **Utility Functions (`packages/utils`):**
    *   TypeScript, `date-fns`, etc.
*   **Environment Variables:**
    *   `dotenv-cli` (Loaded from root `.env`)

#### **2. Project Structure**

```
recipe-planner-app/
├── apps/                    # Individual Applications (Application Layer)
│   ├── web/                 # Web App (Next.js) - UI Presentation, API Routes, Web-specific logic
│   │   ├── app/             # Next.js App Router core directory
│   │   │   ├── (auth)/      # Authentication route group
│   │   │   ├── (main)/      # Main application interface route group (requires login)
│   │   │   │   ├── recipes/
│   │   │   │   │   └── [recipeId]/page.tsx # Recipe Detail Page
│   │   │   │   │   └── page.tsx           # Recipe Library Page
│   │   │   │   ├── meal-plans/page.tsx   # Weekly Plan Page
│   │   │   │   ├── shopping-list/page.tsx# Shopping List Page
│   │   │   │   └── profile/page.tsx      # Profile Center Page
│   │   │   ├── api/         # API Routes (Route Handlers)
│   │   │   └── layout.tsx   # Web app root layout
│   │   ├── components/      # Web app-specific components (gradually migrate to packages/ui)
│   │   ├── lib/             # Web app utilities, config, Hooks (some can move to packages/utils)
│   │   ├── public/          # Web static assets
│   │   ├── types/           # Web app-specific types (or re-export shared types)
│   │   ├── next.config.mjs
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── mobile/              # Mobile App (React Native / Expo) - UI Presentation, Mobile-specific logic
│       ├── src/             # Mobile app source code
│       │   ├── components/  # Mobile app-specific components (prefer packages/ui)
│       │   ├── navigation/  # Navigation configuration
│       │   ├── screens/     # Screen components
│       │   ├── store/       # State management (Zustand)
│       │   ├── hooks/       # Custom Hooks
│       │   └── api/         # API call encapsulation (consuming web app's API)
│       ├── app.json         # Expo config
│       ├── package.json
│       └── tsconfig.json
├── packages/                # Shared Packages (Shared Logic & Resources)
│   ├── prisma-db/           # Prisma database client encapsulation and export
│   ├── types/               # Shared TypeScript type definitions
│   ├── ui/                  # Shared UI component library (React / Tailwind / Radix)
│   ├── utils/               # Shared utility functions (date, string, business logic, etc.)
│   ├── validators/          # Shared Zod validation Schemas
│   └── eslint-config-custom/ # Shared ESLint configuration
├── prisma/                  # Global Prisma configuration
│   ├── schema.prisma        # Database Schema definition (single source of truth)
│   └── migrations/          # Database migration files
├── .env                     # Root environment variables (loaded via dotenv-cli)
├── .gitignore
├── CONTRIBUTING.md          # Contribution guide (Created)
├── docs/                    # Project documentation
│   └── COMPONENT_MIGRATION.md # Component migration guide (Created)
├── package.json             # Root package.json (manages workspace and devDependencies)
├── pnpm-lock.yaml
├── pnpm-workspace.yaml      # pnpm workspace configuration
├── tsconfig.base.json       # Base TypeScript configuration
├── tsconfig.json            # Root TypeScript configuration (references base)
└── turbo.json               # Turborepo configuration file (Cache optimized)
```

#### **3. UI/UX Specifications (Reference)**

*   **Theme & Colors:**
    *   Primary: `#FF9F1C` (Warm Orange) - For buttons, key elements, links, active states.
    *   Secondary: `#2EC4B6` (Mint Green) - For secondary buttons, tags, informational highlights, success states.
    *   Accent: `#FFD700` (Gold) - For ratings, special highlights, or premium features (use sparingly).
    *   Background:
        *   Light Mode: Main `#FFFFFF` (White), Secondary/Card `#F8F9FA` (Light Gray).
        *   Dark Mode: Main `#1A1A1A` (Very Dark Gray), Secondary/Card `#2C2C2C` (Dark Gray).
    *   Text:
        *   Light Mode: Primary `#333333` (Dark Gray), Secondary `#555555` (Medium Gray).
        *   Dark Mode: Primary `#E0E0E0` (Light Gray), Secondary `#B0B0B0` (Medium-Light Gray).
    *   Muted/Border:
        *   Light Mode: `#CED4DA` (Light Gray).
        *   Dark Mode: `#444444` (Dark Gray).
    *   Error/Destructive: `#E53E3E` (Red).
    *   Success: `#38A169` (Green - can be similar to Secondary if desired, or a distinct shade).
    *   **Dark Mode Support:** Provide a toggle option. Theme variables should be meticulously managed for both modes.

*   **Typography:**
    *   **Chinese Font:** "Noto Sans SC", "Source Han Sans CN", "PingFang SC", "Microsoft YaHei" (ensure proper web font loading and fallbacks).
    *   **UI/English Font:** System Font Stack (San Francisco, Segoe UI, Roboto, Noto Sans, sans-serif).
    *   **Hierarchy:** Clear visual hierarchy using font size, weight (e.g., 300, 400, 500, 700), and color. Use Tailwind's typography utilities effectively.
        *   H1: e.g., 2.25rem (36px) Bold
        *   H2: e.g., 1.875rem (30px) Bold
        *   H3: e.g., 1.5rem (24px) Semi-Bold
        *   Body: e.g., 1rem (16px) Regular
        *   Caption/Muted: e.g., 0.875rem (14px) Regular

*   **Iconography:**
    *   **Library:** **Lucide Icons** (already in use, good choice due to its tree-shakable nature and extensive set). Ensure consistency in icon style (e.g., stroke width, fill/stroke).
    *   **Usage:** Icons should be meaningful and enhance usability, not just decorative.
        *   Navigation: Clear icons for main navigation items (e.g., Recipe book, Calendar, Shopping cart, User profile).
        *   Actions: Consistent icons for common actions (e.g., Add, Edit, Delete, Favorite, Share, Search, Filter, Sort).
        *   Status/Feedback: Icons for loading, success, error, warning states.
        *   Recipe Specific: Icons for cooking time, difficulty, servings.
    *   **Custom Icons:** For unique concepts (like a branded app icon), ensure they match the overall style of Lucide icons.

*   **Layout & Spacing:**
    *   **Grid System:** Utilize Tailwind's grid and flexbox utilities for consistent layouts.
    *   **Spacing Scale:** Adhere to a consistent spacing scale (e.g., multiples of 4px or 8px) for margins, paddings, and gaps. Tailwind's default spacing scale is a good starting point.
    *   **White Space:** Ample white space to improve readability and reduce clutter.
    *   **Max Width:** Container max-widths for readability on large screens (e.g., `max-w-7xl` in Tailwind).

*   **Interactions & Animations:**
    *   **Library:** **Framer Motion** (already listed, excellent for sophisticated animations in React).
    *   **Principles:** Animations should be purposeful, smooth, and provide feedback without being distracting or slowing down the user experience.
    *   **Hover Effects:** Subtle hover effects on interactive elements (buttons, links, cards) like slight scaling, color change, or shadow elevation.
    *   **Active States:** Clear visual distinction for active/selected states (e.g., navigation links, tabs, selected filters).
    *   **Page Transitions:** (Optional, use sparingly) Subtle fade-in/slide-in transitions for page loads or route changes. Framer Motion's `AnimatePresence` can be used for exit/enter animations.
    *   **Modal/Dialog Animations:** Smooth open/close animations (e.g., scale, fade, slide from top/bottom).
    *   **Loading States:** Use skeleton loaders (`packages/ui` or create/import) for content-heavy areas during data fetching. Consider subtle pulsing animations for skeletons.
    *   **Drag and Drop (Meal Planner):** Smooth drag initiation, clear visual feedback of the dragged item, and a designated drop zone highlight. `DnD Kit` is suitable.
    *   **Feedback Animations:** Small, delightful animations for successful actions (e.g., a checkmark animation on save, a heart fill animation on favorite).

*   **Component Styling & Polish:**
    *   **Shadcn/ui (Radix UI + Tailwind):** Continue leveraging this for base components. Customize them to fit the project's theme.
    *   **Cards (`RecipeCard`, `MealPlanItemCard`):**
        *   Clean design with clear information hierarchy.
        *   Hover: Slight shadow elevation or border highlight.
        *   High-quality images with appropriate aspect ratios.
    *   **Buttons:** Clear visual distinction between primary, secondary, and outline/ghost buttons. Consistent corner rounding (`var(--radius)`).
    *   **Forms:** Well-structured forms with clear labels, input fields, and validation messages. Use `react-hook-form` and `Zod`.
    *   **Modals/Dialogs:** Should be dismissible via an escape key or an explicit close button. Overlay should dim the background content.
    *   **Tooltips/Popovers:** For extra information or actions without cluttering the main UI. Use Radix UI primitives (via Shadcn/ui) for accessibility.

*   **Accessibility (A11y):**
    *   **Semantic HTML:** Use appropriate HTML tags for their meaning.
    *   **Keyboard Navigation:** Ensure all interactive elements are keyboard navigable and focusable, with clear focus indicators (Tailwind's `focus-visible` is helpful).
    *   **ARIA Attributes:** Use ARIA attributes where necessary to provide context to assistive technologies, especially for custom components or complex interactions.
    *   **Color Contrast:** Ensure sufficient color contrast between text and background, adhering to WCAG guidelines. Use tools to check contrast ratios with the new theme colors.
    *   **Image Alt Text:** Provide descriptive alt text for all meaningful images.

*   **Responsive Design:**
    *   Prioritize Mobile-First design philosophy.
    *   Use TailwindCSS breakpoints (`sm`, `md`, `lg`, `xl`, `2xl`) for adapting layouts and styles.
    *   Components in `packages/ui` should be inherently responsive or provide responsive props.
    *   Test thoroughly on various screen sizes and devices.

*   **Recommended Libraries for Enhanced UI/UX (Beyond current stack if needed):**
    *   **`Sonner` (or `react-hot-toast`):** For elegant, non-intrusive toast notifications for feedback (e.g., success, error, info messages). Integrates well with Tailwind.
    *   **`VisX` (by Airbnb) or `Recharts`:** If advanced data visualizations (beyond simple charts) are needed for nutritional info or user stats. (Consider if `--chart` CSS vars are insufficient for complex cases).
    *   **`Headless UI` (by Tailwind Labs):** If needing more unstyled, accessible components beyond what Radix/Shadcn provides, to build highly custom interactions.

*   **Visual Polish & Consistency:**
    *   **Brand Consistency:** Ensure the primary and secondary colors are used consistently to reinforce brand identity.
    *   **Visual Rhythm:** Maintain consistent spacing and alignment throughout the application.
    *   **Image Quality:** Use high-quality, optimized images for recipes. Consider placeholders or lazy loading strategies (`next/image` handles this well).

This enhanced specification provides a more robust guide for achieving a professional and user-friendly interface.

#### **4. Core Page Designs (Web - `apps/web/app`)**

*(Note: Mobile app screens should adapt these designs for native views, reusing components from `packages/ui` where possible.)*

**4.1. Root Layout (`/apps/web/app/layout.tsx`)**

*   Includes global `Header` and `Footer` components (likely defined in `apps/web/components/shared`).
*   `Header`:
    *   Logo
    *   Main Navigation (using a component from `packages/ui` or `apps/web/components/shared` like Shadcn/ui `NavigationMenu`).
    *   Nav Items (Links): "首页" (`/`), "食谱库" (`/recipes`), "周计划" (`/meal-plans`), "购物清单" (`/shopping-list`), "个人中心" (`/profile`).
    *   User avatar / Login / Register entry point (conditional rendering based on auth state).
    *   Dark mode toggle button (using `next-themes` and a UI component).
*   `Main` Content Area: Renders `{children}` passed by Next. Js layout system.
*   `Footer`: Copyright info, relevant links, etc.

**4.2. Homepage (`/apps/web/app/page.tsx`)**

*   **Hero Section:**
    *   Main Heading: "探索美味食谱，规划健康生活"
    *   Subheading: "轻松查找、分享、计划你的每一餐"
    *   Prominent Search Bar (using `Input` and `Button` from `packages/ui`): Placeholder text "搜索食谱、食材或关键词...", links to `/recipes` with search params.
*   **Featured Recipes:**
    *   Section Title: "本周热门推荐"
    *   Responsive grid layout displaying `RecipeCard` components (from `packages/ui`).
    *   May include a "View More" link to `/recipes`.
*   **Quick Access (Conditional based on login):**
    *   "我的本周计划" preview card.
    *   "购物清单概览" card.
    *   "最近浏览的食谱" list or cards.

**4.3. Recipe Library Page (`/apps/web/app/(main)/recipes/page.tsx`)**

*   **Search & Filter Panel:** (Component likely in `apps/web/components/features/recipes`)
    *   Keyword search input (using `Input` from `packages/ui`).
    *   Filters (using `Select`, `Checkbox`, `Slider`, etc., from `packages/ui` or adapted Shadcn/ui):
        *   **分类 (Categories):** (e.g., 快手菜, 家常菜, 烘焙, 汤羹...) - Multi-select Checkbox or Tags.
        *   **烹饪时间 (Cooking Time):** (e.g., 15 分钟以下, 15-30 分钟, 30-60 分钟, 60 分钟以上) - Select or Slider.
        *   **难度 (Difficulty):** (e.g., 简单, 中等, 困难) - Select.
        *   **特殊标签 (Special Tags):** (e.g., 素食, 低卡, 无麸质...) - Multi-select Checkbox or Tags.
    *   "Reset Filters" button (using `Button` from `packages/ui`).
*   **Recipe List Area:**
    *   Sort options (using `Select` from `packages/ui`): "最新发布", "最受欢迎", "评分最高".
    *   Responsive grid displaying `RecipeCard` components (from `packages/ui`).
    *   Implement **Infinite Scroll** or pagination logic fetching data via React Query.
    *   Loading states (using `Skeleton` components from `packages/ui` if available, or local ones) and empty state indicators.
*   **Recipe Card (`packages/ui/src/RecipeCard.tsx`):**
    *   Needs properties for: Cover Image URL, Title, Cooking Time, Difficulty, Rating.
    *   (Actions like Favorite/Add to Plan might be added via composition in the consuming App).
    *   Clicking the card navigates to `/recipes/[recipeId]`.

**4.4. Recipe Detail Page (`/apps/web/app/(main)/recipes/[recipeId]/page.tsx`)**

*   **Basic Info:** Title, large cover image, author info, publish date, rating display, favorite count, description text.
*   **Key Data Display:** Cooking time, difficulty, servings.
*   **Action Buttons (using `Button` from `packages/ui`):** "收藏", "添加到周计划", "分享".
*   **Ingredients List (using `IngredientList` from `packages/ui`):**
    *   List ingredients and quantities.
    *   (Optional) Quick add to shopping list feature (checkbox per ingredient).
*   **Instructions:** Step-by-step text, potentially with images.
*   **Nutrition Info:** (Optional) Display data if available.
*   **Comments Section:** Input area (using `Textarea`, `Button` from `packages/ui`) and list of comments.

**4.5. Weekly Plan Page (`/apps/web/app/(main)/meal-plans/page.tsx`)**

*   **Calendar View Component:** (Complex component, likely in `apps/web/components/features/meal-plans`)
    *   Week navigation controls.
    *   Grid layout (Days x Meal Times: "早餐", "午餐", "晚餐").
    *   Display simplified recipe cards (`MealPlanItemCard` - potentially in `packages/ui`) in cells.
*   **Planning Tools:**
    *   **Drag and Drop:** Requires `DnD Kit`. Needs a sidebar/modal listing "收藏食谱" or "最近使用食谱". Drag recipes to calendar slots.
    *   **Quick Add:** Button in cells to open a recipe search modal.
    *   **Template Functionality:** Buttons ("保存为模板", "加载模板", "清空本周计划") triggering API calls.
*   **Actions & Overview:**
    *   "生成购物清单" button (using `Button` from `packages/ui`).
    *   (Optional) Nutritional overview display.

**4.6. Shopping List Page (`/apps/web/app/(main)/shopping-list/page.tsx`)**

*   **List Display Component:** (In `apps/web/components/features/shopping-list`)
    *   Group items by **分类 (Category)** (e.g., "蔬菜水果", "肉类海鲜", "乳制品蛋类", "调味品干货", "其他"). Use collapsible sections (e.g., `Accordion` from `packages/ui` if migrated).
    *   Each item (`ShoppingListItem` component from `packages/ui` if available):
        *   Checkbox (from `packages/ui`).
        *   Item name.
        *   Quantity and unit.
        *   (Optional) Notes area/icon.
        *   (Optional) Delete button.
*   **List Management:**
    *   **Manual Add:** Input field (`Input` from `packages/ui`) and Add button (`Button` from `packages/ui`).
*   **Interactive Features:**
    *   Checkbox interaction marks item complete (client-side state + API update).
    *   Inline editing capability.
*   **List Actions (Buttons from `packages/ui`):**
    *   "全部标记为完成" / "全部取消标记".
    *   "清除已完成项".
    *   "清空整个清单".
    *   "打印清单".
    *   "分享清单".

**4.7. Profile Center Page (`/apps/web/app/(main)/profile/page.tsx`)**

*   **User Information:** Display avatar, nickname, email. Edit form (using `Form`, `Input`, `Button` from `packages/ui` if migrated).
*   **Tabs or Sections:**
    *   "我的食谱": List of user-created recipes.
    *   "我的收藏": Grid/list of favorited `RecipeCard`s.
    *   "我的餐计划模板": List of saved templates.
    *   "账户设置": Password change form, preference settings.

#### **5. Data Management & API (Monorepo Perspective)**

*   **State Management:**
    *   **Zustand:** Manage global client-side state within each app (`apps/web`, `apps/mobile`) as needed (e.g., UI toggles, auth status).
    *   **React Query:** Manage server data state within each app (`apps/web`, `apps/mobile`) for fetching, caching, and mutating data via API calls. Configure query keys consistently.
*   **API Design:**
    *   Utilize Next. Js Route Handlers in `/apps/web/app/api/...` for RESTful endpoints.
    *   Enforce authentication/authorization using NextAuth. Js session in API handlers.
    *   Use Zod schemas from `packages/validators` for input validation.
    *   Example API Endpoints (in `apps/web`):
        *   `GET /api/recipes`: Get recipe list (with filters, sort, pagination).
        *   `POST /api/recipes`: Create recipe.
        *   `GET /api/recipes/{id}`: Get recipe details.
        *   `PUT /api/recipes/{id}`: Update recipe.
        *   `DELETE /api/recipes/{id}`: Delete recipe.
        *   `POST /api/recipes/{id}/favorite`: Toggle favorite status.
        *   `GET /api/meal-plans?week={date}`: Get weekly meal plan.
        *   `POST /api/meal-plans`: Update meal plan (batch or single item).
        *   `GET /api/shopping-list`: Get user's shopping list.
        *   `POST /api/shopping-list/generate`: Generate list from meal plan.
        *   `POST /api/shopping-list/items`: Add manual item.
        *   `PUT /api/shopping-list/items/{id}`: Update item (check off, change qty).
        *   `DELETE /api/shopping-list/items/{id}`: Delete item.
*   **Database Schema (Prisma):** (`prisma/schema.prisma`)
    *   Models: `User`, `Recipe`, `Category`, `Tag`, `Favorite`, `MealPlan`, `MealPlanItem`, `ShoppingList`, `ShoppingListItem`, potentially `Rating`, `Comment`. Define relations clearly. Use JSON for flexible fields like ingredients/instructions if preferred over separate tables.
*   **TypeScript Types (`packages/types`):**
    *   Define interfaces corresponding to Prisma models.
    *   Define types for API request/response payloads.
    *   Define types for complex UI states or shared function signatures.

#### **6. Mobile Adaptation Strategy**

*   **UI:**
    *   Prioritize using shared components from `packages/ui`. Ensure compatibility with React Native styling and primitives.
    *   Create mobile-specific components in `apps/mobile/src/components` when necessary.
    *   Adapt layouts from Web page designs for smaller screens using React Native's layout system (Flexbox).
*   **Logic:**
    *   Reuse shared logic from `packages/utils`, `packages/types`, `packages/validators`.
*   **API Communication:**
    *   Implement API client logic within `apps/mobile` (e.g., in `src/api` or using hooks) to communicate with the `apps/web` API endpoints. Handle token storage and authentication securely (e.g., using `expo-secure-store`).
*   **State Management:**
    *   `apps/mobile` will have its own instances of Zustand stores and React Query client/cache, configured for the mobile context.

#### **7. Shared Package Development (`packages/`)**

*   **`packages/types`:** Define core data structures. Changes might require re-running `pnpm db:generate` or restarting the TS server.
*   **`packages/ui`:** Develop cross-platform UI components.
    *   **Goal:** Gradually migrate components from `apps/web/components/ui`. See `docs/COMPONENT_MIGRATION.md`.
    *   **Testing:** Consider using Storybook for component preview and testing.
    *   **Build:** `pnpm build --filter @recipe-planner/ui`.
*   **`packages/utils`:** Place pure TS/JS, side-effect-free utility functions.
*   **`packages/validators`:** Place Zod schemas.
*   **`packages/prisma-db`:** Usually no changes needed unless upgrading Prisma or adjusting exports.
*   **`packages/eslint-config-custom`:** Modify shared ESLint rules.

#### **8. Mobile Adaptation Strategy**

*   **UI:**
    *   Prioritize using shared components from `packages/ui`. Ensure they are written compatibly with React Native (avoid direct DOM manipulation, styles might need adaptation).
    *   Create platform-specific UI in `apps/mobile/src/components`.
*   **Logic:**
    *   Reuse logic from `packages/utils`, `packages/types`, `packages/validators`.
*   **API Communication:**
    *   `apps/mobile` needs its own API request logic (e.g., using `fetch` or `axios`) to call the endpoints provided by `apps/web`. Manage authentication tokens carefully.
*   **State Management:**
    *   `apps/mobile` uses its own Zustand stores and React Query instance.

#### **9. Environment & Deployment**

*   **Environment Variables:** Use the root `.env` file centrally, injected via `dotenv-cli` in `package.json` scripts. Ensure production environments have variables set correctly.
*   **Web Deployment:** `apps/web` is a standard Next. Js app, deployable to Vercel, Netlify, Docker, etc.
*   **Mobile Build:** `apps/mobile` (if using Expo) can be built for Android/iOS using Expo EAS or standard React Native build processes.
*   **Database Deployment:** Deploy PostgreSQL (e.g., Neon, Supabase, AWS RDS).

#### **10. Versioning & Publishing (Recommendation)**

*   **Use `changesets`:**
    1.  `pnpm add -D @changesets/cli -w`
    2.  `pnpm changeset init`
    3.  Run `pnpm changeset` after modifying packages to document changes.
    4.  Run `pnpm changeset version` to update versions and `CHANGELOG.md` before release.
    5.  Run `pnpm install` to update the lockfile.
    6.  Commit changes.
    7.  Run `pnpm publish -r` (requires configuration for npm or other registry).

#### **11. Testing Strategy (Recommendation)**

*   **Unit Tests:** Use Jest or Vitest for functions in `packages/utils`, `packages/validators`.
*   **Component Tests:** Use React Testing Library and Storybook for components in `packages/ui`.
*   **Integration Tests:** Test API routes (`apps/web`), interactions between modules within Apps.
*   **E 2 E Tests:**
    *   Web: Playwright or Cypress.
    *   Mobile: Detox or Appium.

