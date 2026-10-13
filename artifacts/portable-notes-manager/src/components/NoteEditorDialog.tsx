import { useEffect, useState, type FormEvent } from 'react';
import { LoaderCircle, X } from 'lucide-react';
import {
  getGetNoteQueryKey,
  type Note,
  type NoteInput,
  useGetNote,
} from '@workspace/api-client-react';

type NoteEditorDialogProps = {
  note: Note | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (input: NoteInput, id?: number) => void;
};

export function NoteEditorDialog({ note, isSaving, onClose, onSave }: NoteEditorDialogProps) {
  const noteId = note?.id;
  const isEditing = typeof noteId === 'number';
  const noteQuery = useGetNote(noteId ?? 0, {
    query: {
      enabled: isEditing,
      queryKey: getGetNoteQueryKey(noteId ?? 0),
    },
  });
  const [studentName, setStudentName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const loadedNote = isEditing ? noteQuery.data ?? note : null;

  useEffect(() => {
    setStudentName(loadedNote?.studentName ?? '');
    setTitle(loadedNote?.title ?? '');
    setDescription(loadedNote?.description ?? '');
    setFormError('');
  }, [loadedNote?.id, loadedNote?.studentName, loadedNote?.title, loadedNote?.description]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSaving) {
        onClose();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSaving, onClose]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!studentName.trim() || !title.trim()) {
      setFormError('Add a student name and a short title to continue.');
      return;
    }
    onSave(
      { studentName: studentName.trim(), title: title.trim(), description: description.trim() },
      noteId,
    );
  }

  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) {
          onClose();
        }
      }}
    >
      <section className="editor-dialog" role="dialog" aria-modal="true" aria-labelledby="editor-title">
        <header className="dialog-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 18 }}>
          <div>
            <div className="eyebrow">{isEditing ? 'Keep the thread going' : 'A fresh observation'}</div>
            <h2 id="editor-title" className="font-editorial" style={{ margin: '8px 0 0', fontSize: 32, fontWeight: 500, letterSpacing: '-0.04em' }}>
              {isEditing ? 'Edit this note' : 'Write a note'}
            </h2>
            <p style={{ margin: '7px 0 0', color: 'hsl(var(--muted-foreground))', fontSize: 12 }}>
              A few thoughtful details can make all the difference.
            </p>
          </div>
          <button className="icon-button" type="button" aria-label="Close editor" data-testid="button-close-editor" onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        {isEditing && noteQuery.isLoading ? (
          <div className="dialog-body" aria-label="Loading note">
            <div className="skeleton" style={{ height: 45, borderRadius: 11 }} />
            <div className="skeleton" style={{ height: 45, borderRadius: 11 }} />
            <div className="skeleton" style={{ height: 132, borderRadius: 11 }} />
          </div>
        ) : isEditing && noteQuery.isError ? (
          <div className="dialog-body">
            <div className="error-state" style={{ minHeight: 180 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>This note could not be opened.</p>
              <button type="button" className="text-button" onClick={() => noteQuery.refetch()}>Try again</button>
            </div>
          </div>
        ) : (
          <form className="dialog-body" onSubmit={handleSubmit}>
            <label>
              <span className="field-label">Student name</span>
              <input
                autoFocus={!isEditing}
                className="form-control"
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
                placeholder="e.g. Rowan Ellis"
                maxLength={120}
                data-testid="input-student-name"
              />
            </label>
            <label>
              <span className="field-label">Note title</span>
              <input
                className="form-control"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="A short, easy-to-find title"
                maxLength={160}
                data-testid="input-note-title"
              />
            </label>
            <label>
              <span className="field-label">Details <span style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 400 }}>(optional)</span></span>
              <textarea
                className="form-control"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Capture what you noticed, what helped, or what to follow up on."
                maxLength={4000}
                data-testid="input-note-description"
              />
            </label>
            {formError && <p role="alert" style={{ margin: 0, color: 'hsl(var(--destructive))', fontSize: 12 }} data-testid="status-form-error">{formError}</p>}
            <div className="dialog-actions">
              <button className="text-button" type="button" onClick={onClose} disabled={isSaving} data-testid="button-cancel-editor">
                Cancel
              </button>
              <button className="primary-button" type="submit" disabled={isSaving} data-testid="button-save-note">
                {isSaving && <LoaderCircle size={15} className="animate-spin" />}
                {isSaving ? 'Saving note…' : isEditing ? 'Save changes' : 'Save note'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
