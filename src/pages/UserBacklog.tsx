import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import TodoList from '@/components/TodoList';
import { supabase } from '@/integrations/supabase/client';
import { Todo } from '@/types/todo';

const UserBacklog = () => {
  const { username } = useParams();

  if (!username) return null;

  const handleMoveToMainList = async (todo: Todo) => {
    await supabase
      .from('todos')
      .update({ assigned_to: '' })
      .eq('id', todo.id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4">
        <div className="mb-4">
          <Link to="/backlogs">
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Backlogs
            </Button>
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-6">{decodeURIComponent(username)}'s Backlog</h1>
        <TodoList 
          assignedUser={decodeURIComponent(username)} 
          onMoveToMainList={handleMoveToMainList}
        />
      </div>
    </div>
  );
};

export default UserBacklog;