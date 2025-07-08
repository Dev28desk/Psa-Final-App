import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueReport } from "@/components/reports/revenue-report";
import { StudentReport } from "@/components/reports/student-report";
import { AttendanceReport } from "@/components/reports/attendance-report";
import { 
  Download, 
  FileText, 
  TrendingUp, 
  Users, 
  Calendar,
  PieChart
} from "lucide-react";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("financial");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const reportCategories = [
    {
      id: "financial",
      name: "Financial Reports",
      icon: TrendingUp,
      description: "Revenue, payments, and financial analytics"
    },
    {
      id: "operational",
      name: "Operational Reports", 
      icon: Users,
      description: "Student enrollment, attendance, and operations"
    },
    {
      id: "analytics",
      name: "Analytics Reports",
      icon: PieChart,
      description: "Performance insights and trends"
    }
  ];

  const financialReports = [
    {
      id: "daily-collection",
      name: "Daily Collection Report",
      description: "Summary of daily payment collections",
      icon: FileText
    },
    {
      id: "monthly-revenue",
      name: "Monthly Revenue Analysis", 
      description: "Detailed monthly revenue breakdown",
      icon: TrendingUp
    },
    {
      id: "outstanding-fees",
      name: "Outstanding Fees Report",
      description: "Pending and overdue payments",
      icon: Calendar
    }
  ];

  const operationalReports = [
    {
      id: "attendance-summary",
      name: "Attendance Summary",
      description: "Batch-wise attendance statistics", 
      icon: Calendar
    },
    {
      id: "enrollment-report",
      name: "Student Enrollment Report",
      description: "New joins vs dropouts analysis",
      icon: Users
    },
    {
      id: "coach-performance",
      name: "Coach Performance Report",
      description: "Coach effectiveness metrics",
      icon: TrendingUp
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Generate comprehensive reports and insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Report Categories */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          {reportCategories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center space-x-2">
              <category.icon className="h-4 w-4" />
              <span>{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Financial Reports */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {financialReports.map((report) => (
              <Card key={report.id} className="quick-action cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 rounded-full">
                      <report.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{report.name}</h3>
                      <p className="text-sm text-gray-500">{report.description}</p>
                      <Button variant="link" className="p-0 h-auto mt-2">
                        Generate Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <RevenueReport dateRange={dateRange} />
        </TabsContent>

        {/* Operational Reports */}
        <TabsContent value="operational" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {operationalReports.map((report) => (
              <Card key={report.id} className="quick-action cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-50 rounded-full">
                      <report.icon className="h-6 w-6 text-success" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{report.name}</h3>
                      <p className="text-sm text-gray-500">{report.description}</p>
                      <Button variant="link" className="p-0 h-auto mt-2">
                        Generate Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StudentReport />
            <AttendanceReport dateRange={dateRange} />
          </div>
        </TabsContent>

        {/* Analytics Reports */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="chart-container">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Sport Popularity Trends</CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Cricket', 'Football', 'Basketball', 'Tennis'].map((sport, index) => {
                    const growth = [12, 8, -3, 15][index];
                    return (
                      <div key={sport} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-primary rounded-full"></div>
                          <span className="text-sm text-gray-900">{sport}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${70 + index * 10}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${growth > 0 ? 'text-success' : 'text-error'}`}>
                            {growth > 0 ? '+' : ''}{growth}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="chart-container">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Retention Analysis</CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-success">92%</div>
                    <div className="text-sm text-gray-500">Overall Retention Rate</div>
                  </div>
                  <div className="space-y-3">
                    {['0-3 months', '3-6 months', '6-12 months', '12+ months'].map((period, index) => {
                      const retention = [98, 95, 89, 85][index];
                      return (
                        <div key={period} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{period}</span>
                          <div className="flex items-center space-x-3">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-success h-2 rounded-full"
                                style={{ width: `${retention}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-10">{retention}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
