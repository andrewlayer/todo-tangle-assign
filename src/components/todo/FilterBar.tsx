import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface FilterBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const FilterBar = ({ value, onChange, placeholder }: FilterBarProps) => {
  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10"
      />
    </div>
  );
};

export default FilterBar;