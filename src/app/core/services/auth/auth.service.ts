import { Injectable } from '@angular/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { Platform } from '@ionic/angular';
import { environment } from '../../../../environments/environment';
import { IAuthService, User, AuthCredentials, ResetPasswordData } from '../../interfaces';
import { StorageService } from '../base/storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements IAuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  private users: User[] = [];
  private readonly USERS_STORAGE_KEY = 'users';

  constructor(
    private platform: Platform,
    private storageService: StorageService
  ) {
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

      const existingUser = this.users.find(u => u.id === user.id);
      
      if (!existingUser) {
        this.users.push(user);
        await this.saveUsers();
        console.log('New user saved to storage');
      } else {
        Object.assign(existingUser, user);
        await this.saveUsers();
        console.log('Existing user updated in storage');
      }

      this.currentUserSubject.next(user);
      this.saveUserSession(user);
      return user;
    } catch (error: any) {
      console.error('Google Sign In failed:', error);
      throw this.handleAuthError(error);
    }
  }

  async registerWithEmail(email: string, password: string, name: string): Promise<User> {
    try {
      const existingUser = this.getUserByEmail(email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      if (!this.isValidEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const user: User = {
        id: this.generateUserId(),
        email: email.toLowerCase(),
        name: name,
        registeredAt: new Date().toISOString(),
        authMethod: 'email',
        password: await this.hashPassword(password)
      };

      this.users.push(user);
      await this.saveUsers();

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
      const user = this.getUserByEmail(email.toLowerCase());
      if (!user) {
        throw new Error('Invalid email or password');
      }

      if (user.authMethod !== 'email') {
        throw new Error('This email is registered with a different method');
      }

      const isPasswordValid = await this.verifyPassword(password, user.password!);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

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
    const currentUser = this.getCurrentUserSync();
    if (currentUser) {
      return currentUser;
    }

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

  async requestPasswordReset(email: string): Promise<void> {
    const user = this.getUserByEmail(email.toLowerCase());
    if (!user) {
      throw new Error('Email not found');
    }
    if (user.authMethod !== 'email') {
      throw new Error('Password reset not supported for this account');
    }
    user.resetToken = this.generateToken();
    user.resetTokenExpiry = new Date(Date.now() + 3600000).toISOString();
    await this.saveUsers();
    console.log('Reset token generated and saved for user:', user.email);
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<void> {
    const user = this.getUserByEmail(email.toLowerCase());
    if (!user) {
      throw new Error('User not found');
    }
    if (!user.resetToken || user.resetToken !== token) {
      throw new Error('Invalid password reset token');
    }
    if (!user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
      throw new Error('Password reset token has expired');
    }
    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    user.password = await this.hashPassword(newPassword);
    delete user.resetToken;
    delete user.resetTokenExpiry;
    await this.saveUsers();
    console.log('Password reset successful for user:', user.email);
  }

  // Public utility methods
  getUserByEmail(email: string): User | undefined {
    return this.users.find(user => user.email === email);
  }

  getCurrentUserSync(): User | null {
    return this.currentUserSubject.value;
  }

  isEmailRegistered(email: string): boolean {
    return this.getUserByEmail(email.toLowerCase()) !== undefined;
  }

  getTotalUsers(): number {
    return this.users.length;
  }

  getUsersByAuthMethod(method: 'email' | 'google'): User[] {
    return this.users.filter(user => user.authMethod === method);
  }

  // Private methods
  private async loadUsers(): Promise<void> {
    try {
      const users = await this.storageService.get(this.USERS_STORAGE_KEY);
      this.users = users || [];
    } catch (error) {
      console.log('No users found, creating new storage');
      this.users = [];
      await this.saveUsers();
    }
  }

  private async saveUsers(): Promise<void> {
    try {
      await this.storageService.set(this.USERS_STORAGE_KEY, this.users);
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }

  private generateUserId(): string {
    return 'user_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private generateToken(): string {
    return Math.random().toString(36).substr(2, 15) + Date.now().toString(36);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async hashPassword(password: string): Promise<string> {
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

  private handleAuthError(error: any): Error {
    if (error?.error === 'popup_closed_by_user') {
      return new Error('Sign-in was cancelled. Please try again.');
    } else if (error?.error === 'access_denied') {
      return new Error('Access denied. Please grant permission to continue.');
    } else if (error?.message?.includes('redirect_uri_mismatch')) {
      return new Error('Authentication configuration error. Please contact support.');
    } else {
      return new Error('Sign-in failed. Please try again later.');
    }
  }

  private async restoreUserSession(): Promise<void> {
    try {
      const sessionUser = this.storageService.getFromLocalStorage('currentUser');
      if (sessionUser) {
        this.currentUserSubject.next(sessionUser);
        console.log('User session restored:', sessionUser);
      }
    } catch (error) {
      console.error('Failed to restore user session:', error);
    }
  }

  private saveUserSession(user: User): void {
    try {
      this.storageService.setToLocalStorage('currentUser', user);
    } catch (error) {
      console.error('Failed to save user session:', error);
    }
  }

  private clearUserSession(): void {
    try {
      this.storageService.removeFromLocalStorage('currentUser');
    } catch (error) {
      console.error('Failed to clear user session:', error);
    }
  }

  private async saveWorkProgressBeforeLogout(): Promise<void> {
    try {
      const currentUser = this.getCurrentUserSync();
      if (!currentUser) {
        return;
      }

      const currentState = {
        inventoryData: this.storageService.getFromLocalStorage('inventoryData') || [],
        currentTab: this.storageService.getFromLocalStorage('currentTab') || 'inventory',
        formData: this.storageService.getFromLocalStorage('formData') || {},
        timestamp: new Date().toISOString()
      };

      const workProgressKey = `work_progress_${currentUser.id}`;
      await this.storageService.set(workProgressKey, currentState);
      console.log('Work progress saved before logout');
    } catch (error) {
      console.error('Error saving work progress before logout:', error);
    }
  }
}
