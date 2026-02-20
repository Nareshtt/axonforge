export function DeleteModal({ pageName, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg w-80 p-4">
        <h2 className="text-sm text-white mb-2 font-medium">
          Delete page "{pageName}"?
        </h2>

        <p className="text-xs text-[#666] mb-4">
          This will permanently delete the page and its files.
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded text-xs bg-[#1a1a1a] hover:bg-[#252525] text-[#888] hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-3 py-1.5 rounded text-xs bg-[#ef4444] hover:bg-[#dc2626] text-white transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
