import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, Banknote, Calendar, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MetricsCardsProps {
  stats: {
    totalStudents: number;
    activeStudents: number;
    totalRevenue: number;
    pendingFees: number;
    todayAttendance: number;
  } | null;
}

export function MetricsCards({ stats }: MetricsCardsProps) {
  if (!stats) return null;

  const metrics = [
    {
      title: "Total Active Students",
      value: stats.activeStudents,
      change: "+12% from last month",
      trend: "up",
      icon: Users,
      color: "primary",
      progress: 75,
      action: "View All"
    },
    {
      title: "Revenue This Month",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      change: "+8% from last month",
      trend: "up",
      icon: Banknote,
      color: "success",
      progress: 80,
      action: "View Details"
    },
    {
      title: "Today's Attendance",
      value: `${stats.todayAttendance.toFixed(0)}%`,
      change: `${stats.activeStudents - Math.floor(stats.activeStudents * stats.todayAttendance / 100)} absent`,
      trend: "neutral",
      icon: Calendar,
      color: "accent",
      progress: stats.todayAttendance,
      action: "Mark Attendance"
    },
    {
      title: "Pending Fees",
      value: `₹${stats.pendingFees.toLocaleString()}`,
      change: "23 students",
      trend: "down",
      icon: AlertTriangle,
      color: "destructive",
      progress: 0,
      action: "Collect Fees",
      isButton: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <Card key={metric.title} className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{metric.value}</p>
                <div className="flex items-center mt-1">
                  {metric.trend === "up" && (
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  )}
                  {metric.trend === "down" && (
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <p className={`text-sm ${
                    metric.trend === "up" ? "text-green-600" : 
                    metric.trend === "down" ? "text-red-600" : "text-gray-500"
                  }`}>
                    {metric.change}
                  </p>
                </div>
              </div>
              <div className={`p-3 rounded-full ${
                metric.color === "primary" ? "bg-blue-50" :
                metric.color === "success" ? "bg-green-50" :
                metric.color === "accent" ? "bg-orange-50" :
                "bg-red-50"
              }`}>
                <metric.icon className={`h-6 w-6 ${
                  metric.color === "primary" ? "text-primary" :
                  metric.color === "success" ? "text-green-600" :
                  metric.color === "accent" ? "text-accent" :
                  "text-destructive"
                }`} />
              </div>
            </div>
            
            <div className="mt-4">
              {metric.isButton ? (
                <Button className="w-full bg-accent hover:bg-accent/90 text-white">
                  {metric.action}
                </Button>
              ) : (
                <>
                  <div className="progress-bar">
                    <div 
                      className={`progress-fill ${
                        metric.color === "primary" ? "bg-primary" :
                        metric.color === "success" ? "bg-green-500" :
                        metric.color === "accent" ? "bg-accent" :
                        "bg-destructive"
                      }`}
                      style={{ width: `${metric.progress}%` }}
                    />
                  </div>
                  <Button variant="link" className="p-0 h-auto mt-2 text-sm">
                    {metric.action}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
