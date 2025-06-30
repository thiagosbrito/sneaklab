import DashboardSidebar from '@/components/layout/dashboard/DashboardSidebar'
import DashboardHeader from '@/components/layout/dashboard/DashboardHeader'

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto flex flex-col">
        <DashboardHeader />
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}