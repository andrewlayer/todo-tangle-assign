import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

const Backlogs = () => {
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full min-w-0 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">User Backlogs</h1>
            <div className="grid gap-4">
              {users.map((user) => (
                <Link 
                  key={user.id} 
                  to={`/backlogs/${encodeURIComponent(user.name)}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between text-left font-normal"
                  >
                    <span>{user.name}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Backlogs;