export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  assigned_to: string;
  parent_id: string | null;
  signature: string;
  notes: string;
  created_at?: string;
  in_backlog: boolean;
  subTodos: Todo[];
}