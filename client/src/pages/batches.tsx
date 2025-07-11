import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Users, Clock, Calendar, Trophy, Target, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBatchSchema } from "@shared/schema";
import { z } from "zod";

const batchFormSchema = insertBatchSchema.extend({
  schedule: z.object({
    days: z.array(z.string()).min(1, "At least one day is required"),
    time: z.string().min(1, "Time is required"),
  }),
});

const TIME_SLOTS = [
  "5:00 AM - 6:00 AM",
  "6:00 AM - 7:00 AM",
  "7:00 AM - 8:00 AM",
  "8:00 AM - 9:00 AM",
  "9:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 1:00 PM",
  "1:00 PM - 2:00 PM",
  "2:00 PM - 3:00 PM",
  "3:00 PM - 4:00 PM",
  "4:00 PM - 5:00 PM",
  "5:00 PM - 6:00 PM",
  "6:00 PM - 7:00 PM",
  "7:00 PM - 8:00 PM",
  "8:00 PM - 9:00 PM",
  "9:00 PM - 10:00 PM",
];

type BatchFormData = z.infer<typeof batchFormSchema>;

export default function BatchesPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<any>(null);

  const { data: batches, isLoading } = useQuery({
    queryKey: ['/api/batches'],
  });

  const { data: sports } = useQuery({
    queryKey: ['/api/sports'],
  });

  const { data: coaches } = useQuery({
    queryKey: ['/api/coaches'],
  });

  const { data: batchStats } = useQuery({
    queryKey: ['/api/batches/stats'],
  });

  const form = useForm<BatchFormData>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: {
      name: "",
      sportId: undefined,
      coachId: undefined,
      schedule: {
        days: [],
        time: "",
      },
      maxCapacity: 20,
      skillLevel: "beginner",
      isActive: true,
    },
  });

  const createBatchMutation = useMutation({
    mutationFn: async (data: BatchFormData) => {
      return await apiRequest('POST', '/api/batches', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/batches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/batches/stats'] });
      setIsDialogOpen(false);
      setEditingBatch(null);
      form.reset();
      toast({
        title: "Success",
        description: "Batch has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create batch",
        variant: "destructive",
      });
    },
  });

  const updateBatchMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<BatchFormData> }) => {
      return await apiRequest('PUT', `/api/batches/${id}`, data);
    },
    onSuccess: () => {
      // Force refresh all batch-related data
      queryClient.invalidateQueries({ queryKey: ['/api/batches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/batches/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.refetchQueries({ queryKey: ['/api/batches'] });
      setIsDialogOpen(false);
      setEditingBatch(null);
      form.reset();
      toast({
        title: "Success",
        description: "Batch schedule has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update batch",
        variant: "destructive",
      });
    },
  });

  const deleteBatchMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/batches/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/batches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/batches/stats'] });
      toast({
        title: "Success",
        description: "Batch has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete batch",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (batch: any) => {
    setEditingBatch(batch);
    form.reset({
      name: batch.name,
      sportId: batch.sportId,
      coachId: batch.coachId,
      schedule: batch.schedule || { days: [], time: "" },
      maxCapacity: batch.maxCapacity,
      skillLevel: batch.skillLevel,
      isActive: batch.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: BatchFormData) => {
    if (editingBatch) {
      updateBatchMutation.mutate({ id: editingBatch.id, data });
    } else {
      createBatchMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this batch?")) {
      deleteBatchMutation.mutate(id);
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCapacityColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Batches Management</h1>
          <p className="text-gray-600">Manage training batches and schedules</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingBatch(null); form.reset(); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Batch
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{editingBatch ? 'Edit Batch' : 'Add New Batch'}</DialogTitle>
              <DialogDescription>
                {editingBatch ? 'Update batch information' : 'Create a new training batch'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Batch Name</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="e.g., Morning Cricket Batch"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="maxCapacity">Max Capacity</Label>
                  <Input
                    id="maxCapacity"
                    type="number"
                    {...form.register('maxCapacity', { valueAsNumber: true })}
                    placeholder="20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sport">Sport</Label>
                  <Select 
                    value={form.watch('sportId')?.toString() || ''} 
                    onValueChange={(value) => form.setValue('sportId', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sport" />
                    </SelectTrigger>
                    <SelectContent>
                      {sports?.map((sport: any) => (
                        <SelectItem key={sport.id} value={sport.id.toString()}>
                          {sport.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="coach">Coach</Label>
                  <Select 
                    value={form.watch('coachId')?.toString() || ''} 
                    onValueChange={(value) => form.setValue('coachId', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select coach" />
                    </SelectTrigger>
                    <SelectContent>
                      {coaches?.map((coach: any) => (
                        <SelectItem key={coach.id} value={coach.id.toString()}>
                          {coach.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="skillLevel">Skill Level</Label>
                  <Select 
                    value={form.watch('skillLevel')} 
                    onValueChange={(value) => form.setValue('skillLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select skill level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="time">Training Time</Label>
                  <Select
                    value={form.watch('schedule.time')}
                    onValueChange={(value) => form.setValue('schedule.time', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select training time" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Training Days</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {daysOfWeek.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={day.value}
                        checked={form.watch('schedule.days')?.includes(day.value) || false}
                        onChange={(e) => {
                          const currentDays = form.watch('schedule.days') || [];
                          if (e.target.checked) {
                            form.setValue('schedule.days', [...currentDays, day.value]);
                          } else {
                            form.setValue('schedule.days', currentDays.filter(d => d !== day.value));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={day.value} className="text-sm">
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={form.watch('isActive')}
                  onCheckedChange={(checked) => form.setValue('isActive', checked)}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createBatchMutation.isPending || updateBatchMutation.isPending}>
                  {editingBatch ? 'Update' : 'Create'} Batch
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Batches</p>
                <p className="text-2xl font-bold text-gray-900">{batchStats?.totalBatches || 0}</p>
              </div>
              <Trophy className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Batches</p>
                <p className="text-2xl font-bold text-green-600">{batchStats?.activeBatches || 0}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-purple-600">{batchStats?.totalStudents || 0}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Capacity</p>
                <p className="text-2xl font-bold text-orange-600">{batchStats?.avgCapacity || 0}%</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches?.map((batch: any) => (
          <Card key={batch.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{batch.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <span>{batch.sport?.name}</span>
                    <Badge className={getSkillLevelColor(batch.skillLevel)}>
                      {batch.skillLevel}
                    </Badge>
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={batch.isActive ? "default" : "secondary"}>
                    {batch.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(batch)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(batch.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{batch.coach?.name || 'No coach assigned'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{batch.schedule?.time || 'No time set'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    {batch.schedule?.days?.join(', ') || 'No days set'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Capacity:</span>
                  <span className={`font-medium ${getCapacityColor(batch.currentCapacity || 0, batch.maxCapacity)}`}>
                    {batch.currentCapacity || 0}/{batch.maxCapacity}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(((batch.currentCapacity || 0) / batch.maxCapacity) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {batches?.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No batches found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first batch</p>
          <Button onClick={() => { setEditingBatch(null); form.reset(); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Batch
          </Button>
        </div>
      )}
    </div>
  );
}