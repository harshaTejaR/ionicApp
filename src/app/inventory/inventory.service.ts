import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private inventoryItems: any[] = [];

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

  addItem(item: { name: string, quantity: number }) {
    const newItem = { 
      id: Date.now().toString(), 
      ...item, 
      timestamp: new Date().toISOString(),
      dateAdded: new Date().toLocaleString()
    };
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
      this.saveToLocalStorage();
    }
  }

  deleteItem(id: string) {
    this.inventoryItems = this.inventoryItems.filter(item => item.id !== id);
    this.saveToLocalStorage();
  }
}