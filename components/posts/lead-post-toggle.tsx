'use client';

import { useState } from 'react';
import { Star, StarOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface LeadPostToggleProps {
  postId: string;
  isLead: boolean;
  onToggle?: (isLead: boolean) => void;
}

export function LeadPostToggle({ postId, isLead, onToggle }: LeadPostToggleProps) {
  const [loading, setLoading] = useState(false);
  const [currentIsLead, setCurrentIsLead] = useState(isLead);
  const { toast } = useToast();

  const handleToggle = async () => {
    setLoading(true);
    
    try {
      const url = `/api/posts/${postId}/set-lead`;
      const method = currentIsLead ? 'DELETE' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update lead status');
      }

      const newIsLead = !currentIsLead;
      setCurrentIsLead(newIsLead);
      onToggle?.(newIsLead);

      toast({
        title: 'Success',
        description: newIsLead 
          ? 'Post set as lead post successfully' 
          : 'Lead status removed successfully',
      });
    } catch (error) {
      console.error('Error toggling lead status:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update lead status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={currentIsLead ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      className={currentIsLead ? "bg-yellow-500 hover:bg-yellow-600 text-white" : ""}
    >
      {currentIsLead ? (
        <>
          <Star className="h-4 w-4 mr-2 fill-current" />
          Lead Post
        </>
      ) : (
        <>
          <StarOff className="h-4 w-4 mr-2" />
          Set as Lead
        </>
      )}
    </Button>
  );
}