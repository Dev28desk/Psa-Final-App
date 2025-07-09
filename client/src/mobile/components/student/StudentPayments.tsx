import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, AlertCircle, CheckCircle2, Clock, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export default function StudentPayments() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ["/api/mobile/student/payments"],
    retry: 1,
  });

  const { data: paymentStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/mobile/student/payment-stats"],
    retry: 1,
  });

  if (isLoading || statsLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
    );
  }

  const stats = paymentStats || {
    totalPaid: 0,
    pendingAmount: 0,
    lastPayment: null,
    nextDueDate: null,
    monthlyFee: 0
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Your Payments</h2>
      
      {/* Payment Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">₹{stats.totalPaid}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Paid</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">₹{stats.pendingAmount}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">₹{stats.monthlyFee}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Fee</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-purple-600">
                {stats.nextDueDate ? format(new Date(stats.nextDueDate), 'MMM dd') : 'N/A'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Next Due</p>
            </div>
          </div>
          
          {stats.pendingAmount > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Payment Due
                </p>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400">
                You have ₹{stats.pendingAmount} pending payment
              </p>
              <Button className="mt-2" size="sm">
                Pay Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Recent Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments && payments.length > 0 ? (
            <div className="space-y-3">
              {payments.map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">₹{payment.amount}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {payment.paymentMethod}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      payment.status === 'completed' ? 'default' : 
                      payment.status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {payment.status === 'completed' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {payment.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                      {payment.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {payment.sport?.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">No payment records found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <CreditCard className="h-4 w-4 mr-2" />
              Credit/Debit Card
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <DollarSign className="h-4 w-4 mr-2" />
              UPI Payment
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <CreditCard className="h-4 w-4 mr-2" />
              Net Banking
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <DollarSign className="h-4 w-4 mr-2" />
              Cash Payment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}