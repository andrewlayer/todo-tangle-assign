import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

interface AddSubTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (text: string) => Promise<void>;
}

const AddSubTodoModal = ({ isOpen, onClose, onAdd }: AddSubTodoModalProps) => {
  const [newTodo, setNewTodo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    setIsSubmitting(true);
    try {
      await onAdd(newTodo.trim());
      setNewTodo('');
      onClose();
    } catch (error) {
      console.error('Error adding subtodo:', error);
      toast({
        title: "Error",
        description: "Failed to add subtodo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setNewTodo('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Sub-Todo</DialogTitle>
          <DialogDescription>
            Add a new sub-task to this todo item
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Enter sub-todo text..."
            autoFocus
            disabled={isSubmitting}
          />
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !newTodo.trim()}
            >
              {isSubmitting ? 'Adding...' : 'Add Sub-Todo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubTodoModal;