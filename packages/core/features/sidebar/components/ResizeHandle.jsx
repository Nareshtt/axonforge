export function ResizeHandle({ onMouseDown }) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-sky-500/40"
    />
  );
}
