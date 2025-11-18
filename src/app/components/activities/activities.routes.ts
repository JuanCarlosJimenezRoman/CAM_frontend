import { Routes } from '@angular/router';

export const ACTIVITY_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./activity-list/activity-list.component').then(m => m.ActivityListComponent) },
  { path: 'new', loadComponent: () => import('./activity-form/activity-form.component').then(m => m.ActivityFormComponent) },
  { path: ':id/edit', loadComponent: () => import('./activity-form/activity-form.component').then(m => m.ActivityFormComponent) },
  { path: ':id', loadComponent: () => import('./activity-detail/activity-detail.component').then(m => m.ActivityDetailComponent) }
];
