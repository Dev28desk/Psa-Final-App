import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Users, UserPlus, Shield, Edit, Eye, EyeOff, Check, X, Settings, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  name: string;
  email?: string;
  phone: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface Permission {
  id: number;
  name: string;
  displayName: string;
  description: string;
  category: string;
  isActive: boolean;
}

const USER_ROLES = [
  { value: "admin", label: "Administrator", color: "bg-red-500" },
  { value: "manager", label: "Manager", color: "bg-blue-500" },
  { value: "staff", label: "Staff", color: "bg-green-500" },
  { value: "coach", label: "Coach", color: "bg-purple-500" },
  { value: "student", label: "Student", color: "bg-gray-500" }
];

export default function UserManagement() {
  const [selectedTab, setSelectedTab] = useState("users");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "student",
    permissions: [] as string[]
  });
  const [selectedRole, setSelectedRole] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/users");
      return response.json();
    }
  });

  // Fetch permissions
  const { data: permissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ["/api/permissions"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/permissions");
      return response.json();
    }
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest("POST", "/api/users", userData);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "User created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsCreateDialogOpen(false);
      setNewUser({ name: "", email: "", phone: "", role: "student", permissions: [] });
    },
    onError: (error: Error) => {
      toast({ title: "Error creating user", description: error.message, variant: "destructive" });
    }
  });

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const response = await apiRequest("PUT", `/api/users/${userId}/role`, { role });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "User role updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error updating user role", description: error.message, variant: "destructive" });
    }
  });

  // Update user permissions mutation
  const updateUserPermissionsMutation = useMutation({
    mutationFn: async ({ userId, permissions }: { userId: number; permissions: string[] }) => {
      const response = await apiRequest("PUT", `/api/users/${userId}/permissions`, { permissions });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "User permissions updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error updating user permissions", description: error.message, variant: "destructive" });
    }
  });

  // Activate/Deactivate user mutation
  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, activate }: { userId: number; activate: boolean }) => {
      const endpoint = activate ? "activate" : "deactivate";
      const response = await apiRequest("PUT", `/api/users/${userId}/${endpoint}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "User status updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error updating user status", description: error.message, variant: "destructive" });
    }
  });

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.phone) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    
    createUserMutation.mutate({
      ...newUser,
      createdBy: 1 // This should be the current user's ID
    });
  };

  const handleUpdatePermissions = (userId: number, permissions: string[]) => {
    updateUserPermissionsMutation.mutate({ userId, permissions });
    setIsPermissionDialogOpen(false);
    setEditingUser(null);
  };

  const filteredUsers = users?.filter((user: User) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    const matchesRole = selectedRole === "all" || selectedRole === "" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    const roleConfig = USER_ROLES.find(r => r.value === role);
    return roleConfig?.color || "bg-gray-500";
  };

  const groupedPermissions = permissions?.reduce((acc: any, permission: Permission) => {
    if (!acc[permission.category]) acc[permission.category] = [];
    acc[permission.category].push(permission);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Create a new user account with specified role and permissions
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="user-name">Name *</Label>
                <Input
                  id="user-name"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <Label htmlFor="user-email">Email</Label>
                <Input
                  id="user-email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <Label htmlFor="user-phone">Phone *</Label>
                <Input
                  id="user-phone"
                  value={newUser.phone}
                  onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <Label htmlFor="user-role">Role</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_ROLES.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCreateUser}
                  disabled={createUserMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Create User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {USER_ROLES.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {usersLoading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Users ({filteredUsers?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers?.map((user: User) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {user.email && <div>{user.email}</div>}
                              <div className="text-muted-foreground">{user.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getRoleColor(user.role)} text-white`}>
                              {USER_ROLES.find(r => r.value === user.role)?.label || user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={user.isActive}
                                onCheckedChange={(checked) => 
                                  toggleUserStatusMutation.mutate({ userId: user.id, activate: checked })
                                }
                              />
                              <Badge variant={user.isActive ? "default" : "secondary"}>
                                {user.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.lastLogin ? format(new Date(user.lastLogin), 'MMM dd, yyyy') : 'Never'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingUser(user);
                                  setIsPermissionDialogOpen(true);
                                }}
                              >
                                <Shield className="h-4 w-4" />
                              </Button>
                              <Select
                                value={user.role}
                                onValueChange={(value) => 
                                  updateUserRoleMutation.mutate({ userId: user.id, role: value })
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {USER_ROLES.map(role => (
                                    <SelectItem key={role.value} value={role.value}>
                                      {role.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          {permissionsLoading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedPermissions || {}).map(([category, perms]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="capitalize">{category} Permissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(perms as Permission[]).map((permission) => (
                        <div key={permission.id} className="p-3 border rounded-lg">
                          <div className="font-medium">{permission.displayName}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {permission.description}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            {permission.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Permissions Dialog */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User Permissions</DialogTitle>
            <DialogDescription>
              Manage permissions for {editingUser?.name}
            </DialogDescription>
          </DialogHeader>
          
          {editingUser && (
            <div className="space-y-6">
              {Object.entries(groupedPermissions || {}).map(([category, perms]) => (
                <div key={category}>
                  <h3 className="font-medium mb-3 capitalize">{category}</h3>
                  <div className="space-y-2">
                    {(perms as Permission[]).map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission.name}
                          checked={editingUser.permissions.includes(permission.name)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setEditingUser({
                                ...editingUser,
                                permissions: [...editingUser.permissions, permission.name]
                              });
                            } else {
                              setEditingUser({
                                ...editingUser,
                                permissions: editingUser.permissions.filter(p => p !== permission.name)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={permission.name} className="text-sm">
                          {permission.displayName}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleUpdatePermissions(editingUser.id, editingUser.permissions)}
                  disabled={updateUserPermissionsMutation.isPending}
                >
                  Update Permissions
                </Button>
                <Button variant="outline" onClick={() => setIsPermissionDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}