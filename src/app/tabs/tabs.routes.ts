import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
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
        path: 'profile',
        loadComponent: () =>
          import('../profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: '',
        redirectTo: '/tabs/inventory',
        pathMatch: 'full',
      },
    ],
  },
];
