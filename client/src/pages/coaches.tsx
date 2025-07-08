import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Send, MessageSquare, Phone, Mail, Users, Clock, Filter, Search, Eye, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCommunicationSchema } from "@shared/schema";
import { z } from "zod";

const communicationFormSchema = insertCommunicationSchema.extend({
  recipients: z.array(z.string()).min(1, "At least one recipient is required"),
});

type CommunicationFormData = z.infer<typeof communicationFormSchema>;

export default function CommunicationsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: communications, isLoading } = useQuery({
    queryKey: ['/api/communications', selectedType, searchQuery],
  });

  const { data: students } = useQuery({
    queryKey: ['/api/students'],
  });

  const { data: communicationStats } = useQuery({
    queryKey: ['/api/communications/stats'],
  });

  const form = useForm<CommunicationFormData>({
    resolver: zodResolver(communicationFormSchema),
    defaultValues: {
      type: "sms",
      recipients: [],
      message: "",
      templateId: "",
      campaignId: "",
    },
  });

  const sendCommunicationMutation = useMutation({
    mutationFn: async (data: CommunicationFormData) => {
      return await apiRequest('POST', '/api/communications/send', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/communications/stats'] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Communication sent successfully.",
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

  const deleteCommunicationMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/communications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/communications/stats'] });
      toast({
        title: "Success",
        description: "Communication deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete communication",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: CommunicationFormData) => {
    sendCommunicationMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sms': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Communications</h1>
          <p className="text-gray-600">Manage communication with students and parents</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Communication</DialogTitle>
              <DialogDescription>
                Send messages to students and parents via SMS, Email, or WhatsApp
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Communication Type</Label>
                  <Select 
                    onValueChange={(value) => form.setValue('type', value as any)}
                    defaultValue="sms"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="recipients">Recipients</Label>
                  <Select 
                    onValueChange={(value) => {
                      const currentRecipients = form.watch('recipients') || [];
                      form.setValue('recipients', [...currentRecipients, value]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      {students?.students?.map((student: any) => (
                        <SelectItem key={student.id} value={student.phone}>
                          {student.name} - {student.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  {...form.register('message')}
                  placeholder="Enter your message..."
                  rows={4}
                />
                {form.formState.errors.message && (
                  <p className="text-red-500 text-sm">{form.formState.errors.message.message}</p>
                )}
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Selected recipients: {form.watch('recipients')?.length || 0}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={sendCommunicationMutation.isPending}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
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
                <p className="text-sm font-medium text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold text-gray-900">{communicationStats?.totalSent || 0}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-green-600">{communicationStats?.delivered || 0}</p>
              </div>
              <Send className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{communicationStats?.failed || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                <p className="text-2xl font-bold text-purple-600">{communicationStats?.deliveryRate || 0}%</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search communications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Communications List */}
      <div className="space-y-4">
        {communications?.map((communication: any) => (
          <Card key={communication.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                    {getTypeIcon(communication.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline" className="capitalize">
                        {communication.type}
                      </Badge>
                      <Badge className={getStatusColor(communication.status)}>
                        {communication.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(communication.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-900">
                        To: {communication.recipient}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {communication.message}
                    </p>
                    {communication.sentAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Sent: {new Date(communication.sentAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteCommunicationMutation.mutate(communication.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {communications?.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No communications found</h3>
          <p className="text-gray-600 mb-4">Start communicating with your students and parents</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </div>
      )}
    </div>
  );
}