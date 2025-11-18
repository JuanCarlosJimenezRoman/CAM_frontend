import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StudentService } from '../../../services/student.service';
import { ActivityService } from '../../../services/activity.service';
import { ProgressService } from '../../../services/progress.service';
import { Student, StudentProgress } from '../../../models/student.model';
import { Activity } from '../../../models/activity.model';
import { Progress } from '../../../models/progress.model';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSnackBarModule,
    MatProgressSpinner,
    MatDialogModule
],
  templateUrl: './student-detail.component.html',
  styleUrls: ['./student-detail.component.css']
})
export class StudentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private studentService = inject(StudentService);
  private activityService = inject(ActivityService);
  private progressService = inject(ProgressService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  student: Student | null = null;
  progressData: StudentProgress | null = null;
  activities: Activity[] = [];
  progress: Progress[] = [];
  loading = true;

  ngOnInit(): void {
    const studentId = this.route.snapshot.paramMap.get('id');
    if (studentId) {
      this.loadStudentDetail(studentId);
      this.loadStudentProgress(studentId);
    }
  }

  loadStudentDetail(studentId: string): void {
    this.studentService.getStudentById(studentId).subscribe({
      next: (response) => {
        this.student = response.student;
      },
      error: (error) => {
        console.error('Error loading student:', error);
        this.snackBar.open('Error al cargar el estudiante', 'Cerrar', { duration: 5000 });
      }
    });
  }

  loadStudentProgress(studentId: string): void {
    this.studentService.getStudentProgress(studentId).subscribe({
      next: (response) => {
        this.progressData = response;
        this.activities = response.activities;
        this.progress = response.progress;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading student progress:', error);
        this.snackBar.open('Error al cargar el progreso', 'Cerrar', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  editStudent(): void {
    if (this.student) {
      this.router.navigate(['/students', this.student.id, 'edit']);
    }
  }

  addActivity(): void {
    this.router.navigate(['/activities/new'], {
      queryParams: { student_id: this.student?.id }
    });
  }

  addProgress(): void {
    this.router.navigate(['/progress/new'], {
      queryParams: { student_id: this.student?.id }
    });
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

  completeActivity(activity: Activity): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Marcar como Completada',
        message: `¿Estás seguro de que quieres marcar la actividad "${activity.title}" como completada?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.activityService.updateActivity(activity.id, { status: 'completed' }).subscribe({
          next: () => {
            this.snackBar.open('Actividad marcada como completada', 'Cerrar', { duration: 3000 });
            this.loadStudentProgress(this.student!.id);
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
        this.activityService.updateActivity(activity.id, { status: 'pending' }).subscribe({
          next: () => {
            this.snackBar.open('Actividad reabierta', 'Cerrar', { duration: 3000 });
            this.loadStudentProgress(this.student!.id);
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
