import { db } from "./db";
import { users, userRoles, permissions } from "@shared/schema";
import { eq, and, inArray, sql } from "drizzle-orm";

export interface CreateUserData {
  name: string;
  email?: string;
  phone: string;
  role: string;
  permissions: string[];
  createdBy: number;
}

export interface UserPermission {
  name: string;
  displayName: string;
  description?: string;
  category: string;
}

export class UserPermissionService {
  // Default permissions for each role
  private readonly DEFAULT_PERMISSIONS = {
    admin: [
      'users.create', 'users.read', 'users.update', 'users.delete',
      'students.create', 'students.read', 'students.update', 'students.delete',
      'payments.create', 'payments.read', 'payments.update', 'payments.delete',
      'attendance.create', 'attendance.read', 'attendance.update', 'attendance.delete',
      'coaches.create', 'coaches.read', 'coaches.update', 'coaches.delete',
      'reports.create', 'reports.read', 'reports.update', 'reports.delete',
      'settings.read', 'settings.update',
      'campaigns.create', 'campaigns.read', 'campaigns.update', 'campaigns.delete',
      'location.read', 'location.update', 'geofences.create', 'geofences.read', 'geofences.update', 'geofences.delete'
    ],
    manager: [
      'users.read', 'users.update',
      'students.create', 'students.read', 'students.update',
      'payments.create', 'payments.read', 'payments.update',
      'attendance.create', 'attendance.read', 'attendance.update',
      'coaches.read', 'coaches.update',
      'reports.create', 'reports.read',
      'campaigns.create', 'campaigns.read', 'campaigns.update',
      'location.read', 'geofences.read'
    ],
    staff: [
      'students.create', 'students.read', 'students.update',
      'payments.create', 'payments.read',
      'attendance.create', 'attendance.read',
      'coaches.read',
      'reports.read',
      'location.read'
    ],
    coach: [
      'students.read',
      'attendance.create', 'attendance.read',
      'reports.read',
      'location.read'
    ],
    student: [
      'students.read',
      'attendance.read',
      'payments.read'
    ]
  };

  // Initialize default permissions in database
  async initializeDefaultPermissions(): Promise<void> {
    try {
      // Check if permissions table exists
      const tableExists = await this.checkTableExists();
      if (!tableExists) {
        console.log('Permissions table does not exist yet. Skipping initialization.');
        return;
      }
      
      const permissionsList: UserPermission[] = [
        // User permissions
        { name: 'users.create', displayName: 'Create Users', description: 'Create new user accounts', category: 'users' },
        { name: 'users.read', displayName: 'View Users', description: 'View user information', category: 'users' },
        { name: 'users.update', displayName: 'Update Users', description: 'Update user information', category: 'users' },
        { name: 'users.delete', displayName: 'Delete Users', description: 'Delete user accounts', category: 'users' },
        
        // Student permissions
        { name: 'students.create', displayName: 'Create Students', description: 'Register new students', category: 'students' },
        { name: 'students.read', displayName: 'View Students', description: 'View student information', category: 'students' },
        { name: 'students.update', displayName: 'Update Students', description: 'Update student information', category: 'students' },
        { name: 'students.delete', displayName: 'Delete Students', description: 'Delete student records', category: 'students' },
        
        // Payment permissions
        { name: 'payments.create', displayName: 'Record Payments', description: 'Record new payments', category: 'payments' },
        { name: 'payments.read', displayName: 'View Payments', description: 'View payment records', category: 'payments' },
        { name: 'payments.update', displayName: 'Update Payments', description: 'Update payment records', category: 'payments' },
        { name: 'payments.delete', displayName: 'Delete Payments', description: 'Delete payment records', category: 'payments' },
        
        // Attendance permissions
        { name: 'attendance.create', displayName: 'Mark Attendance', description: 'Mark student attendance', category: 'attendance' },
        { name: 'attendance.read', displayName: 'View Attendance', description: 'View attendance records', category: 'attendance' },
        { name: 'attendance.update', displayName: 'Update Attendance', description: 'Update attendance records', category: 'attendance' },
        { name: 'attendance.delete', displayName: 'Delete Attendance', description: 'Delete attendance records', category: 'attendance' },
        
        // Coach permissions
        { name: 'coaches.create', displayName: 'Add Coaches', description: 'Add new coaches', category: 'coaches' },
        { name: 'coaches.read', displayName: 'View Coaches', description: 'View coach information', category: 'coaches' },
        { name: 'coaches.update', displayName: 'Update Coaches', description: 'Update coach information', category: 'coaches' },
        { name: 'coaches.delete', displayName: 'Delete Coaches', description: 'Delete coach records', category: 'coaches' },
        
        // Report permissions
        { name: 'reports.create', displayName: 'Create Reports', description: 'Create custom reports', category: 'reports' },
        { name: 'reports.read', displayName: 'View Reports', description: 'View generated reports', category: 'reports' },
        { name: 'reports.update', displayName: 'Update Reports', description: 'Update report configurations', category: 'reports' },
        { name: 'reports.delete', displayName: 'Delete Reports', description: 'Delete report configurations', category: 'reports' },
        
        // Settings permissions
        { name: 'settings.read', displayName: 'View Settings', description: 'View system settings', category: 'settings' },
        { name: 'settings.update', displayName: 'Update Settings', description: 'Update system settings', category: 'settings' },
        
        // Campaign permissions
        { name: 'campaigns.create', displayName: 'Create Campaigns', description: 'Create marketing campaigns', category: 'campaigns' },
        { name: 'campaigns.read', displayName: 'View Campaigns', description: 'View campaign information', category: 'campaigns' },
        { name: 'campaigns.update', displayName: 'Update Campaigns', description: 'Update campaign settings', category: 'campaigns' },
        { name: 'campaigns.delete', displayName: 'Delete Campaigns', description: 'Delete campaigns', category: 'campaigns' },
        
        // Location permissions
        { name: 'location.read', displayName: 'View Locations', description: 'View location tracking data', category: 'location' },
        { name: 'location.update', displayName: 'Update Locations', description: 'Update location settings', category: 'location' },
        
        // Geofence permissions
        { name: 'geofences.create', displayName: 'Create Geofences', description: 'Create new geofences', category: 'geofences' },
        { name: 'geofences.read', displayName: 'View Geofences', description: 'View geofence information', category: 'geofences' },
        { name: 'geofences.update', displayName: 'Update Geofences', description: 'Update geofence settings', category: 'geofences' },
        { name: 'geofences.delete', displayName: 'Delete Geofences', description: 'Delete geofences', category: 'geofences' }
      ];

      // Insert permissions if they don't exist
      for (const permission of permissionsList) {
        const [existing] = await db.select().from(permissions)
          .where(eq(permissions.name, permission.name));
        
        if (!existing) {
          await db.insert(permissions).values(permission);
        }
      }
    } catch (error) {
      console.error('Error initializing default permissions:', error);
    }
  }

  // Check if table exists
  private async checkTableExists(): Promise<boolean> {
    try {
      await db.select({ count: sql`COUNT(*)` }).from(permissions).limit(1);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Create a new user with role and permissions
  async createUser(userData: CreateUserData): Promise<any> {
    try {
      // Get default permissions for the role
      const defaultPermissions = this.DEFAULT_PERMISSIONS[userData.role as keyof typeof this.DEFAULT_PERMISSIONS] || [];
      
      // Combine default permissions with custom permissions
      const userPermissions = [...new Set([...defaultPermissions, ...userData.permissions])];
      
      const [user] = await db.insert(users).values({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        permissions: userPermissions,
        createdBy: userData.createdBy
      }).returning();
      
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Check if user has specific permission
  async hasPermission(userId: number, permission: string): Promise<boolean> {
    try {
      const [user] = await db.select().from(users)
        .where(and(eq(users.id, userId), eq(users.isActive, true)));
      
      if (!user) return false;
      
      const userPermissions = user.permissions as string[] || [];
      return userPermissions.includes(permission);
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  // Get user permissions
  async getUserPermissions(userId: number): Promise<string[]> {
    try {
      const [user] = await db.select().from(users)
        .where(eq(users.id, userId));
      
      if (!user) return [];
      
      return user.permissions as string[] || [];
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }

  // Update user permissions
  async updateUserPermissions(userId: number, permissions: string[]): Promise<any> {
    try {
      const [user] = await db.update(users)
        .set({ 
          permissions: permissions,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();
      
      return user;
    } catch (error) {
      console.error('Error updating user permissions:', error);
      throw error;
    }
  }

  // Get all users with their permissions
  async getUsers(): Promise<any[]> {
    try {
      const userList = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        permissions: users.permissions,
        isActive: users.isActive,
        lastLogin: users.lastLogin,
        createdAt: users.createdAt
      }).from(users);
      
      return userList;
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }

  // Get all available permissions
  async getPermissions(): Promise<any[]> {
    try {
      return await db.select().from(permissions)
        .where(eq(permissions.isActive, true));
    } catch (error) {
      console.error('Error getting permissions:', error);
      throw error;
    }
  }

  // Update user role
  async updateUserRole(userId: number, newRole: string): Promise<any> {
    try {
      const defaultPermissions = this.DEFAULT_PERMISSIONS[newRole as keyof typeof this.DEFAULT_PERMISSIONS] || [];
      
      const [user] = await db.update(users)
        .set({ 
          role: newRole,
          permissions: defaultPermissions,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();
      
      return user;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  // Deactivate user
  async deactivateUser(userId: number): Promise<any> {
    try {
      const [user] = await db.update(users)
        .set({ 
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();
      
      return user;
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  }

  // Activate user
  async activateUser(userId: number): Promise<any> {
    try {
      const [user] = await db.update(users)
        .set({ 
          isActive: true,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();
      
      return user;
    } catch (error) {
      console.error('Error activating user:', error);
      throw error;
    }
  }
}

// Middleware to check permissions
export const checkPermission = (requiredPermission: string) => {
  return async (req: any, res: any, next: any) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const userPermissionService = new UserPermissionService();
      const hasPermission = await userPermissionService.hasPermission(userId, requiredPermission);
      
      if (!hasPermission) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

export const userPermissionService = new UserPermissionService();