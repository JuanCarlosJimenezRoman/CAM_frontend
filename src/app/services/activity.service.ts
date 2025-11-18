import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Activity } from '../models/activity.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private apiService = inject(ApiService);

  getActivities(studentId?: string): Observable<{ activities: Activity[] }> {
    const params = studentId ? { student_id: studentId } : undefined;
    return this.apiService.get<{ activities: Activity[] }>('activities', params);
  }

  getActivityById(id: string): Observable<{ activity: Activity }> {
    return this.apiService.get<{ activity: Activity }>(`activities/${id}`);
  }

  createActivity(activity: Partial<Activity>): Observable<{ message: string; activity: Activity }> {
    return this.apiService.post<{ message: string; activity: Activity }>('activities', activity);
  }

  updateActivity(id: string, activity: Partial<Activity>): Observable<{ message: string; activity: Activity }> {
    return this.apiService.put<{ message: string; activity: Activity }>('activities', id, activity);
  }

  deleteActivity(id: string): Observable<{ message: string }> {
    return this.apiService.delete<{ message: string }>('activities', id);
  }
}
