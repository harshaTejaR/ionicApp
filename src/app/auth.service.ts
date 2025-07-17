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
        registeredAt: new Date().toISOString()
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

  async signOut(): Promise<void> {
    try {
      await GoogleAuth.signOut();
      this.currentUserSubject.next(null);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const googleUser = await GoogleAuth.signIn();
      if (googleUser) {
        const user: User = {
          id: googleUser.id,
          email: googleUser.email,
          name: googleUser.name,
          imageUrl: googleUser.imageUrl,
          registeredAt: new Date().toISOString()
        };
        this.currentUserSubject.next(user);
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
}
