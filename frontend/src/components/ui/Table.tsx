import { cn } from '../../utils/tailwind';

interface Column<T> {
  key: keyof T;
  header: string;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  className?: string;
}

export const Table = <T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  className,
}: TableProps<T>) => {
  return (
    <div className={cn('w-full overflow-x-auto rounded-[var(--n-radius-md)] border border-[var(--n-border)]', className)}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[var(--n-bg-subtle)]">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  'px-5 py-3 text-[12px] font-medium uppercase tracking-[0.5px] text-[var(--n-text-tertiary)] border-b border-[var(--n-border)]',
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-5 py-12 text-center text-[var(--n-text-tertiary)] text-[14px]"
              >
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'h-12 border-b border-[var(--n-border)] last:border-b-0 transition-colors text-[14px]',
                  'hover:bg-[var(--n-bg-subtle)]',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className={cn('px-5 py-3', col.className)}>
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
