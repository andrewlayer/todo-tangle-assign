import React, { useState, useEffect } from 'react';
import { Check, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Todo } from '@/types/todo';
import AddSubTodoModal from './AddSubTodoModal';
import TodoControls from './todo/TodoControls';
import TodoText from './todo/TodoText';
import TodoNotes from './todo/TodoNotes';
import { useIsMobile } from '@/hooks/use-mobile';

interface TodoItemProps {
  todo: Todo;
  onComplete: (todo: Todo) => void;
  onUncomplete: (todoId: string) => void;
  onAssign: (todoId: string, assignee: string, isSubTodo?: boolean) => void;
  onAddSubTodo: (parentId: string, text: string) => void;
  onDelete: (todoId: string, isSubTodo?: boolean) => void;
  onUpdateNotes: (todoId: string, notes: string) => void;
  onUpdateText: (todoId: string, text: string) => void;
}

const TodoItem = ({ 
  todo, 
  onComplete,
  onUncomplete, 
  onAssign, 
  onAddSubTodo, 
  onDelete,
  onUpdateNotes,
  onUpdateText
}: TodoItemProps) => {
  const [assignee, setAssignee] = useState(todo.assigned_to || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notes, setNotes] = useState(todo.notes || '');
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(todo.text);
  const isMobile = useIsMobile();

  useEffect(() => {
    setAssignee(todo.assigned_to || '');
    setNotes(todo.notes || '');
    setEditedText(todo.text);
  }, [todo.assigned_to, todo.notes, todo.text]);

  const handleAssignChange = (value: string) => {
    setAssignee(value);
    onAssign(todo.id, value);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleNotesBlur = () => {
    if (notes !== todo.notes) {
      onUpdateNotes(todo.id, notes);
    }
  };

  const handleToggleComplete = () => {
    if (todo.completed) {
      onUncomplete(todo.id);
    } else {
      onComplete(todo);
    }
  };

  const handleTextEdit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTextSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedText(todo.text);
    }
  };

  const handleTextSave = () => {
    if (editedText.trim() && editedText !== todo.text) {
      onUpdateText(todo.id, editedText);
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-2">
      <div 
        className={cn(
          "p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm transition-all",
          "hover:shadow-md bg-white",
          todo.completed && "bg-gray-50 border-gray-100"
        )}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            {!isMobile && (
              <div className="cursor-grab">
                <GripVertical className="w-4 h-4 text-gray-400" />
              </div>
            )}
            
            <button
              onClick={handleToggleComplete}
              className={cn(
                "min-w-[20px] h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                "transition-colors hover:border-[#7A65FF]",
                todo.completed ? "bg-[#7A65FF] border-[#7A65FF]" : "border-gray-300"
              )}
            >
              {todo.completed && <Check className="w-3 h-3 text-white" />}
            </button>

            <TodoText
              text={todo.text}
              isEditing={isEditing}
              isCompleted={todo.completed}
              editedText={editedText}
              onEditedTextChange={(e) => setEditedText(e.target.value)}
              onTextEdit={handleTextEdit}
              onTextClick={() => !todo.completed && setIsEditing(true)}
              onTextSave={handleTextSave}
            />
          </div>

          <TodoControls
            assignee={assignee}
            onAssignChange={handleAssignChange}
            onAddSubTodo={() => setIsModalOpen(true)}
            onToggleNotes={() => setIsNotesOpen(!isNotesOpen)}
            onDelete={() => onDelete(todo.id)}
            hasNotes={Boolean(todo.notes?.trim())}
            isMobile={isMobile}
          />
        </div>

        <TodoNotes
          isOpen={isNotesOpen}
          notes={notes}
          onChange={handleNotesChange}
          onBlur={handleNotesBlur}
        />

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
        <div className="pl-4 sm:pl-8 space-y-2">
          {todo.subTodos.map((subTodo) => (
            <TodoItem
              key={subTodo.id}
              todo={subTodo}
              onComplete={onComplete}
              onUncomplete={onUncomplete}
              onAssign={(todoId, assignee) => onAssign(todoId, assignee, true)}
              onAddSubTodo={onAddSubTodo}
              onDelete={(todoId) => onDelete(todoId, true)}
              onUpdateNotes={onUpdateNotes}
              onUpdateText={onUpdateText}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoItem;