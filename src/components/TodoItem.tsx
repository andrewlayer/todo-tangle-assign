import React, { useState, useEffect } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Todo } from '@/types/todo';
import { cn } from '@/lib/utils';
import AddSubTodoModal from './AddSubTodoModal';

interface TodoItemProps {
  todo: Todo;
  onComplete: (todo: Todo) => void;
  onAssign: (todoId: string, assignee: string, isSubTodo?: boolean) => void;
  onAddSubTodo: (parentId: string, text: string) => void;
  onDelete: (todoId: string, isSubTodo?: boolean) => void;
}

const TodoItem = ({ todo, onComplete, onAssign, onAddSubTodo, onDelete }: TodoItemProps) => {
  const [assignee, setAssignee] = useState(todo.assigned_to || '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setAssignee(todo.assigned_to || '');
  }, [todo.assigned_to]);

  const handleAssignChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setAssignee(newValue);
  };

  const handleAssignBlur = () => {
    if (assignee !== todo.assigned_to) {
      onAssign(todo.id, assignee);
    }
  };

  return (
    <div className="space-y-2">
      <div className={cn(
        "p-4 rounded-lg border border-gray-200 shadow-sm transition-all",
        "hover:shadow-md bg-white",
        todo.completed && "bg-gray-50 border-gray-100"
      )}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => !todo.completed && onComplete(todo)}
            className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center",
              "transition-colors hover:border-indigo-600",
              todo.completed ? "bg-indigo-600 border-indigo-600" : "border-gray-300"
            )}
          >
            {todo.completed && <Check className="w-3 h-3 text-white" />}
          </button>
          
          <span className={cn(
            "flex-1 text-gray-900",
            todo.completed && "line-through text-gray-500"
          )}>
            {todo.text}
          </span>

          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Assign to..."
              value={assignee}
              onChange={handleAssignChange}
              onBlur={handleAssignBlur}
              className="w-32 h-8 text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="h-8"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(todo.id)}
              className="h-8"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {todo.completed && todo.signature && (
          <div className="mt-2 text-sm text-gray-500">
            Completed by: {todo.signature}
          </div>
        )}
      </div>

      <AddSubTodoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={(text) => {
          onAddSubTodo(todo.id, text);
          setIsModalOpen(false);
        }}
      />

      {todo.subTodos.length > 0 && (
        <div className="pl-8 space-y-2">
          {todo.subTodos.map((subTodo) => (
            <TodoItem
              key={subTodo.id}
              todo={subTodo}
              onComplete={onComplete}
              onAssign={(todoId, assignee) => onAssign(todoId, assignee, true)}
              onAddSubTodo={onAddSubTodo}
              onDelete={(todoId) => onDelete(todoId, true)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoItem;