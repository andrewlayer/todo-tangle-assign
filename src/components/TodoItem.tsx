import React, { useState, useEffect } from 'react';
import { Check, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Todo } from '@/types/todo';
import AddSubTodoModal from './AddSubTodoModal';
import TodoControls from './todo/TodoControls';
import TodoText from './todo/TodoText';
import TodoNotes from './todo/TodoNotes';

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
          <div className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          
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
          
          <TodoText
            text={todo.text}
            isEditing={isEditing}
            isCompleted={todo.completed}
            editedText={editedText}
            onEditedTextChange={(e) => setEditedText(e.target.value)}
            onTextEdit={handleTextEdit}
            onTextClick={() => !todo.completed && setIsEditing(true)}
            onTextSave={handleTextSave}
          />

          <TodoControls
            assignee={assignee}
            onAssignChange={handleAssignChange}
            onAssignBlur={handleAssignBlur}
            onAddSubTodo={() => setIsModalOpen(true)}
            onToggleNotes={() => setIsNotesOpen(!isNotesOpen)}
            onDelete={() => onDelete(todo.id)}
            hasNotes={Boolean(todo.notes?.trim())}
          />
        </div>

        <TodoNotes
          isOpen={isNotesOpen}
          notes={notes}
          onChange={handleNotesChange}
          onBlur={handleNotesBlur}
        />

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