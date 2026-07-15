export const GROUP_COLOR_KEYS = [
  'blue',
  'green',
  'amber',
  'rose',
  'violet',
  'teal',
  'orange',
  'lime',
  'cyan',
  'indigo',
  'fuchsia',
  'slate',
] as const;

export type GroupColorKey = (typeof GROUP_COLOR_KEYS)[number];

export const GROUP_COLORS: { key: GroupColorKey; label: string; var: string }[] = GROUP_COLOR_KEYS.map((key) => ({
  key,
  label: key.charAt(0).toUpperCase() + key.slice(1),
  var: `var(--group-${key})`,
}));

// Resolve a color key to a css color
export function groupColorVar(key?: string | null): string {
  return key && (GROUP_COLOR_KEYS as readonly string[]).includes(key) ? `var(--group-${key})` : 'var(--color-primary)';
}
