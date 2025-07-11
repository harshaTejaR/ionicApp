import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InventoryListComponent } from '../components/inventory-list/inventory-list.component';
import { InventoryAddComponent } from '../components/inventory-add/inventory-add.component';
import { InventoryEditComponent } from '../components/inventory-edit/inventory-edit.component';

const routes: Routes = [
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
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }