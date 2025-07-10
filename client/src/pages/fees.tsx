import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentForm } from "@/components/fees/payment-form";
import { FeeStatus } from "@/components/fees/fee-status";
import { PaymentRecorder } from "@/components/payments/payment-recorder";
import { useRealtime } from "@/hooks/use-realtime";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  CheckCircle,
  Trophy,
  Users,
  MessageSquare,
  AlertCircle
} from "lucide-react";

export default function Fees() {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  
  useRealtime();

  const handleSendReminder = async (payment: any) => {
    try {
      const response = await apiRequest('POST', '/api/notifications/fee-reminder', {
        studentId: payment.studentId,
        amount: payment.amount,
        dueDate: payment.dueDate,
        monthYear: payment.monthYear
      });

      if (response.ok) {
        toast({
          title: "Reminder Sent",
          description: `WhatsApp reminder sent to ${payment.student?.name}`,
        });
      } else {
        throw new Error('Failed to send reminder');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send WhatsApp reminder. Please check your WhatsApp configuration.",
        variant: "destructive",
      });
    }
  };

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['/api/payments', searchTerm, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      return apiRequest('GET', `/api/payments?${params.toString()}`);
    },
  });

  const { data: revenueStats } = useQuery({
    queryKey: ['/api/payments/revenue-stats'],
  });

  const { data: pendingPayments } = useQuery({
    queryKey: ['/api/payments/pending'],
  });

  const { data: groupedPendingPayments } = useQuery({
    queryKey: ['/api/payments/pending-grouped'],
  });

  const { data: students } = useQuery({
    queryKey: ['/api/students'],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="status-paid">Paid</Badge>;
      case 'pending':
        return <Badge className="status-pending">Pending</Badge>;
      case 'failed':
        return <Badge className="status-overdue">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    const colors = {
      cash: 'bg-green-100 text-green-800',
      upi: 'bg-blue-100 text-blue-800',
      card: 'bg-purple-100 text-purple-800',
      online: 'bg-orange-100 text-orange-800'
    };
    
    return (
      <Badge className={`status-badge ${colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {method.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Fees & Payments</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage student fees and payment collection</p>
        </div>
      </div>

      <Tabs defaultValue="quick-record" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="quick-record">Quick Record</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value="quick-record">
          <PaymentRecorder />
        </TabsContent>

        <TabsContent value="overview">
          <div className="space-y-6">

      {/* Revenue Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₹{revenueStats?.total.toLocaleString() || 0}
                </p>
                <p className="text-sm text-success">All time collection</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₹{revenueStats?.thisMonth.toLocaleString() || 0}
                </p>
                <p className="text-sm text-success">
                  +{revenueStats?.growth.toFixed(1) || 0}% from last month
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Dues</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₹{pendingPayments?.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0).toLocaleString() || 0}
                </p>
                <p className="text-sm text-error">{pendingPayments?.length || 0} students</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collection Rate</p>
                <p className="text-3xl font-bold text-gray-900">87%</p>
                <p className="text-sm text-warning">This month</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Status Overview */}
      <FeeStatus students={students?.students || []} />

      {/* Payments Table */}
      <Card className="data-table">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payment Records</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search payments..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="completed">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paymentsData?.payments?.map((payment: any) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {payment.student?.name || `Student ${payment.studentId}`}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {payment.student?.studentId || payment.studentId} • Receipt: {payment.receiptNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-data font-bold text-gray-900">
                          ₹{parseFloat(payment.amount).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {payment.paymentType}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPaymentMethodBadge(payment.paymentMethod)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button variant="link" size="sm" className="text-primary">
                          View Receipt
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="space-y-6">
            {/* Pending Payments Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending Payments by Sport & Batch
                </CardTitle>
              </CardHeader>
              <CardContent>
                {groupedPendingPayments && Object.keys(groupedPendingPayments).length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(groupedPendingPayments).map(([sport, batches]) => (
                      <div key={sport} className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                          <Trophy className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{sport}</h3>
                        </div>
                        {Object.entries(batches as any).map(([batch, payments]) => (
                          <div key={batch} className="ml-4 space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                              <Users className="h-4 w-4" />
                              {batch}
                            </div>
                            <div className="ml-6 space-y-2">
                              {(payments as any[]).map((payment: any) => (
                                <div key={payment.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
                                      <AlertCircle className="h-4 w-4 text-red-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900 dark:text-gray-100">{payment.student?.name}</p>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {payment.monthYear} • Due: {payment.dueDate}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <span className="font-semibold text-red-600">₹{payment.amount}</span>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleSendReminder(payment)}
                                    >
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      Send Reminder
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">All payments are up to date!</p>
                    <p className="text-gray-500 dark:text-gray-400">No pending payments at the moment.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <PaymentForm 
            onSuccess={() => setIsPaymentDialogOpen(false)}
            students={students?.students || []}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
