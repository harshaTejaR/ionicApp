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
    if (item.dimensions && item.dimensions.length > 0 && item.dimensions.width > 0) {
      let singleItemSurfaceArea: number;
      
      if (item.dimensions.thickness > 0) {
        // Surface Area = 2 × (Length × Width + Length × Thickness + Width × Thickness)
        singleItemSurfaceArea = 2 * (
          (item.dimensions.length * item.dimensions.width) + 
          (item.dimensions.length * item.dimensions.thickness) + 
          (item.dimensions.width * item.dimensions.thickness)
        );
      } else {
        // Surface Area = Length × Width (for flat items)
        singleItemSurfaceArea = item.dimensions.length * item.dimensions.width;
      }
      
      const totalSurfaceArea = singleItemSurfaceArea * item.quantity;
      
      // Convert to square feet based on input unit
      const unit = item.dimensions.unit;
      let surfaceAreaInSqFt: number;
      
      if (unit === 'cm') {
        // 1 cm² = 0.00107639 ft²
        surfaceAreaInSqFt = totalSurfaceArea * 0.00107639;
      } else if (unit === 'mm') {
        // 1 mm² = 0.0000107639 ft²
        surfaceAreaInSqFt = totalSurfaceArea * 0.0000107639;
      } else if (unit === 'in') {
        // 1 in² = 0.00694444 ft²
        surfaceAreaInSqFt = totalSurfaceArea * 0.00694444;
      } else if (unit === 'm') {
        // 1 m² = 10.7639 ft²
        surfaceAreaInSqFt = totalSurfaceArea * 10.7639;
      } else {
        // Already in ft²
        surfaceAreaInSqFt = totalSurfaceArea;
      }
      
      newItem.totalSurfaceArea = {
        value: surfaceAreaInSqFt,
        unit: 'ft²',
        formatted: `${surfaceAreaInSqFt.toFixed(2)} ft²`
      };
    }
    
    this.inventoryItems.push(newItem);
    this.saveToLocalStorage();
  }

  updateItem(id: string, updatedItem: { name?: string, quantity?: number, dimensions?: { length: number, width: number, thickness: number, unit: string } }) {
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
        if (item.dimensions && item.dimensions.length > 0 && item.dimensions.width > 0) {
          let singleItemSurfaceArea: number;
          
          if (item.dimensions.thickness > 0) {
            // Surface Area = 2 × (Length × Width + Length × Thickness + Width × Thickness)
            singleItemSurfaceArea = 2 * (
              (item.dimensions.length * item.dimensions.width) + 
              (item.dimensions.length * item.dimensions.thickness) + 
              (item.dimensions.width * item.dimensions.thickness)
            );
          } else {
            // Surface Area = Length × Width (for flat items)
            singleItemSurfaceArea = item.dimensions.length * item.dimensions.width;
          }
          
          const totalSurfaceArea = singleItemSurfaceArea * item.quantity;
          
          // Convert to square feet based on input unit
          const unit = item.dimensions.unit;
          let surfaceAreaInSqFt: number;
          
          if (unit === 'cm') {
            // 1 cm² = 0.00107639 ft²
            surfaceAreaInSqFt = totalSurfaceArea * 0.00107639;
          } else if (unit === 'mm') {
            // 1 mm² = 0.0000107639 ft²
            surfaceAreaInSqFt = totalSurfaceArea * 0.0000107639;
          } else if (unit === 'in') {
            // 1 in² = 0.00694444 ft²
            surfaceAreaInSqFt = totalSurfaceArea * 0.00694444;
          } else if (unit === 'm') {
            // 1 m² = 10.7639 ft²
            surfaceAreaInSqFt = totalSurfaceArea * 10.7639;
          } else {
            // Already in ft²
            surfaceAreaInSqFt = totalSurfaceArea;
          }
          
          item.totalSurfaceArea = {
            value: surfaceAreaInSqFt,
            unit: 'ft²',
            formatted: `${surfaceAreaInSqFt.toFixed(2)} ft²`
          };
        } else {
          // If dimensions are not valid, remove surface area
          delete item.totalSurfaceArea;
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