export const INDEXDB_NAME = "Tarea6DB";
export const INDEXDB_VERSION = 1;
export const STORE_NAME = "notes";

export function syncNotesData(notes) {
  NotesData.NOTES.length = 0;

  notes.forEach((note) => {
    NotesData.NOTES.push(note);
  });
}

export const NotesData = {
  NOTES: [],
};
