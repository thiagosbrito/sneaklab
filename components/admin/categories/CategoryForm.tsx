import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createCategoryAction } from '@/app/actions'
import { useState } from 'react'

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  showInMenu: z.boolean(),
  imageURL: z.array(z.string()).optional(),
})

export type CategoryFormValues = z.infer<typeof categorySchema>

type CategoryFormProps = {
  initialValues?: CategoryFormValues
  onSuccess?: () => void
  loading?: boolean
}

export default function CategoryForm({ initialValues, onSuccess, loading }: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialValues || {
      name: '',
      slug: '',
      description: '',
      showInMenu: true,
      imageURL: [],
    },
  })

  const onSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('slug', data.slug)
      formData.append('description', data.description || '')
      formData.append('showInMenu', data.showInMenu.toString())
      
      const result = await createCategoryAction(formData)
      
      if (result.error) {
        setError(result.error)
      } else {
        reset()
        onSuccess?.()
      }
    } catch (err) {
      setError('Failed to create category')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
        <input
          {...register('name')}
          type="text"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
        <input
          {...register('slug')}
          type="text"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.slug && <p className="text-red-500 text-sm">{errors.slug.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
      </div>
      <div>
        <label className="flex items-center space-x-2">
          <input
            {...register('showInMenu')}
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Show in menu</span>
        </label>
      </div>
      
      {error && (
        <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
          {error}
        </div>
      )}
      
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        disabled={isSubmitting || loading}
      >
        {isSubmitting ? 'Saving...' : 'Save Category'}
      </button>
    </form>
  )
}
