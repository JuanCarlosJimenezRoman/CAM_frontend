export interface Group {
grade_level: any;
  is_active: unknown;
  id: string;
  name: string;
  level: string;
  description?: string;
  teacher_id: string;
  teacher_name?: string;
  created_at: string;
}

export interface GroupStats {
  total_students: number;
  total_activities: number;
  progress_breakdown: ProgressBreakdown[];
}

export interface ProgressBreakdown {
  progress_status: string;
  count: string;
}
