'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function ChallengeJoinButton({ challengeId, disabled = false }: { challengeId: string; disabled?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (disabled || loading) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/community/challenges/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to join challenge');
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleJoin}
      disabled={disabled || loading}
      className="w-full"
      variant={disabled ? 'secondary' : 'default'}
    >
      <Plus className="w-4 h-4 mr-2" />
      {loading
        ? 'Joining...'
        : disabled
        ? 'Starts Soon'
        : 'Join Challenge'}
    </Button>
  );
}

