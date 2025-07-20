import { Injectable } from '@angular/core';
import { 
  IInventoryService, 
  InventoryItem, 
  CreateInventoryItem, 
  UpdateInventoryItem 
} from '../../interfaces';
import { StorageService } from '../base/storage.service';
import { SurfaceAreaCalculatorService } from './surface-area-calculator.service';

@Injectable({
  providedIn: 'root'
})
export class InventoryService implements IInventoryService {
  private inventoryItems: InventoryItem[] = [];
  private readonly STORAGE_KEY = 'inventoryItems';

  constructor(
    private storageService: StorageService,
    private surfaceAreaCalculator: SurfaceAreaCalculatorService
  ) {
    this.loadFromStorage();
  }

  getInventory(): InventoryItem[] {
    return [...this.inventoryItems];
  }

  getItem(id: string): InventoryItem | undefined {
    return this.inventoryItems.find(item => item.id === id);
  }

  addItem(item: CreateInventoryItem): void {
    const newItem: InventoryItem = { 
      id: this.generateId(), 
      ...item, 
      timestamp: new Date().toISOString(),
      dateAdded: new Date().toLocaleString()
    };
    
    // Calculate total surface area if dimensions are provided
    if (item.dimensions && this.surfaceAreaCalculator.validateDimensions(item.dimensions)) {
      newItem.totalSurfaceArea = this.surfaceAreaCalculator.calculateSurfaceArea(
        item.dimensions, 
        item.quantity
      );
    }
    
    this.inventoryItems.push(newItem);
    this.saveToStorage();
  }

  updateItem(id: string, updatedItem: UpdateInventoryItem): void {
    const index = this.inventoryItems.findIndex(item => item.id === id);
    if (index > -1) {
      // Preserve the original timestamp when updating
      this.inventoryItems[index] = { 
        ...this.inventoryItems[index], 
        ...updatedItem,
        lastModified: new Date().toLocaleString()
      };
      
      // Recalculate total surface area if quantity or dimensions are updated
      if (updatedItem.quantity !== undefined || updatedItem.dimensions !== undefined) {
        const item = this.inventoryItems[index];
        if (item.dimensions && this.surfaceAreaCalculator.validateDimensions(item.dimensions)) {
          item.totalSurfaceArea = this.surfaceAreaCalculator.calculateSurfaceArea(
            item.dimensions, 
            item.quantity
          );
        } else {
          // If dimensions are not valid, remove surface area
          delete item.totalSurfaceArea;
        }
      }
      
      this.saveToStorage();
    }
  }

  deleteItem(id: string): void {
    this.inventoryItems = this.inventoryItems.filter(item => item.id !== id);
    this.saveToStorage();
  }

  // Additional utility methods
  getItemsByCategory(category: string): InventoryItem[] {
    return this.inventoryItems.filter(item => item.category === category);
  }

  getTotalItems(): number {
    return this.inventoryItems.reduce((total, item) => total + item.quantity, 0);
  }

  getTotalValue(): number {
    return this.inventoryItems.reduce((total, item) => {
      return total + (item.price || 0) * item.quantity;
    }, 0);
  }

  searchItems(query: string): InventoryItem[] {
    const lowercaseQuery = query.toLowerCase();
    return this.inventoryItems.filter(item => 
      item.name.toLowerCase().includes(lowercaseQuery) ||
      item.description?.toLowerCase().includes(lowercaseQuery) ||
      item.category?.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Private methods
  private loadFromStorage(): void {
    try {
      const storedItems = this.storageService.getFromLocalStorage(this.STORAGE_KEY);
      if (storedItems) {
        this.inventoryItems = storedItems;
      }
    } catch (error) {
      console.error('Error loading inventory from storage:', error);
      this.inventoryItems = [];
    }
  }

  private saveToStorage(): void {
    try {
      this.storageService.setToLocalStorage(this.STORAGE_KEY, this.inventoryItems);
    } catch (error) {
      console.error('Error saving inventory to storage:', error);
    }
  }

  private generateId(): string {
    return Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
