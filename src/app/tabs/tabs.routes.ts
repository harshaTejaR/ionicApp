import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'inventory',
        loadChildren: () => import('../inventory/inventory.module').then(m => m.InventoryModule)
      },
      {
        path: 'add-items',
        loadComponent: () =>
          import('./add-items/add-items.page').then((m) => m.AddItemsPage),
      },
      {
        path: '',
        redirectTo: '/tabs/inventory',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/inventory',
    pathMatch: 'full',
  },
];
