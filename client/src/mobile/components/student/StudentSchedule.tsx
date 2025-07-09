import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek, addDays } from "date-fns";

export default function StudentSchedule() {
  const { data: schedule, isLoading } = useQuery({
    queryKey: ["/api/mobile/student/schedule"],
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
    );
  }

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Your Schedule</h2>
      
      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weekDays.map((day) => {
              const daySchedule = schedule?.filter((item: any) => 
                format(new Date(item.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
              ) || [];
              
              return (
                <div key={day.toISOString()} className="border-l-4 border-primary pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{format(day, 'EEEE')}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {format(day, 'MMM dd')}
                    </p>
                  </div>
                  
                  {daySchedule.length > 0 ? (
                    <div className="space-y-2">
                      {daySchedule.map((class_: any) => (
                        <div key={class_.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{class_.sport?.name}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{class_.timeSlot}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>{class_.coach?.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{class_.location || 'Main Ground'}</span>
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline">
                              {class_.skillLevel || 'Beginner'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No classes scheduled</p>
                  )}
                </div>
              );
            })}
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
          {schedule && schedule.length > 0 ? (
            <div className="space-y-3">
              {schedule.slice(0, 5).map((class_: any) => (
                <div key={class_.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">{class_.sport?.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {format(new Date(class_.date), 'MMM dd, yyyy')} • {class_.timeSlot}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Coach: {class_.coach?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">
                      {class_.skillLevel || 'Beginner'}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {class_.location || 'Main Ground'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">No upcoming classes</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}