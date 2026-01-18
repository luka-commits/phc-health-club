import { redirect } from 'next/navigation';
import { getDBUser } from '@/lib/supabase/auth';
import { getLifestyleNotes, getProviderMeetingNotes } from '@/lib/actions/lifestyle';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { ScrollText, Stethoscope } from 'lucide-react';
import { AddNoteForm } from './add-note-form';
import { NotesList } from './notes-list';

export default async function LifestylePage() {
  const { user, error } = await getDBUser();

  if (error || !user) {
    redirect('/login');
  }

  if (user.role !== 'patient') {
    redirect(`/${user.role}`);
  }

  // Fetch data in parallel
  const [notesResult, meetingNotesResult] = await Promise.all([
    getLifestyleNotes(),
    getProviderMeetingNotes(),
  ]);

  const lifestyleNotes = notesResult.success ? notesResult.data || [] : [];
  const meetingNotes = meetingNotesResult.success ? meetingNotesResult.data || [] : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lifestyle Notes"
        description="Track your health journey and view notes from provider meetings"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left section - My Notes */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Note</CardTitle>
              <CardDescription>
                Write about how you&apos;re feeling, your progress, or anything you want to track
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddNoteForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">My Notes</CardTitle>
              <CardDescription>
                Your personal health journal entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lifestyleNotes.length > 0 ? (
                <NotesList notes={lifestyleNotes} />
              ) : (
                <EmptyState
                  icon={ScrollText}
                  title="No Notes Yet"
                  description="Start tracking your health journey by adding your first note above."
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right section - Provider Meeting Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Provider Meeting Notes</CardTitle>
            <CardDescription>
              Notes from your appointments with providers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {meetingNotes.length > 0 ? (
              <div className="space-y-4">
                {meetingNotes.map((note, index) => (
                  <div
                    key={index}
                    className="rounded-lg border p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground">
                        {new Date(note.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {note.providerName}
                      </p>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{note.notes}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Stethoscope}
                title="No Meeting Notes"
                description="Notes from your provider meetings will appear here after completed appointments."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
