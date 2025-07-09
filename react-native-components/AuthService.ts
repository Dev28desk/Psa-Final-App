import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export interface LoginCredentials {
  phone: string;
  password: string;
  userType: 'coach' | 'student';
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  type: 'coach' | 'student';
  sportId?: number;
  batchId?: number;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

class AuthService {
  private tokenKey = 'mobile-token';
  private userKey = 'mobile-user';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/mobile/auth/login', credentials);
      const data: AuthResponse = response.data;

      if (data.success) {
        await this.storeToken(data.token);
        await this.storeUser(data.user);
        
        // Set default authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      }

      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint
      await api.post('/mobile/auth/logout');
    } catch (error) {
      // Continue with local logout even if server call fails
      console.log('Logout server call failed, continuing with local logout');
    } finally {
      // Clear local storage
      await this.clearToken();
      await this.clearUser();
      
      // Remove authorization header
      delete api.defaults.headers.common['Authorization'];
    }
  }

  async checkAuthStatus(): Promise<{ isAuthenticated: boolean; user?: User }> {
    try {
      const token = await this.getToken();
      const user = await this.getUser();

      if (!token || !user) {
        return { isAuthenticated: false };
      }

      // Set authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Verify token with server
      const response = await api.get('/mobile/auth/check');
      
      if (response.data.success) {
        return { isAuthenticated: true, user };
      } else {
        // Token is invalid, clear local data
        await this.clearToken();
        await this.clearUser();
        return { isAuthenticated: false };
      }
    } catch (error) {
      // If token verification fails, clear local data
      await this.clearToken();
      await this.clearUser();
      return { isAuthenticated: false };
    }
  }

  private async storeToken(token: string): Promise<void> {
    await AsyncStorage.setItem(this.tokenKey, token);
  }

  private async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(this.tokenKey);
  }

  private async clearToken(): Promise<void> {
    await AsyncStorage.removeItem(this.tokenKey);
  }

  private async storeUser(user: User): Promise<void> {
    await AsyncStorage.setItem(this.userKey, JSON.stringify(user));
  }

  private async getUser(): Promise<User | null> {
    const userJson = await AsyncStorage.getItem(this.userKey);
    return userJson ? JSON.parse(userJson) : null;
  }

  private async clearUser(): Promise<void> {
    await AsyncStorage.removeItem(this.userKey);
  }

  async getCurrentUser(): Promise<User | null> {
    return await this.getUser();
  }

  async updateUser(user: User): Promise<void> {
    await this.storeUser(user);
  }

  async isLoggedIn(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  async getUserType(): Promise<'coach' | 'student' | null> {
    const user = await this.getUser();
    return user?.type || null;
  }
}

export default new AuthService();