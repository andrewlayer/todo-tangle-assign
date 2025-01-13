import React from 'react';
import { Plus, MessageSquare, Trash2, MoveRight } from 'lucide-react';
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
import { useLocation } from 'react-router-dom';

interface TodoControlsProps {
  assignee: string;
  onAssignChange: (value: string) => void;
  onAddSubTodo: () => void;
  onToggleNotes: () => void;
  onDelete: () => void;
  onMoveToMainList?: () => void;
  hasNotes: boolean;
  isMobile?: boolean;
}

const TodoControls = ({
  assignee,
  onAssignChange,
  onAddSubTodo,
  onToggleNotes,
  onDelete,
  onMoveToMainList,
  hasNotes,
  isMobile
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

  const location = useLocation();
  const isInBacklog = location.pathname.includes('/backlogs/');
  const selectValue = assignee || '_unassigned';

  const handleAssignChange = (value: string) => {
    onAssignChange(value === '_unassigned' ? '' : value);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
      <Select value={selectValue} onValueChange={handleAssignChange}>
        <SelectTrigger className="h-8 flex-1">
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
      <div className="flex gap-2 justify-end sm:justify-start">
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
        {isInBacklog && onMoveToMainList && (
          <Button
            variant="outline"
            size="sm"
            onClick={onMoveToMainList}
            className="h-8"
          >
            <MoveRight className="w-4 h-4" />
          </Button>
        )}
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          className="h-8"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default TodoControls;