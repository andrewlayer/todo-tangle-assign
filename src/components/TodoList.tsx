import { useState } from 'react';
import TodoItem from './TodoItem';
import { useTodos } from '@/hooks/useTodos';
import FilterBar from './todo/FilterBar';
import SignatureModal from './SignatureModal';
import { Todo } from '@/types/todo';
import { toast } from '@/components/ui/use-toast';

interface TodoListProps {
  assignedUser?: string;
  onMoveToMainList?: (todo: Todo) => void;
}

const TodoList = ({ assignedUser, onMoveToMainList }: TodoListProps) => {
  const [showCompleted, setShowCompleted] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const { 
    todos, 
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

  const handleAddSubTodo = async (parentId: string, text: string): Promise<void> => {
    try {
      const result = await addTodo(text, parentId);
      if (!result) {
        throw new Error('Failed to add subtodo');
      }
      toast({
        title: "Success",
        description: "Sub-todo added successfully",
      });
    } catch (error) {
      console.error('Error adding subtodo:', error);
      toast({
        title: "Error",
        description: "Failed to add sub-todo. Please try again.",
        variant: "destructive"
      });
      throw error;
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

  return (
    <div className="space-y-4">
      <FilterBar 
        showCompleted={showCompleted} 
        onShowCompletedChange={setShowCompleted} 
        onAddTodo={addTodo}
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