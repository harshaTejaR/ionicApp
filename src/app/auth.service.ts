import { Injectable } from '@angular/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';
import { environment } from '../environments/environment';

export interface User {
  id: string;
  email: string;
  name: string;
  imageUrl?: string;
  registeredAt: string;
  authMethod: 'email' | 'google';
  password?: string; // Only for email auth (hashed)
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  private users: User[] = [];
  private readonly USERS_FILE = 'users.json';

  constructor(private platform: Platform) {
    this.initializeGoogleAuth();
    this.loadUsers();
    this.restoreUserSession();
  }

  private async initializeGoogleAuth() {
    try {
      await this.platform.ready();
      await GoogleAuth.initialize({
        clientId: environment.googleAuth.clientId,
        scopes: environment.googleAuth.scopes,
        grantOfflineAccess: true,
      });
    } catch (error) {
      console.error('Failed to initialize Google Auth:', error);
    }
  }

  async signInWithGoogle(): Promise<User | null> {
    try {
      console.log('Starting Google Sign In...');
      
      // Check if GoogleAuth is properly initialized
      if (!GoogleAuth) {
        console.error('GoogleAuth is not available');
        throw new Error('GoogleAuth is not properly initialized');
      }

      const googleUser = await GoogleAuth.signIn();
      console.log('Google Sign In successful:', googleUser);
      
      if (!googleUser || !googleUser.email) {
        console.error('Invalid Google user data received');
        throw new Error('Invalid user data received from Google');
      }

      const user: User = {
        id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        imageUrl: googleUser.imageUrl,
        registeredAt: new Date().toISOString(),
        authMethod: 'google'
      };

      console.log('User object created:', user);

      // Check if user already exists
      const existingUser = this.users.find(u => u.id === user.id);
      
      if (!existingUser) {
        this.users.push(user);
        await this.saveUsers();
        console.log('New user saved to local storage');
      } else {
        // Update existing user info
        Object.assign(existingUser, user);
        await this.saveUsers();
        console.log('Existing user updated in local storage');
      }

      this.currentUserSubject.next(user);
      this.saveUserSession(user);
      return user;
    } catch (error: any) {
      console.error('Google Sign In failed:', error);
      
      // Handle specific error types
      if (error?.error === 'popup_closed_by_user') {
        console.warn('User closed the Google sign-in popup');
        throw new Error('Sign-in was cancelled. Please try again.');
      } else if (error?.error === 'access_denied') {
        console.warn('User denied access to Google account');
        throw new Error('Access denied. Please grant permission to continue.');
      } else if (error?.message?.includes('redirect_uri_mismatch')) {
        console.error('OAuth configuration error');
        throw new Error('Authentication configuration error. Please contact support.');
      } else {
        console.error('Unknown sign-in error:', error);
        throw new Error('Sign-in failed. Please try again later.');
      }
    }
  }

  // Email/Password Authentication Methods
  async registerWithEmail(email: string, password: string, name: string): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = this.getUserByEmail(email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Validate email format
      if (!this.isValidEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate password
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Create new user
      const user: User = {
        id: this.generateUserId(),
        email: email.toLowerCase(),
        name: name,
        registeredAt: new Date().toISOString(),
        authMethod: 'email',
        password: await this.hashPassword(password)
      };

      // Save user
      this.users.push(user);
      await this.saveUsers();

      // Set current user (remove password from returned object)
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      this.currentUserSubject.next(userWithoutPassword);
      this.saveUserSession(userWithoutPassword);

      console.log('User registered successfully:', userWithoutPassword);
      return userWithoutPassword;
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      // Find user by email
      const user = this.getUserByEmail(email.toLowerCase());
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if user registered with email
      if (user.authMethod !== 'email') {
        throw new Error('This email is registered with a different method');
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(password, user.password!);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Set current user (remove password from returned object)
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      this.currentUserSubject.next(userWithoutPassword);
      this.saveUserSession(userWithoutPassword);

      console.log('User signed in successfully:', userWithoutPassword);
      return userWithoutPassword;
    } catch (error: any) {
      console.error('Sign in failed:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      // Save work progress before signing out
      await this.saveWorkProgressBeforeLogout();
      
      if (this.currentUserSubject.value?.authMethod === 'google') {
        await GoogleAuth.signOut();
      }
      this.currentUserSubject.next(null);
      this.clearUserSession();
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    // First check if we have a current user in session
    const currentUser = this.getCurrentUserSync();
    if (currentUser) {
      return currentUser;
    }

    // Only try Google Auth if no session exists and we need to authenticate
    try {
      const googleUser = await GoogleAuth.signIn();
      if (googleUser) {
        const user: User = {
          id: googleUser.id,
          email: googleUser.email,
          name: googleUser.name,
          imageUrl: googleUser.imageUrl,
          registeredAt: new Date().toISOString(),
          authMethod: 'google'
        };
        this.currentUserSubject.next(user);
        this.saveUserSession(user);
        return user;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getUsers(): User[] {
    return this.users;
  }

  getUserById(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.users.find(user => user.email === email);
  }

  private async loadUsers(): Promise<void> {
    try {
      const result = await Filesystem.readFile({
        path: this.USERS_FILE,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
      
      this.users = JSON.parse(result.data as string) || [];
    } catch (error) {
      console.log('No users file found, creating new one');
      this.users = [];
      await this.saveUsers();
    }
  }

  private async saveUsers(): Promise<void> {
    try {
      await Filesystem.writeFile({
        path: this.USERS_FILE,
        data: JSON.stringify(this.users, null, 2),
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }

  // Utility Methods
  private generateUserId(): string {
    return 'user_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async hashPassword(password: string): Promise<string> {
    // Simple hash function for demonstration
    // In production, use bcrypt or similar
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'salt_key_for_hashing');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    const hashedPassword = await this.hashPassword(password);
    return hashedPassword === hash;
  }

  // Get current user without triggering Google sign-in
  getCurrentUserSync(): User | null {
    return this.currentUserSubject.value;
  }

  // Check if email is already registered
  isEmailRegistered(email: string): boolean {
    return this.getUserByEmail(email.toLowerCase()) !== undefined;
  }

  // Get total registered users count
  getTotalUsers(): number {
    return this.users.length;
  }

  // Get users by auth method
  getUsersByAuthMethod(method: 'email' | 'google'): User[] {
    return this.users.filter(user => user.authMethod === method);
  }

  // Session management
  private async restoreUserSession(): Promise<void> {
    try {
      const sessionUser = localStorage.getItem('currentUser');
      if (sessionUser) {
        const user = JSON.parse(sessionUser);
        this.currentUserSubject.next(user);
        console.log('User session restored:', user);
      }
    } catch (error) {
      console.error('Failed to restore user session:', error);
    }
  }

  private saveUserSession(user: User): void {
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user session:', error);
    }
  }

  private clearUserSession(): void {
    try {
      localStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Failed to clear user session:', error);
    }
  }

  // Work progress saving before logout
  private async saveWorkProgressBeforeLogout(): Promise<void> {
    try {
      const currentUser = this.getCurrentUserSync();
      if (!currentUser) {
        return;
      }

      // Collect current app state
      const currentState = {
        inventoryData: this.getInventoryData(),
        currentTab: this.getCurrentTab(),
        formData: this.getFormData(),
        timestamp: new Date().toISOString()
      };

      // Save to filesystem
      const workProgressFile = `work_progress_${currentUser.id}.json`;
      await Filesystem.writeFile({
        path: workProgressFile,
        data: JSON.stringify(currentState, null, 2),
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });

      console.log('Work progress saved before logout');
    } catch (error) {
      console.error('Error saving work progress before logout:', error);
    }
  }

  // Helper methods to collect current app state
  private getInventoryData(): any[] {
    try {
      const inventoryData = localStorage.getItem('inventoryData');
      return inventoryData ? JSON.parse(inventoryData) : [];
    } catch {
      return [];
    }
  }

  private getCurrentTab(): string {
    return localStorage.getItem('currentTab') || 'inventory';
  }

  private getFormData(): any {
    try {
      const formData = localStorage.getItem('formData');
      return formData ? JSON.parse(formData) : {};
    } catch {
      return {};
    }
  }

  // Method to restore work progress after login
  async restoreWorkProgress(): Promise<void> {
    try {
      const currentUser = this.getCurrentUserSync();
      if (!currentUser) {
        return;
      }

      const workProgressFile = `work_progress_${currentUser.id}.json`;
      const result = await Filesystem.readFile({
        path: workProgressFile,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });

      const workProgress = JSON.parse(result.data as string);
      if (workProgress) {
        // Restore inventory data
        if (workProgress.inventoryData) {
          localStorage.setItem('inventoryData', JSON.stringify(workProgress.inventoryData));
        }

        // Restore current tab
        if (workProgress.currentTab) {
          localStorage.setItem('currentTab', workProgress.currentTab);
        }

        // Restore form data
        if (workProgress.formData) {
          localStorage.setItem('formData', JSON.stringify(workProgress.formData));
        }

        console.log('Work progress restored successfully');
      }
    } catch (error) {
      console.log('No work progress found or error restoring:', error);
    }
  }
}
