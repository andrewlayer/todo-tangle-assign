import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface FilterBarProps {
  filterText: string;
  onFilterChange: (value: string) => void;
}

const FilterBar = ({ filterText, onFilterChange }: FilterBarProps) => {
  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        type="text"
        value={filterText}
        onChange={(e) => onFilterChange(e.target.value)}
        placeholder="Filter tasks..."
        className="pl-10"
      />
    </div>
  );
};

export default FilterBar;