import React, { useState, useEffect } from 'react';
import { Check, Plus, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Todo } from '@/types/todo';
import { cn } from '@/lib/utils';
import AddSubTodoModal from './AddSubTodoModal';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';

interface TodoItemProps {
  todo: Todo;
  onComplete: (todo: Todo) => void;
  onUncomplete: (todoId: string) => void;
  onAssign: (todoId: string, assignee: string, isSubTodo?: boolean) => void;
  onAddSubTodo: (parentId: string, text: string) => void;
  onDelete: (todoId: string, isSubTodo?: boolean) => void;
  onUpdateNotes: (todoId: string, notes: string) => void;
  onUpdateText: (todoId: string, text: string) => void;
}

const TodoItem = ({ 
  todo, 
  onComplete,
  onUncomplete, 
  onAssign, 
  onAddSubTodo, 
  onDelete,
  onUpdateNotes,
  onUpdateText
}: TodoItemProps) => {
  const [assignee, setAssignee] = useState(todo.assigned_to || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notes, setNotes] = useState(todo.notes || '');
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(todo.text);

  useEffect(() => {
    setAssignee(todo.assigned_to || '');
    setNotes(todo.notes || '');
    setEditedText(todo.text);
  }, [todo.assigned_to, todo.notes, todo.text]);

  const handleAssignChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setAssignee(newValue);
  };

  const handleAssignBlur = () => {
    if (assignee !== todo.assigned_to) {
      onAssign(todo.id, assignee);
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleNotesBlur = () => {
    if (notes !== todo.notes) {
      onUpdateNotes(todo.id, notes);
    }
  };

  const handleToggleComplete = () => {
    if (todo.completed) {
      onUncomplete(todo.id);
    } else {
      onComplete(todo);
    }
  };

  const handleTextEdit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTextSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedText(todo.text);
    }
  };

  const handleTextSave = () => {
    if (editedText.trim() && editedText !== todo.text) {
      onUpdateText(todo.id, editedText);
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-2">
      <div className={cn(
        "p-4 rounded-lg border border-gray-200 shadow-sm transition-all",
        "hover:shadow-md bg-white",
        todo.completed && "bg-gray-50 border-gray-100"
      )}>
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleComplete}
            className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center",
              "transition-colors hover:border-[#7A65FF]",
              todo.completed ? "bg-[#7A65FF] border-[#7A65FF]" : "border-gray-300"
            )}
          >
            {todo.completed && <Check className="w-3 h-3 text-white" />}
          </button>
          
          {isEditing ? (
            <Input
              type="text"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              onKeyDown={handleTextEdit}
              onBlur={handleTextSave}
              className="flex-1"
              autoFocus
            />
          ) : (
            <span 
              className={cn(
                "flex-1 text-gray-900 cursor-pointer hover:text-[#7A65FF]",
                todo.completed && "line-through text-gray-500"
              )}
              onClick={() => !todo.completed && setIsEditing(true)}
            >
              {todo.text}
            </span>
          )}

          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Assign to..."
              value={assignee}
              onChange={handleAssignChange}
              onBlur={handleAssignBlur}
              className="w-32 h-8 text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="h-8"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNotesOpen(!isNotesOpen)}
              className="h-8"
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(todo.id)}
              className="h-8"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Collapsible open={isNotesOpen} onOpenChange={setIsNotesOpen}>
          <CollapsibleContent className="mt-4">
            <Textarea
              placeholder="Add notes..."
              value={notes}
              onChange={handleNotesChange}
              onBlur={handleNotesBlur}
              className="w-full min-h-[100px] text-sm"
            />
          </CollapsibleContent>
        </Collapsible>

        {todo.completed && todo.signature && (
          <div className="mt-2 text-sm text-gray-500">
            Completed by: {todo.signature}
          </div>
        )}
      </div>

      <AddSubTodoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={(text) => {
          onAddSubTodo(todo.id, text);
          setIsModalOpen(false);
        }}
      />

      {todo.subTodos.length > 0 && (
        <div className="pl-8 space-y-2">
          {todo.subTodos.map((subTodo) => (
            <TodoItem
              key={subTodo.id}
              todo={subTodo}
              onComplete={onComplete}
              onUncomplete={onUncomplete}
              onAssign={(todoId, assignee) => onAssign(todoId, assignee, true)}
              onAddSubTodo={onAddSubTodo}
              onDelete={(todoId) => onDelete(todoId, true)}
              onUpdateNotes={onUpdateNotes}
              onUpdateText={onUpdateText}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoItem;