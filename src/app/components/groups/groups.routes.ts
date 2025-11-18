import { Routes } from '@angular/router';

export const GROUP_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./group-list/group-list.component').then(m => m.GroupListComponent) },
  { path: 'new', loadComponent: () => import('./group-form/group-form.component').then(m => m.GroupFormComponent) },
  { path: ':id/edit', loadComponent: () => import('./group-form/group-form.component').then(m => m.GroupFormComponent) },
  { path: ':id', loadComponent: () => import('./group-detail/group-detail.component').then(m => m.GroupDetailComponent) }
];
