import type React from 'react';

// A matrix column — `key` identifies the platform (opaque to this visual layer), `label` is the header text
export interface MatrixColumn {
  key: string;
  label: string;
}

interface MatrixRowProps {
  label: React.ReactNode;
  labelClassName?: string;
  columns: MatrixColumn[];
  renderCell: (columnKey: string) => React.ReactNode;
  // Permission rows sit indented under the feature; master rows are flush
  indent?: boolean;
  className?: string;
}

// Presentational row grammar: a flex-1 label + one fixed-width centered cell per column. No domain logic — the
// parent decides what each cell renders (switch, checkbox, lock, or nothing).
export const MatrixRow: React.FC<MatrixRowProps> = ({
  label,
  labelClassName,
  columns,
  renderCell,
  indent,
  className,
}) => (
  <div className={`flex items-center gap-3 ${indent ? 'py-1 pl-14 pr-4' : 'px-4 py-2'} ${className ?? ''}`}>
    <span className={`min-w-0 flex-1 ${labelClassName ?? 'text-sm font-medium text-foreground'}`}>{label}</span>
    <div className="flex">
      {columns.map((col) => (
        <div key={col.key} className="flex w-24 justify-center">
          {renderCell(col.key)}
        </div>
      ))}
    </div>
  </div>
);
