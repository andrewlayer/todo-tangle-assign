import * as React from 'react';
import { Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TodoItem from './TodoItem';
import SignatureModal from './SignatureModal';
import FilterBar from './todo/FilterBar';
import { Todo } from '@/types/todo';
import { useTodos } from '@/hooks/useTodos';
import { Link } from 'react-router-dom';
import UserStatusList from './user/UserStatusList';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const TodoList = () => {
  const [newTodo, setNewTodo] = React.useState('');
  const [selectedTodo, setSelectedTodo] = React.useState<Todo | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = React.useState(false);
  const [assigneeFilters, setAssigneeFilters] = React.useState<string[]>([]);
  
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

  const filteredTodos = filterTodosByAssignees(todos, assigneeFilters);

  return (
    <div className="max-w-[90rem] mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/fc710911-f339-469a-b007-e2b31d58d6a9.png" 
                alt="Layer's Logo" 
                className="w-8 h-8"
              />
              <h1 className="text-3xl font-bold text-gray-900">Layer's Todos</h1>
            </div>
            <Link to="/settings">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>

          <FilterBar
            value={assigneeFilters}
            onChange={setAssigneeFilters}
            placeholder="Filter by assignee..."
          />
          
          <div className="flex gap-2">
            <Input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new todo..."
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTodo(newTodo)}
            />
            <Button onClick={() => handleAddTodo(newTodo)} className="bg-[#7A65FF] hover:bg-[#6952FF] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Todo
            </Button>
          </div>

          <div className="space-y-4">
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
          </div>

          <SignatureModal
            isOpen={isSignatureModalOpen}
            onClose={() => setIsSignatureModalOpen(false)}
            onSubmit={handleSignatureSubmit}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border h-fit">
          <UserStatusList users={users} />
        </div>
      </div>
    </div>
  );
};

export default TodoList;