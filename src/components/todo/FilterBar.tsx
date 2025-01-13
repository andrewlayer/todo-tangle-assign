import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface FilterBarProps {
  showCompleted: boolean;
  onShowCompletedChange: (show: boolean) => void;
  onAddTodo: (text: string) => Promise<void>;
  isAddingTodo: boolean;
}

const FilterBar = ({ 
  showCompleted, 
  onShowCompletedChange, 
  onAddTodo,
  isAddingTodo 
}: FilterBarProps) => {
  const [newTodo, setNewTodo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim() || isAddingTodo) return;

    try {
      await onAddTodo(newTodo.trim());
      setNewTodo('');
    } catch (error) {
      console.error('Error in FilterBar:', error);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
          className="flex-1"
          disabled={isAddingTodo}
        />
        <Button type="submit" disabled={!newTodo.trim() || isAddingTodo}>
          {isAddingTodo ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            'Add Todo'
          )}
        </Button>
      </form>
      <div className="flex items-center space-x-2">
        <Switch
          id="show-completed"
          checked={showCompleted}
          onCheckedChange={onShowCompletedChange}
        />
        <Label htmlFor="show-completed">Show completed todos</Label>
      </div>
    </div>
  );
};

export default FilterBar;