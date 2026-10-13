import { CalendarDays, Pencil, Trash2 } from 'lucide-react';
import type { Note } from '@workspace/api-client-react';

type NoteCardProps = {
  note: Note;
  index: number;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Recently updated';
  }
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function NoteCard({ note, index, onEdit, onDelete }: NoteCardProps) {
  return (
    <article
      className="note-card"
      data-testid={`card-note-${note.id}`}
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      <div className="student-line">
        <span className="student-initial" aria-hidden="true">{initials(note.studentName)}</span>
        <span data-testid={`text-student-${note.id}`} style={{ fontSize: 12, fontWeight: 700 }}>{note.studentName}</span>
      </div>
      <h3 className="note-title" data-testid={`text-title-${note.id}`}>{note.title}</h3>
      <div className="note-description" data-testid={`text-description-${note.id}`}>
        {note.description || 'No details have been added to this note yet.'}
      </div>
      <div className="note-footer">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <CalendarDays size={12} />
          Added {formatDate(note.createdAt)} · Updated {formatDate(note.updatedAt)}
        </span>
        <div className="note-actions">
          <button
            className="icon-button"
            type="button"
            aria-label={`Edit note for ${note.studentName}`}
            data-testid={`button-edit-note-${note.id}`}
            onClick={() => onEdit(note)}
          >
            <Pencil size={15} />
          </button>
          <button
            className="icon-button danger"
            type="button"
            aria-label={`Delete note for ${note.studentName}`}
            data-testid={`button-delete-note-${note.id}`}
            onClick={() => onDelete(note)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
