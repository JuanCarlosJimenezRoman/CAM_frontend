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
import { ProgressService } from '../../../services/progress.service';
import { StudentService } from '../../../services/student.service';
import { ActivityService } from '../../../services/activity.service';
import { Progress } from '../../../models/progress.model';
import { Student } from '../../../models/student.model';
import { Activity } from '../../../models/activity.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MatProgressSpinner } from "@angular/material/progress-spinner";

@Component({
  selector: 'app-progress-list',
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
  templateUrl: './progress-list.component.html',
  styleUrls: ['./progress-list.component.css']
})
export class ProgressListComponent implements OnInit {
  private progressService = inject(ProgressService);
  private studentService = inject(StudentService);
  private activityService = inject(ActivityService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  progressRecords: Progress[] = [];
  students: Student[] = [];
  activities: Activity[] = [];
  filteredProgress: Progress[] = [];
  loading = true;
  selectedStudent: string = '';
  selectedActivity: string = '';

  displayedColumns: string[] = ['student', 'activity', 'progress_status', 'progress_date', 'notes', 'actions'];

  ngOnInit(): void {
    this.loadProgress();
    this.loadStudents();
    this.loadActivities();
  }

  loadProgress(): void {
    this.loading = true;
    this.progressService.getProgress().subscribe({
      next: (response) => {
        this.progressRecords = response.progress;
        this.filteredProgress = [...this.progressRecords];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading progress:', error);
        this.snackBar.open('Error al cargar los registros de progreso', 'Cerrar', { duration: 5000 });
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

  loadActivities(): void {
    this.activityService.getActivities().subscribe({
      next: (response) => {
        this.activities = response.activities;
      },
      error: (error) => {
        console.error('Error loading activities:', error);
      }
    });
  }

  filterProgress(): void {
    let filtered = [...this.progressRecords];

    if (this.selectedStudent) {
      filtered = filtered.filter(progress => progress.student_id === this.selectedStudent);
    }

    if (this.selectedActivity) {
      filtered = filtered.filter(progress => progress.activity_id === this.selectedActivity);
    }

    this.filteredProgress = filtered;
  }

  deleteProgress(progress: Progress): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Registro de Progreso',
        message: `¿Estás seguro de que quieres eliminar este registro de progreso?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.progressService.deleteProgress(progress.id).subscribe({
          next: () => {
            this.snackBar.open('Registro de progreso eliminado exitosamente', 'Cerrar', { duration: 3000 });
            this.loadProgress();
          },
          error: (error) => {
            console.error('Error deleting progress:', error);
            this.snackBar.open('Error al eliminar el registro de progreso', 'Cerrar', { duration: 5000 });
          }
        });
      }
    });
  }

  editProgress(progress: Progress): void {
    this.router.navigate(['/progress', progress.id, 'edit']);
  }

  getProgressStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'achieved': 'Logrado',
      'in_progress': 'En Progreso',
      'not_achieved': 'No Logrado'
    };
    return statusMap[status] || status;
  }

  getProgressStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'achieved': 'status-achieved',
      'in_progress': 'status-in-progress',
      'not_achieved': 'status-not-achieved'
    };
    return classMap[status] || '';
  }

  getStudentName(studentId: string): string {
    const student = this.students.find(s => s.id === studentId);
    return student ? student.name : 'Estudiante no encontrado';
  }

  getActivityTitle(activityId: string): string {
    const activity = this.activities.find(a => a.id === activityId);
    return activity ? activity.title : 'Actividad no encontrada';
  }
}
