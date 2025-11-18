export interface Progress {
  id: string;
  student_id: string;
  student_name?: string;
  activity_id: string;
  activity_title?: string;
  progress_status: 'achieved' | 'in_progress' | 'not_achieved';
  performance_indicators?: any;
  teacher_notes?: string;
  progress_date: string;
  created_at: string;
}