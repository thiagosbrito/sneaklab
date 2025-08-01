/**
 * Server-side caching utility for database queries
 * Provides React Query-like features on the server-side
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  staleTime: number
}

class ServerCache {
  private cache = new Map<string, CacheEntry<any>>()
  
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: {
      staleTime?: number // Time in milliseconds
      gcTime?: number    // Garbage collection time
    } = {}
  ): Promise<T> {
    const { staleTime = 5 * 60 * 1000, gcTime = 10 * 60 * 1000 } = options
    
    const cached = this.cache.get(key)
    const now = Date.now()
    
    // Return cached data if still fresh
    if (cached && (now - cached.timestamp) < cached.staleTime) {
      console.log(`🎯 Cache HIT for key: ${key}`)
      return cached.data
    }
    
    // Fetch fresh data
    console.log(`🔄 Cache MISS for key: ${key}, fetching fresh data...`)
    const data = await fetcher()
    
    // Store in cache
    this.cache.set(key, {
      data,
      timestamp: now,
      staleTime
    })
    
    // Schedule cleanup
    setTimeout(() => {
      const entry = this.cache.get(key)
      if (entry && (Date.now() - entry.timestamp) > gcTime) {
        this.cache.delete(key)
        console.log(`🗑️  Cache entry expired and removed: ${key}`)
      }
    }, gcTime)
    
    return data
  }
  
  invalidate(keyPattern: string) {
    const keysToDelete: string[] = []
    
    this.cache.forEach((_, key) => {
      if (key.includes(keyPattern)) {
        keysToDelete.push(key)
      }
    })
    
    keysToDelete.forEach(key => {
      this.cache.delete(key)
      console.log(`🔄 Cache invalidated: ${key}`)
    })
  }
  
  clear() {
    this.cache.clear()
    console.log('🗑️  All cache cleared')
  }
  
  getStats() {
    const keys: string[] = []
    this.cache.forEach((_, key) => keys.push(key))
    
    return {
      size: this.cache.size,
      keys
    }
  }
}

// Singleton instance
export const serverCache = new ServerCache()

// Helper function to create cache keys
export function createCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      if (params[key] !== undefined && params[key] !== null) {
        result[key] = params[key]
      }
      return result
    }, {} as Record<string, any>)
  
  return `${prefix}:${JSON.stringify(sortedParams)}`
}
