function DeleteFileModal({ isOpen, onClose, onDelete, filename }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <h2 className="mb-2 text-2xl font-bold text-white">Delete File</h2>

        <p className="mb-6 text-slate-300">
          Are you sure you want to permanently delete{" "}
          <span className="font-semibold text-white">{filename}</span>?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-600 bg-slate-800 px-5 py-2.5 text-slate-300 transition hover:bg-slate-700"
          >
            Cancel
          </button>

          <button
            onClick={onDelete}
            className="rounded-xl bg-red-600 px-5 py-2.5 font-medium text-white transition hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteFileModal;
