import { DatabaseManager } from "./indexedDB.js";

// DOM element references
const noteColorInput = document.querySelector("#noteColor");
const addInput = document.querySelector("#addButton");
const mainElement = document.querySelector("main");

// Database manager instance
const dbManager = DatabaseManager.getInstance();

// Open database and load existing notes
dbManager
  .open()
  .then(() => {
    console.log("Database opened successfully");
    dbManager.getAll().then(displayNotes);
  })
  .catch((error) => {
    console.error("Error opening the database:", error);
  });

let counterID = 0;

// Add button click event
addInput.addEventListener("click", () => {
  const color = noteColorInput.value;
  const noteData = {
    color,
    text: "",
    position: { x: 0, y: 0 },
  };

  dbManager
    .add(noteData)
    .then((id) => {
      noteData.id = id;
      createNoteElement(noteData);
      counterID++;
    })
    .catch((error) => {
      console.error("Error adding the note:", error);
    });
});

// Delete note click event
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("delete")) {
    const noteElement = event.target.closest(".note");
    const noteId = parseInt(noteElement.dataset.id, 10);
    dbManager
      .delete(noteId)
      .then(() => {
        noteElement.remove();
      })
      .catch((error) => {
        console.error("Error deleting the note:", error);
      });
  }
});

let cursor = {
  x: null,
  y: null,
};
let note = {
  dom: null,
  x: null,
  y: null,
};
let zIndexValue = 0;

// Drag note while mouse is pressed
document.addEventListener("mousemove", (event) => {
  if (note.dom == null) return;

  const currentCursor = {
    x: event.clientX,
    y: event.clientY,
  };
  const distance = {
    x: currentCursor.x - cursor.x,
    y: currentCursor.y - cursor.y,
  };
  note.dom.style.left = note.x + distance.x + "px";
  note.dom.style.top = note.y + distance.y + "px";
});

// End drag event and update position
document.addEventListener("mouseup", (event) => {
  if (note.dom) {
    const noteId = parseInt(note.dom.dataset.id, 10);
    const position = {
      x: parseInt(note.dom.style.left, 10),
      y: parseInt(note.dom.style.top, 10),
    };
    dbManager
      .get(noteId)
      .then((noteData) => {
        noteData.position = position;
        dbManager.update(noteData);
      })
      .catch((error) => {
        console.error("Error updating the note position:", error);
      });
    note.dom = null;
    event.target.parentNode.style.cursor = "grab";
  }
});

// Start drag event for note header
document.addEventListener("mousedown", (event) => {
  if (event.target.classList.contains("noteHeader")) {
    cursor = { x: event.clientX, y: event.clientY };
    const current = event.target.closest(".note");
    note = {
      dom: current,
      x: current.getBoundingClientRect().left,
      y: current.getBoundingClientRect().top,
    };
    current.style.cursor = "grabbing";
    current.style.zIndex = zIndexValue;
    zIndexValue++;
  }
});

// Create a new note element
function createNoteElement(noteData) {
  const newNote = document.createElement("div");
  newNote.classList.add("note");
  newNote.dataset.id = noteData.id;

  const noteHeader = document.createElement("div");
  noteHeader.classList.add("noteHeader");
  noteHeader.innerHTML = `<button class="delete">X</button>`;
  noteHeader.style.background = noteData.color;
  newNote.appendChild(noteHeader);

  const noteContent = document.createElement("div");
  noteContent.classList.add("noteContent");
  noteContent.innerHTML = `<textarea name="noteText" id="noteText">${noteData.text}</textarea>`;
  newNote.appendChild(noteContent);

  newNote.style.left = `${noteData.position.x}px`;
  newNote.style.top = `${noteData.position.y}px`;

  mainElement.appendChild(newNote);

  const textarea = newNote.querySelector("textarea");
  textarea.addEventListener("input", () => {
    noteData.text = textarea.value;
    dbManager.update(noteData).catch((error) => {
      console.error("Error updating the note text:", error);
    });
  });
}

// Render all notes stored in the database
function displayNotes(notes) {
  notes.forEach((note) => {
    createNoteElement(note);
  });
}
