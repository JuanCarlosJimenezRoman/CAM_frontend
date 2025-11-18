export interface Activity {
  id: string;
  student_id: string;
  student_name?: string;
  group_name?: string;
  title: string;
  description?: string;
  category: string;
  difficulty_level: string;
  objective?: string;
  due_date?: string;
  status: string;
  created_at: string;
}