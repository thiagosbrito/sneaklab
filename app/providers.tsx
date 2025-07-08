"use client"

import { ReactQueryClientProvider } from '@/contexts/ReactQueryClientProvider'
import { AuthProvider } from '@/contexts/auth'
import { BagProvider } from '@/contexts/bag'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryClientProvider>
      <AuthProvider>
        <BagProvider>
          {children}
        </BagProvider>
      </AuthProvider>
    </ReactQueryClientProvider>
  )
}
