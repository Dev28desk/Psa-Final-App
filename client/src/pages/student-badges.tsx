import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Trophy, 
  Award, 
  Star, 
  Target, 
  Medal, 
  Plus, 
  Crown, 
  Shield,
  CheckCircle,
  Activity,
  Calendar,
  Gift,
  UserCheck,
  TrendingUp,
  Clock,
  Edit,
  Trash2,
  Sparkles,
  Users,
  Book,
  Heart,
  Zap,
  Flame,
  Diamond,
  Crown as CrownIcon
} from "lucide-react";

interface Badge {
  id: number;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  requirements: any;
  points: number;
  level: number;
  isActive: boolean;
  createdAt: string;
}

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  batch: {
    name: string;
    sport: {
      name: string;
    };
  };
}

interface StudentBadge {
  id: number;
  studentId: number;
  badgeId: number;
  earnedAt: string;
  progress: any;
  isDisplayed: boolean;
  badge: Badge;
}

interface StudentPoints {
  id: number;
  studentId: number;
  totalPoints: number;
  experiencePoints: number;
  monthlyPoints: number;
  level: number;
  lastUpdated: string;
}

const badgeIcons = {
  trophy: Trophy,
  award: Award,
  star: Star,
  medal: Medal,
  crown: Crown,
  shield: Shield,
  target: Target,
  activity: Activity,
  calendar: Calendar,
  gift: Gift,
  usercheck: UserCheck,
  trending: TrendingUp,
  clock: Clock,
  sparkles: Sparkles,
  users: Users,
  book: Book,
  heart: Heart,
  zap: Zap,
  flame: Flame,
  diamond: Diamond,
  crownicon: CrownIcon
};

const badgeColors = {
  gold: "bg-yellow-100 text-yellow-800 border-yellow-300",
  silver: "bg-gray-100 text-gray-800 border-gray-300",
  bronze: "bg-orange-100 text-orange-800 border-orange-300",
  blue: "bg-blue-100 text-blue-800 border-blue-300",
  green: "bg-green-100 text-green-800 border-green-300",
  red: "bg-red-100 text-red-800 border-red-300",
  purple: "bg-purple-100 text-purple-800 border-purple-300",
  indigo: "bg-indigo-100 text-indigo-800 border-indigo-300"
};

const badgeCategories = [
  { value: "attendance", label: "Attendance" },
  { value: "performance", label: "Performance" },
  { value: "milestone", label: "Milestone" },
  { value: "special", label: "Special" },
  { value: "participation", label: "Participation" },
  { value: "achievement", label: "Achievement" }
];

export default function StudentBadges() {
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newBadge, setNewBadge] = useState({
    name: "",
    description: "",
    category: "",
    icon: "trophy",
    color: "gold",
    points: 10,
    level: 1,
    requirements: {}
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: badges, isLoading: badgesLoading } = useQuery({
    queryKey: ['/api/badges'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['/api/students'],
    staleTime: 5 * 60 * 1000,
  });

  const students = studentsData?.students || [];

  const { data: studentBadges, isLoading: studentBadgesLoading } = useQuery({
    queryKey: ['/api/students', selectedStudent, 'badges'],
    enabled: !!selectedStudent,
  });

  const { data: studentPoints, isLoading: studentPointsLoading } = useQuery({
    queryKey: ['/api/students', selectedStudent, 'points'],
    enabled: !!selectedStudent,
  });

  const { data: achievementHistory, isLoading: achievementLoading } = useQuery({
    queryKey: ['/api/students', selectedStudent, 'achievements'],
    enabled: !!selectedStudent,
  });

  const createBadgeMutation = useMutation({
    mutationFn: async (badgeData: any) => {
      const response = await apiRequest("POST", "/api/badges", badgeData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Badge created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/badges'] });
      setIsCreateDialogOpen(false);
      setNewBadge({
        name: "",
        description: "",
        category: "",
        icon: "trophy",
        color: "gold",
        points: 10,
        level: 1,
        requirements: {}
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create badge",
        variant: "destructive",
      });
    }
  });

  const awardBadgeMutation = useMutation({
    mutationFn: async ({ studentId, badgeId }: { studentId: number; badgeId: number }) => {
      const response = await apiRequest("POST", `/api/students/${studentId}/award-badge`, { badgeId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Badge awarded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/students', selectedStudent, 'badges'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to award badge",
        variant: "destructive",
      });
    }
  });

  const addPointsMutation = useMutation({
    mutationFn: async ({ studentId, points }: { studentId: number; points: number }) => {
      const response = await apiRequest("POST", `/api/students/${studentId}/add-points`, { points });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Points added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/students', selectedStudent, 'points'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add points",
        variant: "destructive",
      });
    }
  });

  const getBadgeIcon = (iconName: string) => {
    const IconComponent = badgeIcons[iconName as keyof typeof badgeIcons] || Trophy;
    return IconComponent;
  };

  const getBadgeColor = (color: string) => {
    return badgeColors[color as keyof typeof badgeColors] || badgeColors.gold;
  };

  const getProgressLevel = (points: number) => {
    if (points >= 1000) return { level: 5, title: "Master", color: "text-purple-600" };
    if (points >= 500) return { level: 4, title: "Expert", color: "text-blue-600" };
    if (points >= 250) return { level: 3, title: "Advanced", color: "text-green-600" };
    if (points >= 100) return { level: 2, title: "Intermediate", color: "text-yellow-600" };
    return { level: 1, title: "Beginner", color: "text-gray-600" };
  };

  const handleCreateBadge = () => {
    if (!newBadge.name || !newBadge.description || !newBadge.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createBadgeMutation.mutate({
      ...newBadge,
      requirements: JSON.stringify(newBadge.requirements),
      isActive: true
    });
  };

  const handleAwardBadge = () => {
    if (!selectedStudent || !selectedBadge) {
      toast({
        title: "Error",
        description: "Please select a student and badge",
        variant: "destructive",
      });
      return;
    }

    awardBadgeMutation.mutate({
      studentId: selectedStudent,
      badgeId: selectedBadge
    });
  };

  const handleAddPoints = (points: number) => {
    if (!selectedStudent) {
      toast({
        title: "Error",
        description: "Please select a student",
        variant: "destructive",
      });
      return;
    }

    addPointsMutation.mutate({
      studentId: selectedStudent,
      points
    });
  };

  const isLoading = badgesLoading || studentsLoading || studentBadgesLoading || studentPointsLoading;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <span>Student Badges & Achievements</span>
          </h1>
          <p className="text-gray-600">Manage student badges, points, and achievements</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Badge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Badge</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="badge-name">Badge Name</Label>
                <Input
                  id="badge-name"
                  value={newBadge.name}
                  onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })}
                  placeholder="Enter badge name"
                />
              </div>
              <div>
                <Label htmlFor="badge-description">Description</Label>
                <Textarea
                  id="badge-description"
                  value={newBadge.description}
                  onChange={(e) => setNewBadge({ ...newBadge, description: e.target.value })}
                  placeholder="Enter badge description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="badge-category">Category</Label>
                  <Select value={newBadge.category} onValueChange={(value) => setNewBadge({ ...newBadge, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {badgeCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="badge-icon">Icon</Label>
                  <Select value={newBadge.icon} onValueChange={(value) => setNewBadge({ ...newBadge, icon: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(badgeIcons).map((iconName) => (
                        <SelectItem key={iconName} value={iconName}>
                          {iconName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="badge-color">Color</Label>
                  <Select value={newBadge.color} onValueChange={(value) => setNewBadge({ ...newBadge, color: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(badgeColors).map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="badge-points">Points</Label>
                  <Input
                    id="badge-points"
                    type="number"
                    value={newBadge.points}
                    onChange={(e) => setNewBadge({ ...newBadge, points: parseInt(e.target.value) })}
                    placeholder="10"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBadge} disabled={createBadgeMutation.isPending}>
                  {createBadgeMutation.isPending ? "Creating..." : "Create Badge"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Select Student</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {studentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : students?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No students found
                  </div>
                ) : (
                  students?.map((student: Student) => (
                    <div
                      key={student.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedStudent === student.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedStudent(student.id)}
                    >
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-gray-600">
                        {student.batch?.sport?.name} - {student.batch?.name}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Details */}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <Tabs defaultValue="badges" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="badges">Badges</TabsTrigger>
                <TabsTrigger value="points">Points</TabsTrigger>
                <TabsTrigger value="award">Award</TabsTrigger>
                <TabsTrigger value="achievements">History</TabsTrigger>
              </TabsList>

              <TabsContent value="badges" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Badges</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {studentBadgesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : studentBadges?.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No badges earned yet
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {studentBadges?.map((studentBadge: StudentBadge) => {
                          const IconComponent = getBadgeIcon(studentBadge.badge.icon);
                          const badgeColor = getBadgeColor(studentBadge.badge.color);
                          return (
                            <div key={studentBadge.id} className={`p-4 rounded-lg border ${badgeColor}`}>
                              <div className="flex items-center space-x-3">
                                <IconComponent className="h-8 w-8" />
                                <div>
                                  <div className="font-medium">{studentBadge.badge.name}</div>
                                  <div className="text-sm">{studentBadge.badge.description}</div>
                                  <div className="text-xs mt-1">
                                    Earned: {new Date(studentBadge.earnedAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="points" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Points & Level</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {studentPointsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {studentPoints && (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{studentPoints.totalPoints}</div>
                                <div className="text-sm text-gray-600">Total Points</div>
                              </div>
                              <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{studentPoints.level}</div>
                                <div className="text-sm text-gray-600">Current Level</div>
                              </div>
                              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-600">{studentPoints.monthlyPoints}</div>
                                <div className="text-sm text-gray-600">This Month</div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Progress to Next Level</span>
                                <span className="text-sm text-gray-600">
                                  {getProgressLevel(studentPoints.totalPoints).title}
                                </span>
                              </div>
                              <Progress value={(studentPoints.totalPoints % 100)} className="h-2" />
                            </div>
                          </>
                        )}
                        
                        <div className="border-t pt-4">
                          <h3 className="font-medium mb-3">Add Points</h3>
                          <div className="flex space-x-2">
                            <Button size="sm" onClick={() => handleAddPoints(5)}>+5</Button>
                            <Button size="sm" onClick={() => handleAddPoints(10)}>+10</Button>
                            <Button size="sm" onClick={() => handleAddPoints(25)}>+25</Button>
                            <Button size="sm" onClick={() => handleAddPoints(50)}>+50</Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="award" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Award Badge</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="badge-select">Select Badge</Label>
                        <Select value={selectedBadge?.toString()} onValueChange={(value) => setSelectedBadge(parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a badge to award" />
                          </SelectTrigger>
                          <SelectContent>
                            {badges?.map((badge: Badge) => (
                              <SelectItem key={badge.id} value={badge.id.toString()}>
                                {badge.name} - {badge.category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button onClick={handleAwardBadge} disabled={awardBadgeMutation.isPending}>
                        {awardBadgeMutation.isPending ? "Awarding..." : "Award Badge"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Achievement History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {achievementLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : achievementHistory?.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No achievements yet
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {achievementHistory?.map((achievement: any) => (
                          <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <div>
                              <div className="font-medium">{achievement.type}</div>
                              <div className="text-sm text-gray-600">{achievement.description}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(achievement.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Student</h3>
                  <p className="text-gray-600">Choose a student to view their badges and achievements</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* All Badges Grid */}
      <Card>
        <CardHeader>
          <CardTitle>All Badges</CardTitle>
        </CardHeader>
        <CardContent>
          {badgesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {badges?.map((badge: Badge) => {
                const IconComponent = getBadgeIcon(badge.icon);
                const badgeColor = getBadgeColor(badge.color);
                return (
                  <div key={badge.id} className={`p-4 rounded-lg border ${badgeColor}`}>
                    <div className="flex items-center space-x-3 mb-2">
                      <IconComponent className="h-6 w-6" />
                      <div className="font-medium">{badge.name}</div>
                    </div>
                    <div className="text-sm mb-2">{badge.description}</div>
                    <div className="flex items-center justify-between text-xs">
                      <Badge variant="secondary">{badge.category}</Badge>
                      <span>{badge.points} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}