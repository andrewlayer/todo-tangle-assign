import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TodoItem from './TodoItem';
import SignatureModal from './SignatureModal';
import { Todo } from '@/types/todo';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTodos();
    
    // Subscribe to changes
    const channel = supabase
      .channel('public:todos')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'todos' }, 
        () => {
          fetchTodos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

  const addTodo = async (parentId: string | null = null) => {
    if (!newTodo.trim()) {
      toast({
        title: "Cannot add empty todo",
        description: "Please enter some text for your todo",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{
          text: newTodo,
          parent_id: parentId,
        }])
        .select()
        .single();

      if (error) throw error;

      setNewTodo('');
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
    }
  };

  const handleTodoCompletion = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsSignatureModalOpen(true);
  };

  const handleSignatureSubmit = async (signature: string) => {
    if (!selectedTodo) return;

    try {
      const { error } = await supabase
        .from('todos')
        .update({
          completed: true,
          signature
        })
        .eq('id', selectedTodo.id);

      if (error) throw error;

      setIsSignatureModalOpen(false);
      setSelectedTodo(null);
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
    } catch (error) {
      console.error('Error assigning todo:', error);
      toast({
        title: "Error assigning todo",
        description: "Please try again later",
        variant: "destructive"
      });
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

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Todo List</h1>
      
      <div className="flex gap-2">
        <Input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
          className="flex-1"
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <Button onClick={() => addTodo()} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Todo
        </Button>
      </div>

      <div className="space-y-4">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onComplete={handleTodoCompletion}
            onAssign={assignTodo}
            onAddSubTodo={(parentId) => addTodo(parentId)}
            onDelete={deleteTodo}
          />
        ))}
      </div>

      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSubmit={handleSignatureSubmit}
      />
    </div>
  );
};

export default TodoList;