import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../inventory/inventory.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { calendarOutline, createOutline, archiveOutline } from 'ionicons/icons';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inventory-list',
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class InventoryListComponent  implements OnInit {
  inventoryItems: any[] = [];
  filteredItems: any[] = [];

  constructor(private inventoryService: InventoryService, private router: Router) {
    addIcons({ calendarOutline, createOutline, archiveOutline });
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
    this.filteredItems = this.inventoryItems.filter(item => item.name.toLowerCase().includes(query));
  }


  editItem(id: string) {
    this.router.navigate([`/tabs/inventory/edit/${id}`]);
  }
}