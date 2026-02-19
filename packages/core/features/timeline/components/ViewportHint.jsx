export function ViewportHint() {
  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-neutral-900/80 backdrop-blur-sm rounded-md border border-neutral-800/50">
      <p className="text-xs text-neutral-500 text-center">
        <span className="text-neutral-400 font-medium">Scroll</span> to zoom
        • <span className="text-neutral-400 font-medium">Middle-click</span> to pan •
        <span className="text-neutral-400 font-medium ml-2">R</span> to reset view
      </p>
    </div>
  );
}
