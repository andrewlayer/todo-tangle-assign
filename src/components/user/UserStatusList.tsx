import React, { useState, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import debounce from 'lodash/debounce';
import ReactMarkdown from 'react-markdown';

interface UserStatus {
  id: string;
  user_name: string;
  status_text: string | null;
  updated_at: string | null;
}

const UserStatusList = ({ users }: { users: { name: string }[] }) => {
  const { toast } = useToast();
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateStatus = useCallback(
    debounce(async (userName: string, newStatus: string) => {
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
    }, 5000),
    [toast, refetch]
  );

  const handleStatusChange = (userName: string, newStatus: string) => {
    setLocalStatuses(prev => ({ ...prev, [userName]: newStatus }));
    debouncedUpdateStatus(userName, newStatus);
  };

  const getStatusForUser = (userName: string) => {
    return statuses?.find(status => status.user_name === userName);
  };

  const handleEditClick = useCallback((userName: string) => {
    setIsEditing(prev => ({ ...prev, [userName]: true }));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Where I Left Off</h2>
      <div className="space-y-8">
        {users.map((user) => {
          const status = getStatusForUser(user.name);
          const localStatus = localStatuses[user.name];
          const isUserEditing = isEditing[user.name];
          const displayText = localStatus !== undefined ? localStatus : status?.status_text || '';

          return (
            <div key={user.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-700">{user.name}</h3>
                {status && (
                  <span className="text-sm text-gray-500">
                    Last updated: {format(new Date(status.updated_at || ''), 'MMM d, yyyy h:mm a')}
                  </span>
                )}
              </div>
              {isUserEditing ? (
                <Textarea
                  placeholder="What did you work on last? (Supports Markdown)"
                  value={displayText}
                  onChange={(e) => handleStatusChange(user.name, e.target.value)}
                  className="min-h-[100px] font-mono"
                  onBlur={() => setIsEditing(prev => ({ ...prev, [user.name]: false }))}
                  autoFocus
                />
              ) : (
                <button
                  type="button"
                  onClick={() => handleEditClick(user.name)}
                  className="w-full text-left prose prose-sm max-w-none p-3 border rounded-md min-h-[100px] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {displayText ? (
                    <div className="flex flex-col items-start [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      <ReactMarkdown>{displayText}</ReactMarkdown>
                    </div>
                  ) : (
                    <span className="text-gray-400">Click to add your status (Supports Markdown)</span>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserStatusList;