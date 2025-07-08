import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface FeeStatusProps {
  status: "paid" | "pending" | "overdue";
  amount: number;
  dueDate: string;
  studentName: string;
}

export function FeeStatus({ status, amount, dueDate, studentName }: FeeStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "paid":
        return {
          color: "bg-green-100 text-green-800",
          icon: CheckCircle,
          text: "Paid",
        };
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-800",
          icon: Clock,
          text: "Pending",
        };
      case "overdue":
        return {
          color: "bg-red-100 text-red-800",
          icon: AlertTriangle,
          text: "Overdue",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          icon: Clock,
          text: "Unknown",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{studentName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">₹{amount ? amount.toLocaleString() : '0'}</p>
            <p className="text-sm text-gray-500">Due: {dueDate}</p>
          </div>
          <Badge className={config.color}>
            <Icon className="h-3 w-3 mr-1" />
            {config.text}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}