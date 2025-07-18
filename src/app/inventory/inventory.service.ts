import { Injectable } from '@angular/core';

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  category?: string;
  price?: number;
  description?: string;
  dimensions?: {
    length: number;
    width: number;
    thickness: number;
    unit: string;
  };
  weight?: {
    value: number;
    unit: string;
  };
  totalSurfaceArea?: {
    value: number;
    unit: string;
    formatted: string;
  };
  timestamp: string;
  dateAdded: string;
  lastModified?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private inventoryItems: InventoryItem[] = [];

  constructor() {
    // Load from local storage if available
    const storedItems = localStorage.getItem('inventoryItems');
    if (storedItems) {
      this.inventoryItems = JSON.parse(storedItems);
    }
  }

  private saveToLocalStorage() {
    localStorage.setItem('inventoryItems', JSON.stringify(this.inventoryItems));
  }

  getInventory() {
    return [...this.inventoryItems];
  }

  getItem(id: string) {
    return this.inventoryItems.find(item => item.id === id);
  }

  addItem(item: { name: string, quantity: number, category?: string, price?: number, description?: string, dimensions?: { length: number, width: number, thickness: number, unit: string }, weight?: { value: number, unit: string } }) {
    const newItem: InventoryItem = { 
      id: Date.now().toString(), 
      ...item, 
      timestamp: new Date().toISOString(),
      dateAdded: new Date().toLocaleString()
    };
    
    // Calculate total surface area if dimensions are provided
    if (item.dimensions && item.dimensions.length > 0 && item.dimensions.width > 0 && item.dimensions.thickness > 0) {
      // Surface Area = 2 × (Length × Width + Length × Thickness + Width × Thickness)
      const singleItemSurfaceArea = 2 * (
        (item.dimensions.length * item.dimensions.width) + 
        (item.dimensions.length * item.dimensions.thickness) + 
        (item.dimensions.width * item.dimensions.thickness)
      );
      const totalSurfaceArea = singleItemSurfaceArea * item.quantity;
      
      // Format area with appropriate unit
      const unit = item.dimensions.unit;
      const areaUnit = unit === 'cm' ? 'cm²' : unit === 'mm' ? 'mm²' : unit === 'in' ? 'in²' : unit === 'ft' ? 'ft²' : 'm²';
      
      newItem.totalSurfaceArea = {
        value: totalSurfaceArea,
        unit: areaUnit,
        formatted: `${totalSurfaceArea.toFixed(2)} ${areaUnit}`
      };
    }
    
    this.inventoryItems.push(newItem);
    this.saveToLocalStorage();
  }

  updateItem(id: string, updatedItem: { name?: string, quantity?: number }) {
    const index = this.inventoryItems.findIndex(item => item.id === id);
    if (index > -1) {
      // Preserve the original timestamp when updating
      this.inventoryItems[index] = { 
        ...this.inventoryItems[index], 
        ...updatedItem,
        lastModified: new Date().toLocaleString()
      };
      
      // Recalculate total surface area if quantity is updated and dimensions exist
      if (updatedItem.quantity !== undefined) {
        const item = this.inventoryItems[index];
        if (item.dimensions && item.dimensions.length > 0 && item.dimensions.width > 0 && item.dimensions.thickness > 0) {
          // Surface Area = 2 × (Length × Width + Length × Thickness + Width × Thickness)
          const singleItemSurfaceArea = 2 * (
            (item.dimensions.length * item.dimensions.width) + 
            (item.dimensions.length * item.dimensions.thickness) + 
            (item.dimensions.width * item.dimensions.thickness)
          );
          const totalSurfaceArea = singleItemSurfaceArea * item.quantity;
          
          // Format area with appropriate unit
          const unit = item.dimensions.unit;
          const areaUnit = unit === 'cm' ? 'cm²' : unit === 'mm' ? 'mm²' : unit === 'in' ? 'in²' : unit === 'ft' ? 'ft²' : 'm²';
          
          item.totalSurfaceArea = {
            value: totalSurfaceArea,
            unit: areaUnit,
            formatted: `${totalSurfaceArea.toFixed(2)} ${areaUnit}`
          };
        }
      }
      
      this.saveToLocalStorage();
    }
  }

  deleteItem(id: string) {
    this.inventoryItems = this.inventoryItems.filter(item => item.id !== id);
    this.saveToLocalStorage();
  }
}