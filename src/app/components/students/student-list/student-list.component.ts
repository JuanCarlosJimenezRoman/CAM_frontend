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
import { StudentService } from '../../../services/student.service';
import { GroupService } from '../../../services/group.service';
import { Student } from '../../../models/student.model';
import { Group } from '../../../models/group.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MatProgressSpinner } from "@angular/material/progress-spinner";

@Component({
  selector: 'app-student-list',
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
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css']
})
export class StudentListComponent implements OnInit {
  private studentService = inject(StudentService);
  private groupService = inject(GroupService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  students: Student[] = [];
  groups: Group[] = [];
  filteredStudents: Student[] = [];
  loading = true;
  selectedGroup: string = '';

  displayedColumns: string[] = ['name', 'group', 'disability', 'tutor', 'actions'];

  ngOnInit(): void {
    this.loadStudents();
    this.loadGroups();
  }

  loadStudents(): void {
    this.loading = true;
    this.studentService.getStudents().subscribe({
      next: (response) => {
        this.students = response.students;
        this.filteredStudents = [...this.students];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.snackBar.open('Error al cargar los estudiantes', 'Cerrar', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  loadGroups(): void {
    this.groupService.getGroups().subscribe({
      next: (response) => {
        this.groups = response.groups;
      },
      error: (error) => {
        console.error('Error loading groups:', error);
      }
    });
  }

  filterByGroup(): void {
    if (this.selectedGroup) {
      this.filteredStudents = this.students.filter(student =>
        student.group_id === this.selectedGroup
      );
    } else {
      this.filteredStudents = [...this.students];
    }
  }

  deleteStudent(student: Student): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Estudiante',
        message: `¿Estás seguro de que quieres eliminar al estudiante "${student.name}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.studentService.deleteStudent(student.id).subscribe({
          next: () => {
            this.snackBar.open('Estudiante eliminado exitosamente', 'Cerrar', { duration: 3000 });
            this.loadStudents();
          },
          error: (error) => {
            console.error('Error deleting student:', error);
            this.snackBar.open('Error al eliminar el estudiante', 'Cerrar', { duration: 5000 });
          }
        });
      }
    });
  }

  viewStudent(student: Student): void {
    this.router.navigate(['/students', student.id]);
  }

  editStudent(student: Student): void {
    this.router.navigate(['/students', student.id, 'edit']);
  }

  getGroupName(groupId: string): string {
    const group = this.groups.find(g => g.id === groupId);
    return group ? group.name : 'Sin grupo';
  }
}
