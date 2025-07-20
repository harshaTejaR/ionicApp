import { Injectable } from '@angular/core';
import { IWorkProgressService, WorkProgress, AppState } from '../../interfaces';
import { StorageService } from '../base/storage.service';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class WorkProgressService implements IWorkProgressService {
  private readonly WORK_PROGRESS_STORAGE_KEY = 'work_progress';
  private workProgressData: WorkProgress[] = [];

  constructor(
    private storageService: StorageService,
    private authService: AuthService
  ) {
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
          this.storageService.setToLocalStorage('inventoryData', workProgress.inventoryData);
        }

        // Restore current tab
        if (workProgress.currentTab) {
          this.storageService.setToLocalStorage('currentTab', workProgress.currentTab);
        }

        // Restore form data
        if (workProgress.formData) {
          this.storageService.setToLocalStorage('formData', workProgress.formData);
        }

        console.log('Work progress restored successfully');
      }
    } catch (error) {
      console.error('Error restoring work progress:', error);
    }
  }

  // Additional utility methods
  async autoSaveWorkProgress(): Promise<void> {
    try {
      const currentUser = this.authService.getCurrentUserSync();
      if (!currentUser) {
        return;
      }

      const currentState: AppState = {
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

  async saveCurrentState(): Promise<void> {
    await this.autoSaveWorkProgress();
  }

  getAllUserProgress(): WorkProgress[] {
    return [...this.workProgressData];
  }

  async getProgressByDateRange(startDate: Date, endDate: Date): Promise<WorkProgress[]> {
    return this.workProgressData.filter(progress => {
      const progressDate = new Date(progress.lastSaved);
      return progressDate >= startDate && progressDate <= endDate;
    });
  }

  // Private methods
  private async loadWorkProgress(): Promise<void> {
    try {
      const progressData = await this.storageService.get(this.WORK_PROGRESS_STORAGE_KEY);
      this.workProgressData = progressData || [];
    } catch (error) {
      console.log('No work progress file found, creating new one');
      this.workProgressData = [];
    }
  }

  private async persistWorkProgress(): Promise<void> {
    try {
      await this.storageService.set(this.WORK_PROGRESS_STORAGE_KEY, this.workProgressData);
    } catch (error) {
      console.error('Error persisting work progress:', error);
    }
  }

  private getInventoryData(): any[] {
    return this.storageService.getFromLocalStorage('inventoryData') || [];
  }

  private getCurrentTab(): string {
    return this.storageService.getFromLocalStorage('currentTab') || 'inventory';
  }

  private getFormData(): any {
    return this.storageService.getFromLocalStorage('formData') || {};
  }
}
