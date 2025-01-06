import React from 'react';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TodoControlsProps {
  assignee: string;
  onAssignChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAssignBlur: () => void;
  onAddSubTodo: () => void;
  onToggleNotes: () => void;
  onDelete: () => void;
  hasNotes: boolean;
}

const TodoControls = ({
  assignee,
  onAssignChange,
  onAssignBlur,
  onAddSubTodo,
  onToggleNotes,
  onDelete,
  hasNotes
}: TodoControlsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="text"
        placeholder="Assign to..."
        value={assignee}
        onChange={onAssignChange}
        onBlur={onAssignBlur}
        className="w-32 h-8 text-sm"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={onAddSubTodo}
        className="h-8"
      >
        <Plus className="w-4 h-4" />
      </Button>
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleNotes}
          className="h-8"
        >
          <MessageSquare className="w-4 h-4" />
        </Button>
        {hasNotes && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </div>
      <Button
        variant="destructive"
        size="sm"
        onClick={onDelete}
        className="h-8"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default TodoControls;