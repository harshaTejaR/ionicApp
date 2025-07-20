import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { calendarOutline, createOutline, archiveOutline } from 'ionicons/icons';
import { FormsModule } from '@angular/forms';
import { ServiceFactory, IInventoryService, InventoryItem } from '../../../../core';

@Component({
  selector: 'app-inventory-list',
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class InventoryListComponent implements OnInit {
  inventoryItems: InventoryItem[] = [];
  filteredItems: InventoryItem[] = [];

  private inventoryService: IInventoryService;

  constructor(
    private serviceFactory: ServiceFactory, 
    private router: Router
  ) {
    addIcons({ calendarOutline, createOutline, archiveOutline });
    this.inventoryService = this.serviceFactory.createInventoryService();
  }

  ngOnInit() {
    this.loadInventory();
  }

  ionViewWillEnter() {
    this.loadInventory();
  }

  loadInventory() {
    this.inventoryItems = this.inventoryService.getInventory();
    // Sort by timestamp (newest first)
    this.inventoryItems.sort((a, b) => {
      const timeA = new Date(a.timestamp || 0).getTime();
      const timeB = new Date(b.timestamp || 0).getTime();
      return timeB - timeA;
    });
    this.filteredItems = [...this.inventoryItems];
  }

  handleSearch(event: any) {
    const query = event.target.value.toLowerCase();
    if (query.trim() === '') {
      this.filteredItems = [...this.inventoryItems];
    } else {
      this.filteredItems = this.inventoryService.searchItems(query);
    }
  }

  editItem(id: string) {
    this.router.navigate([`/tabs/inventory/edit/${id}`]);
  }

  deleteItem(id: string) {
    this.inventoryService.deleteItem(id);
    this.loadInventory(); // Refresh the list
  }

  getTotalItems(): number {
    return this.inventoryService.getTotalItems();
  }

  getTotalValue(): number {
    return this.inventoryService.getTotalValue();
  }

  getItemsByCategory(category: string): InventoryItem[] {
    return this.inventoryService.getItemsByCategory(category);
  }
}
