import React, { useState, useEffect } from "react";

const NotesSection = () => {
  const [note, setNote] = useState("");

  useEffect(() => {
    const savedNote = localStorage.getItem("dashboardNote");
    if (savedNote) setNote(savedNote);
  }, []);

  const saveNote = () => {
    localStorage.setItem("dashboardNote", note);
    alert("✅ Note saved");
  };

  return (
    <div className="max-w-xl mx-auto mt-6 p-4 border rounded">
      <h2 className="text-lg font-bold mb-2">📝 Personal Notes</h2>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full h-32 border p-2 rounded text-sm"
        placeholder="Write something..."
      />
      <button
        onClick={saveNote}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Save Note
      </button>
    </div>
  );
};

export default NotesSection;
