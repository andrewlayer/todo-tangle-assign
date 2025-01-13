import { useState } from 'react';
import TodoItem from '@/components/TodoItem';
import { useTodos } from '@/hooks/useTodos';
import FilterBar from '@/components/todo/FilterBar';
import SignatureModal from '@/components/SignatureModal';
import { Todo } from '@/types/todo';
import { toast } from '@/hooks/use-toast';

interface TodoListProps {
  assignedUser?: string;
  onMoveToMainList?: (todo: Todo) => void;
}

const TodoList = ({ assignedUser, onMoveToMainList }: TodoListProps) => {
  const [showCompleted, setShowCompleted] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  
  const { 
    todos, 
    isLoading,
    addTodo, 
    updateTodoText, 
    deleteTodo, 
    completeTodo, 
    uncompleteTodo, 
    assignTodo, 
    updateNotes,
    moveToMainList
  } = useTodos(Boolean(assignedUser), assignedUser);

  const handleComplete = async (todo: Todo) => {
    setSelectedTodo(todo);
    setIsSignatureModalOpen(true);
  };

  const handleSignatureSubmit = async (signature: string) => {
    if (selectedTodo) {
      try {
        await completeTodo(selectedTodo.id, signature);
        setSelectedTodo(null);
        setIsSignatureModalOpen(false);
      } catch (error) {
        console.error('Error completing todo:', error);
        toast({
          title: "Error",
          description: "Failed to complete the todo. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleAddTodo = async (text: string) => {
    if (isAddingTodo) return;
    
    setIsAddingTodo(true);
    try {
      await addTodo(text);
      toast({
        title: "Success",
        description: "Todo added successfully",
      });
    } catch (error) {
      console.error('Error adding todo:', error);
      toast({
        title: "Error",
        description: "Failed to add todo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAddingTodo(false);
    }
  };

  const handleAddSubTodo = async (parentId: string, text: string): Promise<void> => {
    if (isAddingTodo) return;
    
    setIsAddingTodo(true);
    try {
      const result = await addTodo(text, parentId);
      if (!result) {
        throw new Error('Failed to add subtodo');
      }
    } catch (error) {
      console.error('Error adding subtodo:', error);
      toast({
        title: "Error",
        description: "Failed to add sub-todo. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsAddingTodo(false);
    }
  };

  const handleUncomplete = async (todoId: string) => {
    try {
      await uncompleteTodo(todoId);
    } catch (error) {
      console.error('Error uncompleting todo:', error);
      toast({
        title: "Error",
        description: "Failed to uncomplete the todo. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleMoveToMainList = async (todo: Todo) => {
    if (!todo.in_backlog) {
      toast({
        title: "Cannot move todo",
        description: "This todo is not in the backlog",
        variant: "destructive"
      });
      return;
    }

    try {
      await moveToMainList(todo.id);
    } catch (error) {
      console.error('Error moving todo:', error);
      toast({
        title: "Error",
        description: "Failed to move the todo. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredTodos = todos.filter(todo => showCompleted || !todo.completed);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FilterBar 
        showCompleted={showCompleted} 
        onShowCompletedChange={setShowCompleted} 
        onAddTodo={handleAddTodo}
        isAddingTodo={isAddingTodo}
      />
      <div className="space-y-4">
        {filteredTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onComplete={handleComplete}
            onUncomplete={handleUncomplete}
            onAssign={assignTodo}
            onAddSubTodo={handleAddSubTodo}
            onDelete={deleteTodo}
            onUpdateNotes={updateNotes}
            onUpdateText={updateTodoText}
            onMoveToMainList={onMoveToMainList ? handleMoveToMainList : undefined}
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