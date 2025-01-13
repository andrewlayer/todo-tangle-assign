import { supabase } from '@/integrations/supabase/client';
import { Todo } from '@/types/todo';
import { toast } from '@/components/ui/use-toast';

export const fetchTodosFromSupabase = async (inBacklog: boolean = false, assignedUser?: string) => {
  try {
    let query = supabase
      .from('todos')
      .select('*')
      .eq('in_backlog', inBacklog)
      .order('created_at', { ascending: true });

    if (assignedUser) {
      query = query.eq('assigned_to', assignedUser);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching todos:', error);
    toast({
      title: "Error fetching todos",
      description: "Please try again later",
      variant: "destructive"
    });
    return [];
  }
};

export const addTodoToSupabase = async (
  text: string, 
  parentId: string | null = null,
  inBacklog: boolean = false,
  assignedUser?: string
) => {
  try {
    const newTodo = {
      text,
      parent_id: parentId || null,
      in_backlog: inBacklog,
      assigned_to: assignedUser || ''
    };

    const { data, error } = await supabase
      .from('todos')
      .insert([newTodo])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error adding todo:', error);
    toast({
      title: "Error adding todo",
      description: "Please try again later",
      variant: "destructive"
    });
    return null;
  }
};

export const updateTodoInSupabase = async (todoId: string, updates: Partial<Todo>) => {
  try {
    const { error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', todoId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating todo:', error);
    toast({
      title: "Error updating todo",
      description: "Please try again later",
      variant: "destructive"
    });
    return false;
  }
};

export const deleteTodoFromSupabase = async (todoId: string) => {
  try {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', todoId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting todo:', error);
    toast({
      title: "Error deleting todo",
      description: "Please try again later",
      variant: "destructive"
    });
    return false;
  }
};