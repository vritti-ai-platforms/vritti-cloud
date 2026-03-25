# Table Action Column Convention

## Always use `RowActions` from `@vritti/quantum-ui/DataTable`

Every data table action column must use the `RowActions` component. Never render inline `<Button>` or `<DropdownMenu>` directly in action cells.

```typescript
import { type ColumnDef, DataTable, RowActions, useDataTable } from '@vritti/quantum-ui/DataTable';
```

## Declare actions as a config array

```typescript
{
  id: 'actions',
  header: '',
  cell: ({ row }) => (
    <RowActions
      actions={[
        { id: 'view', icon: Eye, label: 'View', onClick: () => onView(row.original) },
        { id: 'edit', icon: Pencil, label: 'Edit', dialog: { title: 'Edit', description: '...', content: (close) => <EditForm onSuccess={close} onCancel={close} /> } },
        { id: 'delete', icon: Trash2, label: 'Delete', variant: 'destructive', disabled: !row.original.canDelete, onClick: () => onDelete(row.original) },
      ]}
    />
  ),
  enableSorting: false,
  enableHiding: false,
}
```

## Auto-layout rules

`RowActions` renders based on the number of visible (non-hidden) actions:

| Visible | Layout |
|---------|--------|
| 0 | Nothing |
| 1 | Single icon button |
| 2 | Two icon buttons side-by-side |
| 3+ | First action as icon button + `⋮` overflow dropdown for the rest |

## Feature-flag visibility

Use the `hidden` prop to control action visibility at runtime. The component re-layouts automatically.

```typescript
{ id: 'resend', icon: Send, label: 'Resend Invite', hidden: row.original.status !== 'PENDING', onClick: () => ... }
```

## Action types

- **Click action** — `onClick` callback
- **Dialog action** — `dialog: { title, description, content }` opens a dialog
- **Destructive action** — `variant: 'destructive'` adds destructive styling
- **Disabled action** — `disabled: true` grays out the button
