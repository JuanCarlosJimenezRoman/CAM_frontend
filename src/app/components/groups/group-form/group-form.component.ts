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
import { GroupService } from '../../../services/group.service';
import { Group } from '../../../models/group.model';

@Component({
  selector: 'app-group-form',
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
  templateUrl: './group-form.component.html',
  styleUrls: ['./group-form.component.css']
})
export class GroupFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private groupService = inject(GroupService);
  private snackBar = inject(MatSnackBar);

  groupForm: FormGroup;
  isEdit = false;
  groupId: string | null = null;
  loading = false;

  levels = [
    'Preescolar',
    'Primaria',
    'Secundaria',
    'Preparatoria',
    'Universidad'
  ];

  constructor() {
    this.groupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      level: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('id');
    this.isEdit = this.route.snapshot.url.some(segment => segment.path === 'edit');

    if (this.isEdit && this.groupId) {
      this.loadGroup();
    }
  }

  loadGroup(): void {
    this.loading = true;
    this.groupService.getGroupById(this.groupId!).subscribe({
      next: (response) => {
        this.groupForm.patchValue(response.group);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading group:', error);
        this.snackBar.open('Error al cargar el grupo', 'Cerrar', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.groupForm.valid) {
      this.loading = true;
      const groupData = this.groupForm.value;

      if (this.isEdit && this.groupId) {
        this.groupService.updateGroup(this.groupId, groupData).subscribe({
          next: (response) => {
            this.snackBar.open('Grupo actualizado exitosamente', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/groups']);
          },
          error: (error) => {
            console.error('Error updating group:', error);
            this.snackBar.open('Error al actualizar el grupo', 'Cerrar', { duration: 5000 });
            this.loading = false;
          }
        });
      } else {
        this.groupService.createGroup(groupData).subscribe({
          next: (response) => {
            this.snackBar.open('Grupo creado exitosamente', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/groups']);
          },
          error: (error) => {
            console.error('Error creating group:', error);
            this.snackBar.open('Error al crear el grupo', 'Cerrar', { duration: 5000 });
            this.loading = false;
          }
        });
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/groups']);
  }
}
