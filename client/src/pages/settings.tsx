import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  CreditCard, 
  Bell, 
  Eye, 
  Shield, 
  Palette, 
  Zap,
  CheckCircle,
  XCircle,
  Plus,
  Edit3,
  Trash2,
  Upload,
  Key,
  Megaphone,
  BarChart3,
  Brain,
  MapPin
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/settings'],
  });

  const { data: paymentGateways } = useQuery({
    queryKey: ['/api/payment-gateways'],
  });

  const { data: icons } = useQuery({
    queryKey: ['/api/icons'],
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      return await apiRequest('POST', '/api/settings', { key, value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Settings Updated",
        description: "Your settings have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const updatePaymentGatewayMutation = useMutation({
    mutationFn: async (gateway: any) => {
      return await apiRequest('POST', '/api/payment-gateways', gateway);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-gateways'] });
      toast({
        title: "Payment Gateway Updated",
        description: "Payment gateway configuration saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update payment gateway",
        variant: "destructive",
      });
    },
  });

  const handleSettingChange = (key: string, value: any) => {
    updateSettingMutation.mutate({ key, value });
  };

  const applyTheme = (theme: string) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', 'system');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your academy's configuration and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto">
          <TabsTrigger value="general" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">General</span>
            <span className="sm:hidden">Gen</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Payments</span>
            <span className="sm:hidden">Pay</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Notifications</span>
            <span className="sm:hidden">Not</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Palette className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Appearance</span>
            <span className="sm:hidden">App</span>
          </TabsTrigger>
          <TabsTrigger value="icons" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Icons</span>
            <span className="sm:hidden">Ico</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Security</span>
            <span className="sm:hidden">Sec</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto mt-4">
          <TabsTrigger value="campaigns" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Megaphone className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Campaigns</span>
            <span className="sm:hidden">Cam</span>
          </TabsTrigger>
          <TabsTrigger value="advanced-reports" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Advanced Reports</span>
            <span className="sm:hidden">Adv</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Users</span>
            <span className="sm:hidden">Usr</span>
          </TabsTrigger>
          <TabsTrigger value="gps-tracking" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">GPS Tracking</span>
            <span className="sm:hidden">GPS</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Academy Information</CardTitle>
              <CardDescription>Basic information about your sports academy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="academy-name">Academy Name</Label>
                  <Input 
                    id="academy-name" 
                    defaultValue={settings?.academy_name || "Parmanand Sports Academy"}
                    onBlur={(e) => handleSettingChange('academy_name', e.target.value)}
                    className="text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="academy-email">Contact Email</Label>
                  <Input 
                    id="academy-email" 
                    type="email"
                    defaultValue={settings?.academy_email || ""}
                    onBlur={(e) => handleSettingChange('academy_email', e.target.value)}
                    className="text-base"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="academy-phone">Contact Phone</Label>
                  <Input 
                    id="academy-phone" 
                    defaultValue={settings?.academy_phone || ""}
                    onBlur={(e) => handleSettingChange('academy_phone', e.target.value)}
                    className="text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="academy-address">Address</Label>
                  <Input 
                    id="academy-address" 
                    defaultValue={settings?.academy_address || ""}
                    onBlur={(e) => handleSettingChange('academy_address', e.target.value)}
                    className="text-base"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Preferences</CardTitle>
              <CardDescription>Configure system-wide preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-backup">Automatic Backup</Label>
                  <p className="text-sm text-gray-500">Automatically backup data daily</p>
                </div>
                <Switch 
                  id="auto-backup"
                  checked={settings?.auto_backup || false}
                  onCheckedChange={(checked) => handleSettingChange('auto_backup', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="real-time-sync">Real-time Sync</Label>
                  <p className="text-sm text-gray-500">Enable real-time data synchronization</p>
                </div>
                <Switch 
                  id="real-time-sync"
                  checked={settings?.real_time_sync || true}
                  onCheckedChange={(checked) => handleSettingChange('real_time_sync', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateways</CardTitle>
              <CardDescription>Configure payment processing options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Razorpay */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Razorpay</h3>
                        <p className="text-sm text-gray-500">Accept payments via UPI, Cards, Net Banking</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {paymentGateways?.find((g: any) => g.name === 'razorpay')?.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Switch 
                        checked={paymentGateways?.find((g: any) => g.name === 'razorpay')?.isActive || false}
                        onCheckedChange={(checked) => {
                          updatePaymentGatewayMutation.mutate({
                            name: 'razorpay',
                            displayName: 'Razorpay',
                            isActive: checked,
                            configuration: {}
                          });
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="razorpay-key">API Key</Label>
                      <Input 
                        id="razorpay-key" 
                        type="password"
                        placeholder="Enter Razorpay API Key"
                      />
                    </div>
                    <div>
                      <Label htmlFor="razorpay-secret">API Secret</Label>
                      <Input 
                        id="razorpay-secret" 
                        type="password"
                        placeholder="Enter Razorpay Secret"
                      />
                    </div>
                  </div>
                </div>

                {/* Stripe */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Stripe</h3>
                        <p className="text-sm text-gray-500">International payment processing</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {paymentGateways?.find((g: any) => g.name === 'stripe')?.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Switch 
                        checked={paymentGateways?.find((g: any) => g.name === 'stripe')?.isActive || false}
                        onCheckedChange={(checked) => {
                          updatePaymentGatewayMutation.mutate({
                            name: 'stripe',
                            displayName: 'Stripe',
                            isActive: checked,
                            configuration: {}
                          });
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stripe-public">Public Key</Label>
                      <Input 
                        id="stripe-public" 
                        placeholder="Enter Stripe Public Key"
                      />
                    </div>
                    <div>
                      <Label htmlFor="stripe-secret">Secret Key</Label>
                      <Input 
                        id="stripe-secret" 
                        type="password"
                        placeholder="Enter Stripe Secret Key"
                      />
                    </div>
                  </div>
                </div>

                {/* PayPal */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">PayPal</h3>
                        <p className="text-sm text-gray-500">PayPal payment processing</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {paymentGateways?.find((g: any) => g.name === 'paypal')?.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Switch 
                        checked={paymentGateways?.find((g: any) => g.name === 'paypal')?.isActive || false}
                        onCheckedChange={(checked) => {
                          updatePaymentGatewayMutation.mutate({
                            name: 'paypal',
                            displayName: 'PayPal',
                            isActive: checked,
                            configuration: {}
                          });
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="paypal-client">Client ID</Label>
                      <Input 
                        id="paypal-client" 
                        placeholder="Enter PayPal Client ID"
                      />
                    </div>
                    <div>
                      <Label htmlFor="paypal-secret">Client Secret</Label>
                      <Input 
                        id="paypal-secret" 
                        type="password"
                        placeholder="Enter PayPal Secret"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <Switch 
                  id="email-notifications"
                  checked={settings?.email_notifications || true}
                  onCheckedChange={(checked) => handleSettingChange('email_notifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                </div>
                <Switch 
                  id="sms-notifications"
                  checked={settings?.sms_notifications || false}
                  onCheckedChange={(checked) => handleSettingChange('sms_notifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-gray-500">Receive browser push notifications</p>
                </div>
                <Switch 
                  id="push-notifications"
                  checked={settings?.push_notifications || true}
                  onCheckedChange={(checked) => handleSettingChange('push_notifications', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme & Appearance</CardTitle>
              <CardDescription>Customize the look and feel of your admin panel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select 
                  defaultValue={settings?.theme || "system"}
                  onValueChange={(value) => {
                    handleSettingChange('theme', value);
                    applyTheme(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accent-color">Accent Color</Label>
                <Select 
                  defaultValue={settings?.accent_color || "blue"}
                  onValueChange={(value) => handleSettingChange('accent_color', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select accent color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="compact-mode">Compact Mode</Label>
                <Switch
                  id="compact-mode"
                  checked={settings?.compact_mode || false}
                  onCheckedChange={(checked) => handleSettingChange('compact_mode', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sidebar-collapsed">Sidebar Collapsed by Default</Label>
                <Switch
                  id="sidebar-collapsed"
                  checked={settings?.sidebar_collapsed || false}
                  onCheckedChange={(checked) => handleSettingChange('sidebar_collapsed', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Keys Management</CardTitle>
              <CardDescription>Configure API keys for external services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">Gemini AI API Key</h3>
                      <p className="text-sm text-gray-500">Used for AI insights and analytics</p>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gemini-key">API Key</Label>
                    <Input 
                      id="gemini-key" 
                      type="password"
                      placeholder="Enter your Gemini API key"
                      value={settings?.gemini_api_key || ''}
                      onChange={(e) => handleSettingChange('gemini_api_key', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">WhatsApp Business API</h3>
                      <p className="text-sm text-gray-500">For sending notifications and alerts</p>
                    </div>
                    <Badge variant={settings?.whatsapp_token ? "secondary" : "outline"}>
                      {settings?.whatsapp_token ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp-token">Access Token</Label>
                      <Input 
                        id="whatsapp-token" 
                        type="password"
                        placeholder="Enter WhatsApp Business API token (starts with EAA...)"
                        value={settings?.whatsapp_token || ''}
                        onChange={(e) => handleSettingChange('whatsapp_token', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp-phone-id">Phone Number ID</Label>
                      <Input 
                        id="whatsapp-phone-id" 
                        type="text"
                        placeholder="Enter your WhatsApp Business phone number ID"
                        value={settings?.whatsapp_phone_number_id || ''}
                        onChange={(e) => handleSettingChange('whatsapp_phone_number_id', e.target.value)}
                      />
                    </div>
                    <div className="text-sm text-gray-500">
                      <p>Need help setting up? <a href="/WHATSAPP_SETUP_GUIDE.md" target="_blank" className="text-blue-600 hover:underline">View Setup Guide</a></p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="icons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Icon Management
                <Button size="sm" onClick={() => document.getElementById('icon-upload')?.click()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Icon
                </Button>
                <input
                  id="icon-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      toast({
                        title: "Icon Upload",
                        description: "Icon upload functionality will be implemented",
                      });
                    }
                  }}
                />
              </CardTitle>
              <CardDescription>Customize icons used throughout the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-8 gap-4">
                {icons?.map((icon: any) => (
                  <div key={icon.id} className="border rounded-lg p-3 text-center hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="w-8 h-8 mx-auto mb-2 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                      <Zap className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-medium">{icon.name}</p>
                    <div className="flex justify-center gap-1 mt-2">
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {icons?.length === 0 && (
                  <div className="col-span-8 text-center py-8 text-gray-500">
                    No custom icons uploaded yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </div>
                <Switch 
                  id="two-factor"
                  checked={settings?.two_factor_auth || false}
                  onCheckedChange={(checked) => handleSettingChange('two_factor_auth', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-logout">Auto Logout</Label>
                  <p className="text-sm text-gray-500">Automatically log out after inactivity</p>
                </div>
                <Switch 
                  id="auto-logout"
                  checked={settings?.auto_logout || true}
                  onCheckedChange={(checked) => handleSettingChange('auto_logout', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaigns</CardTitle>
              <CardDescription>Manage your WhatsApp campaigns and automated messages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Button onClick={() => window.location.href = '/campaigns'} className="mb-4">
                  Go to Campaigns
                </Button>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create and manage automated WhatsApp campaigns for fee reminders, welcome messages, and more.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced-reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Reports</CardTitle>
              <CardDescription>Custom report builder with advanced analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Button onClick={() => window.location.href = '/advanced-reports'} className="mb-4">
                  Go to Advanced Reports
                </Button>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create custom reports with advanced filters and data visualization.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>



        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Button onClick={() => window.location.href = '/user-management'} className="mb-4">
                  Go to User Management
                </Button>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create and manage user accounts with role-based permissions.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gps-tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>GPS Tracking</CardTitle>
              <CardDescription>Real-time location tracking and geofencing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Button onClick={() => window.location.href = '/gps-tracking'} className="mb-4">
                  Go to GPS Tracking
                </Button>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Monitor coach locations in real-time with geofencing capabilities.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}