import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetApplicationHealthQueryKey,
  getGetNoteQueryKey,
  getHealthCheckQueryKey,
  getListNotesQueryKey,
  type Note,
  type NoteInput,
  useCreateNote,
  useDeleteNote,
  useGetApplicationHealth,
  useHealthCheck,
  useListNotes,
  useUpdateNote,
} from '@workspace/api-client-react';
import { BookOpen, Check, CircleAlert, LoaderCircle, Plus, Search, Sparkles } from 'lucide-react';
import { NoteCard } from '../components/NoteCard';
import { NoteEditorDialog } from '../components/NoteEditorDialog';
import { SideRail } from '../components/SideRail';

export default function Home() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);
  const [feedback, setFeedback] = useState('');
  const searchParams = useMemo(() => {
    const value = search.trim();
    return value ? { search: value } : undefined;
  }, [search]);
  const notesQuery = useListNotes(searchParams);
  const healthQuery = useGetApplicationHealth({
    query: { queryKey: getGetApplicationHealthQueryKey(), refetchInterval: 60_000 },
  });
  const legacyHealthQuery = useHealthCheck({
    query: { queryKey: getHealthCheckQueryKey(), refetchInterval: 60_000 },
  });
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const notes = notesQuery.data ?? [];
  const isSaving = createNote.isPending || updateNote.isPending;

  async function refreshNotes() {
    await queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
  }

  function openNewNote() {
    setEditingNote(null);
    setEditorOpen(true);
    setFeedback('');
  }

  function openEditNote(note: Note) {
    setEditingNote(note);
    setEditorOpen(true);
    setFeedback('');
  }

  function closeEditor() {
    if (isSaving) {
      return;
    }
    setEditorOpen(false);
    setEditingNote(null);
  }

  function saveNote(input: NoteInput, id?: number) {
    setFeedback('');
    if (typeof id === 'number') {
      updateNote.mutate(
        { id, data: input },
        {
          onSuccess: async () => {
            await Promise.all([
              refreshNotes(),
              queryClient.invalidateQueries({ queryKey: getGetNoteQueryKey(id) }),
            ]);
            setEditorOpen(false);
            setEditingNote(null);
            setFeedback('Your changes are saved.');
          },
          onError: () => setFeedback('The note could not be updated. Please try again.'),
        },
      );
      return;
    }
    createNote.mutate(
      { data: input },
      {
        onSuccess: async () => {
          await refreshNotes();
          setEditorOpen(false);
          setEditingNote(null);
          setFeedback('A new note is ready in your collection.');
        },
        onError: () => setFeedback('The note could not be saved. Please try again.'),
      },
    );
  }

  function confirmDelete() {
    if (!deletingNote) {
      return;
    }
    const id = deletingNote.id;
    deleteNote.mutate(
      { id },
      {
        onSuccess: async () => {
          await Promise.all([
            refreshNotes(),
            queryClient.invalidateQueries({ queryKey: getGetNoteQueryKey(id) }),
          ]);
          setDeletingNote(null);
          setFeedback('Note deleted.');
        },
        onError: () => setFeedback('The note could not be deleted. Please try again.'),
      },
    );
  }

  const databaseConnected = healthQuery.data?.database === true;
  const applicationHealthy = healthQuery.data?.status?.toLowerCase() === 'ok';
  const serverHealthy = legacyHealthQuery.data?.status?.toLowerCase() === 'ok';

  return (
    <div className="app-shell grain">
      <SideRail>
        <div style={{ display: 'grid', gap: 9 }}>
          <div className="status-chip" data-testid="status-database-health">
            <span className="status-dot" style={{ background: healthQuery.isError || !databaseConnected ? '#d79b54' : undefined }} />
            {healthQuery.isLoading ? 'Checking workspace' : healthQuery.isError ? 'Workspace status unavailable' : databaseConnected ? 'Notes safely connected' : 'Database connection pending'}
          </div>
          <div style={{ paddingLeft: 3, color: 'hsl(var(--sidebar-foreground) / 0.43)', fontSize: 9 }} data-testid="status-service-health">
            {legacyHealthQuery.isLoading ? 'Service check in progress' : legacyHealthQuery.isError ? 'Service check unavailable' : serverHealthy ? 'Service is running' : 'Service status: ' + (legacyHealthQuery.data?.status ?? 'unknown')}
            {applicationHealthy && serverHealthy ? ' · All systems steady' : ''}
            {healthQuery.data?.version ? ` · v${healthQuery.data.version}` : ''}
          </div>
        </div>
      </SideRail>

      <main className="workspace-main">
        <div className="mobile-brand" data-testid="brand-mobile">
          <span className="brand-symbol" style={{ width: 30, height: 30, borderRadius: 10 }}>
            <BookOpen size={15} />
          </span>
          Fieldnotes <span style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>/ Student journal</span>
        </div>
        <header className="topline">
          <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'block', width: 19, height: 1, background: 'hsl(var(--accent))' }} />
            Your teaching notebook
          </div>
          <div className="status-chip" style={{ color: 'hsl(var(--muted-foreground))', borderColor: 'hsl(var(--border))' }}>
            <span className="status-dot" style={{ background: 'hsl(var(--primary))' }} />
            Notes stay in step with you
          </div>
        </header>

        <section className="welcome-block">
          <div className="eyebrow" style={{ color: 'hsl(var(--primary))' }}>A clearer picture, one note at a time</div>
          <h1 className="hero-title">Remember the <em>small things.</em></h1>
          <p className="hero-copy">
            Keep the moments, milestones, and gentle reminders that help every student feel seen.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 14, color: 'hsl(var(--muted-foreground))', fontSize: 11 }}>
            <Sparkles size={13} color="hsl(var(--accent))" />
            A quiet place for the details that matter
          </div>
        </section>

        <section aria-labelledby="notes-heading">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Your collection</div>
              <h2 id="notes-heading" className="font-editorial" style={{ margin: '5px 0 0', fontSize: 31, fontWeight: 500, letterSpacing: '-0.04em' }}>
                Student notes
                <span style={{ marginLeft: 10, color: 'hsl(var(--muted-foreground))', fontFamily: 'var(--app-font-sans)', fontSize: 13, fontWeight: 500, letterSpacing: 0 }} data-testid="text-note-count">
                  {notesQuery.isLoading ? '…' : notes.length}
                </span>
              </h2>
            </div>
            <div className="section-tools" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label className="search-wrap">
                <Search size={16} aria-hidden="true" />
                <input
                  className="search-input"
                  type="search"
                  aria-label="Search student notes"
                  placeholder="Find a student or title"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  data-testid="input-search-notes"
                />
              </label>
              <button className="primary-button" type="button" onClick={openNewNote} data-testid="button-new-note">
                <Plus size={17} />
                New note
              </button>
            </div>
          </div>

          {feedback && (
            <div
              role="status"
              data-testid="status-feedback"
              style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 15px', color: feedback.includes('could not') ? 'hsl(var(--destructive))' : 'hsl(var(--primary))', fontSize: 12, fontWeight: 600 }}
            >
              {feedback.includes('could not') ? <CircleAlert size={15} /> : <Check size={15} />}
              {feedback}
            </div>
          )}
          {notesQuery.isLoading ? (
            <div className="notes-grid" aria-label="Loading notes" data-testid="loading-notes">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="note-card" style={{ animation: 'none' }}>
                  <div className="skeleton" style={{ width: 130, height: 34, borderRadius: 10, marginBottom: 19 }} />
                  <div className="skeleton" style={{ width: '71%', height: 20, borderRadius: 6, marginBottom: 12 }} />
                  <div className="skeleton" style={{ width: '92%', height: 13, borderRadius: 5, marginBottom: 7 }} />
                  <div className="skeleton" style={{ width: '61%', height: 13, borderRadius: 5 }} />
                </div>
              ))}
            </div>
          ) : notesQuery.isError ? (
            <div className="error-state" role="alert" data-testid="error-notes">
              <div className="empty-illustration"><CircleAlert size={25} /></div>
              <h3 className="font-editorial" style={{ margin: '0 0 7px', fontSize: 24, fontWeight: 500 }}>Your notes are taking a moment.</h3>
              <p style={{ margin: '0 0 16px', color: 'hsl(var(--muted-foreground))', fontSize: 13 }}>We couldn’t reach the notebook just now.</p>
              <button className="primary-button" type="button" onClick={() => notesQuery.refetch()} data-testid="button-retry-notes">
                <LoaderCircle size={15} />
                Try again
              </button>
            </div>
          ) : notes.length === 0 ? (
            <div className="empty-state" data-testid="empty-notes">
              <div className="empty-illustration"><BookOpen size={26} /></div>
              <h3 className="font-editorial" style={{ margin: '0 0 7px', fontSize: 25, fontWeight: 500 }}>
                {search ? 'No notes found just yet.' : 'A fresh page, whenever you’re ready.'}
              </h3>
              <p style={{ maxWidth: 340, margin: '0 0 18px', color: 'hsl(var(--muted-foreground))', fontSize: 13, lineHeight: 1.65 }}>
                {search ? 'Try another student name or note title.' : 'Start with one small thing you want to remember about a student.'}
              </p>
              {!search && (
                <button className="primary-button" type="button" onClick={openNewNote} data-testid="button-create-first-note">
                  <Plus size={16} />
                  Write your first note
                </button>
              )}
            </div>
          ) : (
            <div className="notes-grid" data-testid="list-notes">
              {notes.map((note, index) => (
                <NoteCard key={note.id} note={note} index={index} onEdit={openEditNote} onDelete={setDeletingNote} />
              ))}
            </div>
          )}
        </section>
        <footer style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 15, marginTop: 36, paddingTop: 17, borderTop: '1px solid hsl(var(--border))', color: 'hsl(var(--muted-foreground))', fontSize: 10 }}>
          <span>Thoughtfully kept. Easily found.</span>
          <span>{notes.length} {notes.length === 1 ? 'note' : 'notes'} in your notebook</span>
        </footer>
      </main>

      {editorOpen && (
        <NoteEditorDialog
          key={editingNote?.id ?? 'new'}
          note={editingNote}
          isSaving={isSaving}
          onClose={closeEditor}
          onSave={saveNote}
        />
      )}
      {deletingNote && (
        <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !deleteNote.isPending) {
            setDeletingNote(null);
          }
        }}>
          <section className="editor-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" style={{ width: 'min(100%, 430px)' }}>
            <div className="dialog-body" style={{ paddingTop: 29 }}>
              <div className="empty-illustration" style={{ color: 'hsl(var(--destructive))', background: 'hsl(var(--destructive) / 0.09)' }}>
                <CircleAlert size={24} />
              </div>
              <div>
                <div className="eyebrow">A quick check</div>
                <h2 id="delete-title" className="font-editorial" style={{ margin: '5px 0 7px', fontSize: 28, fontWeight: 500 }}>
                  Remove this note?
                </h2>
                <p style={{ margin: 0, color: 'hsl(var(--muted-foreground))', fontSize: 13, lineHeight: 1.65 }}>
                  “{deletingNote.title}” for {deletingNote.studentName} will be permanently deleted.
                </p>
              </div>
              {deleteNote.isError && <p role="alert" style={{ margin: 0, color: 'hsl(var(--destructive))', fontSize: 12 }}>That note could not be deleted. Please try again.</p>}
              <div className="dialog-actions" style={{ justifyContent: 'flex-end' }}>
                <button className="text-button" type="button" onClick={() => setDeletingNote(null)} disabled={deleteNote.isPending} data-testid="button-cancel-delete">
                  Keep note
                </button>
                <button
                  className="primary-button"
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleteNote.isPending}
                  style={{ background: 'hsl(var(--destructive))' }}
                  data-testid="button-confirm-delete"
                >
                  {deleteNote.isPending ? <LoaderCircle size={15} className="animate-spin" /> : null}
                  {deleteNote.isPending ? 'Removing…' : 'Delete note'}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
