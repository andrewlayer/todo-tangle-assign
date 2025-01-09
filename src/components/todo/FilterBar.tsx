import React from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FilterBarProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

const FilterBar = ({ value = [], onChange, placeholder }: FilterBarProps) => {
  const [open, setOpen] = React.useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['assignable-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignable_users')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const toggleUser = (userName: string) => {
    const newValue = Array.isArray(value) && value.includes(userName)
      ? value.filter(v => v !== userName)
      : [...(Array.isArray(value) ? value : []), userName];
    onChange(newValue);
  };

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={isLoading}
          >
            {!value?.length ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {value.map((userName) => (
                  <Badge 
                    key={userName}
                    variant="secondary"
                    className="mr-1"
                  >
                    {userName}
                  </Badge>
                ))}
              </div>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search users..." />
            <CommandEmpty>No user found.</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.name}
                  onSelect={() => toggleUser(user.name)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      Array.isArray(value) && value.includes(user.name) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {user.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FilterBar;