import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StudentService } from '../../../services/student.service';
import { GroupService } from '../../../services/group.service';
import { Student } from '../../../models/student.model';
import { Group } from '../../../models/group.model';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.css']
})
export class StudentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private studentService = inject(StudentService);
  private groupService = inject(GroupService);
  private snackBar = inject(MatSnackBar);

  studentForm: FormGroup;
  groups: Group[] = [];
  isEdit = false;
  studentId: string | null = null;
  loading = false;

  disabilityTypes = [
    'Discapacidad visual',
    'Discapacidad auditiva',
    'Discapacidad física',
    'Discapacidad intelectual',
    'Trastorno del espectro autista',
    'Discapacidad múltiple',
    'Otro'
  ];

  academicLevels = [
    'Preescolar',
    'Primaria - 1°',
    'Primaria - 2°',
    'Primaria - 3°',
    'Primaria - 4°',
    'Primaria - 5°',
    'Primaria - 6°',
    'Secundaria - 1°',
    'Secundaria - 2°',
    'Secundaria - 3°',
    'Preparatoria',
    'Universidad'
  ];

  constructor() {
    this.studentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      group_id: ['', Validators.required],
      disability_type: ['', Validators.required],
      academic_level: [''],
      tutor_name: [''],
      tutor_phone: [''],
      tutor_email: ['', Validators.email],
      photo_url: [''],
      additional_info: ['']
    });
  }

  ngOnInit(): void {
    this.loadGroups();

    this.studentId = this.route.snapshot.paramMap.get('id');
    this.isEdit = this.route.snapshot.url.some(segment => segment.path === 'edit');

    // Obtener group_id de query params si viene de crear desde grupo
    this.route.queryParams.subscribe(params => {
      if (params['group_id']) {
        this.studentForm.patchValue({ group_id: params['group_id'] });
      }
    });

    if (this.isEdit && this.studentId) {
      this.loadStudent();
    }
  }

  loadGroups(): void {
    this.groupService.getGroups().subscribe({
      next: (response) => {
        this.groups = response.groups;
      },
      error: (error) => {
        console.error('Error loading groups:', error);
        this.snackBar.open('Error al cargar los grupos', 'Cerrar', { duration: 5000 });
      }
    });
  }

  loadStudent(): void {
    this.loading = true;
    this.studentService.getStudentById(this.studentId!).subscribe({
      next: (response) => {
        this.studentForm.patchValue(response.student);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading student:', error);
        this.snackBar.open('Error al cargar el estudiante', 'Cerrar', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.studentForm.valid) {
      this.loading = true;
      const studentData = this.studentForm.value;

      if (this.isEdit && this.studentId) {
        this.studentService.updateStudent(this.studentId, studentData).subscribe({
          next: (response) => {
            this.snackBar.open('Estudiante actualizado exitosamente', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/students']);
          },
          error: (error) => {
            console.error('Error updating student:', error);
            this.snackBar.open('Error al actualizar el estudiante', 'Cerrar', { duration: 5000 });
            this.loading = false;
          }
        });
      } else {
        this.studentService.createStudent(studentData).subscribe({
          next: (response) => {
            this.snackBar.open('Estudiante creado exitosamente', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/students']);
          },
          error: (error) => {
            console.error('Error creating student:', error);
            this.snackBar.open('Error al crear el estudiante', 'Cerrar', { duration: 5000 });
            this.loading = false;
          }
        });
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/students']);
  }
}
