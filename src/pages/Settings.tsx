import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Trash2 } from "lucide-react"

interface AssignableUser {
  id: string;
  name: string;
}

const Settings = () => {
  const [users, setUsers] = useState<AssignableUser[]>([]);
  const [newUserName, setNewUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('assignable_users')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error fetching users",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    
    setIsAdding(true);
    try {
      const { error } = await supabase
        .from('assignable_users')
        .insert([{ name: newUserName.trim() }]);

      if (error) throw error;
      
      setNewUserName('');
      await fetchUsers();
      toast({
        title: "Success",
        description: "New assignee added successfully",
      });
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "Error adding user",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('assignable_users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      
      await fetchUsers();
      toast({
        title: "Success",
        description: "Assignee deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error deleting user",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Manage Assignees</h2>
            
            <form onSubmit={addUser} className="flex gap-2 mb-6">
              <Input
                type="text"
                placeholder="Enter assignee name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                disabled={isAdding}
              />
              <Button type="submit" disabled={isAdding}>
                {isAdding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Assignee'
                )}
              </Button>
            </form>

            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <span>{user.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No assignees added yet
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;