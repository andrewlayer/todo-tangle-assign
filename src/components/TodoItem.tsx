import React, { useState, useEffect } from 'react';
import { Check, Plus, Trash2, MessageSquare, Edit, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Todo } from '@/types/todo';
import { cn } from '@/lib/utils';
import AddSubTodoModal from './AddSubTodoModal';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface TodoItemProps {
  todo: Todo;
  onComplete: (todo: Todo) => void;
  onAssign: (todoId: string, assignee: string, isSubTodo?: boolean) => void;
  onAddSubTodo: (parentId: string, text: string) => void;
  onDelete: (todoId: string, isSubTodo?: boolean) => void;
  onUpdateNotes: (todoId: string, notes: string) => void;
}

const TodoItem = ({ 
  todo, 
  onComplete, 
  onAssign, 
  onAddSubTodo, 
  onDelete,
  onUpdateNotes 
}: TodoItemProps) => {
  const [assignee, setAssignee] = useState(todo.assigned_to || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notes, setNotes] = useState(todo.notes || '');
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState('');

  useEffect(() => {
    setAssignee(todo.assigned_to || '');
    setNotes(todo.notes || '');
  }, [todo.assigned_to, todo.notes]);

  const handleAssignChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setAssignee(newValue);
  };

  const handleAssignBlur = () => {
    if (assignee !== todo.assigned_to) {
      onAssign(todo.id, assignee);
    }
  };

  const handleEditNotes = () => {
    setTempNotes(notes);
    setIsEditingNotes(true);
  };

  const handleSaveNotes = () => {
    onUpdateNotes(todo.id, tempNotes);
    setIsEditingNotes(false);
  };

  const handleCancelEdit = () => {
    setTempNotes(notes);
    setIsEditingNotes(false);
  };

  const handleDeleteNotes = () => {
    onUpdateNotes(todo.id, '');
    setIsNotesOpen(false);
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
            onClick={() => !todo.completed && onComplete(todo)}
            className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center",
              "transition-colors hover:border-[#7A65FF]",
              todo.completed ? "bg-[#7A65FF] border-[#7A65FF]" : "border-gray-300"
            )}
          >
            {todo.completed && <Check className="w-3 h-3 text-white" />}
          </button>
          
          <span className={cn(
            "flex-1 text-gray-900",
            todo.completed && "line-through text-gray-500"
          )}>
            {todo.text}
          </span>

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
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-gray-700">Notes</h4>
                <div className="flex gap-2">
                  {!isEditingNotes ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEditNotes}
                        className="h-8 px-2"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {notes && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleDeleteNotes}
                          className="h-8 px-2 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSaveNotes}
                        className="h-8 px-2 text-green-500 hover:text-green-600"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="h-8 px-2 text-red-500 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              {isEditingNotes ? (
                <Textarea
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                  placeholder="Add notes..."
                  className="w-full min-h-[100px] text-sm"
                />
              ) : (
                <div className="text-sm text-gray-600 whitespace-pre-wrap">
                  {notes || "No notes added yet"}
                </div>
              )}
            </div>
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
              onAssign={(todoId, assignee) => onAssign(todoId, assignee, true)}
              onAddSubTodo={onAddSubTodo}
              onDelete={(todoId) => onDelete(todoId, true)}
              onUpdateNotes={onUpdateNotes}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoItem;