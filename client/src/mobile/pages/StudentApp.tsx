import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GraduationCap, 
  Calendar, 
  CheckCircle2, 
  CreditCard, 
  Award, 
  LogOut,
  Bell,
  Settings,
  User
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Student Mobile Components
import StudentDashboard from "../components/student/StudentDashboard";
import StudentSchedule from "../components/student/StudentSchedule";
import StudentAttendance from "../components/student/StudentAttendance";
import StudentPayments from "../components/student/StudentPayments";
import StudentAchievements from "../components/student/StudentAchievements";
import StudentProfile from "../components/student/StudentProfile";

export default function StudentApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: studentData, isLoading } = useQuery({
    queryKey: ["/api/mobile/student/profile"],
    retry: 1,
  });

  const handleLogout = async () => {
    try {
      await fetch('/api/mobile/auth/logout', { method: 'POST' });
      localStorage.removeItem('mobile-user');
      localStorage.removeItem('mobile-token');
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      setLocation('/mobile');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900 dark:text-white">
                  Student App
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {studentData?.name || 'Student'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="dashboard" className="text-xs">
              Home
            </TabsTrigger>
            <TabsTrigger value="schedule" className="text-xs">
              Schedule
            </TabsTrigger>
            <TabsTrigger value="attendance" className="text-xs">
              Attendance
            </TabsTrigger>
            <TabsTrigger value="payments" className="text-xs">
              Payments
            </TabsTrigger>
            <TabsTrigger value="achievements" className="text-xs">
              Badges
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-xs">
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <StudentDashboard />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <StudentSchedule />
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <StudentAttendance />
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <StudentPayments />
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <StudentAchievements />
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <StudentProfile />
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-6">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`p-2 flex flex-col items-center gap-1 ${
              activeTab === "dashboard" ? "text-primary" : "text-gray-500"
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => setActiveTab("schedule")}
            className={`p-2 flex flex-col items-center gap-1 ${
              activeTab === "schedule" ? "text-primary" : "text-gray-500"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Schedule</span>
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`p-2 flex flex-col items-center gap-1 ${
              activeTab === "attendance" ? "text-primary" : "text-gray-500"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs">Attendance</span>
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`p-2 flex flex-col items-center gap-1 ${
              activeTab === "payments" ? "text-primary" : "text-gray-500"
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span className="text-xs">Payments</span>
          </button>
          <button
            onClick={() => setActiveTab("achievements")}
            className={`p-2 flex flex-col items-center gap-1 ${
              activeTab === "achievements" ? "text-primary" : "text-gray-500"
            }`}
          >
            <Award className="h-4 w-4" />
            <span className="text-xs">Badges</span>
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`p-2 flex flex-col items-center gap-1 ${
              activeTab === "profile" ? "text-primary" : "text-gray-500"
            }`}
          >
            <User className="h-4 w-4" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}