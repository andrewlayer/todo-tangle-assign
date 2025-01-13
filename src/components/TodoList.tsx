import { useState } from 'react';
import TodoItem from './TodoItem';
import { useTodos } from '@/hooks/useTodos';
import FilterBar from './todo/FilterBar';
import SignatureModal from './SignatureModal';
import { Todo } from '@/types/todo';

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
      await completeTodo(selectedTodo.id, signature);
      setSelectedTodo(null);
      setIsSignatureModalOpen(false);
    }
  };

  const handleUncomplete = async (todoId: string) => {
    await uncompleteTodo(todoId);
  };

  const handleMoveToMainList = async (todo: Todo) => {
    await moveToMainList(todo.id);
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
            onAddSubTodo={addTodo}
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
