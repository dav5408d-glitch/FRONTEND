const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface User {
  id: string;
  email: string;
  name?: string;
  plan?: 'BAS' | 'FREE' | 'PRO' | 'ELITE';
  isPaid?: boolean;
  subscriptionStatus?: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    try {
      // Validation client-side
      if (!email || !password) {
        throw new Error('Email and password required');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      if (!email.includes('@')) {
        throw new Error('Invalid email format');
      }

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Registration failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.token) {
        this.setToken(data.token);
      }
      if (data.user) {
        this.setUser(data.user);
      }
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      if (!email || !password) {
        throw new Error('Email and password required');
      }

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.token) {
        this.setToken(data.token);
      }
      if (data.user) {
        this.setUser(data.user);
      }
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      // Note: In production, consider using httpOnly cookies set by backend
      localStorage.setItem(this.tokenKey, token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem(this.userKey);
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      // Decode JWT without verification (check expiry)
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const decoded = JSON.parse(atob(parts[1]));
      const exp = decoded.exp * 1000; // Convert to ms
      return Date.now() < exp;
    } catch {
      return false;
    }
  }

  isPaidUser(): boolean {
    const user = this.getUser();
    return user?.isPaid === true || (user?.plan !== 'FREE' && user?.plan !== undefined);
  }

  getPlan(): string {
    const user = this.getUser();
    return user?.plan || 'FREE';
  }

  canUseAI(): boolean {
    return this.isPaidUser();
  }

  async refreshProfile(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token) return null;

      const response = await fetch(`${API_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout(); // Token invalid, logout user
        }
        throw new Error('Failed to refresh profile');
      }

      const data = await response.json();
      this.setUser(data.user);
      return data.user;
    } catch (error) {
      console.error('Error refreshing profile:', error);
      return null;
    }
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
  }

  updateUserPlan(plan: 'BAS' | 'FREE' | 'PRO' | 'ELITE'): void {
    const user = this.getUser();
    if (user) {
      user.plan = plan;
      user.isPaid = plan !== 'FREE';
      this.setUser(user);
    }
  }

  async updatePlanOnBackend(plan: 'BAS' | 'FREE' | 'PRO' | 'ELITE'): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) return false;

      const response = await fetch(`${API_URL}/api/auth/update-plan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      });

      if (!response.ok) {
        throw new Error('Failed to update plan');
      }

      const data = await response.json();
      this.setToken(data.token);
      this.setUser(data.user);
      return true;
    } catch (error) {
      console.error('Error updating plan:', error);
      return false;
    }
  }
}

export const authService = new AuthService();