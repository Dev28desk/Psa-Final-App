import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, MapPin, Calendar, Award, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export default function CoachProfile() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/mobile/coach/profile"],
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Your Profile</h2>
      
      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{profile?.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">Sports Coach</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{profile?.email || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{profile?.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{profile?.address || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  Joined {profile?.createdAt ? format(new Date(profile.createdAt), 'MMM yyyy') : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Professional Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">Specializations</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile?.specializations?.map((spec: string, index: number) => (
                  <Badge key={index} variant="secondary">{spec}</Badge>
                )) || <span className="text-gray-500 text-sm">None specified</span>}
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium">Experience</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {profile?.experience || 'Not specified'} years
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium">Qualifications</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile?.qualifications?.map((qual: string, index: number) => (
                  <Badge key={index} variant="outline">{qual}</Badge>
                )) || <span className="text-gray-500 text-sm">None specified</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Your Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{profile?.totalStudents || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{profile?.totalClasses || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Classes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{profile?.attendanceRate || 0}%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Attendance Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{profile?.rating || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Phone className="h-4 w-4 mr-2" />
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Mail className="h-4 w-4 mr-2" />
              Notification Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}