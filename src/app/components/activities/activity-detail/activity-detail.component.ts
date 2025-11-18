import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivityService } from '../../../services/activity.service';
import { ProgressService } from '../../../services/progress.service';
import { Activity } from '../../../models/activity.model';
import { Progress } from '../../../models/progress.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MatProgressSpinner } from "@angular/material/progress-spinner";

@Component({
  selector: 'app-activity-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinner
],
  templateUrl: './activity-detail.component.html',
  styleUrls: ['./activity-detail.component.css']
})
export class ActivityDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private activityService = inject(ActivityService);
  private progressService = inject(ProgressService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  activity: Activity | null = null;
  progressRecords: Progress[] = [];
  loading = true;

  ngOnInit(): void {
    const activityId = this.route.snapshot.paramMap.get('id');
    if (activityId) {
      this.loadActivityDetail(activityId);
      this.loadActivityProgress(activityId);
    }
  }

  loadActivityDetail(activityId: string): void {
    this.activityService.getActivityById(activityId).subscribe({
      next: (response) => {
        this.activity = response.activity;
      },
      error: (error) => {
        console.error('Error loading activity:', error);
        this.snackBar.open('Error al cargar la actividad', 'Cerrar', { duration: 5000 });
      }
    });
  }

  loadActivityProgress(activityId: string): void {
    this.progressService.getProgress(undefined, activityId).subscribe({
      next: (response) => {
        this.progressRecords = response.progress;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading progress:', error);
        this.snackBar.open('Error al cargar el progreso', 'Cerrar', { duration: 5000 });
        this.loading = false;
      }
    });
  }

completeActivity(): void {
  if (!this.activity) return;

  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    data: {
      title: 'Marcar como Completada',
      message: `¿Estás seguro de que quieres marcar la actividad "${this.activity.title}" como completada?`
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result && this.activity) {
      // Enviar el objeto completo con el status actualizado
      const updatedActivity = {
        ...this.activity,
        status: 'completed'
      };

      this.activityService.updateActivity(this.activity.id, updatedActivity).subscribe({
        next: (response) => {
          this.snackBar.open('Actividad marcada como completada', 'Cerrar', { duration: 3000 });
          this.loadActivityDetail(this.activity!.id);
        },
        error: (error) => {
          console.error('Error completing activity:', error);
          this.snackBar.open('Error al completar la actividad', 'Cerrar', { duration: 5000 });
        }
      });
    }
  });
}

reopenActivity(): void {
  if (!this.activity) return;

  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    data: {
      title: 'Reabrir Actividad',
      message: `¿Estás seguro de que quieres reabrir la actividad "${this.activity.title}"?`
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result && this.activity) {
      // Enviar el objeto completo con el status actualizado
      const updatedActivity = {
        ...this.activity,
        status: 'pending'
      };

      this.activityService.updateActivity(this.activity.id, updatedActivity).subscribe({
        next: (response) => {
          this.snackBar.open('Actividad reabierta', 'Cerrar', { duration: 3000 });
          this.loadActivityDetail(this.activity!.id);
        },
        error: (error) => {
          console.error('Error reopening activity:', error);
          this.snackBar.open('Error al reabrir la actividad', 'Cerrar', { duration: 5000 });
        }
      });
    }
  });
}

  editActivity(): void {
    if (this.activity) {
      this.router.navigate(['/activities', this.activity.id, 'edit']);
    }
  }

  addProgress(): void {
    this.router.navigate(['/progress/new'], {
      queryParams: {
        student_id: this.activity?.student_id,
        activity_id: this.activity?.id
      }
    });
  }

  getStatusText(status: string): string {
    return status === 'pending' ? 'Pendiente' : 'Completada';
  }

  getStatusClass(status: string): string {
    return status === 'pending' ? 'status-pending' : 'status-completed';
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
}
