import { cn } from '@vritti/quantum-ui';

export interface MaterialSymbolProps {
  // Material Symbols ligature name (underscored), e.g. "shopping_bag" — same names the mobile app renders.
  // NOTE: deliberately NOT called `name` — quantum-ui's <Form> auto-wraps any child with a string
  // `name` prop in a Controller and strips the prop, which would blank the glyph.
  icon: string;
  // Glyph size in px (drives font-size). Defaults to 20.
  size?: number;
  className?: string;
}

// Renders a Material Symbols (Outlined) glyph on web via the self-hosted font ligature, so the
// admin UI previews the same icon set the mobile app renders on Android. Color follows currentColor,
// so `className="text-muted-foreground"` tints it. The font is loaded by src/index.css.
export const MaterialSymbol: React.FC<MaterialSymbolProps> = ({ icon, size = 20, className }) => {
  if (typeof icon !== 'string' || icon.length === 0) return null;
  return (
    <span aria-hidden className={cn('material-symbols-outlined', className)} style={{ fontSize: size }}>
      {icon}
    </span>
  );
};
