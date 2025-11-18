import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { ActivityService } from '../../../services/activity.service';
import { StudentService } from '../../../services/student.service';
import { Activity } from '../../../models/activity.model';
import { Student } from '../../../models/student.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MatProgressSpinner } from "@angular/material/progress-spinner";

@Component({
  selector: 'app-activity-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSnackBarModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinner
],
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.css']
})
export class ActivityListComponent implements OnInit {
  private activityService = inject(ActivityService);
  private studentService = inject(StudentService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  activities: Activity[] = [];
  students: Student[] = [];
  filteredActivities: Activity[] = [];
  loading = true;
  selectedStudent: string = '';

  displayedColumns: string[] = ['title', 'student', 'category', 'difficulty', 'status', 'dueDate', 'actions'];

  ngOnInit(): void {
    this.loadActivities();
    this.loadStudents();
  }

  loadActivities(): void {
    this.loading = true;
    this.activityService.getActivities().subscribe({
      next: (response) => {
        this.activities = response.activities;
        this.filteredActivities = [...this.activities];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading activities:', error);
        this.snackBar.open('Error al cargar las actividades', 'Cerrar', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  loadStudents(): void {
    this.studentService.getStudents().subscribe({
      next: (response) => {
        this.students = response.students;
      },
      error: (error) => {
        console.error('Error loading students:', error);
      }
    });
  }

  filterByStudent(): void {
    if (this.selectedStudent) {
      this.filteredActivities = this.activities.filter(activity =>
        activity.student_id === this.selectedStudent
      );
    } else {
      this.filteredActivities = [...this.activities];
    }
  }

  deleteActivity(activity: Activity): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Actividad',
        message: `¿Estás seguro de que quieres eliminar la actividad "${activity.title}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.activityService.deleteActivity(activity.id).subscribe({
          next: () => {
            this.snackBar.open('Actividad eliminada exitosamente', 'Cerrar', { duration: 3000 });
            this.loadActivities();
          },
          error: (error) => {
            console.error('Error deleting activity:', error);
            this.snackBar.open('Error al eliminar la actividad', 'Cerrar', { duration: 5000 });
          }
        });
      }
    });
  }

  viewActivity(activity: Activity): void {
    this.router.navigate(['/activities', activity.id]);
  }

  editActivity(activity: Activity): void {
    this.router.navigate(['/activities', activity.id, 'edit']);
  }

  getStatusText(status: string): string {
    return status === 'pending' ? 'Pendiente' : 'Completada';
  }

  getStatusClass(status: string): string {
    return status === 'pending' ? 'status-pending' : 'status-completed';
  }

  completeActivity(activity: Activity): void {
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    data: {
      title: 'Marcar como Completada',
      message: `¿Estás seguro de que quieres marcar la actividad "${activity.title}" como completada?`
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // Enviar el objeto completo con el status actualizado
      const updatedActivity = {
        ...activity,
        status: 'completed'
      };

      this.activityService.updateActivity(activity.id, updatedActivity).subscribe({
        next: () => {
          this.snackBar.open('Actividad marcada como completada', 'Cerrar', { duration: 3000 });
          this.loadActivities();
        },
        error: (error) => {
          console.error('Error completing activity:', error);
          this.snackBar.open('Error al completar la actividad', 'Cerrar', { duration: 5000 });
        }
      });
    }
  });
}

  reopenActivity(activity: Activity): void {
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    data: {
      title: 'Reabrir Actividad',
      message: `¿Estás seguro de que quieres reabrir la actividad "${activity.title}"?`
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // Enviar el objeto completo con el status actualizado
      const updatedActivity = {
        ...activity,
        status: 'pending'
      };

      this.activityService.updateActivity(activity.id, updatedActivity).subscribe({
        next: () => {
          this.snackBar.open('Actividad reabierta', 'Cerrar', { duration: 3000 });
          this.loadActivities();
        },
        error: (error) => {
          console.error('Error reopening activity:', error);
          this.snackBar.open('Error al reabrir la actividad', 'Cerrar', { duration: 5000 });
        }
      });
    }
  });
}
}
