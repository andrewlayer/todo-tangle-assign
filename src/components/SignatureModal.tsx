import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (signature: string) => void;
}

const SignatureModal = ({ isOpen, onClose, onSubmit }: SignatureModalProps) => {
  const [signature, setSignature] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (signature.trim()) {
      onSubmit(signature);
      setSignature('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign Off Todo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="Enter your name..."
            className="w-full"
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Complete Todo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SignatureModal;