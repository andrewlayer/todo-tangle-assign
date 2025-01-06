import React, { useState } from 'react';
import { Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TodoItem from './TodoItem';
import SignatureModal from './SignatureModal';
import { Todo } from '@/types/todo';

const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  const addTodo = (parentId: string | null = null) => {
    if (!newTodo.trim()) return;

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
        return prevTodos.map(todo => {
          if (todo.id === parentId) {
            return { ...todo, subTodos: [...todo.subTodos, newTodoItem] };
          }
          return todo;
        });
      });
    } else {
      setTodos(prevTodos => [...prevTodos, newTodoItem]);
    }
    setNewTodo('');
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
            onAddSubTodo={(parentId) => {
              if (newTodo) addTodo(parentId);
            }}
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