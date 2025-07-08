import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AttendanceCalendar } from "@/components/attendance/attendance-calendar";
import { AttendanceGrid } from "@/components/attendance/attendance-grid";
import { useRealtime } from "@/hooks/use-realtime";
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
  
  useRealtime();

  const { data: attendanceStats } = useQuery({
    queryKey: ['/api/attendance/stats', { date: selectedDate, batchId: selectedBatch }],
  });

  const { data: attendanceData } = useQuery({
    queryKey: ['/api/attendance', { date: selectedDate, batchId: selectedBatch }],
  });

  const { data: batches } = useQuery({
    queryKey: ['/api/batches'],
  });

  const { data: students } = useQuery({
    queryKey: ['/api/students'],
  });

  const getAttendancePercentage = () => {
    if (!attendanceStats) return 0;
    return attendanceStats.total > 0 ? (attendanceStats.present / attendanceStats.total) * 100 : 0;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600">Track and manage student attendance</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            value={selectedBatch || ''}
            onChange={(e) => setSelectedBatch(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">All Batches</option>
            {batches?.map((batch: any) => (
              <option key={batch.id} value={batch.id}>
                {batch.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">
                  {attendanceStats?.total || 0}
                </p>
                <p className="text-sm text-gray-500">Enrolled today</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Present</p>
                <p className="text-3xl font-bold text-gray-900">
                  {attendanceStats?.present || 0}
                </p>
                <p className="text-sm text-success">
                  {getAttendancePercentage().toFixed(1)}% attendance
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Absent</p>
                <p className="text-3xl font-bold text-gray-900">
                  {attendanceStats?.absent || 0}
                </p>
                <p className="text-sm text-error">
                  {attendanceStats?.total ? ((attendanceStats.absent / attendanceStats.total) * 100).toFixed(1) : 0}% absent
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Late Arrivals</p>
                <p className="text-3xl font-bold text-gray-900">3</p>
                <p className="text-sm text-warning">Need attention</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Calendar */}
        <div className="lg:col-span-1">
          <AttendanceCalendar 
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </div>

        {/* Attendance Grid */}
        <div className="lg:col-span-2">
          <AttendanceGrid
            date={selectedDate}
            batchId={selectedBatch}
            students={students?.students || []}
            attendance={attendanceData || []}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="chart-container">
          <CardHeader>
            <CardTitle>Weekly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => {
                const percentage = Math.floor(Math.random() * 20) + 80; // Mock data
                return (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{day}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="chart-container">
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['Rahul S.', 'Priya P.', 'Arjun K.', 'Sneha R.', 'Vikram M.'].map((student, index) => (
                <div key={student} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">{index + 1}</span>
                    </div>
                    <span className="text-sm text-gray-900">{student}</span>
                  </div>
                  <Badge className="status-paid">
                    {100 - index}% 
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="chart-container">
          <CardHeader>
            <CardTitle>Attention Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['Rohit S.', 'Kavya M.', 'Arun K.'].map((student, index) => (
                <div key={student} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-warning" />
                    <span className="text-sm text-gray-900">{student}</span>
                  </div>
                  <Badge className="status-overdue">
                    {65 + index * 5}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
