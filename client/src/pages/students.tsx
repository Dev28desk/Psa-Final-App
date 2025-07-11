import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentTable } from "@/components/students/student-table";
import { StudentForm } from "@/components/students/student-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useStudentStore } from "@/stores/student-store";
import { UserPlus, Search, Filter, Download } from "lucide-react";

export default function Students() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { filters, setFilters } = useStudentStore();

  const { data: studentsData, isLoading, error: studentsError } = useQuery({
    queryKey: ['/api/students', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.sportId) params.append('sportId', filters.sportId.toString());
      if (filters.batchId) params.append('batchId', filters.batchId.toString());
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
      
      const response = await fetch(`/api/students?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      return response.json();
    },
  });

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.sportId) params.append('sportId', filters.sportId.toString());
      if (filters.batchId) params.append('batchId', filters.batchId.toString());
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
      
      const response = await fetch(`/api/export/students?${params}`);
      if (!response.ok) {
        throw new Error('Failed to export students');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting students:', error);
    }
  };

  const { data: sports, error: sportsError } = useQuery({
    queryKey: ['/api/sports'],
    queryFn: async () => {
      const response = await fetch('/api/sports');
      if (!response.ok) {
        throw new Error('Failed to fetch sports');
      }
      return response.json();
    },
  });

  const { data: batches, error: batchesError } = useQuery({
    queryKey: ['/api/batches'],
    queryFn: async () => {
      const response = await fetch('/api/batches');
      if (!response.ok) {
        throw new Error('Failed to fetch batches');
      }
      return response.json();
    },
  });

  if (studentsError || sportsError || batchesError) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <h2 className="text-lg font-semibold">Error Loading Data</h2>
            <p className="text-sm">
              {studentsError?.message || sportsError?.message || batchesError?.message}
            </p>
          </div>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Students Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {studentsData?.total || 0} students enrolled
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
              />
            </div>
            
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              value={filters.sportId || ''}
              onChange={(e) => setFilters({ sportId: e.target.value ? parseInt(e.target.value) : undefined })}
            >
              <option value="">All Sports</option>
              {sports?.map((sport: any) => (
                <option key={sport.id} value={sport.id}>
                  {sport.name}
                </option>
              ))}
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              value={filters.batchId || ''}
              onChange={(e) => setFilters({ batchId: e.target.value ? parseInt(e.target.value) : undefined })}
            >
              <option value="">All Batches</option>
              {batches?.map((batch: any) => (
                <option key={batch.id} value={batch.id}>
                  {batch.schedule?.time} - {batch.name}
                </option>
              ))}
            </select>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleExport()}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <StudentTable 
        students={studentsData?.students || []} 
        isLoading={isLoading}
        sports={sports || []}
        batches={batches || []}
      />

      {/* Add Student Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Fill in the student details to add them to your academy.
            </DialogDescription>
          </DialogHeader>
          <StudentForm 
            onSuccess={() => setIsAddDialogOpen(false)}
            sports={sports || []}
            batches={batches || []}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
