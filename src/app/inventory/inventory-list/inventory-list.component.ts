import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../inventory.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
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

  constructor(private inventoryService: InventoryService, private router: Router) { }

  ngOnInit() {
    this.loadInventory();
  }

  ionViewWillEnter() {
    this.loadInventory();
  }

  loadInventory() {
    this.inventoryItems = this.inventoryService.getInventory();
    this.filteredItems = [...this.inventoryItems];
  }

  handleSearch(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredItems = this.inventoryItems.filter(item => item.name.toLowerCase().includes(query));
  }

  addItem() {
    this.router.navigate(['/tabs/inventory/add']);
  }

  editItem(id: string) {
    this.router.navigate([`/tabs/inventory/edit/${id}`]);
  }
}