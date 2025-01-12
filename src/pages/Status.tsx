import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import UserStatusList from '@/components/user/UserStatusList';

const Status = () => {
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
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <UserStatusList users={users} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Status;