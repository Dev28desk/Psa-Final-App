import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";

interface Student {
  id: number;
  name: string;
  studentId: string;
  profileImageUrl?: string;
}

interface FeeStatusProps {
  students: Student[];
}

export function FeeStatus({ students }: FeeStatusProps) {
  // Mock payment status for demonstration
  const getPaymentStatus = (studentId: number) => {
    const statuses = ['paid', 'pending', 'overdue'];
    return statuses[studentId % 3];
  };

  const getCurrentMonthGrid = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return months.map((month, index) => ({
      month,
      status: index < currentMonth ? 'paid' : 
              index === currentMonth ? 'pending' : 'future'
    }));
  };

  const paymentGrid = getCurrentMonthGrid();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="status-paid">Paid</Badge>;
      case 'pending':
        return <Badge className="status-pending">Pending</Badge>;
      case 'overdue':
        return <Badge className="status-overdue">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const paidStudents = students.filter(s => getPaymentStatus(s.id) === 'paid');
  const pendingStudents = students.filter(s => getPaymentStatus(s.id) === 'pending');
  const overdueStudents = students.filter(s => getPaymentStatus(s.id) === 'overdue');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Paid Students */}
      <Card className="chart-container">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-success flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Paid This Month</span>
            </CardTitle>
            <Badge className="status-paid">{paidStudents.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {paidStudents.slice(0, 5).map((student) => (
              <div key={student.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={student.profileImageUrl} alt={student.name} />
                    <AvatarFallback>
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.studentId}</p>
                  </div>
                </div>
                <CheckCircle className="h-4 w-4 text-success" />
              </div>
            ))}
            {paidStudents.length > 5 && (
              <Button variant="link" size="sm" className="w-full">
                View All {paidStudents.length} Students
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Students */}
      <Card className="chart-container">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-warning flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Pending Payment</span>
            </CardTitle>
            <Badge className="status-pending">{pendingStudents.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {pendingStudents.slice(0, 5).map((student) => (
              <div key={student.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={student.profileImageUrl} alt={student.name} />
                    <AvatarFallback>
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.studentId}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-xs">
                  Remind
                </Button>
              </div>
            ))}
            {pendingStudents.length > 5 && (
              <Button variant="link" size="sm" className="w-full">
                View All {pendingStudents.length} Students
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Overdue Students */}
      <Card className="chart-container">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-destructive flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Overdue Payment</span>
            </CardTitle>
            <Badge className="status-overdue">{overdueStudents.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {overdueStudents.slice(0, 5).map((student) => (
              <div key={student.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={student.profileImageUrl} alt={student.name} />
                    <AvatarFallback>
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.studentId}</p>
                  </div>
                </div>
                <Button size="sm" className="bg-destructive hover:bg-destructive/90 text-xs">
                  Follow Up
                </Button>
              </div>
            ))}
            {overdueStudents.length > 5 && (
              <Button variant="link" size="sm" className="w-full">
                View All {overdueStudents.length} Students
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
