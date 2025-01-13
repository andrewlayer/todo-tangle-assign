import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export interface FilterBarProps {
  showCompleted: boolean;
  onShowCompletedChange: (value: boolean) => void;
  onAddTodo: (text: string, parentId?: string | null) => Promise<any>;
}

const FilterBar = ({ showCompleted, onShowCompletedChange, onAddTodo }: FilterBarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [todoText, setTodoText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (todoText.trim()) {
      await onAddTodo(todoText.trim());
      setTodoText("");
      setIsOpen(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="show-completed"
          checked={showCompleted}
          onCheckedChange={onShowCompletedChange}
        />
        <Label htmlFor="show-completed">Show completed</Label>
      </div>

      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Add Todo
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Todo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <Input
                value={todoText}
                onChange={(e) => setTodoText(e.target.value)}
                placeholder="Enter todo text..."
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="submit">Add Todo</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FilterBar;