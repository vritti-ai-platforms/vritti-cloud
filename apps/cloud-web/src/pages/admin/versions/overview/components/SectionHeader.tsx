interface SectionHeaderProps {
  icon: React.FC<{ className?: string }>;
  title: string;
  count: number;
  color: string;
  subtitle?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ icon: Icon, title, count, color, subtitle }) => (
  <div className="flex items-center gap-2.5">
    <Icon className={`size-4 ${color}`} />
    <span className="text-sm font-semibold tracking-tight">{title}</span>
    <span className="text-xs text-muted-foreground tabular-nums">({count})</span>
    {subtitle && (
      <>
        <span className="text-border">·</span>
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      </>
    )}
  </div>
);
