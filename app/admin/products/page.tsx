'use client'

import { useState, useEffect } from 'react'
import { Tables } from '@/utils/supabase/database.types'
import useSupabaseBrowser from '@/utils/supabase/client'
import { useTable } from '@/hooks/useTable'
import TableHeader from '@/components/ui/TableHeader'
import DataTable, { Column } from '@/components/ui/DataTable'
import Pagination from '@/components/ui/Pagination'
import Sidebar from '@/components/ui/Sidebar'
import { Edit, Trash2, Eye, Package } from 'lucide-react'

type Product = Tables<'products'>
type Brand = Tables<'brands'>
type Category = Tables<'categories'>

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
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
              setSelectedProduct(product)
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
    setSelectedProduct(null)
    setSidebarOpen(true)
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
        onRowClick={(product) => {
          setSelectedProduct(product)
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
        title={selectedProduct ? 'Product Details' : 'Add New Product'}
        width="lg"
      >
        {selectedProduct ? (
          <div className="space-y-4">
            {/* Product Image */}
            {selectedProduct.imageURL && selectedProduct.imageURL[0] && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image
                </label>
                <img 
                  src={selectedProduct.imageURL[0]} 
                  alt={selectedProduct.name}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <p className="text-sm text-gray-900">{selectedProduct.name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <p className="text-sm text-gray-900">{selectedProduct.description || '-'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <p className="text-sm text-gray-900">{getBrandName(selectedProduct.brandID)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <p className="text-sm text-gray-900">{getCategoryName(selectedProduct.categoryID)}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-900">${selectedProduct.price}</p>
                {selectedProduct.promoPrice && (
                  <span className="text-sm text-green-600 font-medium">
                    (Promo: ${selectedProduct.promoPrice})
                  </span>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                selectedProduct.isAvailable 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {selectedProduct.isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created Date
              </label>
              <p className="text-sm text-gray-900">
                {selectedProduct.created_at ? new Date(selectedProduct.created_at).toLocaleString() : '-'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    // TODO: Handle edit
                    console.log('Edit product:', selectedProduct.id)
                  }}
                  className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Product</span>
                </button>
                <button
                  onClick={() => {
                    // TODO: Handle delete
                    console.log('Delete product:', selectedProduct.id)
                  }}
                  className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Product</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600 mb-4">
              Fill in the details below to add a new product.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                placeholder="Enter product name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                placeholder="Enter product description"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand *
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select a brand</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Promo Price
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URLs
              </label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Add the main product image URL. Multiple images support coming soon.
              </p>
            </div>
            
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Product is available</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    // TODO: Handle save
                    console.log('Save new product')
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  Save Product
                </button>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </Sidebar>
    </div>
  )
}
