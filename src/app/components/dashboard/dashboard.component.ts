import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GroupService } from '../../services/group.service';
import { StudentService } from '../../services/student.service';
import { ActivityService } from '../../services/activity.service';
import { ProgressService } from '../../services/progress.service';
import { Group } from '../../models/group.model';
import { Student } from '../../models/student.model';
import { Activity } from '../../models/activity.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

interface ProgressStats {
  achieved: number;
  in_progress: number;
  not_achieved: number;
  total: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private groupService = inject(GroupService);
  private studentService = inject(StudentService);
  private activityService = inject(ActivityService);
  private progressService = inject(ProgressService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  groups: Group[] = [];
  students: Student[] = [];
  activities: Activity[] = [];
  progressStats: ProgressStats = {
    achieved: 0,
    in_progress: 0,
    not_achieved: 0,
    total: 0
  };
  loading = true;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    let completedRequests = 0;
    const totalRequests = 4;

    const checkComplete = () => {
      completedRequests++;
      if (completedRequests === totalRequests) {
        this.loading = false;
      }
    };

    this.groupService.getGroups().subscribe({
      next: (response) => {
        this.groups = response.groups;
        checkComplete();
      },
      error: (error) => {
        console.error('Error loading groups:', error);
        checkComplete();
      }
    });

    this.studentService.getStudents().subscribe({
      next: (response) => {
        this.students = response.students;
        checkComplete();
      },
      error: (error) => {
        console.error('Error loading students:', error);
        checkComplete();
      }
    });

    this.activityService.getActivities().subscribe({
      next: (response) => {
        this.activities = response.activities;
        checkComplete();
      },
      error: (error) => {
        console.error('Error loading activities:', error);
        checkComplete();
      }
    });

    this.progressService.getProgress().subscribe({
      next: (response) => {
        this.calculateProgressStats(response.progress);
        checkComplete();
      },
      error: (error) => {
        console.error('Error loading progress:', error);
        checkComplete();
      }
    });
  }

  calculateProgressStats(progressList: any[]): void {
    this.progressStats = {
      achieved: progressList.filter(p => p.progress_status === 'achieved').length,
      in_progress: progressList.filter(p => p.progress_status === 'in_progress').length,
      not_achieved: progressList.filter(p => p.progress_status === 'not_achieved').length,
      total: progressList.length
    };
  }

  get recentStudents(): Student[] {
    return this.students.slice(0, 5);
  }

  get pendingActivities(): Activity[] {
    return this.activities
      .filter(activity => activity.status === 'pending')
      .slice(0, 5);
  }

  get completedActivities(): Activity[] {
    return this.activities.filter(activity => activity.status === 'completed');
  }

  get achievementRate(): number {
    if (this.progressStats.total === 0) return 0;
    return Math.round((this.progressStats.achieved / this.progressStats.total) * 100);
  }

  get activeGroups(): Group[] {
    return this.groups.filter(group => group.is_active);
  }

  get studentsWithSpecialNeeds(): Student[] {
    return this.students.filter(student =>
      student.disability_type && student.disability_type.trim() !== ''
    );
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
        const updatedActivity = {
          ...activity,
          status: 'completed'
        };

        this.activityService.updateActivity(activity.id, updatedActivity).subscribe({
          next: () => {
            this.snackBar.open('Actividad marcada como completada', 'Cerrar', { duration: 3000 });
            this.loadDashboardData();
          },
          error: (error) => {
            console.error('Error completing activity:', error);
            this.snackBar.open('Error al completar la actividad', 'Cerrar', { duration: 5000 });
          }
        });
      }
    });
  }

  getActivityStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'primary';
      case 'pending': return 'accent';
      case 'in_progress': return 'warn';
      default: return '';
    }
  }

  getProgressStatusLabel(status: string): string {
    switch (status) {
      case 'achieved': return 'Logrado';
      case 'in_progress': return 'En Progreso';
      case 'not_achieved': return 'No Logrado';
      default: return status;
    }
  }
}
