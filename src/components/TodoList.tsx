import React, { useState } from 'react';
import { Plus, User, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TodoItem from './TodoItem';
import SignatureModal from './SignatureModal';
import { Todo } from '@/types/todo';
import { useToast } from '@/components/ui/use-toast';

const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const { toast } = useToast();

  const addTodo = (parentId: string | null = null) => {
    if (!newTodo.trim()) {
      toast({
        title: "Cannot add empty todo",
        description: "Please enter some text for your todo",
        variant: "destructive"
      });
      return;
    }

    const newTodoItem: Todo = {
      id: Date.now().toString(),
      text: newTodo,
      completed: false,
      assignedTo: '',
      parentId,
      signature: '',
      subTodos: [],
    };

    if (parentId) {
      setTodos(prevTodos => {
        const updateTodoWithSubTodos = (todos: Todo[]): Todo[] => {
          return todos.map(todo => {
            if (todo.id === parentId) {
              return { ...todo, subTodos: [...todo.subTodos, newTodoItem] };
            }
            if (todo.subTodos.length > 0) {
              return { ...todo, subTodos: updateTodoWithSubTodos(todo.subTodos) };
            }
            return todo;
          });
        };
        return updateTodoWithSubTodos(prevTodos);
      });
    } else {
      setTodos(prevTodos => [...prevTodos, newTodoItem]);
    }
    setNewTodo('');
    toast({
      title: "Todo added",
      description: parentId ? "Sub-todo added successfully" : "Todo added successfully",
    });
  };

  const handleTodoCompletion = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsSignatureModalOpen(true);
  };

  const handleSignatureSubmit = (signature: string) => {
    setTodos(prevTodos => 
      prevTodos.map(todo => {
        if (todo.id === selectedTodo?.id) {
          return { ...todo, completed: true, signature };
        }
        if (todo.subTodos.some(st => st.id === selectedTodo?.id)) {
          return {
            ...todo,
            subTodos: todo.subTodos.map(st =>
              st.id === selectedTodo?.id
                ? { ...st, completed: true, signature }
                : st
            ),
          };
        }
        return todo;
      })
    );
    setIsSignatureModalOpen(false);
    setSelectedTodo(null);
    toast({
      title: "Todo completed",
      description: `Task marked as complete by ${signature}`,
    });
  };

  const assignTodo = (todoId: string, assignee: string, isSubTodo: boolean = false) => {
    setTodos(prevTodos =>
      prevTodos.map(todo => {
        if (!isSubTodo && todo.id === todoId) {
          return { ...todo, assignedTo: assignee };
        }
        if (isSubTodo) {
          return {
            ...todo,
            subTodos: todo.subTodos.map(st =>
              st.id === todoId ? { ...st, assignedTo: assignee } : st
            ),
          };
        }
        return todo;
      })
    );
  };

  const deleteTodo = (todoId: string, isSubTodo: boolean = false) => {
    if (!isSubTodo) {
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== todoId));
    } else {
      setTodos(prevTodos =>
        prevTodos.map(todo => ({
          ...todo,
          subTodos: todo.subTodos.filter(st => st.id !== todoId),
        }))
      );
    }
    toast({
      title: "Todo deleted",
      description: "Task has been removed",
    });
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