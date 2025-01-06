export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  assignedTo: string;
  parentId: string | null;
  signature: string;
  subTodos: Todo[];
}