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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ActivityService } from '../../../services/activity.service';
import { StudentService } from '../../../services/student.service';
import { Activity } from '../../../models/activity.model';
import { Student } from '../../../models/student.model';

@Component({
  selector: 'app-activity-form',
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
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './activity-form.component.html',
  styleUrls: ['./activity-form.component.css']
})
export class ActivityFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private activityService = inject(ActivityService);
  private studentService = inject(StudentService);
  private snackBar = inject(MatSnackBar);

  activityForm: FormGroup;
  students: Student[] = [];
  isEdit = false;
  activityId: string | null = null;
  loading = false;

  categories = [
    'Lectura',
    'Escritura',
    'Matemáticas',
    'Ciencias',
    'Arte',
    'Música',
    'Educación Física',
    'Habilidades Sociales',
    'Lenguaje',
    'Terapia Ocupacional',
    'Otro'
  ];

  difficultyLevels = [
    'Muy fácil',
    'Fácil',
    'Intermedio',
    'Difícil',
    'Muy difícil'
  ];

  statusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'completed', label: 'Completada' }
  ];

  constructor() {
    this.activityForm = this.fb.group({
      student_id: ['', Validators.required],
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      category: ['', Validators.required],
      difficulty_level: ['', Validators.required],
      objective: [''],
      due_date: [''],
      status: ['pending']
    });
  }

  ngOnInit(): void {
    this.loadStudents();

    this.activityId = this.route.snapshot.paramMap.get('id');
    this.isEdit = this.route.snapshot.url.some(segment => segment.path === 'edit');

    // Obtener student_id de query params si viene de crear desde estudiante
    this.route.queryParams.subscribe(params => {
      if (params['student_id']) {
        this.activityForm.patchValue({ student_id: params['student_id'] });
      }
    });

    if (this.isEdit && this.activityId) {
      this.loadActivity();
    }
  }

  loadStudents(): void {
    this.studentService.getStudents().subscribe({
      next: (response) => {
        this.students = response.students;
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.snackBar.open('Error al cargar los estudiantes', 'Cerrar', { duration: 5000 });
      }
    });
  }

  loadActivity(): void {
    this.loading = true;
    this.activityService.getActivityById(this.activityId!).subscribe({
      next: (response) => {
        const activity = response.activity;
        // Formatear la fecha para el datepicker
        const formattedActivity = {
          ...activity,
          due_date: activity.due_date ? new Date(activity.due_date) : ''
        };
        this.activityForm.patchValue(formattedActivity);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading activity:', error);
        this.snackBar.open('Error al cargar la actividad', 'Cerrar', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.activityForm.valid) {
      this.loading = true;
      const activityData = this.activityForm.value;

      // Formatear la fecha para el backend
      if (activityData.due_date) {
        activityData.due_date = this.formatDate(activityData.due_date);
      }

      if (this.isEdit && this.activityId) {
        this.activityService.updateActivity(this.activityId, activityData).subscribe({
          next: (response) => {
            this.snackBar.open('Actividad actualizada exitosamente', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/activities']);
          },
          error: (error) => {
            console.error('Error updating activity:', error);
            this.snackBar.open('Error al actualizar la actividad', 'Cerrar', { duration: 5000 });
            this.loading = false;
          }
        });
      } else {
        this.activityService.createActivity(activityData).subscribe({
          next: (response) => {
            this.snackBar.open('Actividad creada exitosamente', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/activities']);
          },
          error: (error) => {
            console.error('Error creating activity:', error);
            this.snackBar.open('Error al crear la actividad', 'Cerrar', { duration: 5000 });
            this.loading = false;
          }
        });
      }
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  onCancel(): void {
    this.router.navigate(['/activities']);
  }
}
