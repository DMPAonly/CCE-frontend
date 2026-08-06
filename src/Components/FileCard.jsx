function FileCard({ file, onClick, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800 p-5 shadow-lg transition-all duration-200 hover:border-slate-600 hover:bg-slate-750 hover:shadow-xl">
      <div
        onClick={onClick}
        className="flex-1 cursor-pointer transition-opacity hover:opacity-90"
      >
        <h3 className="text-lg font-semibold text-white">{file.filename}</h3>

        <p className="mt-1 text-sm text-slate-400">{file.language}</p>

        <p className="mt-2 text-xs text-slate-500">
          Uploaded: {new Date(file.created_at).toLocaleString()}
        </p>
      </div>

      <div className="ml-6 flex items-center gap-3">
        <button
          onClick={onEdit}
          className="rounded-lg border border-blue-500 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-blue-700"
        >
          Edit
        </button>

        <button
          onClick={onDelete}
          className="rounded-lg border border-red-500 bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default FileCard;
