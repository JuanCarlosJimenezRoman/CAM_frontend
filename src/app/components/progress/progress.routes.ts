import { Routes } from '@angular/router';

export const PROGRESS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./progress-list/progress-list.component').then(m => m.ProgressListComponent) },
  { path: 'new', loadComponent: () => import('./progress-form/progress-form.component').then(m => m.ProgressFormComponent) },
  { path: ':id/edit', loadComponent: () => import('./progress-form/progress-form.component').then(m => m.ProgressFormComponent) }
];
