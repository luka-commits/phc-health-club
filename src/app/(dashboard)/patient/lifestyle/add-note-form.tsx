'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { createLifestyleNote } from '@/lib/actions/lifestyle';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AddNoteForm() {
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState('');
  const [noteDate, setNoteDate] = useState(() => {
    // Default to today's date in YYYY-MM-DD format
    return new Date().toISOString().split('T')[0];
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Please enter a note');
      return;
    }

    startTransition(async () => {
      const result = await createLifestyleNote({
        content: content.trim(),
        noteDate,
      });

      if (result.success) {
        toast.success('Note added successfully');
        setContent('');
        // Keep the date as is for convenience when adding multiple notes
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="note-date">Date</Label>
        <Input
          id="note-date"
          type="date"
          value={noteDate}
          onChange={(e) => setNoteDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="note-content">Note</Label>
        <Textarea
          id="note-content"
          placeholder="How are you feeling today? Any changes to report?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          required
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Adding...' : 'Add Note'}
      </Button>
    </form>
  );
}
