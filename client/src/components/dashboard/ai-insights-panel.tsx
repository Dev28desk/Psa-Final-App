import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, TrendingUp, Users, Clock, Send } from "lucide-react";
import { useState } from "react";

export function AIInsightsPanel() {
  const [query, setQuery] = useState("");

  const insights = [
    {
      type: "revenue",
      title: "Revenue Prediction",
      description: "Expected revenue for next month: ₹3,12,000 (+9.7%)",
      icon: TrendingUp,
      color: "insight-info",
      action: "View Details"
    },
    {
      type: "retention",
      title: "At-Risk Students",
      description: "7 students show low engagement patterns",
      icon: Users,
      color: "insight-warning",
      action: "Take Action"
    },
    {
      type: "optimization",
      title: "Optimal Schedule",
      description: "Evening batches show 15% better attendance",
      icon: Clock,
      color: "insight-success",
      action: "Optimize"
    }
  ];

  const handleSendQuery = () => {
    if (query.trim()) {
      console.log("AI Query:", query);
      setQuery("");
    }
  };

  return (
    <Card className="chart-container">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>AI Insights</span>
            <Sparkles className="h-5 w-5 text-accent" />
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.type} className={`insight-card ${insight.color}`}>
              <div className="flex items-center space-x-2 mb-2">
                <insight.icon className="h-5 w-5" />
                <h3 className="font-medium text-gray-900">{insight.title}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 h-auto text-xs"
              >
                {insight.action}
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Ask AI anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendQuery()}
            />
            <Button 
              size="sm" 
              onClick={handleSendQuery}
              disabled={!query.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
