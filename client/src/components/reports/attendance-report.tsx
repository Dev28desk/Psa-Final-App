import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Download, Calendar, TrendingUp, TrendingDown } from "lucide-react";

interface AttendanceReportProps {
  dateRange: {
    start: string;
    end: string;
  };
}

export function AttendanceReport({ dateRange }: AttendanceReportProps) {
  const { data: attendanceStats } = useQuery({
    queryKey: ['/api/attendance/stats'],
  });

  const { data: batches } = useQuery({
    queryKey: ['/api/batches'],
  });

  // Mock attendance trend data (in real app, this would come from API based on dateRange)
  const attendanceTrend = [
    { date: '2025-01-01', percentage: 85 },
    { date: '2025-01-02', percentage: 88 },
    { date: '2025-01-03', percentage: 82 },
    { date: '2025-01-04', percentage: 90 },
    { date: '2025-01-05', percentage: 87 },
    { date: '2025-01-06', percentage: 92 },
    { date: '2025-01-07', percentage: 89 },
  ];

  // Mock batch performance data
  const batchPerformance = (batches || []).map((batch: any, index: number) => {
    const attendance = 75 + Math.random() * 20; // Random attendance between 75-95%
    const trend = Math.random() > 0.5 ? 'up' : 'down';
    const change = Math.random() * 10;
    
    return {
      id: batch.id,
      name: batch.name,
      attendance: attendance.toFixed(1),
      trend,
      change: change.toFixed(1),
      students: 25 + Math.floor(Math.random() * 15) // Random student count
    };
  });

  const avgAttendance = attendanceTrend.reduce((sum, item) => sum + item.percentage, 0) / attendanceTrend.length;
  const bestDay = attendanceTrend.reduce((max, item) => item.percentage > max.percentage ? item : max);
  const worstDay = attendanceTrend.reduce((min, item) => item.percentage < min.percentage ? item : min);

  return (
    <Card className="chart-container">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Attendance Analysis</span>
          </CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Average Attendance</div>
              <div className="text-2xl font-bold text-primary">
                {avgAttendance.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Last 7 days</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Best Day</div>
              <div className="text-2xl font-bold text-success">
                {bestDay.percentage}%
              </div>
              <div className="text-xs text-gray-500">
                {new Date(bestDay.date).toLocaleDateString()}
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Lowest Day</div>
              <div className="text-2xl font-bold text-destructive">
                {worstDay.percentage}%
              </div>
              <div className="text-xs text-gray-500">
                {new Date(worstDay.date).toLocaleDateString()}
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Trend</div>
              <div className="text-2xl font-bold text-accent">+2.3%</div>
              <div className="text-xs text-gray-500">vs last week</div>
            </div>
          </div>

          {/* Attendance Trend Chart */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Weekly Attendance Trend</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                  />
                  <YAxis 
                    domain={[70, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Attendance']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="percentage" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Batch Performance */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Batch Performance</h4>
            <div className="space-y-3">
              {batchPerformance.slice(0, 8).map((batch) => (
                <div key={batch.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="font-medium text-gray-900">{batch.name}</div>
                    <Badge variant="outline" className="text-xs">
                      {batch.students} students
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{batch.attendance}%</div>
                      <div className={`text-xs flex items-center space-x-1 ${
                        batch.trend === 'up' ? 'text-success' : 'text-destructive'
                      }`}>
                        {batch.trend === 'up' ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span>{batch.change}%</span>
                      </div>
                    </div>
                    
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${batch.attendance}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Time Slot Analysis</h4>
              <div className="space-y-3">
                {[
                  { time: '6:00 AM - 8:00 AM', attendance: 92, label: 'Morning' },
                  { time: '9:00 AM - 11:00 AM', attendance: 88, label: 'Late Morning' },
                  { time: '4:00 PM - 6:00 PM', attendance: 95, label: 'Evening' },
                  { time: '6:00 PM - 8:00 PM', attendance: 89, label: 'Late Evening' }
                ].map((slot) => (
                  <div key={slot.time} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{slot.label}</div>
                      <div className="text-xs text-gray-500">{slot.time}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-accent h-2 rounded-full"
                          style={{ width: `${slot.attendance}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12">{slot.attendance}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-4">Day-wise Analysis</h4>
              <div className="space-y-3">
                {[
                  { day: 'Monday', attendance: 87 },
                  { day: 'Tuesday', attendance: 90 },
                  { day: 'Wednesday', attendance: 85 },
                  { day: 'Thursday', attendance: 92 },
                  { day: 'Friday', attendance: 88 },
                  { day: 'Saturday', attendance: 94 }
                ].map((day) => (
                  <div key={day.day} className="flex items-center justify-between">
                    <span className="text-sm text-gray-900 w-20">{day.day}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-success h-2 rounded-full"
                          style={{ width: `${day.attendance}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12">{day.attendance}%</span>
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
