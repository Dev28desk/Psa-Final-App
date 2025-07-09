import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Star, Trophy, Target, TrendingUp, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export default function StudentAchievements() {
  const { data: achievements, isLoading } = useQuery({
    queryKey: ["/api/mobile/student/achievements"],
    retry: 1,
  });

  const { data: badges, isLoading: badgesLoading } = useQuery({
    queryKey: ["/api/mobile/student/badges"],
    retry: 1,
  });

  const { data: points, isLoading: pointsLoading } = useQuery({
    queryKey: ["/api/mobile/student/points"],
    retry: 1,
  });

  if (isLoading || badgesLoading || pointsLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
    );
  }

  const pointsData = points || {
    totalPoints: 0,
    level: 1,
    experiencePoints: 0,
    monthlyPoints: 0
  };

  const nextLevelPoints = pointsData.level * 100;
  const progressToNextLevel = (pointsData.experiencePoints / nextLevelPoints) * 100;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Your Achievements</h2>
      
      {/* Points & Level Overview */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-2xl font-bold">Level {pointsData.level}</p>
              <p className="text-purple-100">{pointsData.totalPoints} total points</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Crown className="h-8 w-8" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {pointsData.level + 1}</span>
              <span>{pointsData.experiencePoints}/{nextLevelPoints}</span>
            </div>
            <Progress value={progressToNextLevel} className="h-2 bg-purple-300" />
          </div>
        </CardContent>
      </Card>

      {/* Badge Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Your Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          {badges && badges.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {badges.map((badge: any) => (
                <div key={badge.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <div className="text-3xl mb-2">{badge.badge?.icon}</div>
                  <p className="font-medium text-sm">{badge.badge?.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {format(new Date(badge.earnedAt), 'MMM dd')}
                  </p>
                  <Badge className="mt-2" variant="secondary" size="sm">
                    +{badge.badge?.points} pts
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">No badges earned yet</p>
              <p className="text-sm text-gray-400 mt-1">Keep training to unlock achievements!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievement Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Achievement Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="h-6 w-6 text-white" />
              </div>
              <p className="font-medium text-sm">Attendance</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {badges?.filter((b: any) => b.badge?.category === 'attendance').length || 0} badges
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <p className="font-medium text-sm">Performance</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {badges?.filter((b: any) => b.badge?.category === 'performance').length || 0} badges
              </p>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="h-6 w-6 text-white" />
              </div>
              <p className="font-medium text-sm">Milestones</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {badges?.filter((b: any) => b.badge?.category === 'milestones').length || 0} badges
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <p className="font-medium text-sm">Payment</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {badges?.filter((b: any) => b.badge?.category === 'payment').length || 0} badges
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {achievements && achievements.length > 0 ? (
            <div className="space-y-3">
              {achievements.slice(0, 5).map((achievement: any) => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{achievement.description}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {format(new Date(achievement.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <Badge variant="secondary" size="sm">
                    +{achievement.points} pts
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">No recent achievements</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Monthly Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">Leaderboard coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}