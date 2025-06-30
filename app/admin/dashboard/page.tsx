import StatsCard from '@/components/layout/dashboard/StatsCard'
import DashboardInbox from '@/components/layout/dashboard/DashboardInbox'
import RecentActivity from '@/components/layout/dashboard/RecentActivity'
import TrendsChart from '@/components/layout/dashboard/TrendsChart'

export default function DashboardPage() {
    return (
        <div className="p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatsCard title="New orders" value="35" color="purple" />
                <StatsCard title="Pending orders" value="09" color="red" />
                <StatsCard title="Total products" value="67" color="blue" />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Inbox and Activity */}
                <div className="space-y-6">
                    <DashboardInbox />
                    <RecentActivity />
                </div>

                {/* Right Column - Chart */}
                <div className="lg:col-span-2">
                    <TrendsChart />
                </div>
            </div>
        </div>
    );
}