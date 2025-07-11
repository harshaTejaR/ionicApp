import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonInput, IonButton } from '@ionic/angular/standalone';
import { InventoryService } from '../../inventory/inventory.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-items',
  templateUrl: './add-items.page.html',
  styleUrls: ['./add-items.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonInput, IonButton, CommonModule, FormsModule]
})
export class AddItemsPage implements OnInit {
  itemName: string = '';
  quantity: number = 0;

  constructor(private inventoryService: InventoryService, private router: Router) { }

  ngOnInit() {
  }

  saveItem() {
    if (this.itemName.trim() && this.quantity > 0) {
      this.inventoryService.addItem({ name: this.itemName, quantity: this.quantity });
      this.itemName = '';
      this.quantity = 0;
      // Navigate to inventory tab to see the added item
      this.router.navigate(['/tabs/inventory']);
    }
  }

  cancel() {
    this.itemName = '';
    this.quantity = 0;
  }

}
