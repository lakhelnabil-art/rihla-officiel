import React from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, Inbox } from 'lucide-react'

/**
 * columns: Array<{
 *   key: string,
 *   label: string,
 *   render?: (value, row) => ReactNode,
 *   align?: 'left' | 'center' | 'right',
 *   sortable?: boolean,
 *   width?: string,   // e.g. 'w-32'
 * }>
 *
 * sortConfig: { key: string, dir: 'asc' | 'desc' } | null
 * onSort: (key: string) => void
 */

const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' }

export const Table = ({
  columns = [],
  data = [],
  keyField = 'id',
  onRowClick,
  sortConfig = null,
  onSort,
  loading = false,
  emptyMessage = 'Aucune donnée disponible',
  className = '',
}) => (
  <div className={`w-full overflow-x-auto ${className}`}>
    <table className="w-full border-collapse">
      <thead>
        <tr>
          {columns.map(col => {
            const sorted = sortConfig?.key === col.key
            const align = alignClass[col.align ?? 'left']
            return (
              <th
                key={col.key}
                className={`table-th ${align} ${col.width ?? ''} ${col.sortable && onSort ? 'cursor-pointer select-none hover:bg-slate-100' : ''}`}
                onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && onSort && (
                    sorted
                      ? sortConfig.dir === 'asc'
                        ? <ChevronUp className="w-3.5 h-3.5 text-primary-600" />
                        : <ChevronDown className="w-3.5 h-3.5 text-primary-600" />
                      : <ChevronsUpDown className="w-3.5 h-3.5 text-slate-300" />
                  )}
                </span>
              </th>
            )
          })}
        </tr>
      </thead>
      <tbody>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="animate-pulse">
              {columns.map(col => (
                <td key={col.key} className="table-td">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                </td>
              ))}
            </tr>
          ))
        ) : data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="py-16 text-center">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <Inbox className="w-10 h-10" />
                <p className="text-sm">{emptyMessage}</p>
              </div>
            </td>
          </tr>
        ) : (
          data.map(row => (
            <tr
              key={row[keyField] ?? JSON.stringify(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-primary-50' : 'hover:bg-slate-50'}`}
            >
              {columns.map(col => (
                <td key={col.key} className={`table-td ${alignClass[col.align ?? 'left']}`}>
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
)

/** Thin pagination strip to pair with Table. */
export const Pagination = ({ page, total, perPage = 20, onChange }) => {
  const pages = Math.ceil(total / perPage)
  if (pages <= 1) return null
  const from = (page - 1) * perPage + 1
  const to = Math.min(page * perPage, total)

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
      <span>{from}–{to} sur {total}</span>
      <div className="flex gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="px-2.5 py-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
        >
          ‹
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1)
          .filter(p => p === 1 || p === pages || Math.abs(p - page) <= 1)
          .reduce((acc, p, idx, arr) => {
            if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…')
            acc.push(p)
            return acc
          }, [])
          .map((p, i) =>
            p === '…' ? (
              <span key={`e${i}`} className="px-2 py-1.5">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onChange(p)}
                className={`px-2.5 py-1.5 rounded border transition-colors ${
                  p === page
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            )
          )}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === pages}
          className="px-2.5 py-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
        >
          ›
        </button>
      </div>
    </div>
  )
}
