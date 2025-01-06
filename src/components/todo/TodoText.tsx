import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TodoTextProps {
  text: string;
  isEditing: boolean;
  isCompleted: boolean;
  editedText: string;
  onEditedTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextEdit: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onTextClick: () => void;
  onTextSave: () => void;
}

const TodoText = ({
  text,
  isEditing,
  isCompleted,
  editedText,
  onEditedTextChange,
  onTextEdit,
  onTextClick,
  onTextSave
}: TodoTextProps) => {
  if (isEditing) {
    return (
      <Input
        type="text"
        value={editedText}
        onChange={onEditedTextChange}
        onKeyDown={onTextEdit}
        onBlur={onTextSave}
        className="flex-1 min-w-0"
        autoFocus
      />
    );
  }

  return (
    <span 
      className={cn(
        "flex-1 text-gray-900 cursor-pointer hover:text-[#7A65FF] truncate",
        isCompleted && "line-through text-gray-500"
      )}
      onClick={onTextClick}
    >
      {text}
    </span>
  );
};

export default TodoText;