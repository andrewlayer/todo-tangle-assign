import React from 'react';
import TodoText from './TodoText';
import TodoControls from './TodoControls';
import TodoNotes from './TodoNotes';

interface TodoLayoutProps {
  text: string;
  isEditing: boolean;
  isCompleted: boolean;
  editedText: string;
  assignee: string;
  notes: string;
  isNotesOpen: boolean;
  signature?: string;
  onEditedTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextEdit: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onTextClick: () => void;
  onTextSave: () => void;
  onAssignChange: (value: string) => void;
  onAddSubTodo: () => void;
  onToggleNotes: () => void;
  onDelete: () => void;
  onNotesChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onNotesBlur: () => void;
}

const TodoLayout = ({
  text,
  isEditing,
  isCompleted,
  editedText,
  assignee,
  notes,
  isNotesOpen,
  signature,
  onEditedTextChange,
  onTextEdit,
  onTextClick,
  onTextSave,
  onAssignChange,
  onAddSubTodo,
  onToggleNotes,
  onDelete,
  onNotesChange,
  onNotesBlur
}: TodoLayoutProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="w-full">
        <TodoText
          text={text}
          isEditing={isEditing}
          isCompleted={isCompleted}
          editedText={editedText}
          onEditedTextChange={onEditedTextChange}
          onTextEdit={onTextEdit}
          onTextClick={onTextClick}
          onTextSave={onTextSave}
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <TodoControls
            assignee={assignee}
            onAssignChange={onAssignChange}
            onAddSubTodo={onAddSubTodo}
            onToggleNotes={onToggleNotes}
            onDelete={onDelete}
            hasNotes={Boolean(notes?.trim())}
          />
        </div>
      </div>

      <TodoNotes
        isOpen={isNotesOpen}
        notes={notes}
        onChange={onNotesChange}
        onBlur={onNotesBlur}
      />

      {isCompleted && signature && (
        <div className="text-sm text-gray-500">
          Completed by: {signature}
        </div>
      )}
    </div>
  );
};

export default TodoLayout;