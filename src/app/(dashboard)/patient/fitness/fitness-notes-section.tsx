'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FitnessNote } from '@/types/database';

interface FitnessNotesSectionProps {
  notes: FitnessNote[];
}

export function FitnessNotesSection({ notes }: FitnessNotesSectionProps) {
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  function toggleNote(noteId: string) {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(noteId)) {
        next.delete(noteId);
      } else {
        next.add(noteId);
      }
      return next;
    });
  }

  // Content is considered long if it has more than 150 characters
  function isLongContent(content: string): boolean {
    return content.length > 150;
  }

  if (notes.length === 0) {
    return (
      <div className="flex h-[100px] items-center justify-center text-muted-foreground">
        No training notes yet. Add your first note above.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => {
        const isExpanded = expandedNotes.has(note.id);
        const isLong = isLongContent(note.content);
        const displayContent = isLong && !isExpanded
          ? note.content.slice(0, 150) + '...'
          : note.content;

        return (
          <div
            key={note.id}
            className="rounded-lg border p-4 space-y-2"
          >
            <p className="text-sm font-medium text-muted-foreground">
              {new Date(note.note_date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            <p className="text-sm whitespace-pre-wrap">{displayContent}</p>
            {isLong && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => toggleNote(note.id)}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="mr-1 h-4 w-4" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-1 h-4 w-4" />
                    Show more
                  </>
                )}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
