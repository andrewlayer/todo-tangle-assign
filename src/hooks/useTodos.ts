import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Todo } from '@/types/todo';
import { toast } from '@/components/ui/use-toast';
import { 
  fetchTodosFromSupabase,
  addTodoToSupabase,
  updateTodoInSupabase,
  deleteTodoFromSupabase
} from './useSupabaseTodos';
import { transformTodosToTree, getAllChildIds } from '@/utils/todoUtils';

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  const fetchTodos = async () => {
    const data = await fetchTodosFromSupabase();
    setTodos(transformTodosToTree(data));
  };

  const addTodo = async (text: string, parentId: string | null = null) => {
    const data = await addTodoToSupabase(text, parentId);
    if (data) {
      await fetchTodos();
      toast({
        title: "Todo added",
        description: parentId ? "Sub-todo added successfully" : "Todo added successfully",
      });
    }
    return data;
  };

  const updateTodoText = async (todoId: string, text: string) => {
    const success = await updateTodoInSupabase(todoId, { text });
    if (success) {
      await fetchTodos();
      toast({
        title: "Todo updated",
        description: "Task name has been updated",
      });
    }
  };

  const deleteTodo = async (todoId: string) => {
    try {
      const childIds = await getAllChildIds(todoId);
      if (childIds.length > 0) {
        await Promise.all(childIds.map(id => deleteTodoFromSupabase(id)));
      }
      await deleteTodoFromSupabase(todoId);
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
      const descendantIds = await getAllChildIds(todoId);
      if (descendantIds.length > 0) {
        await Promise.all(descendantIds.map(id => 
          updateTodoInSupabase(id, { completed: true, signature })
        ));
      }
      await updateTodoInSupabase(todoId, { completed: true, signature });
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

  const uncompleteTodo = async (todoId: string) => {
    const success = await updateTodoInSupabase(todoId, { 
      completed: false,
      signature: null
    });
    if (success) {
      await fetchTodos();
      toast({
        title: "Todo uncompleted",
        description: "Task has been marked as incomplete",
      });
    }
  };

  const assignTodo = async (todoId: string, assignee: string) => {
    const success = await updateTodoInSupabase(todoId, { assigned_to: assignee });
    if (success) {
      await fetchTodos();
    }
  };

  const updateNotes = async (todoId: string, notes: string) => {
    const success = await updateTodoInSupabase(todoId, { notes });
    if (success) {
      await fetchTodos();
      toast({
        title: "Notes updated",
        description: "Task notes have been saved",
      });
    }
  };

  useEffect(() => {
    fetchTodos();
    
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
    updateTodoText,
    deleteTodo,
    completeTodo,
    uncompleteTodo,
    assignTodo,
    updateNotes
  };
};