import { Injectable } from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { AuthService } from './auth.service';

export interface WorkProgress {
  userId: string;
  lastSaved: string;
  data: any; // Generic data structure for work progress
  inventoryData?: any[];
  currentTab?: string;
  formData?: any;
}

@Injectable({
  providedIn: 'root'
})
export class WorkProgressService {
  private readonly WORK_PROGRESS_FILE = 'work_progress.json';
  private workProgressData: WorkProgress[] = [];

  constructor(private authService: AuthService) {
    this.loadWorkProgress();
  }

  async saveWorkProgress(data: any): Promise<void> {
    try {
      const currentUser = this.authService.getCurrentUserSync();
      if (!currentUser) {
        console.warn('No user logged in, cannot save work progress');
        return;
      }

      const existingProgressIndex = this.workProgressData.findIndex(
        progress => progress.userId === currentUser.id
      );

      const workProgress: WorkProgress = {
        userId: currentUser.id,
        lastSaved: new Date().toISOString(),
        data: data,
        inventoryData: data.inventoryData || [],
        currentTab: data.currentTab || 'inventory',
        formData: data.formData || {}
      };

      if (existingProgressIndex >= 0) {
        this.workProgressData[existingProgressIndex] = workProgress;
      } else {
        this.workProgressData.push(workProgress);
      }

      await this.persistWorkProgress();
      console.log('Work progress saved successfully');
    } catch (error) {
      console.error('Error saving work progress:', error);
    }
  }

  async getWorkProgress(userId?: string): Promise<WorkProgress | null> {
    try {
      const currentUser = this.authService.getCurrentUserSync();
      const targetUserId = userId || currentUser?.id;
      
      if (!targetUserId) {
        return null;
      }

      const userProgress = this.workProgressData.find(
        progress => progress.userId === targetUserId
      );

      return userProgress || null;
    } catch (error) {
      console.error('Error getting work progress:', error);
      return null;
    }
  }

  async clearWorkProgress(userId?: string): Promise<void> {
    try {
      const currentUser = this.authService.getCurrentUserSync();
      const targetUserId = userId || currentUser?.id;
      
      if (!targetUserId) {
        return;
      }

      this.workProgressData = this.workProgressData.filter(
        progress => progress.userId !== targetUserId
      );

      await this.persistWorkProgress();
      console.log('Work progress cleared successfully');
    } catch (error) {
      console.error('Error clearing work progress:', error);
    }
  }

  async autoSaveWorkProgress(): Promise<void> {
    try {
      const currentUser = this.authService.getCurrentUserSync();
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

      await this.saveWorkProgress(currentState);
    } catch (error) {
      console.error('Error auto-saving work progress:', error);
    }
  }

  private async loadWorkProgress(): Promise<void> {
    try {
      const result = await Filesystem.readFile({
        path: this.WORK_PROGRESS_FILE,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
      
      this.workProgressData = JSON.parse(result.data as string) || [];
    } catch (error) {
      console.log('No work progress file found, creating new one');
      this.workProgressData = [];
    }
  }

  private async persistWorkProgress(): Promise<void> {
    try {
      await Filesystem.writeFile({
        path: this.WORK_PROGRESS_FILE,
        data: JSON.stringify(this.workProgressData, null, 2),
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
    } catch (error) {
      console.error('Error persisting work progress:', error);
    }
  }

  // Helper methods to collect current app state
  private getInventoryData(): any[] {
    // This would typically interface with your inventory service
    // For now, return empty array or get from localStorage
    const inventoryData = localStorage.getItem('inventoryData');
    return inventoryData ? JSON.parse(inventoryData) : [];
  }

  private getCurrentTab(): string {
    // Get current active tab from router or localStorage
    return localStorage.getItem('currentTab') || 'inventory';
  }

  private getFormData(): any {
    // Get any unsaved form data
    const formData = localStorage.getItem('formData');
    return formData ? JSON.parse(formData) : {};
  }

  // Public method to manually save current state
  async saveCurrentState(): Promise<void> {
    await this.autoSaveWorkProgress();
  }

  // Method to restore user's work progress
  async restoreWorkProgress(): Promise<void> {
    try {
      const currentUser = this.authService.getCurrentUserSync();
      if (!currentUser) {
        return;
      }

      const workProgress = await this.getWorkProgress(currentUser.id);
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
      console.error('Error restoring work progress:', error);
    }
  }
}
