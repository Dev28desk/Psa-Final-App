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

const paymentFormSchema = z.object({
  studentId: z.number().min(1, "Please select a student"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  paymentType: z.enum(["monthly", "registration", "tournament", "other"]),
  paymentMethod: z.enum(["cash", "upi", "card", "online"]),
  monthYear: z.string().optional(),
  notes: z.string().optional()
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  onSuccess: () => void;
  students: Array<{ id: number; name: string; studentId: string }>;
}

export function PaymentForm({ onSuccess, students }: PaymentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      paymentType: "monthly",
      paymentMethod: "cash",
      monthYear: new Date().toISOString().slice(0, 7) // Current month in YYYY-MM format
    }
  });

  const paymentType = watch("paymentType");

  const createPaymentMutation = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      return apiRequest("POST", "/api/payments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payments/revenue-stats"] });
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PaymentFormData) => {
    createPaymentMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="student">Student *</Label>
        <select
          {...register("studentId", { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Select a student</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name} ({student.studentId})
            </option>
          ))}
        </select>
        {errors.studentId && (
          <p className="text-sm text-destructive mt-1">{errors.studentId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Amount (₹) *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            {...register("amount", { valueAsNumber: true })}
            placeholder="Enter amount"
          />
          {errors.amount && (
            <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="paymentType">Payment Type *</Label>
          <select
            {...register("paymentType")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="monthly">Monthly Fee</option>
            <option value="registration">Registration Fee</option>
            <option value="tournament">Tournament Fee</option>
            <option value="other">Other</option>
          </select>
          {errors.paymentType && (
            <p className="text-sm text-destructive mt-1">{errors.paymentType.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="paymentMethod">Payment Method *</Label>
          <select
            {...register("paymentMethod")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
            <option value="online">Online Transfer</option>
          </select>
          {errors.paymentMethod && (
            <p className="text-sm text-destructive mt-1">{errors.paymentMethod.message}</p>
          )}
        </div>

        {paymentType === "monthly" && (
          <div>
            <Label htmlFor="monthYear">Month & Year</Label>
            <Input
              id="monthYear"
              type="month"
              {...register("monthYear")}
            />
            {errors.monthYear && (
              <p className="text-sm text-destructive mt-1">{errors.monthYear.message}</p>
            )}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register("notes")}
          placeholder="Additional notes (optional)"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={createPaymentMutation.isPending}
          className="bg-accent hover:bg-accent/90"
        >
          {createPaymentMutation.isPending ? "Recording..." : "Record Payment"}
        </Button>
      </div>
    </form>
  );
}
