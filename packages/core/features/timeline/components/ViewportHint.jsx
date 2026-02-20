export function ViewportHint() {
  return (
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#0a0a0a]/80 backdrop-blur-sm rounded border border-[#1f1f1f]">
      <p className="text-[10px] text-[#444] text-center">
        <span className="text-[#666]">Scroll</span> to zoom
        • <span className="text-[#666]">Middle-click</span> to pan
        • <span className="text-[#666] ml-1">R</span> to reset
      </p>
    </div>
  );
}
