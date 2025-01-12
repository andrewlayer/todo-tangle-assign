import React, { useState } from 'react';
import { Plus, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TodoItem from './TodoItem';
import SignatureModal from './SignatureModal';
import FilterBar from './todo/FilterBar';
import { Todo } from '@/types/todo';
import { useTodos } from '@/hooks/useTodos';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const TodoList = () => {
  const [newTodo, setNewTodo] = React.useState('');
  const [selectedTodo, setSelectedTodo] = React.useState<Todo | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = React.useState(false);
  const [assigneeFilters, setAssigneeFilters] = React.useState<string[]>([]);
  const [isOpen, setIsOpen] = React.useState(true);
  const isMobile = useIsMobile();
  
  const { 
    todos, 
    addTodo, 
    deleteTodo, 
    completeTodo, 
    uncompleteTodo, 
    assignTodo, 
    updateNotes,
    updateTodoText 
  } = useTodos();

  const { data: users = [] } = useQuery({
    queryKey: ['assignable-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignable_users')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const handleAddTodo = async (text: string, parentId: string | null = null) => {
    if (!text.trim()) return;
    await addTodo(text, parentId);
    setNewTodo('');
  };

  const handleTodoCompletion = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsSignatureModalOpen(true);
  };

  const handleSignatureSubmit = async (signature: string) => {
    if (!selectedTodo) return;
    await completeTodo(selectedTodo.id, signature);
    setIsSignatureModalOpen(false);
    setSelectedTodo(null);
  };

  const filterTodosByAssignees = (todos: Todo[], filters: string[]): Todo[] => {
    if (filters.length === 0) return todos;
    
    return todos.map(todo => {
      const matchesFilter = todo.assigned_to && filters.includes(todo.assigned_to);
      const filteredSubTodos = filterTodosByAssignees(todo.subTodos, filters);
      
      if (matchesFilter || filteredSubTodos.length > 0) {
        return {
          ...todo,
          subTodos: filteredSubTodos
        };
      }
      return null;
    }).filter((todo): todo is Todo => todo !== null);
  };

  const countAllTodos = (todos: Todo[]): number => {
    return todos.reduce((count, todo) => {
      return count + 1 + countAllTodos(todo.subTodos);
    }, 0);
  };

  const filteredTodos = filterTodosByAssignees(todos, assigneeFilters);
  const totalTodoCount = countAllTodos(filteredTodos);

  return (
    <div className="w-full min-w-0 px-4 sm:px-6 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-8">
            <div className="flex items-center gap-3 overflow-hidden">
              <img 
                src="/lovable-uploads/fc710911-f339-469a-b007-e2b31d58d6a9.png" 
                alt="Layer's Logo" 
                className="w-8 h-8 flex-shrink-0"
              />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Layer's Todos</h1>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Link to="/status" className="flex-1 sm:flex-none">
                <Button variant="outline" size="sm" className="w-full">
                  Where I Left Off
                </Button>
              </Link>
              <Link to="/settings" className="flex-1 sm:flex-none">
                <Button variant="outline" size="sm" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>

          <FilterBar
            value={assigneeFilters}
            onChange={setAssigneeFilters}
            placeholder="Filter by assignee..."
          />
          
          <div className="flex flex-col sm:flex-row gap-2 min-w-0">
            <Input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new todo..."
              className="flex-1 min-w-0"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTodo(newTodo)}
            />
            <Button 
              onClick={() => handleAddTodo(newTodo)} 
              className="bg-[#7A65FF] hover:bg-[#6952FF] text-white w-full sm:w-auto whitespace-nowrap flex-shrink-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Todo
            </Button>
          </div>

          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-white rounded-lg shadow-sm border">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Tasks</h2>
                <Badge variant="secondary">{totalTodoCount}</Badge>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4">
              {filteredTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onComplete={handleTodoCompletion}
                  onUncomplete={uncompleteTodo}
                  onAssign={assignTodo}
                  onAddSubTodo={(parentId, text) => handleAddTodo(text, parentId)}
                  onDelete={deleteTodo}
                  onUpdateNotes={updateNotes}
                  onUpdateText={updateTodoText}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>

          <SignatureModal
            isOpen={isSignatureModalOpen}
            onClose={() => setIsSignatureModalOpen(false)}
            onSubmit={handleSignatureSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default TodoList;