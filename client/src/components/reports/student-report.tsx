import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Download, Users, TrendingUp, UserPlus, UserMinus } from "lucide-react";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--warning))'];

export function StudentReport() {
  const { data: studentsData } = useQuery({
    queryKey: ['/api/students'],
  });

  const { data: sports } = useQuery({
    queryKey: ['/api/sports'],
  });

  const students = studentsData?.students || [];
  const sportsData = sports || [];

  // Calculate sport distribution
  const sportDistribution = sportsData.map((sport: any) => {
    const count = students.filter((student: any) => student.sportId === sport.id).length;
    return {
      name: sport.name,
      value: count,
      percentage: students.length > 0 ? (count / students.length) * 100 : 0
    };
  }).filter((item: any) => item.value > 0);

  // Calculate skill level distribution
  const skillLevels = ['beginner', 'intermediate', 'advanced'];
  const skillDistribution = skillLevels.map(level => {
    const count = students.filter((student: any) => student.skillLevel === level).length;
    return {
      level: level.charAt(0).toUpperCase() + level.slice(1),
      count,
      percentage: students.length > 0 ? (count / students.length) * 100 : 0
    };
  });

  // Mock enrollment trends (in real app, this would come from API)
  const enrollmentTrends = [
    { month: 'Jan', newJoins: 25, dropouts: 3 },
    { month: 'Feb', newJoins: 32, dropouts: 5 },
    { month: 'Mar', newJoins: 28, dropouts: 2 },
    { month: 'Apr', newJoins: 35, dropouts: 4 },
    { month: 'May', newJoins: 42, dropouts: 6 },
    { month: 'Jun', newJoins: 38, dropouts: 3 },
  ];

  const totalNewJoins = enrollmentTrends.reduce((sum, item) => sum + item.newJoins, 0);
  const totalDropouts = enrollmentTrends.reduce((sum, item) => sum + item.dropouts, 0);
  const netGrowth = totalNewJoins - totalDropouts;
  const growthRate = students.length > 0 ? (netGrowth / students.length) * 100 : 0;

  return (
    <Card className="chart-container">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Student Analytics</span>
          </CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <div className="text-sm text-gray-600">Total Students</div>
              </div>
              <div className="text-2xl font-bold text-primary">{students.length}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-success" />
                <div className="text-sm text-gray-600">New Joins</div>
              </div>
              <div className="text-2xl font-bold text-success">{totalNewJoins}</div>
              <div className="text-xs text-gray-500">Last 6 months</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <UserMinus className="h-5 w-5 text-destructive" />
                <div className="text-sm text-gray-600">Dropouts</div>
              </div>
              <div className="text-2xl font-bold text-destructive">{totalDropouts}</div>
              <div className="text-xs text-gray-500">Last 6 months</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                <div className="text-sm text-gray-600">Growth Rate</div>
              </div>
              <div className="text-2xl font-bold text-accent">+{growthRate.toFixed(1)}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sport Distribution Chart */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Sport Distribution</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sportDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sportDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Students']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {sportDistribution.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {item.value} ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Level Distribution */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Skill Level Distribution</h4>
              <div className="space-y-4">
                {skillDistribution.map((item, index) => (
                  <div key={item.level} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{item.level}</span>
                      <span className="text-sm text-gray-600">
                        {item.count} students ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Enrollment Trends */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-4">Enrollment Trends</h4>
                <div className="space-y-3">
                  {enrollmentTrends.slice(-3).map((item) => (
                    <div key={item.month} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{item.month}</span>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Badge className="status-paid text-xs">+{item.newJoins}</Badge>
                          <span className="text-xs text-gray-500">joins</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Badge className="status-overdue text-xs">-{item.dropouts}</Badge>
                          <span className="text-xs text-gray-500">drops</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
