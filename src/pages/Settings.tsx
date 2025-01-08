import React, { useState } from 'react';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface AssignableUser {
  id: string;
  name: string;
}

const Settings = () => {
  const [newUserName, setNewUserName] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['assignableUsers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignable_users')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as AssignableUser[];
    },
  });

  const addUserMutation = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase
        .from('assignable_users')
        .insert([{ name }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignableUsers'] });
      setNewUserName('');
      toast({
        title: "User added",
        description: "The user has been added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add user",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('assignable_users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignableUsers'] });
      toast({
        title: "User deleted",
        description: "The user has been removed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    addUserMutation.mutate(newUserName);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="mr-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Assignable Users</h2>
          
          <form onSubmit={handleAddUser} className="flex gap-2 mb-6">
            <Input
              type="text"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="Enter user name..."
              className="flex-1"
            />
            <Button type="submit" className="bg-[#7A65FF] hover:bg-[#6952FF] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </form>

          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <span>{user.name}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteUserMutation.mutate(user.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;