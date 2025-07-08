import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Send, MessageSquare, Mail, Phone, CheckCircle, XCircle, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const communicationSchema = z.object({
  type: z.enum(["sms", "whatsapp", "email"]),
  recipient: z.string().min(1, "Recipient is required"),
  message: z.string().min(1, "Message is required"),
  templateId: z.string().optional(),
  campaignId: z.string().optional(),
});

type CommunicationFormData = z.infer<typeof communicationSchema>;

const MESSAGE_TEMPLATES = {
  sms: [
    { id: "welcome", name: "Welcome Message", content: "Welcome to Parmanand Sports Academy! We're excited to have you join our sports family." },
    { id: "payment_reminder", name: "Payment Reminder", content: "Dear [Name], your monthly fee payment is due. Please make the payment at your earliest convenience." },
    { id: "attendance_low", name: "Low Attendance Alert", content: "Dear [Name], we noticed your attendance has been low. Please ensure regular participation for better progress." },
    { id: "batch_update", name: "Batch Update", content: "Important update about your batch schedule. Please check the updated timings." },
  ],
  whatsapp: [
    { id: "welcome", name: "Welcome Message", content: "🏆 Welcome to Parmanand Sports Academy! We're excited to have you join our sports family." },
    { id: "payment_reminder", name: "Payment Reminder", content: "💰 Dear [Name], your monthly fee payment is due. Please make the payment at your earliest convenience." },
    { id: "attendance_low", name: "Low Attendance Alert", content: "📊 Dear [Name], we noticed your attendance has been low. Please ensure regular participation for better progress." },
    { id: "achievement", name: "Achievement Congratulations", content: "🎉 Congratulations [Name]! Your hard work and dedication have paid off. Keep up the excellent work!" },
  ],
  email: [
    { id: "welcome", name: "Welcome Email", content: "Dear [Name],\n\nWelcome to Parmanand Sports Academy! We're excited to have you join our sports family and begin your journey with us.\n\nBest regards,\nParmanand Sports Academy Team" },
    { id: "payment_receipt", name: "Payment Receipt", content: "Dear [Name],\n\nThank you for your payment of ₹[Amount]. Your payment has been successfully processed.\n\nReceipt Number: [Receipt]\nPayment Date: [Date]\n\nBest regards,\nParmanand Sports Academy" },
    { id: "monthly_report", name: "Monthly Progress Report", content: "Dear [Name],\n\nPlease find your monthly progress report attached. We're proud of your achievements this month.\n\nBest regards,\nParmanand Sports Academy" },
  ],
};

export default function Communications() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  const { data: communications, isLoading } = useQuery({
    queryKey: ['/api/communications'],
    queryFn: () => apiRequest('GET', '/api/communications'),
  });

  const { data: communicationStats } = useQuery({
    queryKey: ['/api/communications/stats'],
    queryFn: () => apiRequest('GET', '/api/communications/stats'),
  });

  const form = useForm<CommunicationFormData>({
    resolver: zodResolver(communicationSchema),
    defaultValues: {
      type: "sms",
      recipient: "",
      message: "",
      templateId: "",
      campaignId: "",
    },
  });

  const sendCommunicationMutation = useMutation({
    mutationFn: (data: CommunicationFormData) => apiRequest("POST", "/api/communications/send", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/communications/stats'] });
      form.reset();
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Communication sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send communication",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CommunicationFormData) => {
    sendCommunicationMutation.mutate(data);
  };

  const handleTemplateSelect = (templateId: string) => {
    const currentType = form.watch('type');
    const templates = MESSAGE_TEMPLATES[currentType as keyof typeof MESSAGE_TEMPLATES];
    const template = templates.find(t => t.id === templateId);
    
    if (template) {
      form.setValue('message', template.content);
      form.setValue('templateId', templateId);
      setSelectedTemplate(templateId);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      delivered: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
      sent: "bg-blue-100 text-blue-800",
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sms':
        return <MessageSquare className="w-4 h-4" />;
      case 'whatsapp':
        return <Phone className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
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
        <h1 className="text-3xl font-bold">Communications</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Send Communication
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Communication</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Communication Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sms">SMS</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="recipient"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipient</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number or email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div>
                  <Label>Message Templates</Label>
                  <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {MESSAGE_TEMPLATES[form.watch('type') as keyof typeof MESSAGE_TEMPLATES]?.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter your message..." 
                          rows={6}
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
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={sendCommunicationMutation.isPending}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
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
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communicationStats?.totalSent || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communicationStats?.delivered || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communicationStats?.failed || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communicationStats?.deliveryRate || 0}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Communications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Communication History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {communications?.communications?.map((comm: any) => (
                <TableRow key={comm.id}>
                  <TableCell className="flex items-center gap-2">
                    {getTypeIcon(comm.type)}
                    {comm.type.toUpperCase()}
                  </TableCell>
                  <TableCell>{comm.recipient}</TableCell>
                  <TableCell className="max-w-md truncate">{comm.message}</TableCell>
                  <TableCell>{getStatusBadge(comm.status)}</TableCell>
                  <TableCell>
                    {comm.sentAt ? new Date(comm.sentAt).toLocaleString() : 'Not sent'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}