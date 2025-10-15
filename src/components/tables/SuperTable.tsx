/* eslint-disable @typescript-eslint/no-explicit-any */

"use client"

import { useState, useMemo } from "react"
import Image from "next/image"

// Tipos de badge personalizados
type BadgeConfig = {
  [key: string]: {
    className: string
    label?: string
  }
}

// Configuração de coluna
interface Column<T> {
  header: string
  accessor: keyof T | string
  render?: (value: any, row: T, index: number) => React.ReactNode
  sortable?: boolean
  width?: string
  align?: "left" | "center" | "right"
  cellClassName?: string
}

// Configuração de badge
interface BadgeSettings {
  field: string
  config: BadgeConfig
}

// Ações customizadas
interface Action<T> {
  icon?: string
  label: string
  onClick: (row: T) => void
  className?: string
  hoverClassName?: string
  show?: (row: T) => boolean
  render?: (row: T) => React.ReactNode
}

// Agrupamento
interface GroupConfig<T> {
  field: keyof T
  render?: (value: any, items: T[]) => React.ReactNode
  sortGroups?: (a: any, b: any) => number
}

// Paginação
interface PaginationConfig {
  enabled: boolean
  pageSize?: number
  position?: "center" | "left" | "right"
}

// Props principais
interface SuperTableProps<T extends { id: number | string }> {
  data: T[]
  columns: Column<T>[]
  
  // Estados
  isLoading?: boolean
  emptyMessage?: string
  emptyIcon?: React.ReactNode
  
  // Seleção
  selectable?: boolean
  onSelectionChange?: (selectedIds: (number | string)[]) => void
  selectedIds?: (number | string)[]
  
  // Ações
  actions?: Action<T>[]
  showActionsHeader?: boolean
  actionsHeader?: string
  
  // Badges
  badges?: BadgeSettings[]
  
  // Agrupamento
  groupBy?: GroupConfig<T>
  groupClassName?: string
  
  // Ordenação
  defaultSort?: {
    field: keyof T
    direction: "asc" | "desc"
  }
  
  // Paginação
  pagination?: PaginationConfig
  
  // Estilização
  className?: string
  headerClassName?: string
  rowClassName?: string | ((row: T, index: number) => string)
  hoverEffect?: boolean
  
  // Cabeçalho customizado
  title?: string
  headerActions?: React.ReactNode
  
  // Rodapé
  footer?: React.ReactNode
  showTotalCount?: boolean
  totalCountLabel?: string
}

export default function SuperTable<T extends { id: number | string }>({
  data,
  columns,
  isLoading = false,
  emptyMessage = "Nenhum registro encontrado",
  emptyIcon,
  selectable = false,
  onSelectionChange,
  selectedIds = [],
  actions = [],
  showActionsHeader = true,
  actionsHeader = "Ações",
  badges = [],
  groupBy,
  groupClassName = "bg-gray-100 font-semibold",
  defaultSort,
  pagination = { enabled: false, pageSize: 10, position: "center" },
  className = "",
  headerClassName = "",
  rowClassName = "",
  hoverEffect = true,
  title,
  headerActions,
  footer,
  showTotalCount = false,
  totalCountLabel = "Total de registros"
}: SuperTableProps<T>) {
  const [selectedItems, setSelectedItems] = useState<Set<number | string>>(new Set(selectedIds))
  const [sortConfig, setSortConfig] = useState<{ field: keyof T; direction: "asc" | "desc" } | null>(
    defaultSort || null
  )
  const [currentPage, setCurrentPage] = useState(1)

  // Função para obter valor aninhado
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj)
  }

  // Aplicar badges
  const applyBadge = (value: any, field: string) => {
    const badgeSetting = badges.find(b => b.field === field)
    if (!badgeSetting) return value

    const badgeConfig = badgeSetting.config[value]
    if (!badgeConfig) return value

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeConfig.className}`}>
        {badgeConfig.label || value}
      </span>
    )
  }

  // Ordenação
  const sortedData = useMemo(() => {
    if (!sortConfig) return data

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.field]
      const bValue = b[sortConfig.field]

      if (aValue === bValue) return 0

      const comparison = aValue > bValue ? 1 : -1
      return sortConfig.direction === "asc" ? comparison : -comparison
    })
  }, [data, sortConfig])

  // Agrupamento
  const groupedData = useMemo(() => {
    if (!groupBy) return null

    const groups = new Map<any, T[]>()
    sortedData.forEach(item => {
      const groupValue = item[groupBy.field]
      if (!groups.has(groupValue)) {
        groups.set(groupValue, [])
      }
      groups.get(groupValue)!.push(item)
    })

    const sortedGroups = Array.from(groups.entries())
    if (groupBy.sortGroups) {
      sortedGroups.sort((a, b) => groupBy.sortGroups!(a[0], b[0]))
    }

    return sortedGroups
  }, [sortedData, groupBy])

  // Paginação
  const paginatedData = useMemo(() => {
    if (!pagination.enabled) return sortedData

    const startIndex = (currentPage - 1) * (pagination.pageSize || 10)
    const endIndex = startIndex + (pagination.pageSize || 10)
    return sortedData.slice(startIndex, endIndex)
  }, [sortedData, currentPage, pagination])

  const totalPages = Math.ceil(sortedData.length / (pagination.pageSize || 10))

  // Seleção
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(data.map(item => item.id))
      setSelectedItems(allIds)
      onSelectionChange?.(Array.from(allIds))
    } else {
      setSelectedItems(new Set())
      onSelectionChange?.([])
    }
  }

  const handleSelectItem = (id: number | string, checked: boolean) => {
    const newSelection = new Set(selectedItems)
    if (checked) {
      newSelection.add(id)
    } else {
      newSelection.delete(id)
    }
    setSelectedItems(newSelection)
    onSelectionChange?.(Array.from(newSelection))
  }

  const isAllSelected = data.length > 0 && selectedItems.size === data.length

  // Ordenação ao clicar no cabeçalho
  const handleSort = (field: keyof T) => {
    setSortConfig(current => {
      if (current?.field === field) {
        return {
          field,
          direction: current.direction === "asc" ? "desc" : "asc"
        }
      }
      return { field, direction: "asc" }
    })
  }

  // Renderizar linha
  const renderRow = (row: T, rowIndex: number) => {
    const isSelected = selectedItems.has(row.id)
    const rowClass = typeof rowClassName === "function" ? rowClassName(row, rowIndex) : rowClassName

    return (
      <tr
        key={row.id}
        className={`${hoverEffect ? "hover:bg-gray-50" : ""} transition-colors ${rowClass}`}
      >
        {selectable && (
          <td className="px-4 py-4 whitespace-nowrap">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => handleSelectItem(row.id, e.target.checked)}
              className="rounded border-gray-300"
            />
          </td>
        )}
        {columns.map((col, colIndex) => {
          const value = typeof col.accessor === 'string' && col.accessor.includes('.')
            ? getNestedValue(row, col.accessor)
            : row[col.accessor as keyof T]

          const cellContent = col.render
            ? col.render(value, row, rowIndex)
            : applyBadge(value, String(col.accessor))

          return (
            <td
              key={colIndex}
              className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"} ${col.cellClassName || ""}`}
              style={{ width: col.width }}
            >
              {cellContent}
            </td>
          )
        })}
        {actions.length > 0 && (
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              {actions.map((action, index) => {
                if (action.show && !action.show(row)) return null

                // Se tiver render customizado, usar ele
                if (action.render) {
                  return <div key={index}>{action.render(row)}</div>
                }

                // Caso contrário, renderizar botão padrão com ícone
                return (
                  <button
                    key={index}
                    onClick={() => action.onClick(row)}
                    className={`cursor-pointer bg-transparent p-1 rounded transition-colors ${action.className || "hover:bg-gray-200"} ${action.hoverClassName || ""}`}
                    title={action.label}
                    aria-label={action.label}
                  >
                    {action.icon && (
                      <Image
                        src={action.icon}
                        alt={action.label}
                        width={20}
                        height={20}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </td>
        )}
      </tr>
    )
  }

  // Renderizar conteúdo agrupado
  const renderGroupedContent = () => {
    if (!groupedData) return null

    return groupedData.map(([groupValue, items]) => (
      <tbody key={String(groupValue)} className="bg-white divide-y divide-gray-200">
        <tr className={groupClassName}>
          <td
            colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
            className="px-6 py-3 text-sm"
          >
            {groupBy?.render ? groupBy.render(groupValue, items) : `${String(groupBy?.field)}: ${groupValue} (${items.length})`}
          </td>
        </tr>
        {items.map((row, index) => renderRow(row, index))}
      </tbody>
    ))
  }

  const displayData = pagination.enabled ? paginatedData : sortedData

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {(title || headerActions) && (
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
          {headerActions && <div>{headerActions}</div>}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={`bg-gray-50 ${headerClassName}`}>
            <tr>
              {selectable && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </th>
              )}
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"}`}
                  onClick={() => col.sortable !== false && handleSort(col.accessor as keyof T)}
                  style={{ width: col.width }}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable !== false && sortConfig?.field === col.accessor && (
                      <span className="text-gray-400">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions.length > 0 && showActionsHeader && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {actionsHeader}
                </th>
              )}
            </tr>
          </thead>

          {isLoading ? (
            <tbody>
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    <span className="ml-2">Carregando...</span>
                  </div>
                </td>
              </tr>
            </tbody>
          ) : displayData.length === 0 ? (
            <tbody>
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center">
                    {emptyIcon || (
                      <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    )}
                    <p className="text-lg font-medium">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            </tbody>
          ) : groupBy ? (
            renderGroupedContent()
          ) : (
            <tbody className="bg-white divide-y divide-gray-200">
              {displayData.map((row, index) => renderRow(row, index))}
            </tbody>
          )}
        </table>
      </div>

      {(footer || (showTotalCount && !isLoading) || (pagination.enabled && totalPages > 1)) && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div>
            {showTotalCount && !isLoading && (
              <p className="text-sm text-gray-700">
                {totalCountLabel}: <span className="font-medium">{data.length}</span>
              </p>
            )}
          </div>

          {pagination.enabled && totalPages > 1 && (
            <div className={`flex space-x-1 ${pagination.position === "center" ? "mx-auto" : pagination.position === "right" ? "ml-auto" : ""}`}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ←
              </button>
              {Array.from({ length: Math.min(totalPages, 9) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-full ${
                    page === currentPage
                      ? "bg-gray-900 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                →
              </button>
            </div>
          )}

          {footer && <div>{footer}</div>}
        </div>
      )}
    </div>
  )
}