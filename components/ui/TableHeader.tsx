import { ReactNode } from 'react'
import { Search, Filter, Plus } from 'lucide-react'

interface TableHeaderProps {
  title: string
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  onAddClick?: () => void
  addButtonText?: string
  filterOptions?: {
    label: string
    value: string
    options: { label: string; value: string }[]
    selectedValue: string
    onChange: (value: string) => void
  }[]
  rightActions?: ReactNode
}

export default function TableHeader({
  title,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  onAddClick,
  addButtonText = "Add New",
  filterOptions = [],
  rightActions
}: TableHeaderProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <div className="flex items-center space-x-3">
          {onAddClick && (
            <button
              onClick={onAddClick}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{addButtonText}</span>
            </button>
          )}
          {rightActions}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        {filterOptions.map((filter) => (
          <div key={filter.value} className="relative">
            <select
              value={filter.selectedValue}
              onChange={(e) => filter.onChange(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{filter.label}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Filter className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  )
}
