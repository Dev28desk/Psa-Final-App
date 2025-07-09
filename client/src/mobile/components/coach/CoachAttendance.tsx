import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, Clock, Users } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function CoachAttendance() {
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: batches, isLoading: batchesLoading } = useQuery({
    queryKey: ["/api/mobile/coach/batches"],
    retry: 1,
  });

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/mobile/coach/batch-students", selectedBatch],
    enabled: !!selectedBatch,
    retry: 1,
  });

  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ["/api/mobile/coach/attendance", selectedBatch, selectedDate],
    enabled: !!selectedBatch && !!selectedDate,
    retry: 1,
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async ({ studentId, status }: { studentId: number, status: string }) => {
      const response = await fetch('/api/mobile/coach/mark-attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('mobile-token')}`
        },
        body: JSON.stringify({
          studentId,
          batchId: selectedBatch,
          date: selectedDate,
          status
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark attendance');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Attendance marked",
        description: "Student attendance has been updated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/mobile/coach/attendance"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark attendance",
        variant: "destructive",
      });
    }
  });

  const handleMarkAttendance = (studentId: number, status: string) => {
    markAttendanceMutation.mutate({ studentId, status });
  };

  if (batchesLoading) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Mark Attendance</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Select Class & Date</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Batch</label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches?.map((batch: any) => (
                    <SelectItem key={batch.id} value={batch.id.toString()}>
                      {batch.sport?.name} - {batch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedBatch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Student Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <div className="space-y-3">
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ) : students && students.length > 0 ? (
              <div className="space-y-3">
                {students.map((student: any) => {
                  const attendance = attendanceData?.find((a: any) => a.studentId === student.id);
                  const currentStatus = attendance?.status || 'unmarked';
                  
                  return (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{student.phone}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          currentStatus === 'present' ? 'default' : 
                          currentStatus === 'absent' ? 'destructive' : 'secondary'
                        }>
                          {currentStatus}
                        </Badge>
                        
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant={currentStatus === 'present' ? 'default' : 'outline'}
                            onClick={() => handleMarkAttendance(student.id, 'present')}
                            disabled={markAttendanceMutation.isPending}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={currentStatus === 'absent' ? 'destructive' : 'outline'}
                            onClick={() => handleMarkAttendance(student.id, 'absent')}
                            disabled={markAttendanceMutation.isPending}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No students found in this batch
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}