import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Todo } from '@/types/todo';
import { useToast } from '@/components/ui/use-toast';

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const { toast } = useToast();

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transform the flat data into a nested structure
      const transformedTodos = data.reduce((acc: Todo[], todo) => {
        if (!todo.parent_id) {
          const subTodos = data.filter(t => t.parent_id === todo.id);
          acc.push({
            ...todo,
            subTodos: subTodos.map(st => ({ ...st, subTodos: [] }))
          });
        }
        return acc;
      }, []);

      setTodos(transformedTodos);
    } catch (error) {
      console.error('Error fetching todos:', error);
      toast({
        title: "Error fetching todos",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const addTodo = async (text: string, parentId: string | null = null) => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{
          text,
          parent_id: parentId,
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchTodos(); // Refetch after adding

      toast({
        title: "Todo added",
        description: parentId ? "Sub-todo added successfully" : "Todo added successfully",
      });

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

  const deleteTodo = async (todoId: string) => {
    try {
      // First delete all sub-todos
      await supabase
        .from('todos')
        .delete()
        .eq('parent_id', todoId);

      // Then delete the main todo
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', todoId);

      if (error) throw error;

      await fetchTodos(); // Refetch after deleting

      toast({
        title: "Todo deleted",
        description: "Task has been removed",
      });
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast({
        title: "Error deleting todo",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const completeTodo = async (todoId: string, signature: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({
          completed: true,
          signature
        })
        .eq('id', todoId);

      if (error) throw error;

      await fetchTodos(); // Refetch after completing

      toast({
        title: "Todo completed",
        description: `Task marked as complete by ${signature}`,
      });
    } catch (error) {
      console.error('Error completing todo:', error);
      toast({
        title: "Error completing todo",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const assignTodo = async (todoId: string, assignee: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({
          assigned_to: assignee
        })
        .eq('id', todoId);

      if (error) throw error;

      await fetchTodos(); // Refetch after assigning
    } catch (error) {
      console.error('Error assigning todo:', error);
      toast({
        title: "Error assigning todo",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchTodos();
    
    // Subscribe to changes
    const channel = supabase
      .channel('public:todos')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'todos' }, 
        () => {
          console.log('Database change detected, refetching todos');
          fetchTodos(); // Refresh todos when any change occurs
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    todos,
    addTodo,
    deleteTodo,
    completeTodo,
    assignTodo
  };
};