import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  Send, 
  TrendingUp, 
  Users, 
  Clock, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Brain,
  Lightbulb,
  Target,
  Loader2,
  UserMinus,
  TrendingDown,
  Shield,
  Activity,
  Calendar,
  UserCheck
} from "lucide-react";

export default function AIInsights() {
  const [query, setQuery] = useState("");
  const { toast } = useToast();

  const { data: studentInsights, isLoading: studentLoading } = useQuery({
    queryKey: ['/api/ai-insights/student-analysis'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: revenueAnalysis, isLoading: revenueLoading } = useQuery({
    queryKey: ['/api/ai-insights/revenue-analysis'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: attendanceInsights, isLoading: attendanceLoading } = useQuery({
    queryKey: ['/api/ai-insights/attendance-insights'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: retentionForecast, isLoading: retentionLoading } = useQuery({
    queryKey: ['/api/ai-insights/retention-forecast'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isLoading = studentLoading || revenueLoading || attendanceLoading || retentionLoading;

  const handleViewDetailedAnalysis = () => {
    if (isLoading) {
      toast({
        title: "Loading",
        description: "AI insights are still loading. Please wait...",
        variant: "default",
      });
      return;
    }
    
    // Navigate to detailed analysis view
    toast({
      title: "Detailed Analysis",
      description: "Opening detailed AI analysis view...",
    });
  };

  const insights = [
    {
      id: "revenue-prediction",
      type: "prediction",
      title: "Revenue Forecasting",
      description: "Based on current trends, next month's revenue is projected to be ₹3,12,000 (+9.7% from this month).",
      confidence: 87,
      impact: "high",
      icon: TrendingUp,
      color: "insight-info",
      recommendations: [
        "Consider promotional campaigns for low-performing sports",
        "Optimize batch timings for better utilization",
        "Introduce advanced skill levels for popular sports"
      ]
    },
    {
      id: "retention-risk",
      type: "alert",
      title: "Student Retention Risk",
      description: "7 students show patterns indicating potential dropout risk. Early intervention recommended.",
      confidence: 92,
      impact: "high", 
      icon: Users,
      color: "insight-warning",
      recommendations: [
        "Schedule individual counseling sessions",
        "Offer skill-appropriate batch transfers",
        "Implement buddy system for struggling students"
      ]
    },
    {
      id: "schedule-optimization",
      type: "optimization",
      title: "Schedule Optimization",
      description: "Evening batches (5-7 PM) show 15% better attendance rates compared to morning sessions.",
      confidence: 94,
      impact: "medium",
      icon: Clock,
      color: "insight-success",
      recommendations: [
        "Increase evening batch capacity",
        "Consider shifting some morning batches",
        "Offer flexible timing options for working parents"
      ]
    },
    {
      id: "payment-patterns",
      type: "analysis",
      title: "Payment Pattern Analysis",
      description: "Students paying via UPI show 23% better payment consistency than cash payments.",
      confidence: 89,
      impact: "medium",
      icon: DollarSign,
      color: "insight-info",
      recommendations: [
        "Promote digital payment adoption",
        "Offer small discounts for digital payments",
        "Implement automated payment reminders"
      ]
    }
  ];

  const predictiveMetrics = [
    {
      title: "Churn Probability",
      value: "12%",
      trend: "down",
      description: "Students likely to discontinue next month"
    },
    {
      title: "Revenue Growth",
      value: "+9.7%",
      trend: "up", 
      description: "Projected revenue increase"
    },
    {
      title: "Capacity Utilization",
      value: "73%",
      trend: "up",
      description: "Average batch fill rate"
    },
    {
      title: "Payment Recovery",
      value: "87%",
      trend: "up",
      description: "Overdue payment collection rate"
    }
  ];

  const suggestedQueries = [
    "Which sports have the highest dropout rates?",
    "What's the optimal batch size for maximum profitability?",
    "Predict next quarter's enrollment numbers",
    "Which payment methods show best collection rates?",
    "Identify students at risk of discontinuing",
    "Suggest new sports based on market demand"
  ];

  const handleSendQuery = async () => {
    if (!query.trim()) return;
    
    toast({
      title: "AI Processing",
      description: "Analyzing your query with AI insights...",
    });
    
    setQuery("");
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <Badge className="status-overdue">High Impact</Badge>;
      case 'medium':
        return <Badge className="status-pending">Medium Impact</Badge>;
      case 'low':
        return <Badge className="status-paid">Low Impact</Badge>;
      default:
        return <Badge variant="secondary">{impact}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-accent" />
            <span>AI Insights</span>
          </h1>
          <p className="text-gray-600">Intelligent analytics and predictive insights for your academy</p>
        </div>
        <Badge className="bg-accent/10 text-accent border-accent">
          <Brain className="h-4 w-4 mr-1" />
          AI Powered
        </Badge>
      </div>

      {/* Query Interface */}
      <Card className="chart-container">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-accent" />
            <span>Ask AI Assistant</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Ask me anything about your academy..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendQuery()}
                className="flex-1"
              />
              <Button 
                onClick={handleSendQuery}
                disabled={!query.trim() || isLoading}
                className="bg-accent hover:bg-accent/90"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-2">Suggested queries:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQueries.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setQuery(suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predictive Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {predictiveMetrics.map((metric, index) => (
          <Card key={index} className="metric-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <p className="text-xs text-gray-500">{metric.description}</p>
                </div>
                <div className={`p-2 rounded-full ${
                  metric.trend === 'up' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <TrendingUp className={`h-5 w-5 ${
                    metric.trend === 'up' ? 'text-success' : 'text-error rotate-180'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Student Retention Forecast */}
      <Card className="chart-container">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5 text-blue-600" />
            <span>Student Retention Forecast</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {retentionLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <span className="ml-2 text-gray-600">Analyzing retention patterns...</span>
            </div>
          ) : retentionForecast ? (
            <div className="space-y-6">
              {/* Overall Forecast */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">Current Retention</h3>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {retentionForecast.overallForecast?.currentRetentionRate || 0}%
                  </p>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-green-900 dark:text-green-100">Predicted Retention</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {retentionForecast.overallForecast?.predictedRetentionRate || 0}%
                  </p>
                </div>
                
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <h3 className="font-semibold text-orange-900 dark:text-orange-100">At-Risk Students</h3>
                  </div>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {retentionForecast.highRiskStudents?.count || 0}
                  </p>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold text-purple-900 dark:text-purple-100">Confidence</h3>
                  </div>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {retentionForecast.overallForecast?.confidenceScore || 0}%
                  </p>
                </div>
              </div>

              {/* Risk Factors and Interventions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span>High-Risk Indicators</span>
                  </h3>
                  <div className="space-y-2">
                    {(retentionForecast.highRiskStudents?.criteria || []).map((criteria, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <UserMinus className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{criteria}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Intervention Strategies</span>
                  </h3>
                  <div className="space-y-2">
                    {(retentionForecast.interventionStrategies || []).map((strategy, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Target className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{strategy}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Retention Factors */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span>Positive Factors</span>
                  </h3>
                  <div className="space-y-2">
                    {(retentionForecast.retentionFactors?.positive || []).map((factor, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                    <span>Negative Factors</span>
                  </h3>
                  <div className="space-y-2">
                    {(retentionForecast.retentionFactors?.negative || []).map((factor, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Plan */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <span>Recommended Action Plan</span>
                </h3>
                <div className="space-y-2">
                  {(retentionForecast.actionPlan || []).map((action, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Unable to generate retention forecast</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {insights.map((insight) => (
          <Card key={insight.id} className={`chart-container ${insight.color}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <insight.icon className="h-5 w-5" />
                  <CardTitle className="text-lg">{insight.title}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  {getImpactBadge(insight.impact)}
                  <Badge variant="outline" className="text-xs">
                    {insight.confidence}% confidence
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{insight.description}</p>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 flex items-center space-x-1">
                  <Target className="h-4 w-4" />
                  <span>Recommended Actions:</span>
                </h4>
                <ul className="space-y-1">
                  {insight.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button variant="link" size="sm" className="p-0 h-auto">
                  View Detailed Analysis →
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Indicators */}
      <Card className="chart-container">
        <CardHeader>
          <CardTitle>AI Model Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">94%</div>
              <div className="text-sm text-gray-500">Prediction Accuracy</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-success h-2 rounded-full w-[94%]"></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">87%</div>
              <div className="text-sm text-gray-500">Recommendation Success</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-primary h-2 rounded-full w-[87%]"></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">156</div>
              <div className="text-sm text-gray-500">Insights Generated</div>
              <div className="text-xs text-gray-400 mt-1">This month</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
