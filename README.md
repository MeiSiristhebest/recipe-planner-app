# Recipe Planner and Sharing Assistant

A modern, cross-platform application integrating recipe discovery, sharing, personalized weekly meal planning, and intelligent shopping list generation. Built with Next.js, React Native, and Prisma in a monorepo architecture using Turborepo.

## Features

- Recipe discovery and sharing
- Personalized weekly meal planning
- Intelligent shopping list generation
- Cross-platform (Web and Mobile)
- Dark mode support
- Responsive design

## Tech Stack

- **Monorepo & Build:**
  - Turborepo: High-performance build system
  - pnpm Workspaces: Package management and dependency sharing
- **Web Application (`apps/web`):**
  - Next.js 14+ (using App Router)
  - React 18+
  - TypeScript
- **Mobile Application (`apps/mobile`):**
  - React Native (Expo)
  - React 18+
  - TypeScript
- **Shared UI Components (`packages/ui`):**
  - React
  - TailwindCSS
  - Shadcn/ui style components (Based on Radix UI & Tailwind)
- **State Management:**
  - Zustand (For global client-side state)
  - React Query (TanStack Query v5) (For server state management)
- **Database & ORM (`packages/prisma-db` & `prisma/`):**
  - PostgreSQL
  - Prisma (ORM)
- **Authentication (Web):**
  - NextAuth.js
- **Form Handling:**
  - React Hook Form
  - Zod (Shared validation logic)

## Getting Started

### Prerequisites

- Node.js 18.18 or later
- pnpm 8.6.10 or later
- PostgreSQL database

### Installation

1. Clone the repository:

\`\`\`bash
git clone https://github.com/yourusername/recipe-planner-app.git
cd recipe-planner-app
\`\`\`

2. Install dependencies:

\`\`\`bash
pnpm install
\`\`\`

3. Set up environment variables:

Create a `.env` file in the root directory with the following variables:

\`\`\`
DATABASE_URL="postgresql://username:password@localhost:5432/recipe_planner"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
\`\`\`

4. Generate Prisma client:

\`\`\`bash
pnpm db:generate
\`\`\`

5. Push database schema:

\`\`\`bash
pnpm db:push
\`\`\`

6. Seed the database:

\`\`\`bash
pnpm db:seed
\`\`\`

7. Start the development server:

\`\`\`bash
pnpm dev
\`\`\`

## Project Structure

\`\`\`
recipe-planner-app/
├── apps/                    # Individual Applications
│   ├── web/                 # Web App (Next.js)
│   └── mobile/              # Mobile App (React Native / Expo)
├── packages/                # Shared Packages
│   ├── prisma-db/           # Prisma database client
│   ├── types/               # Shared TypeScript type definitions
│   ├── ui/                  # Shared UI component library
│   ├── utils/               # Shared utility functions
│   ├── validators/          # Shared Zod validation Schemas
│   └── eslint-config-custom/ # Shared ESLint configuration
├── prisma/                  # Global Prisma configuration
│   ├── schema.prisma        # Database Schema definition
│   └── migrations/          # Database migration files
├── .env                     # Root environment variables
└── package.json             # Root package.json
\`\`\`

## Development

### Web Application

The web application is built with Next.js and is located in the `apps/web` directory. To start the development server:

\`\`\`bash
pnpm dev --filter web
\`\`\`

### Mobile Application

The mobile application is built with React Native (Expo) and is located in the `apps/mobile` directory. To start the development server:

\`\`\`bash
pnpm dev --filter mobile
\`\`\`

### Shared Packages

The shared packages are located in the `packages` directory. These packages are used by both the web and mobile applications.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
\`\`\`

Let's create a CONTRIBUTING.md file:
