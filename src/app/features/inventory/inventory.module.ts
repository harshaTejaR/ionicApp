import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

// Import inventory components
import { InventoryListComponent } from './components/inventory-list/inventory-list.component';
import { InventoryAddComponent } from './components/inventory-add/inventory-add.component';
import { InventoryEditComponent } from './components/inventory-edit/inventory-edit.component';

// Inventory routing
const inventoryRoutes = [
  {
    path: '',
    component: InventoryListComponent
  },
  {
    path: 'add',
    component: InventoryAddComponent
  },
  {
    path: 'edit/:id',
    component: InventoryEditComponent
  }
];

@NgModule({
  declarations: [
    InventoryListComponent,
    InventoryAddComponent,
    InventoryEditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(inventoryRoutes)
  ],
  exports: [
    InventoryListComponent,
    InventoryAddComponent,
    InventoryEditComponent
  ]
})
export class InventoryModule { }
