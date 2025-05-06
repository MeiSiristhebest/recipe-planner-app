# Contributing to Recipe Planner and Sharing Assistant

Thank you for considering contributing to the Recipe Planner and Sharing Assistant! This document outlines the guidelines and workflows for contributing to this project.

## Code of Conduct

Please be respectful and considerate of others when contributing to this project. We aim to foster an inclusive and welcoming community.

## Development Workflow

### Setting Up the Development Environment

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/recipe-planner-app.git`
3. Install dependencies: `pnpm install`
4. Set up environment variables (see README.md)
5. Generate Prisma client: `pnpm db:generate`
6. Push database schema: `pnpm db:push`
7. Seed the database: `pnpm db:seed`

### Branch Naming Convention

- `feature/feature-name`: For new features
- `fix/issue-description`: For bug fixes
- `docs/documentation-update`: For documentation updates
- `refactor/component-name`: For code refactoring

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages:

- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation only changes
- `style:` Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor:` A code change that neither fixes a bug nor adds a feature
- `perf:` A code change that improves performance
- `test:` Adding missing tests or correcting existing tests
- `chore:` Changes to the build process or auxiliary tools and libraries

### Pull Request Process

1. Create a new branch from `main` following the branch naming convention
2. Make your changes
3. Run tests and ensure they pass: `pnpm test`
4. Run linting and ensure it passes: `pnpm lint`
5. Update documentation if necessary
6. Create a pull request to the `main` branch
7. Wait for review and address any feedback

## Monorepo Structure and Guidelines

### Adding Dependencies

- Add dependencies to the root package.json only if they are used across multiple packages
- Add package-specific dependencies to the respective package.json

\`\`\`bash
# Add a dependency to a specific package
pnpm add package-name --filter @recipe-planner/package-name
\`\`\`

### Creating a New Package

1. Create a new directory in the `packages` directory
2. Initialize a new package.json with the appropriate name and dependencies
3. Update the `pnpm-workspace.yaml` file if necessary

### Shared UI Components

When developing shared UI components:

1. Place the component in the `packages/ui/src` directory
2. Export the component from the package's index.ts file
3. Document the component's props and usage
4. Consider creating a Storybook story for the component

## Component Migration Guide

See [COMPONENT_MIGRATION.md](docs/COMPONENT_MIGRATION.md) for guidelines on migrating components from app-specific implementations to shared packages.

## Testing

- Write unit tests for utility functions and shared components
- Write integration tests for API routes and complex interactions
- Write end-to-end tests for critical user flows

## Documentation

- Update README.md with any new features or changes
- Document new components and their props
- Keep API documentation up to date

## Versioning

We use [Changesets](https://github.com/changesets/changesets) for versioning:

1. Run `pnpm changeset` to create a new changeset
2. Follow the prompts to describe your changes
3. Commit the changeset file along with your changes

## Questions?

If you have any questions or need help, please open an issue or reach out to the maintainers.

Thank you for contributing!
\`\`\`

Let's create a component migration guide:
