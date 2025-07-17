import { Injectable } from '@angular/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';

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
    await this.platform.ready();
    await GoogleAuth.initialize({
      clientId: '1071050647044-3efo3l0fj7crdvlrv0m1b2gvfqgbkf45.apps.googleusercontent.com', // Replace with your actual client ID
      scopes: ['profile', 'email'],
      grantOfflineAccess: true,
    });
  }

  async signInWithGoogle(): Promise<User | null> {
    try {
      const googleUser = await GoogleAuth.signIn();
      
      const user: User = {
        id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        imageUrl: googleUser.imageUrl,
        registeredAt: new Date().toISOString()
      };

      // Check if user already exists
      const existingUser = this.users.find(u => u.id === user.id);
      
      if (!existingUser) {
        this.users.push(user);
        await this.saveUsers();
      } else {
        // Update existing user info
        Object.assign(existingUser, user);
        await this.saveUsers();
      }

      this.currentUserSubject.next(user);
      return user;
    } catch (error) {
      console.error('Google Sign In failed:', error);
      return null;
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
