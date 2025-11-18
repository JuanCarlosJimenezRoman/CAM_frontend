import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'groups',
    loadChildren: () => import('./components/groups/groups.routes').then(m => m.GROUP_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'students',
    loadChildren: () => import('./components/students/students.routes').then(m => m.STUDENT_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'activities',
    loadChildren: () => import('./components/activities/activities.routes').then(m => m.ACTIVITY_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'progress',
    loadChildren: () => import('./components/progress/progress.routes').then(m => m.PROGRESS_ROUTES),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];
