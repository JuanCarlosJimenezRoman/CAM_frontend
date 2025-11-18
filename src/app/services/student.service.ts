import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Student, StudentProgress } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  constructor(private apiService: ApiService) { }

  getStudents(groupId?: string): Observable<{ students: Student[] }> {
    const params = groupId ? { group_id: groupId } : undefined;
    return this.apiService.get<{ students: Student[] }>('students', params);
  }

  getStudentById(id: string): Observable<{ student: Student }> {
    return this.apiService.get<{ student: Student }>(`students/${id}`);
  }

  createStudent(student: Partial<Student>): Observable<{ message: string; student: Student }> {
    return this.apiService.post<{ message: string; student: Student }>('students', student);
  }

  updateStudent(id: string, student: Partial<Student>): Observable<{ message: string; student: Student }> {
    return this.apiService.put<{ message: string; student: Student }>('students', id, student);
  }

  deleteStudent(id: string): Observable<{ message: string }> {
    return this.apiService.delete<{ message: string }>('students', id);
  }

  getStudentProgress(id: string): Observable<StudentProgress> {
    return this.apiService.get<StudentProgress>(`students/${id}/progress`);
  }
}