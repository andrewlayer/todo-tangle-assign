import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';

interface TodoNotesProps {
  isOpen: boolean;
  notes: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur: () => void;
}

const TodoNotes = ({
  isOpen,
  notes,
  onChange,
  onBlur
}: TodoNotesProps) => {
  return (
    <Collapsible open={isOpen}>
      <CollapsibleContent className="mt-4">
        <Textarea
          placeholder="Add notes..."
          value={notes}
          onChange={onChange}
          onBlur={onBlur}
          className="w-full min-h-[100px] text-sm"
        />
      </CollapsibleContent>
    </Collapsible>
  );
};

export default TodoNotes;