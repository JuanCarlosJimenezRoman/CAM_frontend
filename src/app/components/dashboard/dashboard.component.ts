import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GroupService } from '../../services/group.service';
import { StudentService } from '../../services/student.service';
import { ActivityService } from '../../services/activity.service';
import { Group } from '../../models/group.model';
import { Student } from '../../models/student.model';
import { Activity } from '../../models/activity.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatGridListModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private groupService = inject(GroupService);
  private studentService = inject(StudentService);
  private activityService = inject(ActivityService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  groups: Group[] = [];
  students: Student[] = [];
  activities: Activity[] = [];
  loading = true;


  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    this.groupService.getGroups().subscribe({
      next: (response) => {
        this.groups = response.groups;
      },
      error: (error) => console.error('Error loading groups:', error)
    });

    this.studentService.getStudents().subscribe({
      next: (response) => {
        this.students = response.students;
      },
      error: (error) => console.error('Error loading students:', error)
    });

    this.activityService.getActivities().subscribe({
      next: (response) => {
        this.activities = response.activities;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading activities:', error);
        this.loading = false;
      }
    });
  }

  get recentStudents(): Student[] {
    return this.students.slice(0, 5);
  }

  get pendingActivities(): Activity[] {
    return this.activities
      .filter(activity => activity.status === 'pending')
      .slice(0, 5);
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

}
