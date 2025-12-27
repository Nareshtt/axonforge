import { useEditorStore } from "../stores/editorStore";

export function TopBar() {
	const mode = useEditorStore((s) => s.mode);
	const toggleMode = useEditorStore((s) => s.toggleMode);

	return (
		<div
			className="
				fixed top-0 left-0 right-0
				h-12
				bg-[#111]
				border-b border-neutral-800
				flex items-center
				px-4
				z-50
				select-none
			"
		>
			{/* LEFT — Brand & Menus */}
			<div className="flex items-center gap-6 text-sm text-neutral-300">
				<span className="font-semibold text-white">AxonForge</span>

				<MenuItem label="File" />
				<MenuItem label="Edit" />
				<MenuItem label="View" />
				<MenuItem label="Canvas" />
				<MenuItem label="Tools" />
				<MenuItem label="Help" />
			</div>

			{/* CENTER — Spacer */}
			<div className="flex-1" />

			{/* RIGHT — Mode Switch */}
			<div className="flex items-center gap-3">
				<span className="text-xs text-neutral-400">Mode:</span>

				<button
					onClick={toggleMode}
					className={`
						px-3 py-1 rounded text-xs
						border
						transition
						${
							mode === "edit"
								? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
								: "bg-sky-500/10 text-sky-400 border-sky-500/30"
						}
					`}
				>
					{mode === "edit" ? "Edit" : "View"}
				</button>
			</div>
		</div>
	);
}

function MenuItem({ label }) {
	return (
		<button
			className="
				px-2 py-1
				rounded
				hover:bg-neutral-800
				transition
			"
		>
			{label}
		</button>
	);
}
