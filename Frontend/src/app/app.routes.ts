import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'employees',
    pathMatch: 'full'
  },
  {
    path: 'employees',
    loadChildren: () => import('./features/employees/employees.routes').then(m => m.EMPLOYEE_ROUTES)
  },
  {
    path: 'users',
    loadComponent: () => import('./features/users-placeholder/users-placeholder').then(m => m.UsersPlaceholderComponent)
  },
  {
    path: '**',
    redirectTo: 'employees'
  }
];
