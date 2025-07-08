import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DigitalCard } from "./digital-card";
import { StudentCard } from "./student-card";
import { useIsMobile } from "@/hooks/use-mobile";
import { Eye, CreditCard, MessageCircle, Edit, Trash2 } from "lucide-react";

interface Student {
  id: number;
  studentId: string;
  name: string;
  phone: string;
  email?: string;
  sportId: number;
  batchId: number;
  skillLevel: string;
  isActive: boolean;
  profileImageUrl?: string;
  joiningDate: string;
}

interface StudentTableProps {
  students: Student[];
  isLoading: boolean;
  sports: any[];
  batches: any[];
}

export function StudentTable({ students, isLoading, sports, batches }: StudentTableProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const getSportName = (sportId: number) => {
    return sports.find(s => s.id === sportId)?.name || 'Unknown';
  };

  const getBatchName = (batchId: number) => {
    return batches.find(b => b.id === batchId)?.name || 'Unknown';
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewCard = (student: Student) => {
    setSelectedStudent(student);
    setIsCardDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="data-table">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {isMobile ? (
        // Mobile card view
        <div className="grid grid-cols-1 gap-4">
          {students.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onEdit={() => {}} // TODO: Implement edit functionality
              onDelete={() => {}} // TODO: Implement delete functionality
            />
          ))}
        </div>
      ) : (
        // Desktop table view
        <div className="data-table">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sport & Batch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Skill Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={student.profileImageUrl} alt={student.name} />
                          <AvatarFallback>
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {student.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {student.studentId}
                          </div>
                        </div>
                      </div>
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{student.phone}</div>
                    {student.email && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">{student.email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{getSportName(student.sportId)}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{getBatchName(student.batchId)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={`status-badge ${getSkillLevelColor(student.skillLevel)}`}>
                      {student.skillLevel}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={`status-badge ${student.isActive ? 'status-paid' : 'status-overdue'}`}>
                      {student.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewCard(student)}
                      >
                        <CreditCard className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Digital Card Dialog */}
      <Dialog open={isCardDialogOpen} onOpenChange={setIsCardDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Student Digital Card</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <DigitalCard
              student={selectedStudent}
              sport={getSportName(selectedStudent.sportId)}
              batch={getBatchName(selectedStudent.batchId)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
