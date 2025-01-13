import React from 'react';
import { Plus, MessageSquare, Trash2, MoveRight, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onAddSubTodo}>
              <Plus className="w-4 h-4 mr-2" />
              Add Subtask
            </DropdownMenuItem>
            {isInBacklog && onMoveToMainList && (
              <DropdownMenuItem onClick={onMoveToMainList}>
                <MoveRight className="w-4 h-4 mr-2" />
                Move to Todos
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={onDelete}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TodoControls;