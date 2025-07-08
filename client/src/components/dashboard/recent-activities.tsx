import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Banknote, Calendar, Trophy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: number;
  type: string;
  description: string;
  createdAt: string;
}

interface RecentActivitiesProps {
  activities: Activity[];
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'student_enrolled':
        return UserPlus;
      case 'payment_received':
        return Banknote;
      case 'attendance_marked':
        return Calendar;
      case 'tournament_scheduled':
        return Trophy;
      default:
        return Calendar;
    }
  };

  const getActivityIconColor = (type: string) => {
    switch (type) {
      case 'student_enrolled':
        return 'bg-green-50 text-green-600';
      case 'payment_received':
        return 'bg-blue-50 text-primary';
      case 'attendance_marked':
        return 'bg-orange-50 text-accent';
      case 'tournament_scheduled':
        return 'bg-purple-50 text-purple-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <Card className="chart-container">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Activities</CardTitle>
          <Button variant="link" size="sm">View All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const iconColorClass = getActivityIconColor(activity.type);
            
            return (
              <div key={activity.id} className="activity-item">
                <div className={`activity-icon ${iconColorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 line-clamp-2">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
          
          {activities.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No recent activities</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
