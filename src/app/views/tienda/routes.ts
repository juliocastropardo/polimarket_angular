import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Tienda'
    },
    children: [
      {
        path: '',
        redirectTo: 'tienda',
        pathMatch: 'full'
      },
      {
        path: 'ventas',
        loadComponent: () => import('./ventas/ventas.component').then(m => m.VentasComponent),
        data: {
          title: 'Ventas'
        }
      }
    ]
  }
];
