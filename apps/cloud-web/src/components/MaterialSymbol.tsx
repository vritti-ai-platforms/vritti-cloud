import { cn } from '@vritti/quantum-ui/cn';

export interface MaterialSymbolProps {
  icon: string;
  size?: number;
  className?: string;
}

// Renders a Material Symbols (Outlined) glyph on web via the self-hosted font ligature.
export const MaterialSymbol: React.FC<MaterialSymbolProps> = ({ icon, size = 20, className }) => {
  if (typeof icon !== 'string' || icon.length === 0) return null;
  return (
    <span aria-hidden className={cn('material-symbols-outlined', className)} style={{ fontSize: size }}>
      {icon}
    </span>
  );
};
