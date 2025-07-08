import { useQuery } from "@tanstack/react-query";
import { useRealtime } from "@/hooks/use-realtime";
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { SportsChart } from "@/components/dashboard/sports-chart";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { AIInsightsPanel } from "@/components/dashboard/ai-insights-panel";
import { Button } from "@/components/ui/button";
import { UserPlus, Banknote, Calendar, FileText } from "lucide-react";

export default function Dashboard() {
  useRealtime();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening at your academy today.</p>
      </div>

      {/* Metrics Cards */}
      <MetricsCards stats={stats} />

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <SportsChart sportsDistribution={stats?.sportsDistribution || []} />
        </div>
      </div>

      {/* Recent Activities & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivities activities={stats?.recentActivities || []} />
        <AIInsightsPanel />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button className="quick-action justify-start h-auto py-4" variant="outline">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-full">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Add Student</p>
              <p className="text-sm text-gray-500">Enroll new student</p>
            </div>
          </div>
        </Button>
        
        <Button className="quick-action justify-start h-auto py-4" variant="outline">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-50 rounded-full">
              <Banknote className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Record Payment</p>
              <p className="text-sm text-gray-500">Quick fee collection</p>
            </div>
          </div>
        </Button>
        
        <Button className="quick-action justify-start h-auto py-4" variant="outline">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-50 rounded-full">
              <Calendar className="h-5 w-5 text-accent" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Mark Attendance</p>
              <p className="text-sm text-gray-500">Today's attendance</p>
            </div>
          </div>
        </Button>
        
        <Button className="quick-action justify-start h-auto py-4" variant="outline">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 rounded-full">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Generate Report</p>
              <p className="text-sm text-gray-500">Custom reports</p>
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
}
