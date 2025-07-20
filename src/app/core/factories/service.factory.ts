import { Injectable } from '@angular/core';
import { 
  IServiceFactory, 
  IAuthService, 
  IInventoryService, 
  IWorkProgressService 
} from '../interfaces';
import { AuthService } from '../services/auth/auth.service';
import { InventoryService } from '../services/inventory/inventory.service';
import { WorkProgressService } from '../services/work-progress/work-progress.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceFactory implements IServiceFactory {
  
  constructor(
    private authService: AuthService,
    private inventoryService: InventoryService,
    private workProgressService: WorkProgressService
  ) {}

  createAuthService(): IAuthService {
    return this.authService;
  }

  createInventoryService(): IInventoryService {
    return this.inventoryService;
  }

  createWorkProgressService(): IWorkProgressService {
    return this.workProgressService;
  }
}

// Alternative factory implementations can be created for different environments
@Injectable()
export class MockServiceFactory implements IServiceFactory {
  
  createAuthService(): IAuthService {
    // Return mock implementation for testing
    return new MockAuthService();
  }

  createInventoryService(): IInventoryService {
    // Return mock implementation for testing
    return new MockInventoryService();
  }

  createWorkProgressService(): IWorkProgressService {
    // Return mock implementation for testing
    return new MockWorkProgressService();
  }
}

// Mock implementations for testing
import { BehaviorSubject } from 'rxjs';

class MockAuthService implements IAuthService {
  currentUser$ = new BehaviorSubject<any>(null).asObservable();
  
  async signInWithGoogle() { return null; }
  async registerWithEmail(email: string, password: string, name: string) { 
    return { id: 'mock', email, name, registeredAt: '', authMethod: 'email' as const }; 
  }
  async signInWithEmail(email: string, password: string) { 
    return { id: 'mock', email, name: 'Mock User', registeredAt: '', authMethod: 'email' as const }; 
  }
  async signOut() {}
  async getCurrentUser() { return null; }
  getCurrentUserSync() { return null; }
  getUserByEmail(email: string) { return undefined; }
  isAuthenticated() { return false; }
  async requestPasswordReset(email: string) {}
  async resetPassword(email: string, token: string, newPassword: string) {}
}

class MockInventoryService implements IInventoryService {
  getInventory() { return []; }
  getItem(id: string) { return undefined; }
  addItem(item: any) {}
  updateItem(id: string, updatedItem: any) {}
  deleteItem(id: string) {}
}

class MockWorkProgressService implements IWorkProgressService {
  async saveWorkProgress(data: any) {}
  async getWorkProgress(userId?: string) { return null; }
  async clearWorkProgress(userId?: string) {}
  async restoreWorkProgress() {}
}
