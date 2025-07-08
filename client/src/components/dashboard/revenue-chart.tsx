import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart } from "recharts";
import { useState } from "react";

export function RevenueChart() {
  const [view, setView] = useState<'monthly' | 'weekly' | 'daily'>('monthly');
  
  const { data: revenueData, isLoading } = useQuery({
    queryKey: ['/api/dashboard/revenue-chart', { year: new Date().getFullYear() }],
  });

  if (isLoading) {
    return (
      <Card className="chart-container">
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = revenueData?.map(item => ({
    month: item.month.substring(0, 3),
    revenue: item.revenue,
    formattedRevenue: `₹${(item.revenue / 1000).toFixed(0)}k`
  })) || [];

  return (
    <Card className="chart-container">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Revenue Trends</CardTitle>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={view === 'monthly' ? 'default' : 'outline'}
              onClick={() => setView('monthly')}
            >
              Monthly
            </Button>
            <Button
              size="sm"
              variant={view === 'weekly' ? 'default' : 'outline'}
              onClick={() => setView('weekly')}
            >
              Weekly
            </Button>
            <Button
              size="sm"
              variant={view === 'daily' ? 'default' : 'outline'}
              onClick={() => setView('daily')}
            >
              Daily
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis 
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary))"
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
