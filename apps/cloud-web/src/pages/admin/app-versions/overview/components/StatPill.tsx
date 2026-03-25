interface StatPillProps {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: number;
  color: string;
  bg: string;
}

export const StatPill: React.FC<StatPillProps> = ({ icon: Icon, label, value, color, bg }) => (
  <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3">
    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${bg}`}>
      <Icon className={`size-4 ${color}`} />
    </div>
    <div>
      <span className="text-2xl font-bold tracking-tight leading-none">{value}</span>
      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  </div>
);
