import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../inventory/inventory.service';
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
  item: any = null;
  
  // Dimension fields
  length: number = 0;
  width: number = 0;
  thickness: number = 0;
  dimensionUnit: string = 'm';

  constructor(
    private inventoryService: InventoryService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.itemId = this.route.snapshot.paramMap.get('id');
    if (this.itemId) {
      this.item = this.inventoryService.getItem(this.itemId);
      if (this.item) {
        this.itemName = this.item.name;
        this.quantity = this.item.quantity;
        
        // Load dimension values if they exist
        if (this.item.dimensions) {
          this.length = this.item.dimensions.length || 0;
          this.width = this.item.dimensions.width || 0;
          this.thickness = this.item.dimensions.thickness || 0;
          this.dimensionUnit = this.item.dimensions.unit || 'm';
        }
      }
    }
  }

  saveItem() {
    if (this.itemId) {
      const updatedItem = {
        name: this.itemName,
        quantity: this.quantity,
        dimensions: {
          length: this.length,
          width: this.width,
          thickness: this.thickness,
          unit: this.dimensionUnit
        }
      };
      
      this.inventoryService.updateItem(this.itemId, updatedItem);
      this.router.navigate(['/tabs/inventory']);
    }
  }
  
  hasDimensions(): boolean {
    return this.length > 0 || this.width > 0 || this.thickness > 0;
  }
  
  getDimensionSummary(): string {
    return `${this.length.toFixed(2)} x ${this.width.toFixed(2)} x ${this.thickness.toFixed(2)} ${this.dimensionUnit}`;
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