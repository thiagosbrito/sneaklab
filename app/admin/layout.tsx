import DashboardSidebar from '@/components/layout/dashboard/DashboardSidebar'
import DashboardHeader from '@/components/layout/dashboard/DashboardHeader'
import { createClient } from '@/utils/supabase/server';

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const user_id = (await supabase.auth.getUser()).data.user?.id;
  if (!user_id) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        {children}
      </div>
    );
  }
  return (
    <AuthenticatedLayout>
      {children}
    </AuthenticatedLayout>
  );
}

const AuthenticatedLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
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
  )
}