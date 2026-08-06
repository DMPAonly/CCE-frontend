import { useState } from "react";

function CreateFileModal({ isOpen, onClose, onCreate }) {
  const [filename, setFilename] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!filename.trim()) return;

    onCreate(filename);

    setFilename("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <h2 className="mb-2 text-2xl font-bold text-white">Create New File</h2>

        <p className="mb-6 text-sm text-slate-400">
          Enter a filename with a supported extension
          <span className="text-slate-300">
            {" "}
            (.js, .ts, .java, .py, .cpp, .c, .cs)
          </span>
        </p>

        <input
          type="text"
          placeholder="Example: App.js"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          className="mb-6 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-600 bg-slate-800 px-5 py-2.5 text-slate-300 transition hover:bg-slate-700"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
          >
            Create File
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateFileModal;
