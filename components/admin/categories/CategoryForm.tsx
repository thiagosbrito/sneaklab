import { useState } from 'react'
import { Tables } from '@/utils/supabase/database.types'

export type CategoryFormValues = {
  name: string
  slug: string
  description?: string
  showInMenu: boolean
  imageURL: string[]
}

type CategoryFormProps = {
  initialValues?: CategoryFormValues
  onSubmit: (values: CategoryFormValues) => void
  loading?: boolean
}

export default function CategoryForm({ initialValues, onSubmit, loading }: CategoryFormProps) {
  const [form, setForm] = useState<CategoryFormValues>(
    initialValues || {
      name: '',
      slug: '',
      description: '',
      showInMenu: true,
      imageURL: [],
    }
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    let fieldValue: string | boolean = value
    if (type === 'checkbox') {
      fieldValue = (e.target as HTMLInputElement).checked
    }
    setForm((prev) => ({
      ...prev,
      [name]: fieldValue,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
        <input
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
        <input
          name="slug"
          type="text"
          value={form.slug}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="flex items-center space-x-2">
          <input
            name="showInMenu"
            type="checkbox"
            checked={form.showInMenu}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Show in menu</span>
        </label>
      </div>
      {/* Image upload can be added here if needed */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save Category'}
      </button>
    </form>
  )
}
