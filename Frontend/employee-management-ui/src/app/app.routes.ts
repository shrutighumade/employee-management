import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Employee } from './pages/employee/employee';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { Login } from './pages/login/login';
import { PageNotFound } from './pages/page-not-found/page-not-found';
import { Register } from './pages/register/register';
import { ResetPassword } from './pages/reset-password/reset-password';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'register',
    component: Register,
    data: { renderMode: 'client' },
  },
  {
    path: 'login',
    component: Login,
    data: { renderMode: 'client' },
  },
  {
    path: 'forgot-password',
    component: ForgotPassword,
    data: { renderMode: 'client' },
  },
  {
    path: 'reset-password',
    component: ResetPassword,
    data: { renderMode: 'client' },
  },
  {
    path: 'dashboard',
    component: Dashboard,
    data: { renderMode: 'client' },
  },
  {
    path: 'employee',
    component: Employee,
    data: { renderMode: 'client' },
  },
  {
    path: '**',
    component: PageNotFound,
    data: { renderMode: 'client' },
  },
];
