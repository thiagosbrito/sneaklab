'use client'

import { useState, useEffect } from 'react'
import { Tables } from '@/utils/supabase/database.types'
import useSupabaseBrowser from '@/utils/supabase/client'
import { useTable } from '@/hooks/useTable'
import TableHeader from '@/components/ui/TableHeader'
import DataTable, { Column } from '@/components/ui/DataTable'
import Pagination from '@/components/ui/Pagination'
import Sidebar from '@/components/ui/Sidebar'
import { Edit, Trash2, Eye, Image as ImageIcon, ExternalLink } from 'lucide-react'

type Category = Tables<'categories'>

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const supabase = useSupabaseBrowser()

  const {
    paginatedData,
    totalItems,
    searchTerm,
    handleSearchChange,
    currentPage,
    totalPages,
    itemsPerPage,
    setCurrentPage,
    handleItemsPerPageChange,
    handleFilterChange,
    getFilterValue
  } = useTable({
    data: categories,
    searchFields: ['name', 'description', 'slug'],
    initialItemsPerPage: 10
  })

  // Fetch categories from Supabase
  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching categories:', error)
          return
        }

        setCategories(data || [])
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [supabase])

  const columns: Column<Category>[] = [
    {
      key: 'imageURL',
      label: 'Image',
      width: 'w-16',
      render: (imageURL: string[]) => (
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
          {imageURL && imageURL[0] ? (
            <img 
              src={imageURL[0]} 
              alt="Category" 
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent) {
                  parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>'
                }
              }}
            />
          ) : (
            <ImageIcon className="w-6 h-6 text-gray-400" />
          )}
        </div>
      )
    },
    {
      key: 'name',
      label: 'Category Name',
      sortable: true,
      render: (name: string) => (
        <span className="font-medium text-gray-900">{name}</span>
      )
    },
    {
      key: 'slug',
      label: 'Slug',
      render: (slug: string) => (
        <code className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
          {slug}
        </code>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (description: string | null) => (
        <span className="max-w-xs truncate text-gray-600" title={description || ''}>
          {description || '-'}
        </span>
      )
    },
    {
      key: 'showInMenu',
      label: 'Show in Menu',
      render: (showInMenu: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          showInMenu 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {showInMenu ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (created_at: string) => (
        <span className="text-sm text-gray-600">
          {new Date(created_at).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, category: Category) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedCategory(category)
              setSidebarOpen(true)
            }}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              // TODO: Handle edit
              console.log('Edit category:', category.id)
            }}
            className="p-1 text-gray-600 hover:text-gray-800"
            title="Edit category"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              // TODO: Handle delete
              console.log('Delete category:', category.id)
            }}
            className="p-1 text-red-600 hover:text-red-800"
            title="Delete category"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <a
            href={`/category/${category.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1 text-purple-600 hover:text-purple-800"
            title="View on site"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )
    }
  ]

  const handleAddCategory = () => {
    setSelectedCategory(null)
    setSidebarOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      <TableHeader
        title="Categories Management"
        searchPlaceholder="Search categories..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        onAddClick={handleAddCategory}
        addButtonText="Add Category"
        filterOptions={[
          {
            label: 'All Visibility',
            value: 'showInMenu',
            options: [
              { label: 'Show in Menu', value: 'true' },
              { label: 'Hidden', value: 'false' }
            ],
            selectedValue: getFilterValue('showInMenu'),
            onChange: (value) => handleFilterChange('showInMenu', value)
          }
        ]}
      />

      <DataTable
        data={paginatedData}
        columns={columns}
        loading={loading}
        emptyMessage="No categories found"
        onRowClick={(category) => {
          setSelectedCategory(category)
          setSidebarOpen(true)
        }}
      />

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        title={selectedCategory ? 'Category Details' : 'Add New Category'}
        width="lg"
      >
        {selectedCategory ? (
          <div className="space-y-6">
            {/* Category Images */}
            {selectedCategory.imageURL && selectedCategory.imageURL.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedCategory.imageURL.map((url, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={url} 
                        alt={`${selectedCategory.name} ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQgMTZsNC41ODYtNC41ODZhMiAyIDAgMDEyLjgyOCAwTDE2IDE2bS0yLTJsMS41ODYtMS41ODZhMiAyIDAgMDEyLjgyOCAwTDIwIDE0bS02LTZoLjAxTTYgMjBoMTJhMiAyIDAgMDAyLTJWNmEyIDIgMCAwMC0yLTJINmEyIDIgMCAwMC0yIDJ2MTJhMiAyIDAgMDAyIDJ6IiBzdHJva2U9IiM5Q0E3QjgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo='
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name
              </label>
              <p className="text-sm text-gray-900 font-medium">{selectedCategory.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-800">
                {selectedCategory.slug}
              </code>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <p className="text-sm text-gray-900">
                {selectedCategory.description || 'No description provided.'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Menu Visibility
              </label>
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                selectedCategory.showInMenu 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {selectedCategory.showInMenu ? 'Visible in Menu' : 'Hidden from Menu'}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created Date
              </label>
              <p className="text-sm text-gray-900">
                {new Date(selectedCategory.created_at).toLocaleString()}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <a
                  href={`/category/${selectedCategory.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View on Site</span>
                </a>
                <button
                  onClick={() => {
                    // TODO: Handle edit
                    console.log('Edit category:', selectedCategory.id)
                  }}
                  className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              Add category form will be implemented here.
            </p>
            {/* Placeholder for form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="Enter category name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  placeholder="category-slug"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Enter category description"
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Show in menu</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </Sidebar>
    </div>
  )
}
