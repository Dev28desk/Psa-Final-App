import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, XCircle, Clock, Save } from "lucide-react";

interface Student {
  id: number;
  name: string;
  studentId: string;
  profileImageUrl?: string;
  batchId: number;
}

interface Attendance {
  id: number;
  studentId: number;
  status: string;
  date: string;
}

interface AttendanceGridProps {
  date: string;
  batchId: number | null;
  students: Student[];
  attendance: Attendance[];
}

export function AttendanceGrid({ date, batchId, students, attendance }: AttendanceGridProps) {
  const [attendanceMap, setAttendanceMap] = useState<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    attendance.forEach(att => {
      map[att.studentId] = att.status;
    });
    return map;
  });
  
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filter students by selected batch
  const filteredStudents = batchId 
    ? students.filter(student => student.batchId === batchId)
    : students;

  const markAttendanceMutation = useMutation({
    mutationFn: async (attendanceData: Array<{ studentId: number; batchId: number; date: string; status: string }>) => {
      // Submit each attendance record
      const promises = attendanceData.map(data =>
        apiRequest("POST", "/api/attendance", data)
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Attendance saved successfully",
      });
      setHasChanges(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save attendance",
        variant: "destructive",
      });
    },
  });

  const updateAttendance = (studentId: number, status: string) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: status
    }));
    setHasChanges(true);
  };

  const saveAttendance = () => {
    const attendanceData = filteredStudents.map(student => ({
      studentId: student.id,
      batchId: student.batchId,
      date,
      status: attendanceMap[student.id] || 'absent'
    }));

    markAttendanceMutation.mutate(attendanceData);
  };

  const markAllPresent = () => {
    const newMap: Record<number, string> = {};
    filteredStudents.forEach(student => {
      newMap[student.id] = 'present';
    });
    setAttendanceMap(newMap);
    setHasChanges(true);
  };

  const markAllAbsent = () => {
    const newMap: Record<number, string> = {};
    filteredStudents.forEach(student => {
      newMap[student.id] = 'absent';
    });
    setAttendanceMap(newMap);
    setHasChanges(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="status-present">Present</Badge>;
      case 'absent':
        return <Badge className="status-absent">Absent</Badge>;
      case 'late':
        return <Badge className="status-late">Late</Badge>;
      case 'excused':
        return <Badge className="status-pending">Excused</Badge>;
      default:
        return <Badge variant="secondary">Not Marked</Badge>;
    }
  };

  const getStatusCount = (status: string) => {
    return filteredStudents.filter(student => attendanceMap[student.id] === status).length;
  };

  return (
    <Card className="data-table">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Attendance for {new Date(date).toLocaleDateString()}
            {batchId && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                (Filtered by selected batch)
              </span>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={markAllPresent}>
              <CheckCircle className="h-4 w-4 mr-1" />
              All Present
            </Button>
            <Button variant="outline" size="sm" onClick={markAllAbsent}>
              <XCircle className="h-4 w-4 mr-1" />
              All Absent
            </Button>
            {hasChanges && (
              <Button 
                onClick={saveAttendance}
                disabled={markAttendanceMutation.isPending}
                className="bg-accent hover:bg-accent/90"
              >
                <Save className="h-4 w-4 mr-1" />
                {markAttendanceMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{filteredStudents.length}</div>
            <div className="text-sm text-gray-500">Total Students</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{getStatusCount('present')}</div>
            <div className="text-sm text-gray-500">Present</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{getStatusCount('absent')}</div>
            <div className="text-sm text-gray-500">Absent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">{getStatusCount('late')}</div>
            <div className="text-sm text-gray-500">Late</div>
          </div>
        </div>

        {/* Attendance Grid */}
        <div className="space-y-2">
          {filteredStudents.map((student) => {
            const status = attendanceMap[student.id] || '';
            
            return (
              <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={student.profileImageUrl} alt={student.name} />
                    <AvatarFallback>
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-500">{student.studentId}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={status === 'present' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateAttendance(student.id, 'present')}
                      className={status === 'present' ? 'bg-success hover:bg-success/90' : ''}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Present
                    </Button>
                    <Button
                      variant={status === 'late' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateAttendance(student.id, 'late')}
                      className={status === 'late' ? 'bg-warning hover:bg-warning/90' : ''}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Late
                    </Button>
                    <Button
                      variant={status === 'absent' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateAttendance(student.id, 'absent')}
                      className={status === 'absent' ? 'bg-destructive hover:bg-destructive/90' : ''}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Absent
                    </Button>
                  </div>
                  
                  <div className="min-w-[100px]">
                    {getStatusBadge(status)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <XCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No students found for the selected criteria</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
