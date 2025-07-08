import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Play, 
  Pause, 
  BarChart, 
  MessageSquare, 
  Users, 
  Clock, 
  TrendingUp,
  Settings,
  Eye,
  Trash2,
  Edit
} from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  completed: "bg-blue-100 text-blue-800"
};

const typeColors = {
  welcome: "bg-blue-100 text-blue-800",
  fee_reminder: "bg-orange-100 text-orange-800",
  attendance_followup: "bg-purple-100 text-purple-800",
  birthday: "bg-pink-100 text-pink-800",
  event: "bg-green-100 text-green-800",
  custom: "bg-gray-100 text-gray-800"
};

export default function Campaigns() {
  const [activeTab, setActiveTab] = useState("active");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["/api/campaigns", activeTab],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns?status=${activeTab}`);
      return response.json();
    },
  });

  const { data: predefinedTemplates } = useQuery({
    queryKey: ["/api/campaigns/templates/predefined"],
    queryFn: async () => {
      const response = await fetch("/api/campaigns/templates/predefined");
      return response.json();
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data) => {
      return apiRequest("POST", "/api/campaigns", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Campaign created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive",
      });
    },
  });

  const toggleCampaignMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return apiRequest("PUT", `/api/campaigns/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Success",
        description: "Campaign updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update campaign",
        variant: "destructive",
      });
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (id) => {
      return apiRequest("DELETE", `/api/campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Success",
        description: "Campaign deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      });
    },
  });

  const runCampaignMutation = useMutation({
    mutationFn: async (id) => {
      return apiRequest("POST", `/api/campaigns/${id}/run`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Campaign execution started",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to run campaign",
        variant: "destructive",
      });
    },
  });

  const handleCreateFromTemplate = (template) => {
    const campaignData = {
      name: template.name,
      description: `Auto-generated ${template.type} campaign`,
      type: template.type,
      trigger: template.trigger,
      status: "draft",
      targetAudience: { type: "all", filters: {} },
      messageTemplate: template.messageTemplate,
      automationRules: template.automationRules,
      analytics: { sent: 0, delivered: 0, read: 0, failed: 0 }
    };
    
    createCampaignMutation.mutate(campaignData);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            WhatsApp Campaigns
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage automated messaging campaigns for students and parents
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
              </DialogHeader>
              <CampaignForm 
                onSubmit={createCampaignMutation.mutate}
                isLoading={createCampaignMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {campaigns?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No campaigns found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Create your first campaign to start engaging with students
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  Create Campaign
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {campaigns?.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onToggle={(status) => toggleCampaignMutation.mutate({ id: campaign.id, status })}
                  onDelete={() => deleteCampaignMutation.mutate(campaign.id)}
                  onRun={() => runCampaignMutation.mutate(campaign.id)}
                  onViewAnalytics={() => {
                    setSelectedCampaign(campaign);
                    setShowAnalytics(true);
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Setup Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Setup Templates</CardTitle>
          <CardDescription>
            Create campaigns from predefined templates for common scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {predefinedTemplates && Object.entries(predefinedTemplates).map(([key, template]) => (
              <div key={key} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                   onClick={() => handleCreateFromTemplate(template)}>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {template.name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {template.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  Create Campaign
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Dialog */}
      <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Campaign Analytics</DialogTitle>
          </DialogHeader>
          {selectedCampaign && (
            <CampaignAnalytics campaign={selectedCampaign} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CampaignCard({ campaign, onToggle, onDelete, onRun, onViewAnalytics }) {
  const canRun = campaign.status === 'active' && campaign.trigger === 'manual';
  const canPause = campaign.status === 'active';
  const canActivate = campaign.status === 'draft' || campaign.status === 'paused';

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {campaign.name}
              </h3>
              <Badge className={statusColors[campaign.status]}>
                {campaign.status}
              </Badge>
              <Badge variant="outline" className={typeColors[campaign.type]}>
                {campaign.type.replace(/_/g, ' ')}
              </Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {campaign.description || 'No description'}
            </p>
            
            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Target: {campaign.targetAudience?.type || 'All'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>
                  {campaign.trigger === 'automated' ? 'Automated' : 'Manual'}
                </span>
              </div>
              {campaign.lastRunAt && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Last run: {format(new Date(campaign.lastRunAt), 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onViewAnalytics}
            >
              <BarChart className="w-4 h-4" />
            </Button>
            
            {canRun && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onRun}
              >
                <Play className="w-4 h-4" />
              </Button>
            )}
            
            {canPause && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onToggle('paused')}
              >
                <Pause className="w-4 h-4" />
              </Button>
            )}
            
            {canActivate && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onToggle('active')}
              >
                <Play className="w-4 h-4" />
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CampaignForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'custom',
    trigger: 'manual',
    targetAudience: { type: 'all', filters: {} },
    messageTemplate: { text: '', variables: [] },
    status: 'draft'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Campaign Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter campaign name"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="type">Campaign Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="welcome">Welcome Message</SelectItem>
              <SelectItem value="fee_reminder">Fee Reminder</SelectItem>
              <SelectItem value="attendance_followup">Attendance Follow-up</SelectItem>
              <SelectItem value="birthday">Birthday Wishes</SelectItem>
              <SelectItem value="event">Event Announcement</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="trigger">Trigger Type</Label>
          <Select value={formData.trigger} onValueChange={(value) => setFormData({ ...formData, trigger: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select trigger" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="automated">Automated</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="targetType">Target Audience</Label>
          <Select 
            value={formData.targetAudience.type} 
            onValueChange={(value) => setFormData({ 
              ...formData, 
              targetAudience: { ...formData.targetAudience, type: value } 
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select target" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              <SelectItem value="sport">By Sport</SelectItem>
              <SelectItem value="batch">By Batch</SelectItem>
              <SelectItem value="custom">Custom Filter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Campaign description"
          rows={3}
        />
      </div>
      
      <div>
        <Label htmlFor="message">Message Template</Label>
        <Textarea
          id="message"
          value={formData.messageTemplate.text}
          onChange={(e) => setFormData({ 
            ...formData, 
            messageTemplate: { ...formData.messageTemplate, text: e.target.value } 
          })}
          placeholder="Enter your message template. Use variables like {studentName}, {amount}, etc."
          rows={6}
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          Available variables: {'{studentName}'}, {'{amount}'}, {'{dueDate}'}, {'{sportName}'}, {'{batchName}'}
        </p>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => setFormData({
          name: '',
          description: '',
          type: 'custom',
          trigger: 'manual',
          targetAudience: { type: 'all', filters: {} },
          messageTemplate: { text: '', variables: [] },
          status: 'draft'
        })}>
          Reset
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Campaign'}
        </Button>
      </div>
    </form>
  );
}

function CampaignAnalytics({ campaign }) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: [`/api/campaigns/${campaign.id}/analytics`],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns/${campaign.id}/analytics`);
      return response.json();
    },
  });

  if (isLoading) {
    return <div className="p-6 text-center">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{analytics?.sent || 0}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Sent</div>
        </div>
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{analytics?.delivered || 0}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Delivered</div>
        </div>
        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{analytics?.read || 0}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Read</div>
        </div>
        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{analytics?.failed || 0}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Delivery Rate</h4>
          <div className="text-2xl font-bold text-blue-600">{analytics?.deliveryRate || 0}%</div>
        </div>
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Read Rate</h4>
          <div className="text-2xl font-bold text-green-600">{analytics?.readRate || 0}%</div>
        </div>
      </div>
    </div>
  );
}