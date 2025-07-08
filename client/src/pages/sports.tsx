import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Users, IndianRupee, Trophy, Activity } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSportSchema } from "@shared/schema";
import { z } from "zod";

const sportFormSchema = insertSportSchema.extend({
  feeStructure: z.object({
    baseAmount: z.number().min(0),
    skillLevels: z.object({
      beginner: z.number().min(0),
      intermediate: z.number().min(0),
      advanced: z.number().min(0),
    }),
  }),
});

type SportFormData = z.infer<typeof sportFormSchema>;

export default function SportsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSport, setEditingSport] = useState<any>(null);

  const { data: sports, isLoading } = useQuery({
    queryKey: ['/api/sports'],
  });

  const { data: sportsStats } = useQuery({
    queryKey: ['/api/sports/stats'],
  });

  const form = useForm<SportFormData>({
    resolver: zodResolver(sportFormSchema),
    defaultValues: {
      name: "",
      description: "",
      feeStructure: {
        baseAmount: 0,
        skillLevels: {
          beginner: 1000,
          intermediate: 1500,
          advanced: 2000,
        },
      },
      isActive: true,
    },
  });

  const createSportMutation = useMutation({
    mutationFn: async (data: SportFormData) => {
      return await apiRequest('POST', '/api/sports', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sports'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sports/stats'] });
      setIsDialogOpen(false);
      setEditingSport(null);
      form.reset();
      toast({
        title: "Success",
        description: "Sport has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create sport",
        variant: "destructive",
      });
    },
  });

  const updateSportMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<SportFormData> }) => {
      return await apiRequest('PUT', `/api/sports/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sports'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sports/stats'] });
      setIsDialogOpen(false);
      setEditingSport(null);
      form.reset();
      toast({
        title: "Success",
        description: "Sport has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update sport",
        variant: "destructive",
      });
    },
  });

  const deleteSportMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/sports/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sports'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sports/stats'] });
      toast({
        title: "Success",
        description: "Sport has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete sport",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (sport: any) => {
    setEditingSport(sport);
    form.reset({
      name: sport.name,
      description: sport.description || "",
      feeStructure: sport.feeStructure || {
        baseAmount: 0,
        skillLevels: {
          beginner: 1000,
          intermediate: 1500,
          advanced: 2000,
        },
      },
      isActive: sport.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: SportFormData) => {
    if (editingSport) {
      updateSportMutation.mutate({ id: editingSport.id, data });
    } else {
      createSportMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this sport?")) {
      deleteSportMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sports Management</h1>
          <p className="text-gray-600">Manage sports offered at your academy</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingSport(null); form.reset(); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Sport
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingSport ? 'Edit Sport' : 'Add New Sport'}</DialogTitle>
              <DialogDescription>
                {editingSport ? 'Update sport information' : 'Create a new sport for your academy'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Sport Name</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="e.g., Cricket, Football, Tennis"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="baseAmount">Base Amount (₹)</Label>
                  <Input
                    id="baseAmount"
                    type="number"
                    {...form.register('feeStructure.baseAmount', { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Brief description of the sport..."
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-base font-medium">Skill Level Fees</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <Label htmlFor="beginner">Beginner (₹)</Label>
                    <Input
                      id="beginner"
                      type="number"
                      {...form.register('feeStructure.skillLevels.beginner', { valueAsNumber: true })}
                      placeholder="1000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="intermediate">Intermediate (₹)</Label>
                    <Input
                      id="intermediate"
                      type="number"
                      {...form.register('feeStructure.skillLevels.intermediate', { valueAsNumber: true })}
                      placeholder="1500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="advanced">Advanced (₹)</Label>
                    <Input
                      id="advanced"
                      type="number"
                      {...form.register('feeStructure.skillLevels.advanced', { valueAsNumber: true })}
                      placeholder="2000"
                    />
                  </div>
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
                <Button type="submit" disabled={createSportMutation.isPending || updateSportMutation.isPending}>
                  {editingSport ? 'Update' : 'Create'} Sport
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
                <p className="text-sm font-medium text-gray-600">Total Sports</p>
                <p className="text-2xl font-bold text-gray-900">{sportsStats?.totalSports || 0}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sports</p>
                <p className="text-2xl font-bold text-green-600">{sportsStats?.activeSports || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{sportsStats?.totalStudents || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Monthly Fee</p>
                <p className="text-2xl font-bold text-purple-600">₹{sportsStats?.avgFee || 0}</p>
              </div>
              <IndianRupee className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sports?.map((sport: any) => (
          <Card key={sport.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{sport.name}</CardTitle>
                  <CardDescription className="mt-1">{sport.description}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={sport.isActive ? "default" : "secondary"}>
                    {sport.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(sport)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(sport.id)}
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
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Base Amount:</span>
                  <span className="font-medium">₹{sport.feeStructure?.baseAmount || 0}</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Skill Level Fees:</p>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center">
                      <p className="text-gray-600">Beginner</p>
                      <p className="font-medium">₹{sport.feeStructure?.skillLevels?.beginner || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600">Intermediate</p>
                      <p className="font-medium">₹{sport.feeStructure?.skillLevels?.intermediate || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600">Advanced</p>
                      <p className="font-medium">₹{sport.feeStructure?.skillLevels?.advanced || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-gray-600">Students Enrolled:</span>
                  <span className="font-medium">{sport.studentsCount || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sports?.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sports found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first sport</p>
          <Button onClick={() => { setEditingSport(null); form.reset(); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Sport
          </Button>
        </div>
      )}
    </div>
  );
}