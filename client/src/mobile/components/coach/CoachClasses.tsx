import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export default function CoachClasses() {
  const { data: classes, isLoading } = useQuery({
    queryKey: ["/api/mobile/coach/classes"],
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Your Classes</h2>
      
      {classes && classes.length > 0 ? (
        <div className="space-y-4">
          {classes.map((class_: any) => (
            <Card key={class_.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{class_.sport?.name} - {class_.name}</CardTitle>
                  <Badge variant={class_.isActive ? "default" : "secondary"}>
                    {class_.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{class_.timeSlot}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    <span>{class_.studentsCount || 0} students</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{class_.location || 'Main Ground'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>Level: {class_.skillLevel || 'Beginner'}</span>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Button size="sm" className="flex-1">
                    View Students
                  </Button>
                  <Button size="sm" variant="outline">
                    Mark Attendance
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">No classes assigned yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}