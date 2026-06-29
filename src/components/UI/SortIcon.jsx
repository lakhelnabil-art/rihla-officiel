import React from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

/**
 * Sortable column indicator.
 * Usage: <SortIcon col="nom" sortCol={sortCol} sortDir={sortDir} />
 */
export const SortIcon = ({ col, sortCol, sortDir }) => {
  if (col !== sortCol)
    return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-300 ml-1" />
  return sortDir === 'asc'
    ? <ChevronUp   className="w-3.5 h-3.5 text-primary-600 ml-1" />
    : <ChevronDown className="w-3.5 h-3.5 text-primary-600 ml-1" />
}
