import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  menuItems = [
    { path: '/Home', icon: 'home', label: 'Home' },
    { path: '/groups', icon: 'group', label: 'Grupos' },
    { path: '/students', icon: 'school', label: 'Estudiantes' },
    { path: '/activities', icon: 'assignment', label: 'Actividades' },
    { path: '/progress', icon: 'trending_up', label: 'Progreso' }
  ];
}
