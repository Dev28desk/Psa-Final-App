import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth } from "date-fns";

export default function StudentAttendance() {
  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ["/api/mobile/student/attendance"],
    retry: 1,
  });

  const { data: attendanceStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/mobile/student/attendance-stats"],
    retry: 1,
  });

  if (isLoading || statsLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
    );
  }

  const stats = attendanceStats || {
    totalClasses: 0,
    presentClasses: 0,
    absentClasses: 0,
    attendancePercentage: 0,
    thisMonthPercentage: 0,
    streak: 0
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Your Attendance</h2>
      
      {/* Statistics Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Attendance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.presentClasses}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Present</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.absentClasses}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Absent</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.attendancePercentage}%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overall</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.streak}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Streak</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Overall Attendance</span>
                <span>{stats.attendancePercentage}%</span>
              </div>
              <Progress value={stats.attendancePercentage} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>This Month</span>
                <span>{stats.thisMonthPercentage}%</span>
              </div>
              <Progress value={stats.thisMonthPercentage} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attendanceData && attendanceData.length > 0 ? (
            <div className="space-y-3">
              {attendanceData.map((attendance: any) => (
                <div key={attendance.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">{attendance.batch?.sport?.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {format(new Date(attendance.date), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {attendance.batch?.timeSlot}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={attendance.status === 'present' ? 'default' : 'destructive'}>
                      {attendance.status === 'present' ? (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {attendance.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">No attendance records found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium p-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid would go here - simplified for mobile */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
            Calendar view coming soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
}