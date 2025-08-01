/**
 * Simple API client utility for SneakLab
 * Uses Drizzle schema types for type safety
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new ApiError(
          `API Error: ${response.status} ${response.statusText}`,
          response.status,
          response
        )
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        return {} as T
      }

      return await response.json()
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(`Network Error: ${error}`, 0)
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Default API client instance
export const apiClient = new ApiClient('/api')

// Helper function to build query strings from objects
export function buildQueryString(params: Record<string, string | number | boolean | null | undefined>): string {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)))
      } else {
        searchParams.append(key, String(value))
      }
    }
  })
  
  return searchParams.toString()
}