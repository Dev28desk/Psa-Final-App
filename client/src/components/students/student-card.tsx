import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Student } from "@shared/schema";
import { format } from "date-fns";
import { Eye, Edit, Trash2, Phone, Mail } from "lucide-react";

interface StudentCardProps {
  student: Student;
  onEdit: (student: Student) => void;
  onDelete: (id: number) => void;
}

export function StudentCard({ student, onEdit, onDelete }: StudentCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow dark:bg-gray-800">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{student.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">ID: {student.studentId}</p>
          </div>
          <Badge 
            variant={student.isActive ? "default" : "secondary"}
            className="text-xs"
          >
            {student.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Phone className="h-4 w-4 mr-2" />
            {student.phone}
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Mail className="h-4 w-4 mr-2" />
            {student.email}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Joined: {student.joiningDate ? format(new Date(student.joiningDate), "MMM dd, yyyy") : "N/A"}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              ₹{student.feeAmount.toLocaleString()}
            </span>
            <span className="text-gray-500 dark:text-gray-400"> / month</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(student)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onDelete(student.id)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}