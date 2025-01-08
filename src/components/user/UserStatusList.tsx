import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

interface UserStatus {
  id: string;
  user_name: string;
  status_text: string;
  updated_at: string;
}

const UserStatusList = ({ users }: { users: { name: string }[] }) => {
  const { toast } = useToast();

  const { data: statuses, refetch } = useQuery({
    queryKey: ['user-statuses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_status')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as UserStatus[];
    }
  });

  const updateStatus = async (userName: string, newStatus: string) => {
    const { error } = await supabase
      .from('user_status')
      .upsert({ 
        user_name: userName, 
        status_text: newStatus,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_name'
      });

    if (error) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Status updated",
        description: "Your status has been saved"
      });
      refetch();
    }
  };

  const getStatusForUser = (userName: string) => {
    return statuses?.find(status => status.user_name === userName);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Where I Left Off</h2>
      <div className="space-y-8">
        {users.map((user) => {
          const status = getStatusForUser(user.name);
          return (
            <div key={user.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-700">{user.name}</h3>
                {status && (
                  <span className="text-sm text-gray-500">
                    Last updated: {format(new Date(status.updated_at), 'MMM d, yyyy h:mm a')}
                  </span>
                )}
              </div>
              <Textarea
                placeholder="What did you work on last?"
                value={status?.status_text || ''}
                onChange={(e) => updateStatus(user.name, e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserStatusList;