import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TodoItem from './TodoItem';
import SignatureModal from './SignatureModal';
import { Todo } from '@/types/todo';
import { useTodos } from '@/hooks/useTodos';

const TodoList = () => {
  const [newTodo, setNewTodo] = useState('');
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const { todos, addTodo, deleteTodo, completeTodo, assignTodo } = useTodos();

  const handleAddTodo = async (parentId: string | null = null) => {
    if (!newTodo.trim()) return;
    await addTodo(newTodo, parentId);
    setNewTodo('');
  };

  const handleTodoCompletion = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsSignatureModalOpen(true);
  };

  const handleSignatureSubmit = async (signature: string) => {
    if (!selectedTodo) return;
    await completeTodo(selectedTodo.id, signature);
    setIsSignatureModalOpen(false);
    setSelectedTodo(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <img 
          src="/lovable-uploads/fc710911-f339-469a-b007-e2b31d58d6a9.png" 
          alt="Layer's Logo" 
          className="w-8 h-8"
        />
        <h1 className="text-3xl font-bold text-gray-900">Layer's Todos</h1>
      </div>
      
      <div className="flex gap-2">
        <Input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
          className="flex-1"
          onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
        />
        <Button onClick={() => handleAddTodo()} className="bg-indigo-600 hover:bg-indigo-700">
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
            onAddSubTodo={(parentId) => handleAddTodo(parentId)}
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