# Component Migration Guide

This guide outlines the process for migrating components from app-specific implementations to shared packages in the Recipe Planner and Sharing Assistant monorepo.

## Why Migrate Components?

- **Consistency**: Ensure consistent UI and behavior across web and mobile platforms
- **Maintainability**: Centralize component logic and styling in one place
- **Efficiency**: Reduce duplication of code and effort
- **Collaboration**: Make it easier for team members to work on different parts of the application

## Migration Process

### 1. Identify Components for Migration

Good candidates for migration to shared packages:

- Components used in multiple places within the same app
- Components with similar functionality across web and mobile
- Basic UI elements (buttons, cards, inputs, etc.)
- Components with complex but platform-agnostic logic

### 2. Prepare the Component for Migration

Before migrating a component:

1. Ensure it has a clear, single responsibility
2. Remove app-specific dependencies and logic
3. Make props explicit and well-typed
4. Document the component's purpose and usage

### 3. Migrate the Component

#### For UI Components (`packages/ui`)

1. Create a new file in `packages/ui/src` with the component name
2. Implement the component using platform-agnostic code where possible
3. For web-specific styling, use Tailwind CSS
4. For platform-specific implementations, use conditional imports or props

Example structure:

\`\`\`tsx
// packages/ui/src/button.tsx
import React from 'react'
import { cn } from './utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  className,
  variant = 'default',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-md font-medium transition-colors',
        variant === 'default' && 'bg-primary text-white hover:bg-primary/90',
        variant === 'outline' && 'border border-input bg-background hover:bg-accent',
        variant === 'ghost' && 'hover:bg-accent',
        size === 'sm' && 'h-8 px-3 text-xs',
        size === 'md' && 'h-10 px-4 text-sm',
        size === 'lg' && 'h-12 px-6 text-base',
        className
      )}
      {...props}
    />
  )
}
\`\`\`

4. Export the component from the package's index.ts file:

\`\`\`tsx
// packages/ui/src/index.ts
export * from './button'
\`\`\`

#### For Utility Functions (`packages/utils`)

1. Create a new file in `packages/utils/src` with a descriptive name
2. Implement the utility function with proper TypeScript typing
3. Export the function from the package's index.ts file

### 4. Update Imports in Apps

After migrating a component:

1. Update imports in the web app:

\`\`\`tsx
// Before
import { Button } from '@/components/ui/button'

// After
import { Button } from '@recipe-planner/ui'
\`\`\`

2. Update imports in the mobile app:

\`\`\`tsx
// Before
import Button from '../components/Button'

// After
import { Button } from '@recipe-planner/ui'
\`\`\`

### 5. Test the Migrated Component

1. Test the component in both web and mobile apps
2. Ensure it behaves consistently across platforms
3. Fix any platform-specific issues

## Platform-Specific Considerations

### Web-Specific Components

For components that only make sense on the web:

1. Keep them in `apps/web/components`
2. Document why they are web-specific

### Mobile-Specific Components

For components that only make sense on mobile:

1. Keep them in `apps/mobile/src/components`
2. Document why they are mobile-specific

### Cross-Platform Components with Platform-Specific Implementations

For components that need different implementations on web and mobile:

1. Create a base component in `packages/ui/src`
2. Use platform detection or conditional imports for platform-specific code
3. Consider using a higher-order component pattern

Example:

\`\`\`tsx
// packages/ui/src/card.tsx
import React from 'react'
import { isPlatformWeb } from './utils'

export interface CardProps {
  children: React.ReactNode
  onPress?: () => void
}

export function Card({ children, onPress }: CardProps) {
  if (isPlatformWeb()) {
    return (
      <div 
        className="rounded-lg border bg-card p-4 shadow-sm" 
        onClick={onPress}
      >
        {children}
      </div>
    )
  } else {
    // React Native implementation
    return (
      <Pressable 
        style={styles.card} 
        onPress={onPress}
      >
        {children}
      </Pressable>
    )
  }
}

// React Native styles
const styles = {
  card: {
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  }
}
\`\`\`

## Best Practices

- **Start Small**: Begin with simple, self-contained components
- **Incremental Migration**: Migrate components gradually, not all at once
- **Test Thoroughly**: Ensure components work correctly on all platforms
- **Document Everything**: Add JSDoc comments and examples
- **Consider Accessibility**: Ensure components are accessible on all platforms
- **Maintain Consistency**: Follow established patterns and naming conventions

## Common Pitfalls

- **Over-engineering**: Don't make components too complex or flexible
- **Platform Assumptions**: Don't assume web-specific or mobile-specific APIs
- **Tight Coupling**: Avoid dependencies on app-specific state or context
- **Inconsistent Styling**: Ensure consistent styling across platforms
- **Missing Types**: Always provide proper TypeScript types

## Example Migration Workflow

1. Identify a component used in multiple places (e.g., RecipeCard)
2. Extract the component to `packages/ui/src/recipe-card.tsx`
3. Make it platform-agnostic and properly typed
4. Export it from `packages/ui/src/index.ts`
5. Update imports in the web and mobile apps
6. Test the component on both platforms
7. Document the component's props and usage
\`\`\`

This completes the implementation of the Recipe Planner and Sharing Assistant application with the authentication pages, API route handlers, recipe creation form, mobile app screens, and database migration script. The application now has a solid foundation for further development and can be deployed to production.
