import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit2, Trash2, Users, Trophy, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const coachSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  specialization: z.string().min(2, "Specialization is required"),
  experience: z.number().min(0, "Experience must be positive"),
  qualifications: z.string().optional(),
  isActive: z.boolean().default(true),
});

type CoachFormData = z.infer<typeof coachSchema>;

export default function Coaches() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: coaches = [], isLoading } = useQuery({
    queryKey: ['/api/coaches'],
  });

  const { data: stats = {} } = useQuery({
    queryKey: ['/api/coaches/stats'],
  });

  const form = useForm<CoachFormData>({
    resolver: zodResolver(coachSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      specialization: "",
      experience: 0,
      qualifications: "",
      isActive: true,
    },
  });

  const createCoachMutation = useMutation({
    mutationFn: (data: CoachFormData) => apiRequest("POST", "/api/coaches", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coaches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/coaches/stats'] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Coach added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add coach",
        variant: "destructive",
      });
    },
  });

  const updateCoachMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CoachFormData> }) =>
      apiRequest("PUT", `/api/coaches/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coaches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/coaches/stats'] });
      setEditingCoach(null);
      form.reset();
      toast({
        title: "Success",
        description: "Coach updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update coach",
        variant: "destructive",
      });
    },
  });

  const deleteCoachMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/coaches/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coaches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/coaches/stats'] });
      toast({
        title: "Success",
        description: "Coach deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete coach",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CoachFormData) => {
    if (editingCoach) {
      updateCoachMutation.mutate({ id: editingCoach.id, data });
    } else {
      createCoachMutation.mutate(data);
    }
  };

  const handleEdit = (coach: any) => {
    setEditingCoach(coach);
    form.reset({
      name: coach.name,
      email: coach.email,
      phone: coach.phone,
      specialization: coach.specialization,
      experience: coach.experience,
      qualifications: coach.qualifications || "",
      isActive: coach.isActive,
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this coach?")) {
      deleteCoachMutation.mutate(id);
    }
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setEditingCoach(null);
    form.reset();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Coaches Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Coach
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCoach ? "Edit Coach" : "Add New Coach"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter coach name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialization</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Cricket, Football" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience (Years)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter years of experience"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="qualifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualifications</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter qualifications and certifications"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDialogClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createCoachMutation.isPending || updateCoachMutation.isPending}
                  >
                    {editingCoach ? "Update Coach" : "Add Coach"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coaches</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCoaches || 0}</div>
            <p className="text-xs text-muted-foreground">
              All registered coaches
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Coaches</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCoaches || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Experience</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgExperience || 0} yrs</div>
            <p className="text-xs text-muted-foreground">
              Average experience
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents || 0}</div>
            <p className="text-xs text-muted-foreground">
              Under coaching
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Coaches List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coaches.map((coach: any) => (
          <Card key={coach.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{coach.name}</CardTitle>
                <Badge variant={coach.isActive ? "default" : "secondary"}>
                  {coach.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Email:</strong> {coach.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Phone:</strong> {coach.phone}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Specialization:</strong> {coach.specialization}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Experience:</strong> {coach.experience} years
                </p>
                {coach.qualifications && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Qualifications:</strong> {coach.qualifications}
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(coach)}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(coach.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {coaches.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No coaches found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first coach
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Coach
          </Button>
        </div>
      )}
    </div>
  );
}