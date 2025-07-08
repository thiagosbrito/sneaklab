'use client'

import { useState, useEffect } from 'react'
import { Tables, Database } from '@/utils/supabase/database.types'
import useSupabaseBrowser from '@/utils/supabase/client'
import { useTable } from '@/hooks/useTable'
import TableHeader from '@/components/ui/TableHeader'
import DataTable, { Column } from '@/components/ui/DataTable'
import Pagination from '@/components/ui/Pagination'
import DashboardSheet from '@/components/ui/DashboardSheet'
import ProductForm from '@/components/admin/products/ProductForm'
import { Edit, Trash2, Eye, Package } from 'lucide-react'

type Product = Tables<'products'>
type Brand = Tables<'brands'>
type Category = Tables<'categories'>

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetLoading, setSheetLoading] = useState(false)
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
    data: products,
    searchFields: ['name', 'description'],
    initialItemsPerPage: 10
  })

  // Fetch products, brands, and categories from Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })

        if (productsError) {
          console.error('Error fetching products:', productsError)
        } else {
          setProducts(productsData || [])
        }

        // Fetch brands
        const { data: brandsData, error: brandsError } = await supabase
          .from('brands')
          .select('*')
          .order('name')

        if (brandsError) {
          console.error('Error fetching brands:', brandsError)
        } else {
          setBrands(brandsData || [])
        }

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name')

        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError)
        } else {
          setCategories(categoriesData || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  // Helper functions
  const getBrandName = (brandID: number | null) => {
    if (!brandID) return 'Unknown Brand'
    const brand = brands.find(b => b.id === brandID)
    return brand?.name || 'Unknown Brand'
  }

  const getCategoryName = (categoryID: number | null) => {
    if (!categoryID) return 'Unknown Category'
    const category = categories.find(c => c.id === categoryID)
    return category?.name || 'Unknown Category'
  }

  const columns: Column<Product>[] = [
    {
      key: 'imageURL',
      label: 'Image',
      width: 'w-16',
      render: (imageURL: string[] | null) => (
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
          {imageURL && imageURL[0] ? (
            <img 
              src={imageURL[0]} 
              alt="Product" 
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const next = target.nextElementSibling as HTMLElement
                if (next) next.classList.remove('hidden')
              }}
            />
          ) : (
            <Package className="w-6 h-6 text-gray-400" />
          )}
        </div>
      )
    },
    {
      key: 'name',
      label: 'Product Name',
      sortable: true
    },
    {
      key: 'description',
      label: 'Description',
      render: (description: string | null) => (
        <span className="max-w-xs truncate" title={description || ''}>
          {description || '-'}
        </span>
      )
    },
    {
      key: 'brandID',
      label: 'Brand',
      render: (brandID: number | null) => (
        <span className="text-sm text-gray-900">
          {getBrandName(brandID)}
        </span>
      )
    },
    {
      key: 'categoryID',
      label: 'Category',
      render: (categoryID: number | null) => (
        <span className="text-sm text-gray-900">
          {getCategoryName(categoryID)}
        </span>
      )
    },
    {
      key: 'price',
      label: 'Price',
      render: (price: number, product: Product) => (
        <div className="flex flex-col">
          {product.promoPrice ? (
            <>
              <span className="text-sm line-through text-gray-500">${price}</span>
              <span className="text-sm font-medium text-green-600">${product.promoPrice}</span>
            </>
          ) : (
            <span className="text-sm font-medium">${price}</span>
          )}
        </div>
      )
    },
    {
      key: 'isAvailable',
      label: 'Status',
      render: (isAvailable: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          isAvailable 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {isAvailable ? 'Available' : 'Unavailable'}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (created_at: string | null) => (
        created_at ? new Date(created_at).toLocaleDateString() : '-'
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, product: Product) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              // setSelectedProduct(product)
              // setSidebarOpen(true)
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
              console.log('Edit product:', product.id)
            }}
            className="p-1 text-gray-600 hover:text-gray-800"
            title="Edit product"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              // TODO: Handle delete
              console.log('Delete product:', product.id)
            }}
            className="p-1 text-red-600 hover:text-red-800"
            title="Delete product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ]

  const handleAddProduct = () => {
    setSheetOpen(true)
  }

  async function handleProductSubmit(product: Omit<Database['public']['Tables']['products']['Insert'], 'id'>) {
    setSheetLoading(true)
    // Save product to supabase
    const { error } = await supabase.from('products').insert([product])
    setSheetLoading(false)
    if (!error) {
      setSheetOpen(false)
      // Optionally, refetch products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      setProducts(productsData || [])
    }
  }

  return (
    <div className="p-6 space-y-6">
      <TableHeader
        title="Products Management"
        searchPlaceholder="Search products..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        onAddClick={handleAddProduct}
        addButtonText="Add Product"
        filterOptions={[
          {
            label: 'All Brands',
            value: 'brandID',
            options: brands.map(brand => ({
              label: brand.name,
              value: brand.id.toString()
            })),
            selectedValue: getFilterValue('brandID'),
            onChange: (value) => handleFilterChange('brandID', value)
          },
          {
            label: 'All Categories',
            value: 'categoryID', 
            options: categories.map(category => ({
              label: category.name,
              value: category.id.toString()
            })),
            selectedValue: getFilterValue('categoryID'),
            onChange: (value) => handleFilterChange('categoryID', value)
          },
          {
            label: 'All Status',
            value: 'isAvailable',
            options: [
              { label: 'Available', value: 'true' },
              { label: 'Unavailable', value: 'false' }
            ],
            selectedValue: getFilterValue('isAvailable'),
            onChange: (value) => handleFilterChange('isAvailable', value)
          }
        ]}
      />

      <DataTable
        data={paginatedData}
        columns={columns}
        loading={loading}
        emptyMessage="No products found"
        // onRowClick={(product) => {
        //   setSelectedProduct(product)
        //   setSidebarOpen(true)
        // }}
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
        title="Add Product"
        description="Fill in the details to add a new product."
        footer={null}
        size="xl"
      >
        <ProductForm onSubmit={handleProductSubmit} loading={sheetLoading} brands={brands} categories={categories} />
      </DashboardSheet>
    </div>
  )
}
