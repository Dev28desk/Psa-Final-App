import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentTable } from "@/components/students/student-table";
import { StudentForm } from "@/components/students/student-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStudentStore } from "@/stores/student-store";
import { UserPlus, Search, Filter, Download } from "lucide-react";

export default function Students() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { filters, setFilters } = useStudentStore();

  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['/api/students', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.sportId) params.append('sportId', filters.sportId.toString());
      if (filters.batchId) params.append('batchId', filters.batchId.toString());
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
      
      const response = await fetch(`/api/students?${params}`);
      return response.json();
    },
  });

  const { data: sports } = useQuery({
    queryKey: ['/api/sports'],
    queryFn: async () => {
      const response = await fetch('/api/sports');
      return response.json();
    },
  });

  const { data: batches } = useQuery({
    queryKey: ['/api/batches'],
    queryFn: async () => {
      const response = await fetch('/api/batches');
      return response.json();
    },
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students Management</h1>
          <p className="text-gray-600">
            {studentsData?.total || 0} students enrolled
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary/90">
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
              <Button variant="outline" size="sm">
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
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
