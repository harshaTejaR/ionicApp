import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../inventory/inventory.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inventory-add',
  templateUrl: './inventory-add.component.html',
  styleUrls: ['./inventory-add.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class InventoryAddComponent  implements OnInit {
  itemName: string = '';
  quantity: number = 0;

  constructor(private inventoryService: InventoryService, private router: Router) { }

  ngOnInit() { }

  saveItem() {
    this.inventoryService.addItem({ name: this.itemName, quantity: this.quantity });
    this.router.navigate(['/tabs/inventory']);
  }

  cancel() {
    this.router.navigate(['/tabs/inventory']);
  }
}