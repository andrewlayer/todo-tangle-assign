import { supabase } from '@/integrations/supabase/client';
import { Todo } from '@/types/todo';

export const fetchTodosFromSupabase = async () => {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

export const addTodoToSupabase = async (text: string, parentId: string | null = null) => {
  const { data, error } = await supabase
    .from('todos')
    .insert([{
      text,
      parent_id: parentId,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteTodoFromSupabase = async (todoId: string) => {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', todoId);

  if (error) throw error;
};

export const completeTodoInSupabase = async (todoId: string, signature: string) => {
  const { error } = await supabase
    .from('todos')
    .update({ completed: true, signature })
    .eq('id', todoId);

  if (error) throw error;
};

export const assignTodoInSupabase = async (todoId: string, assignee: string) => {
  const { error } = await supabase
    .from('todos')
    .update({ assigned_to: assignee })
    .eq('id', todoId);

  if (error) throw error;
};

export const updateNotesInSupabase = async (todoId: string, notes: string) => {
  const { error } = await supabase
    .from('todos')
    .update({ notes })
    .eq('id', todoId);

  if (error) throw error;
};