import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Progress } from '../models/progress.model';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private apiService = inject(ApiService);

  getProgress(studentId?: string, activityId?: string): Observable<{ progress: Progress[] }> {
    const params: any = {};
    if (studentId) params.student_id = studentId;
    if (activityId) params.activity_id = activityId;

    return this.apiService.get<{ progress: Progress[] }>('progress', params);
  }

  getProgressById(id: string): Observable<{ progress: Progress }> {
    return this.apiService.get<{ progress: Progress }>(`progress/${id}`);
  }

  createProgress(progress: Partial<Progress>): Observable<{ message: string; progress: Progress }> {
    return this.apiService.post<{ message: string; progress: Progress }>('progress', progress);
  }

  updateProgress(id: string, progress: Partial<Progress>): Observable<{ message: string; progress: Progress }> {
    return this.apiService.put<{ message: string; progress: Progress }>('progress', id, progress);
  }

  deleteProgress(id: string): Observable<{ message: string }> {
    return this.apiService.delete<{ message: string }>('progress', id);
  }
}
