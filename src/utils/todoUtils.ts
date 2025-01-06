import { Todo } from '@/types/todo';
import { supabase } from '@/integrations/supabase/client';

export const transformTodosToTree = (data: any[]): Todo[] => {
  const todoMap = new Map<string, Todo>();
  
  // First pass: create Todo objects
  data.forEach(todo => {
    todoMap.set(todo.id, { ...todo, subTodos: [] });
  });
  
  // Second pass: build the tree
  const rootTodos: Todo[] = [];
  data.forEach(todo => {
    const todoObj = todoMap.get(todo.id)!;
    if (todo.parent_id) {
      const parent = todoMap.get(todo.parent_id);
      if (parent) {
        parent.subTodos.push(todoObj);
      }
    } else {
      rootTodos.push(todoObj);
    }
  });

  return rootTodos;
};

export const getAllChildIds = async (id: string): Promise<string[]> => {
  const { data } = await supabase
    .from('todos')
    .select('id')
    .eq('parent_id', id);
  
  if (!data || data.length === 0) return [];
  
  const childIds = data.map(t => t.id);
  const grandChildIds = await Promise.all(childIds.map(getAllChildIds));
  return [...childIds, ...grandChildIds.flat()];
};