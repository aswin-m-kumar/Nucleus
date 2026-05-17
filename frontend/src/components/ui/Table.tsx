import { cn } from '../../utils/tailwind';

interface Column<T> {
  key: keyof T;
  header: string;
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
  className = '',
}: TableProps<T>) => {
  return (
    <div className={cn('w-full overflow-x-auto rounded-xl border border-gray-100', className)}>
      <table className="w-full text-left border-collapse min-w-[500px] md:min-w-full">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-4 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {data.map((row, idx) => (
            <tr
              key={idx}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'border-b border-gray-50 last:border-0 transition-colors',
                onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
              )}
            >
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-3 text-sm text-gray-700">
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile-only list view (< 768px) handled via parent container and overflow or separate component if needed */}
      <div className="md:hidden">
        {/* Note: In a real app, you might swap the table for a list of cards here */}
      </div>
    </div>
  );
};
