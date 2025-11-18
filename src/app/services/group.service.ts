import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Group, GroupStats } from '../models/group.model';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  constructor(private apiService: ApiService) { }

  getGroups(): Observable<{ groups: Group[] }> {
    return this.apiService.get<{ groups: Group[] }>('groups');
  }

  getGroupById(id: string): Observable<{ group: Group }> {
    return this.apiService.get<{ group: Group }>(`groups/${id}`);
  }

  createGroup(group: Partial<Group>): Observable<{ message: string; group: Group }> {
    return this.apiService.post<{ message: string; group: Group }>('groups', group);
  }

  updateGroup(id: string, group: Partial<Group>): Observable<{ message: string; group: Group }> {
    return this.apiService.put<{ message: string; group: Group }>('groups', id, group);
  }

  deleteGroup(id: string): Observable<{ message: string }> {
    return this.apiService.delete<{ message: string }>('groups', id);
  }

  getGroupStats(id: string): Observable<{ stats: GroupStats }> {
    return this.apiService.get<{ stats: GroupStats }>(`groups/${id}/stats`);
  }
}
