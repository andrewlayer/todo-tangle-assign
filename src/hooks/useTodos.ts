import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Todo } from '@/types/todo';
import { buildTodoTree } from '@/utils/todoUtils';
import {
  fetchTodosFromSupabase,
  addTodoToSupabase,
  deleteTodoFromSupabase,
  completeTodoInSupabase,
  assignTodoInSupabase,
  updateNotesInSupabase
} from './useSupabaseTodos';
import { supabase } from '@/integrations/supabase/client';

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const { toast } = useToast();

  const fetchTodos = async () => {
    try {
      const data = await fetchTodosFromSupabase();
      setTodos(buildTodoTree(data));
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
      await addTodoToSupabase(text, parentId);
      await fetchTodos();
      toast({
        title: "Todo added",
        description: parentId ? "Sub-todo added successfully" : "Todo added successfully",
      });
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
      await completeTodoInSupabase(todoId, signature);
      await fetchTodos();
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
      await assignTodoInSupabase(todoId, assignee);
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

  const updateNotes = async (todoId: string, notes: string) => {
    try {
      await updateNotesInSupabase(todoId, notes);
      await fetchTodos();
      toast({
        title: "Notes updated",
        description: "Task notes have been saved",
      });
    } catch (error) {
      console.error('Error updating notes:', error);
      toast({
        title: "Error updating notes",
        description: "Please try again later",
        variant: "destructive"
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
    deleteTodo,
    completeTodo,
    assignTodo,
    updateNotes
  };
};