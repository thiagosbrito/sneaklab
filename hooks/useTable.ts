'use client'

import { useState, useMemo } from 'react'

interface UseTableOptions<T> {
  data: T[]
  searchFields?: (keyof T)[]
  initialItemsPerPage?: number
}

interface FilterOption {
  field: string
  value: string
}

export function useTable<T extends Record<string, any>>({
  data,
  searchFields = [],
  initialItemsPerPage = 10
}: UseTableOptions<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)
  const [filters, setFilters] = useState<FilterOption[]>([])

  // Apply search and filters
  const filteredData = useMemo(() => {
    let filtered = data

    // Apply search
    if (searchTerm && searchFields.length > 0) {
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const value = item[field]
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        })
      )
    }

    // Apply filters
    filters.forEach(filter => {
      if (filter.value) {
        filtered = filtered.filter(item => {
          const fieldValue = item[filter.field]
          return fieldValue?.toString() === filter.value
        })
      }
    })

    return filtered
  }, [data, searchTerm, searchFields, filters])

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  // Reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => {
      const existing = prev.find(f => f.field === field)
      if (existing) {
        return prev.map(f => f.field === field ? { ...f, value } : f)
      } else {
        return [...prev, { field, value }]
      }
    })
    setCurrentPage(1)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  const getFilterValue = (field: string) => {
    return filters.find(f => f.field === field)?.value || ''
  }

  return {
    // Data
    filteredData,
    paginatedData,
    totalItems: filteredData.length,
    
    // Search
    searchTerm,
    handleSearchChange,
    
    // Pagination
    currentPage,
    totalPages,
    itemsPerPage,
    setCurrentPage,
    handleItemsPerPageChange,
    
    // Filters
    handleFilterChange,
    getFilterValue,
    
    // State setters for external control
    setSearchTerm,
    setFilters
  }
}
