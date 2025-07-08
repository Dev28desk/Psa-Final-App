import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, CreditCard, Banknote, Smartphone, Globe, CheckCircle } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface Student {
  id: number;
  studentId: string;
  name: string;
  phone: string;
  email?: string;
  sportId: number;
  batchId: number;
  isActive: boolean;
  joiningDate: string;
}

interface Sport {
  id: number;
  name: string;
  monthlyFee: number;
}

interface Batch {
  id: number;
  name: string;
  timings: string;
}

export function PaymentRecorder() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Search students
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["/api/students", searchTerm],
    enabled: searchTerm.length > 2,
    queryFn: () => apiRequest("GET", `/api/students?search=${encodeURIComponent(searchTerm)}`),
  });

  // Get sports data
  const { data: sports = [] } = useQuery({
    queryKey: ["/api/sports"],
    queryFn: () => apiRequest("GET", "/api/sports"),
  });

  // Get batches data
  const { data: batches = [] } = useQuery({
    queryKey: ["/api/batches"],
    queryFn: () => apiRequest("GET", "/api/batches"),
  });

  // Payment recording mutation
  const recordPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      return apiRequest("POST", "/api/payments", paymentData);
    },
    onSuccess: () => {
      toast({
        title: "Payment Recorded Successfully",
        description: "The payment has been recorded in the system.",
      });
      // Reset form
      setSelectedStudent(null);
      setPaymentMethod("");
      setAmount("");
      setSearchTerm("");
      setIsProcessing(false);
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Payment Recording Failed",
        description: error.message || "There was an error recording the payment.",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setSearchTerm(student.name);
    const sport = sports.find((s: Sport) => s.id === student.sportId);
    if (sport) {
      setAmount(sport.monthlyFee.toString());
    }
  };

  const handlePaymentSubmit = async () => {
    if (!selectedStudent || !paymentMethod || !amount) {
      toast({
        title: "Missing Information",
        description: "Please complete all fields before recording payment.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    const paymentData = {
      studentId: selectedStudent.id,
      amount: parseFloat(amount),
      paymentMethod,
      status: "paid",
      monthYear: new Date().toISOString().slice(0, 7), // YYYY-MM format
      paidAt: new Date().toISOString(),
    };

    recordPaymentMutation.mutate(paymentData);
  };

  const getStudentSport = (sportId: number) => {
    return sports.find((s: Sport) => s.id === sportId);
  };

  const getStudentBatch = (batchId: number) => {
    return batches.find((b: Batch) => b.id === batchId);
  };

  const paymentMethods = [
    { value: "cash", label: "Cash", icon: Banknote },
    { value: "upi", label: "UPI", icon: Smartphone },
    { value: "card", label: "Card", icon: CreditCard },
    { value: "online", label: "Online", icon: Globe },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Record Payment</h1>
        <p className="text-gray-600 dark:text-gray-400">Quick and easy payment recording</p>
      </div>

      {/* Step 1: Search Student */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Student
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Input
              placeholder="Type student name to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>

          {/* Search Results */}
          {searchResults && searchResults.students && searchResults.students.length > 0 && (
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
              {searchResults.students.map((student: Student) => (
                <div
                  key={student.id}
                  onClick={() => handleStudentSelect(student)}
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{student.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">ID: {student.studentId}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{student.phone}</p>
                    </div>
                    <Badge variant={student.isActive ? "default" : "secondary"}>
                      {student.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Student Details & Fee */}
      {selectedStudent && (
        <Card>
          <CardHeader>
            <CardTitle>Student Details & Fee</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Student Name</Label>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedStudent.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Student ID</Label>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedStudent.studentId}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sport</Label>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {getStudentSport(selectedStudent.sportId)?.name || "Unknown"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Batch</Label>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {getStudentBatch(selectedStudent.batchId)?.name || "Unknown"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Monthly Fee Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg font-semibold"
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="month">Payment Month</Label>
                <Input
                  id="month"
                  type="month"
                  defaultValue={new Date().toISOString().slice(0, 7)}
                  className="text-lg"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Payment Method Selection */}
      {selectedStudent && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {paymentMethods.map((method) => (
                <Button
                  key={method.value}
                  variant={paymentMethod === method.value ? "default" : "outline"}
                  onClick={() => setPaymentMethod(method.value)}
                  className="h-16 flex flex-col items-center justify-center gap-2"
                >
                  <method.icon className="h-6 w-6" />
                  <span className="text-sm">{method.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Submit Payment */}
      {selectedStudent && paymentMethod && amount && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Payment Summary</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Student: <span className="font-medium text-gray-900 dark:text-gray-100">{selectedStudent.name}</span>
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Amount: <span className="font-medium text-gray-900 dark:text-gray-100">₹{amount}</span>
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Method: <span className="font-medium text-gray-900 dark:text-gray-100">
                    {paymentMethods.find(m => m.value === paymentMethod)?.label}
                  </span>
                </p>
              </div>
              
              <Button
                onClick={handlePaymentSubmit}
                disabled={isProcessing}
                className="w-full md:w-auto px-8 py-3 text-lg"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Record Payment
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}