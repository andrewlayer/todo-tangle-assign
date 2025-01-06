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

      // Transform the flat data into a nested structure with unlimited depth
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

      setTodos(rootTodos);
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
      
      await fetchTodos();

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
      // First delete all sub-todos recursively
      const getAllChildIds = async (id: string): Promise<string[]> => {
        const { data } = await supabase
          .from('todos')
          .select('id')
          .eq('parent_id', id);
        
        if (!data || data.length === 0) return [];
        
        const childIds = data.map(t => t.id);
        const grandChildIds = await Promise.all(childIds.map(getAllChildIds));
        return [...childIds, ...grandChildIds.flat()];
      };

      const childIds = await getAllChildIds(todoId);
      if (childIds.length > 0) {
        await supabase
          .from('todos')
          .delete()
          .in('id', childIds);
      }

      // Then delete the main todo
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', todoId);

      if (error) throw error;

      await fetchTodos();

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
      // Helper function to get all descendant todos
      const getAllDescendants = async (id: string): Promise<string[]> => {
        const { data } = await supabase
          .from('todos')
          .select('id')
          .eq('parent_id', id);
        
        if (!data || data.length === 0) return [];
        
        const childIds = data.map(t => t.id);
        const grandChildIds = await Promise.all(childIds.map(getAllDescendants));
        return [...childIds, ...grandChildIds.flat()];
      };

      // Get all descendant todos
      const descendantIds = await getAllDescendants(todoId);

      // Complete all uncompleted descendants with the same signature
      if (descendantIds.length > 0) {
        await supabase
          .from('todos')
          .update({ completed: true, signature })
          .in('id', descendantIds)
          .eq('completed', false);
      }

      // Complete the main todo
      const { error } = await supabase
        .from('todos')
        .update({ completed: true, signature })
        .eq('id', todoId);

      if (error) throw error;

      await fetchTodos();

      toast({
        title: "Todo completed",
        description: `Task and uncompleted subtasks marked as complete by ${signature}`,
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

      await fetchTodos();
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
          fetchTodos();
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