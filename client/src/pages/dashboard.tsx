import { useQuery } from "@tanstack/react-query";
import { useRealtime } from "@/hooks/use-realtime";
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { SportsChart } from "@/components/dashboard/sports-chart";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { AIInsightsPanel } from "@/components/dashboard/ai-insights-panel";
import { Button } from "@/components/ui/button";
import { UserPlus, Banknote, Calendar, FileText, Users, Grid3X3 } from "lucide-react";
import { Link } from "wouter";

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
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening at your academy today.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="outline" size="sm" className="hover:bg-gray-50">
              <FileText className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link href="/students">
            <Button 
              variant="outline" 
              className="h-20 w-full flex flex-col items-center justify-center space-y-2 hover:bg-primary hover:text-white transition-all duration-200 hover:shadow-md"
            >
              <UserPlus className="h-6 w-6" />
              <span className="text-xs font-medium">Add Student</span>
            </Button>
          </Link>
          <Link href="/fees">
            <Button 
              variant="outline" 
              className="h-20 w-full flex flex-col items-center justify-center space-y-2 hover:bg-green-600 hover:text-white transition-all duration-200 hover:shadow-md"
            >
              <Banknote className="h-6 w-6" />
              <span className="text-xs font-medium">Collect Fee</span>
            </Button>
          </Link>
          <Link href="/attendance">
            <Button 
              variant="outline" 
              className="h-20 w-full flex flex-col items-center justify-center space-y-2 hover:bg-blue-600 hover:text-white transition-all duration-200 hover:shadow-md"
            >
              <Calendar className="h-6 w-6" />
              <span className="text-xs font-medium">Mark Attendance</span>
            </Button>
          </Link>
          <Link href="/reports">
            <Button 
              variant="outline" 
              className="h-20 w-full flex flex-col items-center justify-center space-y-2 hover:bg-purple-600 hover:text-white transition-all duration-200 hover:shadow-md"
            >
              <FileText className="h-6 w-6" />
              <span className="text-xs font-medium">Generate Report</span>
            </Button>
          </Link>
          <Link href="/students">
            <Button 
              variant="outline" 
              className="h-20 w-full flex flex-col items-center justify-center space-y-2 hover:bg-orange-600 hover:text-white transition-all duration-200 hover:shadow-md"
            >
              <Users className="h-6 w-6" />
              <span className="text-xs font-medium">View Students</span>
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="h-20 w-full flex flex-col items-center justify-center space-y-2 hover:bg-indigo-600 hover:text-white transition-all duration-200 hover:shadow-md"
          >
            <Grid3X3 className="h-6 w-6" />
            <span className="text-xs font-medium">Manage Batches</span>
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <MetricsCards stats={stats} />

      {/* Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <RevenueChart />
          <SportsChart sportsDistribution={stats?.sportsDistribution || []} />
        </div>
        <div className="space-y-6">
          <RecentActivities activities={stats?.recentActivities || []} />
          <AIInsightsPanel />
        </div>
      </div>
    </div>
  );
}