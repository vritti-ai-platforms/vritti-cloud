# vritti-cloud-web - Development Best Practices

This document outlines the conventions and best practices for the vritti-cloud-web frontend application.

## Project Overview

vritti-cloud-web is a standalone React web application built with:
- **React 19** with TypeScript
- **Tailwind CSS v4** for styling
- **@vritti/quantum-ui** component library
- **Standalone app (no module federation)**
- **React Router** for navigation
- **TanStack Query** for server state management

## Critical Best Practices

### 1. Color Usage Guidelines

**CRITICAL: Never hardcode colors.** Always use design system tokens from quantum-ui.

Available semantic colors:
- `primary` / `primary-foreground` - Brand primary color
- `secondary` / `secondary-foreground` - Secondary actions
- `muted` / `muted-foreground` - Subtle backgrounds/text
- `accent` / `accent-foreground` - Accent highlights
- `destructive` / `destructive-foreground` - Error/danger states
- `warning` / `warning-foreground` - Warning states
- `success` / `success-foreground` - Success states
- `background` / `foreground` - Base colors
- `card` / `card-foreground` - Card surfaces
- `border`, `input`, `ring` - UI element colors

```typescript
// WRONG - Hardcoded colors
<div style={{ color: '#16a34a' }} />
<div style={{ backgroundColor: 'rgba(22, 163, 74, 0.15)' }} />
<div className="text-green-600" />  // Tailwind palette colors may not match theme

// CORRECT - Design system tokens
<div className="text-success" />
<div className="bg-success/15 text-success" />
<CheckCircle className="text-success" />
```

For opacity variants, use Tailwind's opacity modifier:
```typescript
<div className="bg-success/15" />  // 15% opacity
<div className="bg-destructive/20" />  // 20% opacity
```

For SVG icons that need dynamic fill colors, use CSS variables:
```typescript
// For custom SVG icons
<path style={{ fill: 'var(--color-foreground)' }} />
```

### 2. Component Imports

Always import quantum-ui components from their specific paths:
```typescript
// CORRECT
import { Button } from '@vritti/quantum-ui/Button';
import { Typography } from '@vritti/quantum-ui/Typography';

// WRONG - Don't use barrel imports
import { Button, Typography } from '@vritti/quantum-ui';
```

### 3. Styling Guidelines

- Use Tailwind CSS v4 utility classes
- Import `cn` utility from quantum-ui for class merging
- Follow the design token system
- Support dark mode automatically via design tokens
- Use quantum-ui components whenever possible

### 4. Form Handling

- Use `react-hook-form` with `zod` schemas for validation
- Use quantum-ui Form components (`Form`, `Field`, `FieldGroup`, etc.)
- Mutations should use TanStack Query hooks

#### API Error Handling in Forms

**CRITICAL: Always enable `showRootError` for forms that may receive general API errors.**

The quantum-ui `Form` component automatically maps API errors to form fields using `mapApiErrorsToForm`:

```typescript
// API returns: { errors: [{ field: "email", message: "Invalid" }] }
// → Error displays inline on the email field

// API returns: { errors: [{ message: "Invalid credentials" }] }
// → Error displays as root error (if showRootError is enabled)
```

**Form Configuration:**

```tsx
// CORRECT - Enable root error display for auth forms
<Form form={form} mutation={loginMutation} showRootError>
  <TextField name="email" />
  <PasswordField name="password" />
</Form>

// WRONG - Root errors will be silently lost!
<Form form={form} mutation={loginMutation}>
  <TextField name="email" />
  <PasswordField name="password" />
</Form>
```

**When to use `showRootError={true}`:**
- Login forms (auth errors aren't field-specific)
- Any form where the API might return general errors
- Forms with complex validation that spans multiple fields

**Root Error Position:**
```tsx
<Form
  form={form}
  mutation={mutation}
  showRootError
  rootErrorPosition="top"  // or "bottom" (default)
  rootErrorClassName="my-2"
>
```

### 5. Authentication Flow

- Auth tokens are managed via `@vritti/quantum-ui/axios`
- Use `setToken`, `scheduleTokenRefresh` for token management
- Navigate based on onboarding status after login/signup

### 6. Rsbuild Configuration Patterns

**CRITICAL: Follow these optimization patterns in `rsbuild.config.ts`.**

1. **Optimize imports for tree-shaking**
   - Use specific imports: `import { readFileSync } from 'node:fs'`
   - Avoid wildcard imports: `import * as fs from 'fs'`
   - Enables better bundle optimization

2. **Extract environment-derived values**
   - Calculate protocol, host, and URLs once at top level
   - Avoids repeated conditional logic
   - Makes configuration clearer

**Example** (`rsbuild.config.ts`):
```typescript
import { readFileSync } from 'node:fs';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

// Environment configuration
const useHttps = process.env.USE_HTTPS === 'true';
const protocol = useHttps ? 'https' : 'http';
const host = 'local.vrittiai.com';
const defaultApiHost = `${protocol}://${host}:3000`;

export default defineConfig({
  output: {
    assetPrefix: '/cloud-web/',
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: process.env.PUBLIC_API_URL || defaultApiHost,
        changeOrigin: true,
        secure: false,
        pathRewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  plugins: [pluginReact()],
});
```

**DO**:
- ✅ Use specific imports: `import { readFileSync } from 'node:fs'`
- ✅ Calculate environment-derived values at top level
- ✅ Use arrow functions for inline plugin callbacks

**DON'T**:
- ❌ Use wildcard imports: `import * as fs from 'fs'`
- ❌ Repeat protocol/host calculation throughout config
- ❌ Inline complex configuration objects

## Directory Structure

```
src/
├── components/       # Reusable components
│   ├── auth/        # Auth-specific components
│   ├── icons/       # Custom SVG icons
│   └── layout/      # Layout components
├── hooks/           # Custom React hooks
├── pages/           # Page components
│   ├── auth/        # Auth pages (login, signup, etc.)
│   └── onboarding/  # Onboarding flow pages
├── schemas/         # Zod validation schemas
├── services/        # API service functions
└── index.css        # Global styles
```

## Common Patterns

### Icon Colors in Light/Dark Mode

For custom SVG icons that need to adapt to theme:
```typescript
export const MyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path style={{ fill: 'var(--color-foreground)' }} d="..." />
  </svg>
);
```

### Success/Error States

```typescript
// Success state
<div className="bg-success/15 text-success rounded-lg p-4">
  <CheckCircle className="h-5 w-5 text-success" />
  <span>Operation successful</span>
</div>

// Error state
<div className="bg-destructive/15 text-destructive rounded-lg p-4">
  <AlertCircle className="h-5 w-5 text-destructive" />
  <span>An error occurred</span>
</div>
```

## Starting the Application

**Prerequisites**:
- If using HTTPS mode, SSL certificates must be in `./certs/` directory
- API backend should be running on `http://local.vrittiai.com:3000` or `https://local.vrittiai.com:3000`

**Available npm scripts**:
```bash
# HTTP mode (default)
pnpm dev                    # Starts on http://local.vrittiai.com:3001

# HTTPS mode
USE_HTTPS=true pnpm dev     # Starts on https://local.vrittiai.com:3001
```

**Access URLs**:
- **HTTP**: `http://local.vrittiai.com:3001`
- **HTTPS**: `https://local.vrittiai.com:3001`

**Important Notes**:
- Port `3001` is the default for vritti-cloud-web
- The dev server writes build outputs to disk (`writeToDisk: true`)
