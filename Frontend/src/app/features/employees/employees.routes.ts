import { Routes } from '@angular/router';

export const EMPLOYEE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/employee-list/employee-list').then(m => m.EmployeeListComponent)
  }
];
