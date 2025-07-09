import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar, CheckCircle2, Clock, MapPin, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export default function CoachDashboard() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/mobile/coach/dashboard"],
    retry: 1,
  });

  const { data: todayClasses, isLoading: classesLoading } = useQuery({
    queryKey: ["/api/mobile/coach/today-classes"],
    retry: 1,
  });

  const { data: recentAttendance, isLoading: attendanceLoading } = useQuery({
    queryKey: ["/api/mobile/coach/recent-attendance"],
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
    );
  }

  const stats = dashboardData || {
    totalStudents: 0,
    activeClasses: 0,
    todayAttendance: 0,
    thisWeekClasses: 0
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.activeClasses}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Classes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.todayAttendance}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Today Present</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.thisWeekClasses}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Classes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {classesLoading ? (
            <div className="space-y-3">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ) : todayClasses && todayClasses.length > 0 ? (
            <div className="space-y-3">
              {todayClasses.map((class_: any) => (
                <div key={class_.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">{class_.sport?.name} - {class_.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {class_.timeSlot} • {class_.studentsCount} students
                    </p>
                  </div>
                  <Badge variant={class_.status === 'active' ? 'default' : 'secondary'}>
                    {class_.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No classes scheduled for today
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Recent Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attendanceLoading ? (
            <div className="space-y-3">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ) : recentAttendance && recentAttendance.length > 0 ? (
            <div className="space-y-3">
              {recentAttendance.map((attendance: any) => (
                <div key={attendance.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{attendance.student?.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {format(new Date(attendance.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <Badge variant={attendance.status === 'present' ? 'default' : 'secondary'}>
                    {attendance.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No recent attendance records
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button className="flex items-center gap-2" variant="outline">
              <CheckCircle2 className="h-4 w-4" />
              Mark Attendance
            </Button>
            <Button className="flex items-center gap-2" variant="outline">
              <Calendar className="h-4 w-4" />
              View Schedule
            </Button>
            <Button className="flex items-center gap-2" variant="outline">
              <Users className="h-4 w-4" />
              View Students
            </Button>
            <Button className="flex items-center gap-2" variant="outline">
              <MapPin className="h-4 w-4" />
              Check Location
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}