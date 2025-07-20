import { Injectable } from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { IStorageService } from '../../interfaces';

@Injectable({
  providedIn: 'root'
})
export class StorageService implements IStorageService {
  
  async get(key: string): Promise<any> {
    try {
      const result = await Filesystem.readFile({
        path: `${key}.json`,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
      
      return JSON.parse(result.data as string);
    } catch (error) {
      console.log(`No ${key} file found`);
      return null;
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      await Filesystem.writeFile({
        path: `${key}.json`,
        data: JSON.stringify(value, null, 2),
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await Filesystem.deleteFile({
        path: `${key}.json`,
        directory: Directory.Data,
      });
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  }

  async clear(): Promise<void> {
    try {
      // This would need to be implemented based on specific requirements
      // For now, we'll just log the operation
      console.log('Storage clear operation called');
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  // Helper methods for localStorage compatibility
  getFromLocalStorage(key: string): any {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return null;
    }
  }

  setToLocalStorage(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key} to localStorage:`, error);
    }
  }

  removeFromLocalStorage(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }
}
