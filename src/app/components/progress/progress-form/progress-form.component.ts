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
import { ProgressService } from '../../../services/progress.service';
import { StudentService } from '../../../services/student.service';
import { ActivityService } from '../../../services/activity.service';
import { Progress } from '../../../models/progress.model';
import { Student } from '../../../models/student.model';
import { Activity } from '../../../models/activity.model';
import { MatProgressSpinner } from "@angular/material/progress-spinner";

@Component({
  selector: 'app-progress-form',
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
    MatNativeDateModule,
    MatProgressSpinner
],
  templateUrl: './progress-form.component.html',
  styleUrls: ['./progress-form.component.css']
})
export class ProgressFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private progressService = inject(ProgressService);
  private studentService = inject(StudentService);
  private activityService = inject(ActivityService);
  private snackBar = inject(MatSnackBar);

  progressForm: FormGroup;
  students: Student[] = [];
  activities: Activity[] = [];
  filteredActivities: Activity[] = [];
  isEdit = false;
  progressId: string | null = null;
  loading = false;

  progressStatusOptions = [
    { value: 'achieved', label: 'Logrado' },
    { value: 'in_progress', label: 'En Progreso' },
    { value: 'not_achieved', label: 'No Logrado' }
  ];

  constructor() {
    this.progressForm = this.fb.group({
      student_id: ['', Validators.required],
      activity_id: ['', Validators.required],
      progress_status: ['', Validators.required],
      performance_indicators: [''],
      teacher_notes: [''],
      progress_date: [new Date(), Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadStudents();

    this.progressId = this.route.snapshot.paramMap.get('id');
    this.isEdit = this.route.snapshot.url.some(segment => segment.path === 'edit');

    // Obtener parámetros de query
    this.route.queryParams.subscribe(params => {
      if (params['student_id']) {
        const studentId = params['student_id'];
        this.progressForm.patchValue({ student_id: studentId });
        this.onStudentChange(studentId);
      }
      if (params['activity_id']) {
        this.progressForm.patchValue({ activity_id: params['activity_id'] });
      }
    });

    if (this.isEdit && this.progressId) {
      this.loadProgress();
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

  loadActivities(studentId?: string): void {
  this.activityService.getActivities(studentId).subscribe({
    next: (response) => {
      this.filteredActivities = response.activities;

      // Si estamos en modo edición y hay una actividad seleccionada,
      // asegurarnos de que esté en la lista filtrada
      if (this.isEdit && this.progressForm.get('activity_id')?.value) {
        const currentActivityId = this.progressForm.get('activity_id')?.value;
        const activityExists = this.filteredActivities.some(activity => activity.id === currentActivityId);

        if (!activityExists && this.activities.length > 0) {
          // Si la actividad actual no está en la lista filtrada, buscar en todas las actividades
          const originalActivity = this.activities.find(activity => activity.id === currentActivityId);
          if (originalActivity) {
            // Agregar la actividad original a la lista filtrada
            this.filteredActivities = [originalActivity, ...this.filteredActivities];
          }
        }
      }
    },
    error: (error) => {
      console.error('Error loading activities:', error);
      this.snackBar.open('Error al cargar las actividades', 'Cerrar', { duration: 5000 });
    }
  });
}

  onStudentChange(studentId: string): void {
  if (studentId) {
    this.loadActivities(studentId);
  } else {
    // Si no hay estudiante seleccionado, mostrar todas las actividades
    this.filteredActivities = [...this.activities];
  }
}

  loadProgress(): void {
  this.loading = true;
  this.progressService.getProgressById(this.progressId!).subscribe({
    next: (response) => {
      const progress = response.progress;

      // Primero cargar todas las actividades para poder seleccionar la correcta
      this.loadAllActivities().then(() => {
        // Ahora establecer los valores del formulario
        const formattedProgress = {
          student_id: progress.student_id,
          activity_id: progress.activity_id,
          progress_status: progress.progress_status,
          performance_indicators: this.formatPerformanceIndicators(progress.performance_indicators),
          teacher_notes: progress.teacher_notes || '',
          progress_date: new Date(progress.progress_date)
        };

        this.progressForm.patchValue(formattedProgress);

        // Filtrar actividades para el estudiante seleccionado
        this.onStudentChange(progress.student_id);

        this.loading = false;
      });
    },
    error: (error) => {
      console.error('Error loading progress:', error);
      this.snackBar.open('Error al cargar el registro de progreso', 'Cerrar', { duration: 5000 });
      this.loading = false;
    }
  });
}

// Método para cargar todas las actividades (sin filtro)
private loadAllActivities(): Promise<void> {
  return new Promise((resolve) => {
    this.activityService.getActivities().subscribe({
      next: (response) => {
        this.activities = response.activities;
        this.filteredActivities = [...this.activities];
        resolve();
      },
      error: (error) => {
        console.error('Error loading all activities:', error);
        resolve(); // Resolver igual para no bloquear
      }
    });
  });
}

// Método para formatear los indicadores de desempeño para el textarea
private formatPerformanceIndicators(indicators: any): string {
  if (!indicators) return '';

  try {
    if (typeof indicators === 'string') {
      return indicators;
    }

    // Si es un objeto, convertirlo a string legible
    if (indicators.notes) {
      return indicators.notes;
    }

    // Si es otro tipo de objeto, convertirlo a JSON string
    return JSON.stringify(indicators, null, 2);
  } catch (error) {
    console.warn('Error formatting performance indicators:', error);
    return '';
  }
}

  onSubmit(): void {
  if (this.progressForm.valid) {
    this.loading = true;
    const formValue = this.progressForm.value;

    // Preparar los datos para enviar al backend
    const progressData: any = {
      student_id: formValue.student_id,
      activity_id: formValue.activity_id,
      progress_status: formValue.progress_status,
      teacher_notes: formValue.teacher_notes?.trim() || null,
      progress_date: this.formatDate(formValue.progress_date)
    };

    // Procesar performance_indicators
    if (formValue.performance_indicators && formValue.performance_indicators.trim() !== '') {
      const indicatorsText = formValue.performance_indicators.trim();

      try {
        // Intentar parsear como JSON
        const parsedIndicators = JSON.parse(indicatorsText);
        progressData.performance_indicators = parsedIndicators;
      } catch {
        // Si no es JSON válido, crear un objeto simple
        progressData.performance_indicators = { notes: indicatorsText };
      }
    } else {
      progressData.performance_indicators = null;
    }

    console.log('Sending progress data:', progressData);

    if (this.isEdit && this.progressId) {
      this.progressService.updateProgress(this.progressId, progressData).subscribe({
        next: (response) => {
          this.snackBar.open('Progreso actualizado exitosamente', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/progress']);
        },
        error: (error) => {
          console.error('Error updating progress:', error);
          console.error('Error details:', error.error);
          this.snackBar.open('Error al actualizar el progreso', 'Cerrar', { duration: 5000 });
          this.loading = false;
        }
      });
    } else {
      this.progressService.createProgress(progressData).subscribe({
        next: (response) => {
          this.snackBar.open('Progreso registrado exitosamente', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/progress']);
        },
        error: (error) => {
          console.error('Error creating progress:', error);
          console.error('Error details:', error.error);
          this.snackBar.open('Error al registrar el progreso', 'Cerrar', { duration: 5000 });
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
    this.router.navigate(['/progress']);
  }
}
