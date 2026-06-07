import Image from "next/image";
import type { PlantNote } from "@/lib/types/database";

interface NoteListProps {
  notes: PlantNote[];
}

export function NoteList({ notes }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <p className="text-sm text-earth-800/50">
        No notes yet. Add your first one.
      </p>
    );
  }

  return (
    <ol className="space-y-4">
      {notes.map((note) => (
        <li
          key={note.id}
          className="flex gap-4 rounded-2xl border border-earth-200 bg-white p-4 shadow-sm"
        >
          <div className="mt-0.5 shrink-0">
            <div className="h-2 w-2 rounded-full bg-leaf-400 mt-1.5" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <time className="text-xs text-earth-800/50">
                {new Date(note.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
              {note.height_cm != null && (
                <span className="rounded-full bg-leaf-50 px-2 py-0.5 text-xs font-medium text-leaf-700">
                  {note.height_cm} cm
                </span>
              )}
            </div>
            <p className="whitespace-pre-wrap text-sm text-earth-900">{note.content}</p>
            {note.photo_url && (
              <div className="relative mt-2 h-40 w-40 overflow-hidden rounded-xl">
                <Image
                  src={note.photo_url}
                  alt="Note photo"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
