'use client'

import { useState } from 'react'
import { Tables } from '@/utils/supabase/database.types'
import { useTable } from '@/hooks/useTable'
import TableHeader from '@/components/ui/TableHeader'
import DataTable, { Column } from '@/components/ui/DataTable'
import Pagination from '@/components/ui/Pagination'
import DashboardSheet from '@/components/ui/DashboardSheet'
import CategoryForm, { CategoryFormValues } from '@/components/admin/categories/CategoryForm'
import TableActions from '@/components/ui/TableActions'
import { Edit, Trash2, Eye, Image as ImageIcon, ExternalLink } from 'lucide-react'
import ImageWithFallback from '@/components/ui/ImageWithFallback'
import useCategories from '@/hooks/useCategories'

type Category = Tables<'categories'>

export default function CategoriesPage() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  // Handle add category
  const handleAddCategory = () => {
    setSheetOpen(true)
  }

  const { categories, loading } = useCategories()

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

  const columns: Column<Category>[] = [
    {
      key: 'imageURL',
      label: 'Image',
      width: 'w-16',
      render: (imageURL: string[]) => (
        <ImageWithFallback
          src={imageURL && imageURL[0] ? imageURL[0] : ''}
          alt="Category"
          className="w-full h-full object-cover rounded-lg"
        />
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
        <TableActions slug={category.slug} />
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
