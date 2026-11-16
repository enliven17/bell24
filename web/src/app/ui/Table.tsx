import type { ReactNode } from 'react'
import { cn } from './util'

export type Column<T> = {
  key: string
  header: ReactNode
  cell: (row: T) => ReactNode
  align?: 'left' | 'right'
  /** Drop the column below this breakpoint; the row stays readable without it. */
  hide?: 'sm' | 'md'
  className?: string
}

export function Table<T>({
  columns,
  rows,
  rowKey,
  caption,
  rowClassName,
}: {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  caption: string
  rowClassName?: (row: T) => string | undefined
}) {
  return (
    <div className="ap-table-wrap">
      <table className="ap-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={cn(c.align === 'right' && 'ap-ta-r', c.hide && `ap-hide-${c.hide}`, c.className)}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={rowKey(r)} className={rowClassName?.(r)}>
              {columns.map((c) => (
                <td key={c.key} className={cn(c.align === 'right' && 'ap-ta-r', c.hide && `ap-hide-${c.hide}`, c.className)}>
                  {c.cell(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
