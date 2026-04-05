---
description: Frontend patterns for Vritti microfrontends
paths:
  - "src/**/*.{ts,tsx}"
---

# Frontend Conventions

## React Import

Always use `import type React from 'react'` — never `import * as React from 'react'`.

```tsx
// WRONG
import * as React from 'react';

// CORRECT
import type React from 'react';
```

## Component Library
- Use components from `@vritti/quantum-ui` (shadcn-based, Tailwind v4)
- Do NOT install shadcn directly in microfrontends — use quantum-ui exports
- Import from specific paths: `import { Button } from '@vritti/quantum-ui/Button'`

## Button — never use HTML `<button>`
- ALWAYS use `<Button>` from `@vritti/quantum-ui/Button`, never raw `<button>`
- For ghost/link-style actions: `<Button variant="ghost">` or `<Button variant="link">`
- For icon-only buttons: `<Button variant="ghost" size="icon">`

```tsx
// WRONG
<button onClick={onBack} className="text-primary">Back</button>
<button type="submit">Submit</button>

// CORRECT
import { Button } from '@vritti/quantum-ui/Button';
<Button variant="ghost" onClick={onBack}>Back</Button>
<Button type="submit">Submit</Button>
```

## Spinner — never use Loader2
- ALWAYS use `<Spinner>` from `@vritti/quantum-ui/Spinner`, never `Loader2` from lucide-react
- Spinner already includes `animate-spin` — just set size and color via className

```tsx
// WRONG
import { Loader2 } from 'lucide-react';
<Loader2 className="h-8 w-8 animate-spin text-primary" />

// CORRECT
import { Spinner } from '@vritti/quantum-ui/Spinner';
<Spinner className="size-8 text-primary" />
```

## Icons
- Use lucide-react icons, NOT custom inline SVG icons
- Common status icons: `CheckCircle2` (success), `AlertCircle` (error), `Info` (info), `TriangleAlert` (warning)
- Status page icon container pattern:
  ```tsx
  <div className="flex justify-center">
    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-{variant}/15">
      <IconComponent className="h-8 w-8 text-{variant}" />
    </div>
  </div>
  ```

## Alert Component
- Use quantum-ui Alert with `title` and `description` props
- NOT AlertTitle/AlertDescription as separate components
- Available variants: `default`, `destructive`, `warning`, `success`, `info`
- Pattern:
  ```tsx
  import { Alert } from '@vritti/quantum-ui/Alert';

  <Alert
    variant="destructive"
    title="Error"
    description="Error message here"
  />
  ```

## quantum-ui Initialization
Every microfrontend that uses quantum-ui axios must call `configureQuantumUI` before rendering:
```typescript
import { configureQuantumUI } from '@vritti/quantum-ui';
import quantumUIConfig from '../quantum-ui.config';

configureQuantumUI(quantumUIConfig);
```
Without this, quantum-ui falls back to defaults (wrong endpoints, wrong baseURL).

## Dialog State — use `useDialog`, never bare `useState(false)`
- ALWAYS use `useDialog()` from `@vritti/quantum-ui/hooks` to control dialog open/close state
- Never write `const [open, setOpen] = useState(false)` for a dialog

```tsx
// WRONG
const [editOpen, setEditOpen] = useState(false);
<Button onClick={() => setEditOpen(true)}>Edit</Button>
<Dialog open={editOpen} onOpenChange={setEditOpen} ... />

// CORRECT
import { useDialog } from '@vritti/quantum-ui/hooks';
const editDialog = useDialog();
<Button onClick={editDialog.open}>Edit</Button>
<Dialog
  open={editDialog.isOpen}
  onOpenChange={(v) => { if (!v) editDialog.close(); }}
  ...
/>
```

For dialogs triggered from a `DropdownMenu` item, use the `dialog` item type instead — no hook or state needed:
```tsx
// CORRECT — dialog lives inside the dropdown item definition
{
  type: 'dialog' as const,
  id: 'edit',
  label: 'Edit',
  icon: Pencil,
  dialog: {
    title: 'Edit Item',
    description: '...',
    content: (close) => <EditForm data={row.original} onSuccess={close} onCancel={close} />,
  },
}
```
The DropdownMenu renders the Dialog outside its content so it survives the dropdown unmount.

## Destructive Actions — use `useConfirm`, never inline confirm
- ALWAYS use `useConfirm()` from `@vritti/quantum-ui/hooks` before destructive mutations (delete, revoke, reset)
- Never use `window.confirm()` or roll a custom state-based confirm dialog
- Make the message specific: include the resource name and what will be lost

```tsx
// WRONG — no confirmation
onClick: () => deleteMutation.mutate(id)

// WRONG — generic message
description: 'Are you sure you want to delete this item? This action cannot be undone.'

// CORRECT
import { useConfirm } from '@vritti/quantum-ui/hooks';

const confirm = useConfirm();

async function handleDelete(id: string, name: string) {
  const confirmed = await confirm({
    title: `Delete ${name}?`,
    description: `${name} and all its associated data will be permanently removed. This action cannot be undone.`,
    confirmLabel: 'Delete',
    variant: 'destructive',
  });
  if (confirmed) deleteMutation.mutate(id);
}
```

Pass the resource name (and relevant context) into `handleDelete` so the description is specific, not generic.

## Slug-based Routes — use `buildSlug` + `useSlugParams`
- For detail page URLs that should show a readable name, use `buildSlug(name, id)` from `@vritti/quantum-ui/slug`
- The slug format is `name-slug~uuid` — the Breadcrumb auto-humanizes the name part
- In the detail page, use `useSlugParams()` from `@vritti/quantum-ui/hooks` to extract `{ name, id }`

```tsx
// Navigating to detail page
import { buildSlug } from '@vritti/quantum-ui/slug';
navigate(`/regions/${buildSlug(region.name, region.id)}`);
// → URL: /regions/us-east~bdfc838c-...

// In the detail page (route param must be named :slug)
import { useSlugParams } from '@vritti/quantum-ui/hooks';
const { id } = useSlugParams(); // UUID for API calls
```

Route param must be named `:slug`, not `:id`:
```typescript
{ path: 'regions/:slug', element: <RegionViewPage /> }
```

## Forms
- React Hook Form + Zod for validation
- Use `<Form>` component from quantum-ui (auto error mapping, auto loading states)
- Use `showRootError` for forms that receive general API errors
- Use `transformSubmit` when form shape differs from API DTO
- Use `rootErrorAction` for contextual actions inside the error Alert (e.g. "Login" button on 409)

## API Calls — Service → Hook → Page
- Services: pure functions wrapping axios (see `frontend-service.md`)
- Hooks: TanStack Query wrappers (see `frontend-hook.md`)
- Pages call hooks, never services directly

## Styling
- NEVER hardcode colors — use design tokens: `text-primary`, `bg-destructive/15`
- NEVER use pixels — use Tailwind classes: `p-4`, `gap-8`, `pt-16`
- Available tokens: primary, secondary, muted, accent, destructive, warning, success, foreground, background, card, border

## Dialog Lifecycle — Conditional Mount Pattern

For dialogs that need initialization on open (API calls, form setup), use conditional rendering instead of `isOpen` prop. The dialog mounts fresh each time and unmounts on close — no `useEffect`/`useRef` cleanup needed.

```tsx
// CORRECT — dialog mounts fresh, runs init on mount, unmounts = cleanup
{emailDialog.isOpen && (
  <EmailVerificationDialog onClose={emailDialog.close} currentEmail={email} />
)}

// WRONG — dialog always mounted, needs useEffect + useRef to manage lifecycle
<EmailVerificationDialog
  isOpen={emailDialog.isOpen}
  onClose={emailDialog.close}
  currentEmail={email}
/>
```

Inside the dialog: `open={true}` (always open when mounted), no `isOpen` prop needed.

## Form — always use mutation prop, never onSubmit for mutations

Always pass `mutation` to `<Form>`. Use `transformSubmit` when form fields don't match the mutation payload. Never use `onSubmit` to call `mutation.mutate()` manually.

```tsx
// CORRECT — Form handles mutate + loading/error automatically
<Form form={form} mutation={createMutation} showRootError>

// CORRECT — transformSubmit maps form data to mutation payload
<Form form={form} mutation={submitMutation} transformSubmit={(data) => ({ channel, target: data.newEmail })} showRootError>

// WRONG — never use onSubmit for mutations
<Form form={form} onSubmit={(data) => mutation.mutate(data)} showRootError>

// WRONG — never use both mutation and onSubmit
<Form form={form} mutation={mutation} onSubmit={handleSubmit} showRootError>
```

## State Management
- AuthProvider in web-nexus for authentication state
- React Context for shared state within microfrontends
- No Redux

## Module Federation
- web-nexus is the host, loads remotes dynamically
- Microfrontends export route arrays (`authRoutes`, `accountRoutes`, `cloudRoutes`)
- Protocol auto-detected from `window.location.protocol`
- Environment variables use `PUBLIC_` prefix via `import.meta.env`
