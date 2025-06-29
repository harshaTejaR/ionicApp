import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../inventory.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inventory-edit',
  templateUrl: './inventory-edit.component.html',
  styleUrls: ['./inventory-edit.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class InventoryEditComponent  implements OnInit {
  itemId: string | null = null;
  itemName: string = '';
  quantity: number = 0;

  constructor(
    private inventoryService: InventoryService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.itemId = this.route.snapshot.paramMap.get('id');
    if (this.itemId) {
      const item = this.inventoryService.getItem(this.itemId);
      if (item) {
        this.itemName = item.name;
        this.quantity = item.quantity;
      }
    }
  }

  saveItem() {
    if (this.itemId) {
      this.inventoryService.updateItem(this.itemId, { name: this.itemName, quantity: this.quantity });
      this.router.navigate(['/tabs/inventory']);
    }
  }

  deleteItem() {
    if (this.itemId) {
      this.inventoryService.deleteItem(this.itemId);
      this.router.navigate(['/tabs/inventory']);
    }
  }

  cancel() {
    this.router.navigate(['/tabs/inventory']);
  }
}