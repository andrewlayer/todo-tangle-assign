import React from 'react';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TodoControlsProps {
  assignee: string;
  onAssignChange: (value: string) => void;
  onAddSubTodo: () => void;
  onToggleNotes: () => void;
  onDelete: () => void;
  hasNotes: boolean;
}

const TodoControls = ({
  assignee,
  onAssignChange,
  onAddSubTodo,
  onToggleNotes,
  onDelete,
  hasNotes
}: TodoControlsProps) => {
  const { data: users = [] } = useQuery({
    queryKey: ['assignableUsers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignable_users')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const selectValue = assignee || '_unassigned';

  const handleAssignChange = (value: string) => {
    onAssignChange(value === '_unassigned' ? '' : value);
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1">
        <Select value={selectValue} onValueChange={handleAssignChange}>
          <SelectTrigger className="w-full h-8">
            <SelectValue placeholder="Assign to..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_unassigned">{''}</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.name}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
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