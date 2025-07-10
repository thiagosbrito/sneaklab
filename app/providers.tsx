"use client"

import { ReactQueryClientProvider } from '@/contexts/ReactQueryClientProvider'
import { AuthProvider } from '@/contexts/auth'
import { BagProvider } from '@/contexts/bag'
import { LoginDialogProvider } from '@/contexts/loginDialog'
import { AuthSidebar } from '@/components/ui/AuthSidebar'
import { useLoginDialog } from '@/contexts/loginDialog'

const AuthSidebarWrapper = () => {
  const { isOpen, closeLoginDialog } = useLoginDialog()
  return <AuthSidebar isOpen={isOpen} onClose={closeLoginDialog} />
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryClientProvider>
      <AuthProvider>
        <BagProvider>
          <LoginDialogProvider>
            {children}
            <AuthSidebarWrapper />
          </LoginDialogProvider>
        </BagProvider>
      </AuthProvider>
    </ReactQueryClientProvider>
  )
}
