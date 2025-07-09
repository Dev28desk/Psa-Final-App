import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Smartphone,
  LogOut,
  Bell,
  Settings
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Coach Mobile Components
import CoachDashboard from "../components/coach/CoachDashboard";
import CoachClasses from "../components/coach/CoachClasses";
import CoachAttendance from "../components/coach/CoachAttendance";
import CoachProfile from "../components/coach/CoachProfile";

export default function CoachApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: coachData, isLoading } = useQuery({
    queryKey: ["/api/mobile/coach/profile"],
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
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900 dark:text-white">
                  Coach App
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {coachData?.name || 'Coach'}
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
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="dashboard" className="text-xs">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="classes" className="text-xs">
              Classes
            </TabsTrigger>
            <TabsTrigger value="attendance" className="text-xs">
              Attendance
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-xs">
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <CoachDashboard />
          </TabsContent>

          <TabsContent value="classes" className="space-y-4">
            <CoachClasses />
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <CoachAttendance />
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <CoachProfile />
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-4">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`p-3 flex flex-col items-center gap-1 ${
              activeTab === "dashboard" ? "text-primary" : "text-gray-500"
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span className="text-xs">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab("classes")}
            className={`p-3 flex flex-col items-center gap-1 ${
              activeTab === "classes" ? "text-primary" : "text-gray-500"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Classes</span>
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`p-3 flex flex-col items-center gap-1 ${
              activeTab === "attendance" ? "text-primary" : "text-gray-500"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs">Attendance</span>
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`p-3 flex flex-col items-center gap-1 ${
              activeTab === "profile" ? "text-primary" : "text-gray-500"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}