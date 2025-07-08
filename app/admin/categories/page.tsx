'use client'

import { useState, useEffect } from 'react'
import { Tables } from '@/utils/supabase/database.types'
import useSupabaseBrowser from '@/utils/supabase/client'
import { useTable } from '@/hooks/useTable'
import TableHeader from '@/components/ui/TableHeader'
import DataTable, { Column } from '@/components/ui/DataTable'
import Pagination from '@/components/ui/Pagination'
import DashboardSheet from '@/components/ui/DashboardSheet'
import CategoryForm, { CategoryFormValues } from '@/components/admin/categories/CategoryForm'
import { Edit, Trash2, Eye, Image as ImageIcon, ExternalLink } from 'lucide-react'

type Category = Tables<'categories'>

export default function CategoriesPage() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  // Handle add category
  const handleAddCategory = () => {
    setSheetOpen(true)
  }

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

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
          <a
            href={`/category/${category.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-purple-600 hover:text-purple-800"
            title="View on site"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )
    }
  ]


  return (
    <div className="p-6 space-y-6">      
      <TableHeader
        title="Categories Management"
        searchPlaceholder="Search categories..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        addButtonText="Add Category"
        onAddClick={handleAddCategory}
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

      <DashboardSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Add Category"
        description="Fill in the details to add a new category."
        footer={null}
        size='md'
      >
        <CategoryForm onSubmit={handleAddCategory} loading={formLoading} />
      </DashboardSheet>
    </div>
  )
}
