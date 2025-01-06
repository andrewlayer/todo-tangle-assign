import React, { useState, useEffect } from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Todo } from '@/types/todo';
import AddSubTodoModal from './AddSubTodoModal';
import TodoContent from './todo/TodoContent';

interface TodoItemProps {
  todo: Todo;
  onComplete: (todo: Todo) => void;
  onUncomplete: (todoId: string) => void;
  onAssign: (todoId: string, assignee: string, isSubTodo?: boolean) => void;
  onAddSubTodo: (parentId: string, text: string) => void;
  onDelete: (todoId: string, isSubTodo?: boolean) => void;
  onUpdateNotes: (todoId: string, notes: string) => void;
  onUpdateText: (todoId: string, text: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const TodoItem = ({ 
  todo, 
  onComplete,
  onUncomplete, 
  onAssign, 
  onAddSubTodo, 
  onDelete,
  onUpdateNotes,
  onUpdateText,
  isExpanded,
  onToggleExpand
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
    setAssignee(e.target.value);
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

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', todo.id);
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-[#7A65FF]');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('border-[#7A65FF]');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-[#7A65FF]');
    const draggedTodoId = e.dataTransfer.getData('text/plain');
    if (draggedTodoId !== todo.id) {
      const draggedTodo = document.querySelector(`[data-todo-id="${draggedTodoId}"]`);
      if (draggedTodo) {
        onAddSubTodo(todo.id, draggedTodo.getAttribute('data-todo-text') || '');
        onDelete(draggedTodoId);
      }
    }
  };

  return (
    <div className="space-y-2">
      <div 
        className={cn(
          "p-4 rounded-lg border border-gray-200 shadow-sm transition-all",
          "hover:shadow-md bg-white group",
          todo.completed && "bg-gray-50 border-gray-100"
        )}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-todo-id={todo.id}
        data-todo-text={todo.text}
      >
        <div className="flex items-center gap-3">
          <div className="cursor-grab">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          
          <TodoContent
            todo={todo}
            isExpanded={isExpanded}
            onToggleExpand={onToggleExpand}
            onComplete={() => onComplete(todo)}
            onUncomplete={() => onUncomplete(todo.id)}
            assignee={assignee}
            onAssignChange={handleAssignChange}
            onAssignBlur={handleAssignBlur}
            isEditing={isEditing}
            editedText={editedText}
            onEditedTextChange={(e) => setEditedText(e.target.value)}
            onTextEdit={handleTextEdit}
            onTextClick={() => !todo.completed && setIsEditing(true)}
            onTextSave={handleTextSave}
            isNotesOpen={isNotesOpen}
            notes={notes}
            onNotesChange={handleNotesChange}
            onNotesBlur={handleNotesBlur}
            onToggleNotes={() => setIsNotesOpen(!isNotesOpen)}
            onAddSubTodo={() => setIsModalOpen(true)}
            onDelete={() => onDelete(todo.id)}
          />
        </div>
      </div>

      <AddSubTodoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={(text) => {
          onAddSubTodo(todo.id, text);
          setIsModalOpen(false);
        }}
      />

      {isExpanded && todo.subTodos.length > 0 && (
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
              isExpanded={isExpanded}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoItem;