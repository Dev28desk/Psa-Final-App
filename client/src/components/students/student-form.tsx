import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const studentFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.object({
    name: z.string().min(2, "Emergency contact name required"),
    phone: z.string().min(10, "Emergency contact phone required"),
    relation: z.string().min(2, "Relation required")
  }),
  medicalNotes: z.string().optional(),
  sportId: z.number().min(1, "Please select a sport"),
  batchId: z.number().min(1, "Please select a batch"),
  skillLevel: z.enum(["beginner", "intermediate", "advanced"])
});

type StudentFormData = z.infer<typeof studentFormSchema>;

interface StudentFormProps {
  onSuccess: () => void;
  sports: Array<{ id: number; name: string }>;
  batches: Array<{ 
    id: number; 
    name: string; 
    sportId: number; 
    schedule: { 
      days: string[]; 
      time: string; 
    }; 
  }>;
}

export function StudentForm({ onSuccess, sports, batches }: StudentFormProps) {
  const [selectedSport, setSelectedSport] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      emergencyContact: {
        name: "",
        phone: "",
        relation: ""
      }
    }
  });

  const sportId = watch("sportId");
  const filteredBatches = batches.filter(batch => batch.sportId === sportId);

  const createStudentMutation = useMutation({
    mutationFn: async (data: StudentFormData) => {
      return apiRequest("POST", "/api/students", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Student added successfully",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add student",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: StudentFormData) => {
    createStudentMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Enter student's full name"
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            {...register("phone")}
            placeholder="Enter phone number"
          />
          {errors.phone && (
            <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="Enter email address"
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            {...register("dateOfBirth")}
          />
        </div>

        <div>
          <Label htmlFor="sport">Sport *</Label>
          <select
            {...register("sportId", { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setValue("sportId", value);
              setValue("batchId", 0); // Reset batch when sport changes
            }}
          >
            <option value="">Select a sport</option>
            {sports.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>
          {errors.sportId && (
            <p className="text-sm text-destructive mt-1">{errors.sportId.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="batch">Batch *</Label>
          <select
            {...register("batchId", { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={!sportId}
          >
            <option value="">Select a batch</option>
            {filteredBatches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.schedule.time} - {batch.name}
              </option>
            ))}
          </select>
          {errors.batchId && (
            <p className="text-sm text-destructive mt-1">{errors.batchId.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="skillLevel">Skill Level *</Label>
          <select
            {...register("skillLevel")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Select skill level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          {errors.skillLevel && (
            <p className="text-sm text-destructive mt-1">{errors.skillLevel.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          {...register("address")}
          placeholder="Enter complete address"
          rows={3}
        />
      </div>

      {/* Emergency Contact */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="emergencyName">Name *</Label>
            <Input
              id="emergencyName"
              {...register("emergencyContact.name")}
              placeholder="Emergency contact name"
            />
            {errors.emergencyContact?.name && (
              <p className="text-sm text-destructive mt-1">
                {errors.emergencyContact.name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="emergencyPhone">Phone *</Label>
            <Input
              id="emergencyPhone"
              {...register("emergencyContact.phone")}
              placeholder="Emergency contact phone"
            />
            {errors.emergencyContact?.phone && (
              <p className="text-sm text-destructive mt-1">
                {errors.emergencyContact.phone.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="emergencyRelation">Relation *</Label>
            <Input
              id="emergencyRelation"
              {...register("emergencyContact.relation")}
              placeholder="Relation (e.g., Father, Mother)"
            />
            {errors.emergencyContact?.relation && (
              <p className="text-sm text-destructive mt-1">
                {errors.emergencyContact.relation.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="medicalNotes">Medical Notes</Label>
        <Textarea
          id="medicalNotes"
          {...register("medicalNotes")}
          placeholder="Any medical conditions or notes"
          rows={3}
        />
      </div>

      {/* Registration Fee Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">Registration Fee</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              One-time registration fee required for new students
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">₹300</span>
            <p className="text-xs text-blue-600 dark:text-blue-400">One-time payment</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={createStudentMutation.isPending}
          className="bg-primary hover:bg-primary/90"
        >
          {createStudentMutation.isPending ? "Adding..." : "Add Student"}
        </Button>
      </div>
    </form>
  );
}
