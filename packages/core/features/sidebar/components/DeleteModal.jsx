export function DeleteModal({ pageName, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1a1d23] border border-neutral-700 rounded-lg w-96 p-4">
        <h2 className="text-sm text-neutral-200 mb-3">
          Delete page &quot;{pageName}&quot;?
        </h2>

        <p className="text-xs text-neutral-400 mb-4">
          This will permanently delete the page and its files.
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded bg-neutral-700 hover:bg-neutral-600 text-sm"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-sm text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
