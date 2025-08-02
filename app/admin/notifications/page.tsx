import { AdminNotificationPanel } from '@/components/admin/NotificationPanel';

export const dynamic = 'force-dynamic';

export default function AdminNotificationsPage() {
  return (
    <div className="p-6 space-y-6">
      <AdminNotificationPanel />
    </div>
  );
}