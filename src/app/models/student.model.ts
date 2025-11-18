import { Progress } from './progress.model';
import { Activity } from './activity.model';

export interface Student {
  id: string;
  name: string;
  group_id: string;
  group_name?: string;
  disability_type: string;
  academic_level?: string;
  tutor_name?: string;
  tutor_phone?: string;
  tutor_email?: string;
  photo_url?: string;
  additional_info?: string;
  created_at: string;
  updated_at?: string;
}

export interface StudentProgress {
  progress: Progress[];
  activities: Activity[];
}
