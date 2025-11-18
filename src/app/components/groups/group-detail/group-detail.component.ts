import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { GroupService } from '../../../services/group.service';
import { StudentService } from '../../../services/student.service';
import { Group, GroupStats } from '../../../models/group.model';
import { Student } from '../../../models/student.model';
import { MatProgressSpinner } from "@angular/material/progress-spinner";

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSnackBarModule,
    MatProgressSpinner
],
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.css']
})
export class GroupDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private groupService = inject(GroupService);
  private studentService = inject(StudentService);
  private snackBar = inject(MatSnackBar);

  group: Group | null = null;
  students: Student[] = [];
  stats: GroupStats | null = null;
  loading = true;

  ngOnInit(): void {
    const groupId = this.route.snapshot.paramMap.get('id');
    if (groupId) {
      this.loadGroupDetail(groupId);
      this.loadGroupStudents(groupId);
      this.loadGroupStats(groupId);
    }
  }

  loadGroupDetail(groupId: string): void {
    this.groupService.getGroupById(groupId).subscribe({
      next: (response) => {
        this.group = response.group;
      },
      error: (error) => {
        console.error('Error loading group:', error);
        this.snackBar.open('Error al cargar el grupo', 'Cerrar', { duration: 5000 });
      }
    });
  }

  loadGroupStudents(groupId: string): void {
    this.studentService.getStudents(groupId).subscribe({
      next: (response) => {
        this.students = response.students;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.snackBar.open('Error al cargar los estudiantes', 'Cerrar', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  loadGroupStats(groupId: string): void {
    this.groupService.getGroupStats(groupId).subscribe({
      next: (response) => {
        this.stats = response.stats;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  editGroup(): void {
    if (this.group) {
      this.router.navigate(['/groups', this.group.id, 'edit']);
    }
  }

  addStudent(): void {
    this.router.navigate(['/students/new'], {
      queryParams: { group_id: this.group?.id }
    });
  }

  viewStudent(student: Student): void {
    this.router.navigate(['/students', student.id]);
  }

  getProgressCount(status: string): number {
  if (!this.stats?.progress_breakdown) return 0;
  const progress = this.stats.progress_breakdown.find(p => p.progress_status === status);
  return progress ? parseInt(progress.count) : 0;
}
}
