import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  CheckCircle2, 
  CreditCard, 
  Award, 
  TrendingUp,
  Clock,
  Users,
  Star
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export default function StudentDashboard() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/mobile/student/dashboard"],
    retry: 1,
  });

  const { data: upcomingClasses, isLoading: classesLoading } = useQuery({
    queryKey: ["/api/mobile/student/upcoming-classes"],
    retry: 1,
  });

  const { data: recentBadges, isLoading: badgesLoading } = useQuery({
    queryKey: ["/api/mobile/student/recent-badges"],
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
    attendancePercentage: 0,
    totalClasses: 0,
    upcomingPayment: 0,
    totalBadges: 0,
    currentLevel: 1,
    totalPoints: 0
  };

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Welcome back!</h2>
              <p className="text-blue-100">Ready for today's training?</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">Level {stats.currentLevel}</p>
              <p className="text-blue-100">{stats.totalPoints} points</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.attendancePercentage}%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Attendance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalClasses}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Classes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalBadges}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Badges</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">₹{stats.upcomingPayment}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Due Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Attendance Goal</span>
                <span className="text-sm text-gray-600">{stats.attendancePercentage}%</span>
              </div>
              <Progress value={stats.attendancePercentage} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Level Progress</span>
                <span className="text-sm text-gray-600">{stats.totalPoints % 100}/100</span>
              </div>
              <Progress value={(stats.totalPoints % 100)} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Classes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Upcoming Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {classesLoading ? (
            <div className="space-y-3">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ) : upcomingClasses && upcomingClasses.length > 0 ? (
            <div className="space-y-3">
              {upcomingClasses.map((class_: any) => (
                <div key={class_.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">{class_.sport?.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {format(new Date(class_.date), 'MMM dd, yyyy')} • {class_.timeSlot}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {class_.coach?.name}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No upcoming classes
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {badgesLoading ? (
            <div className="space-y-3">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ) : recentBadges && recentBadges.length > 0 ? (
            <div className="space-y-3">
              {recentBadges.map((badge: any) => (
                <div key={badge.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl">{badge.badge?.icon}</div>
                  <div>
                    <p className="font-medium">{badge.badge?.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Earned {format(new Date(badge.earnedAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <Badge className="ml-auto" variant="secondary">
                    +{badge.badge?.points} pts
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No achievements yet. Keep working hard!
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
              <Calendar className="h-4 w-4" />
              View Schedule
            </Button>
            <Button className="flex items-center gap-2" variant="outline">
              <CreditCard className="h-4 w-4" />
              Pay Fees
            </Button>
            <Button className="flex items-center gap-2" variant="outline">
              <Award className="h-4 w-4" />
              View Badges
            </Button>
            <Button className="flex items-center gap-2" variant="outline">
              <Users className="h-4 w-4" />
              Contact Coach
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}