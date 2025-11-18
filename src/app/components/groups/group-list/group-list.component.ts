import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GroupService } from '../../../services/group.service';
import { Group } from '../../../models/group.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatChip } from "@angular/material/chips";

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinner,
    MatChip
],
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css']
})
export class GroupListComponent implements OnInit {
  private groupService = inject(GroupService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  groups: Group[] = [];
  loading = true;

  displayedColumns: string[] = ['name', 'level', 'description', 'studentsCount', 'actions'];
activeGroupsCount: any;

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.loading = true;
    this.groupService.getGroups().subscribe({
      next: (response) => {
        this.groups = response.groups;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading groups:', error);
        this.snackBar.open('Error al cargar los grupos', 'Cerrar', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  deleteGroup(group: Group): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Grupo',
        message: `¿Estás seguro de que quieres eliminar el grupo "${group.name}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.groupService.deleteGroup(group.id).subscribe({
          next: () => {
            this.snackBar.open('Grupo eliminado exitosamente', 'Cerrar', { duration: 3000 });
            this.loadGroups();
          },
          error: (error) => {
            console.error('Error deleting group:', error);
            this.snackBar.open('Error al eliminar el grupo', 'Cerrar', { duration: 5000 });
          }
        });
      }
    });
  }

  viewGroup(group: Group): void {
    this.router.navigate(['/groups', group.id]);
  }

  editGroup(group: Group): void {
    this.router.navigate(['/groups', group.id, 'edit']);
  }
}
