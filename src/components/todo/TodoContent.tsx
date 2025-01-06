import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Todo } from '@/types/todo';
import TodoControls from './TodoControls';
import TodoText from './TodoText';
import TodoNotes from './TodoNotes';

interface TodoContentProps {
  todo: Todo;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onComplete: () => void;
  onUncomplete: () => void;
  assignee: string;
  onAssignChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAssignBlur: () => void;
  isEditing: boolean;
  editedText: string;
  onEditedTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextEdit: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onTextClick: () => void;
  onTextSave: () => void;
  isNotesOpen: boolean;
  notes: string;
  onNotesChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onNotesBlur: () => void;
  onToggleNotes: () => void;
  onAddSubTodo: () => void;
  onDelete: () => void;
}

const TodoContent = ({
  todo,
  isExpanded,
  onToggleExpand,
  onComplete,
  onUncomplete,
  assignee,
  onAssignChange,
  onAssignBlur,
  isEditing,
  editedText,
  onEditedTextChange,
  onTextEdit,
  onTextClick,
  onTextSave,
  isNotesOpen,
  notes,
  onNotesChange,
  onNotesBlur,
  onToggleNotes,
  onAddSubTodo,
  onDelete,
}: TodoContentProps) => {
  return (
    <>
      <div className="flex items-center gap-3">
        {todo.subTodos.length > 0 && (
          <button
            onClick={onToggleExpand}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronRight
              className={cn(
                "w-4 h-4 transition-transform",
                isExpanded && "transform rotate-90"
              )}
            />
          </button>
        )}
        
        <button
          onClick={todo.completed ? onUncomplete : onComplete}
          className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center",
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
          onEditedTextChange={onEditedTextChange}
          onTextEdit={onTextEdit}
          onTextClick={onTextClick}
          onTextSave={onTextSave}
        />

        <TodoControls
          assignee={assignee}
          onAssignChange={onAssignChange}
          onAssignBlur={onAssignBlur}
          onAddSubTodo={onAddSubTodo}
          onToggleNotes={onToggleNotes}
          onDelete={onDelete}
          hasNotes={Boolean(todo.notes?.trim())}
        />
      </div>

      <TodoNotes
        isOpen={isNotesOpen}
        notes={notes}
        onChange={onNotesChange}
        onBlur={onNotesBlur}
      />

      {todo.completed && todo.signature && (
        <div className="mt-2 text-sm text-gray-500">
          Completed by: {todo.signature}
        </div>
      )}
    </>
  );
};

export default TodoContent;