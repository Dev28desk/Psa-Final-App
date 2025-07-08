import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Download, TrendingUp } from "lucide-react";

interface RevenueReportProps {
  dateRange: {
    start: string;
    end: string;
  };
}

export function RevenueReport({ dateRange }: RevenueReportProps) {
  const { data: revenueData, isLoading } = useQuery({
    queryKey: ['/api/dashboard/revenue-chart', { year: new Date().getFullYear() }],
  });

  const chartData = revenueData?.map(item => ({
    month: item.month.substring(0, 3),
    revenue: item.revenue,
    target: item.revenue * 1.1, // Mock target 10% higher
    formattedRevenue: `₹${(item.revenue / 1000).toFixed(0)}k`
  })) || [];

  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const avgMonthlyRevenue = totalRevenue / chartData.length;

  if (isLoading) {
    return (
      <Card className="chart-container">
        <CardHeader>
          <CardTitle>Revenue Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="chart-container">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Revenue Analysis</span>
          </CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total Revenue</div>
              <div className="text-2xl font-bold text-primary">
                ₹{totalRevenue.toLocaleString()}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Average Monthly</div>
              <div className="text-2xl font-bold text-success">
                ₹{avgMonthlyRevenue.toLocaleString()}
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Growth Rate</div>
              <div className="text-2xl font-bold text-accent">+12.5%</div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `₹${value.toLocaleString()}`, 
                    name === 'revenue' ? 'Revenue' : 'Target'
                  ]}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Methods Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Payment Methods</h4>
              <div className="space-y-3">
                {[
                  { method: 'UPI', percentage: 45, amount: 1280000 },
                  { method: 'Cash', percentage: 35, amount: 980000 },
                  { method: 'Card', percentage: 15, amount: 420000 },
                  { method: 'Online', percentage: 5, amount: 140000 }
                ].map((item) => (
                  <div key={item.method} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <span className="text-sm text-gray-900">{item.method}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-16">
                        ₹{(item.amount / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-4">Sport-wise Revenue</h4>
              <div className="space-y-3">
                {[
                  { sport: 'Cricket', percentage: 40, amount: 1120000 },
                  { sport: 'Football', percentage: 30, amount: 840000 },
                  { sport: 'Basketball', percentage: 20, amount: 560000 },
                  { sport: 'Tennis', percentage: 10, amount: 280000 }
                ].map((item) => (
                  <div key={item.sport} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-accent rounded-full"></div>
                      <span className="text-sm text-gray-900">{item.sport}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-accent h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-16">
                        ₹{(item.amount / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
