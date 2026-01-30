import { useEffect, useRef, useState } from "react";
import {
	ChevronDown,
	ChevronLeft,
	Layers,
	FileText,
	Plus,
	Trash2,
} from "lucide-react";

import { usePageStore } from "../stores/pageStore";
import { useEditorStore } from "../stores/editorStore";

/* ---- constants ---- */
const ICON_RAIL_WIDTH = 48;
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 256;

const STORAGE_KEY = "axonforge:left-sidebar";

/* ---- persistence helpers ---- */

function loadSidebarState() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

function saveSidebarState(state) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* ---------------- Component ---------------- */

export function LeftSidebar() {
	console.log("[LeftSidebar] render");

	const persisted = loadSidebarState();

	const [width, setWidth] = useState(persisted?.width ?? DEFAULT_WIDTH);
	const [isResizing, setIsResizing] = useState(false);

	const [pagesExpanded, setPagesExpanded] = useState(
		persisted?.pagesExpanded ?? true
	);
	const [layersExpanded, setLayersExpanded] = useState(
		persisted?.layersExpanded ?? true
	);

	const [deleteTarget, setDeleteTarget] = useState(null);

	const sidebarRef = useRef(null);
	const lastExpandedWidthRef = useRef(
		persisted?.lastExpandedWidth ?? DEFAULT_WIDTH
	);

	const pages = usePageStore((s) => s.pages);
	const selectedPageId = useEditorStore((s) => s.selectedPageId);
	const selectPage = useEditorStore((s) => s.selectPage);

	/* ---------------- Resize logic ---------------- */

	useEffect(() => {
		if (!isResizing) return;

		const onMouseMove = (e) => {
			const { left } = sidebarRef.current.getBoundingClientRect();
			const raw = e.clientX - left;
			const clamped = Math.max(ICON_RAIL_WIDTH, Math.min(MAX_WIDTH, raw));
			setWidth(clamped);
			if (clamped > ICON_RAIL_WIDTH) {
				lastExpandedWidthRef.current = clamped;
			}
		};

		const onMouseUp = () => {
			setIsResizing(false);
			document.body.style.cursor = "default";

			saveSidebarState({
				width,
				lastExpandedWidth: lastExpandedWidthRef.current,
				pagesExpanded,
				layersExpanded,
			});
		};

		document.addEventListener("mousemove", onMouseMove);
		document.addEventListener("mouseup", onMouseUp);

		return () => {
			document.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseup", onMouseUp);
		};
	}, [isResizing, width, pagesExpanded, layersExpanded]);

	const startResize = (e) => {
		e.preventDefault();
		setIsResizing(true);
		document.body.style.cursor = "col-resize";
	};

	/* ---------------- Toggle ---------------- */

	const handleToggle = () => {
		let nextWidth =
			width <= ICON_RAIL_WIDTH + 1 ?
				lastExpandedWidthRef.current
			:	ICON_RAIL_WIDTH;

		setWidth(nextWidth);

		saveSidebarState({
			width: nextWidth,
			lastExpandedWidth: lastExpandedWidthRef.current,
			pagesExpanded,
			layersExpanded,
		});
	};

	const visuallyCollapsed = width <= ICON_RAIL_WIDTH + 1;

	/* ---------------- Create Page ---------------- */

	const handleCreatePage = async () => {
		console.log("[LeftSidebar] ➕ Add Page clicked");

		await fetch("/__pages/create", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: "New" }),
		});
	};

	/* ---------------- Delete Page ---------------- */

	const confirmDelete = async () => {
		if (!deleteTarget) return;

		console.log("[LeftSidebar] Deleting page:", deleteTarget);

		await fetch("/__pages/delete", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: deleteTarget }),
		});

		setDeleteTarget(null);
	};

	/* ---------------- Render ---------------- */

	return (
		<>
			<div
				ref={sidebarRef}
				className="
					fixed top-12 left-0 bottom-0
					bg-[#111]
					border-r border-neutral-800
					text-neutral-300 text-sm
					select-none
					z-40
				"
				style={{
					width,
					transition: isResizing ? "none" : "width 0.2s ease",
				}}
			>
				{/* Header */}
				<div className="h-10 flex items-center justify-between px-2 border-b border-neutral-800/50">
					{!visuallyCollapsed && (
						<span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
							Explorer
						</span>
					)}

					<button
						onClick={handleToggle}
						className={`w-7 h-7 rounded hover:bg-neutral-800 ${
							visuallyCollapsed ? "mx-auto" : ""
						}`}
					>
						<ChevronLeft
							size={16}
							className={visuallyCollapsed ? "rotate-180" : ""}
						/>
					</button>
				</div>

				{/* Content */}
				{visuallyCollapsed ?
					<div className="flex flex-col items-center gap-4 mt-6">
						<FileText size={18} />
						<Layers size={18} />
					</div>
				:	<div className="overflow-y-auto h-full">
						{/* PAGES */}
						<SidebarSection
							title="Pages"
							icon={<FileText size={14} />}
							expanded={pagesExpanded}
							onToggle={() => setPagesExpanded(!pagesExpanded)}
							rightActions={
								<button
									onClick={handleCreatePage}
									className="w-6 h-6 flex items-center justify-center rounded hover:bg-neutral-800 text-neutral-400"
									title="Add Page"
								>
									<Plus size={14} />
								</button>
							}
						>
							{pages.map((page) => (
								<PageItem
									key={page.id}
									page={page}
									active={page.id === selectedPageId}
									onSelect={() => selectPage(page.id)}
									onDelete={() => setDeleteTarget(page.id)}
								/>
							))}
						</SidebarSection>

						<div className="h-px bg-neutral-800/50 mx-2" />

						{/* LAYERS */}
						<SidebarSection
							title="Layers"
							icon={<Layers size={14} />}
							expanded={layersExpanded}
							onToggle={() => setLayersExpanded(!layersExpanded)}
						>
							<div className="px-3 py-1.5 text-neutral-500 text-sm">
								Coming soon
							</div>
						</SidebarSection>
					</div>
				}

				{/* Resize handle */}
				<div
					onMouseDown={startResize}
					className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-sky-500/40"
				/>
			</div>

			{/* ---------- Delete Modal ---------- */}
			{deleteTarget && (
				<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
					<div className="bg-[#1a1d23] border border-neutral-700 rounded-lg w-96 p-4">
						<h2 className="text-sm text-neutral-200 mb-3">
							Delete page "{deleteTarget}"?
						</h2>

						<p className="text-xs text-neutral-400 mb-4">
							This will permanently delete the page and its files.
						</p>

						<div className="flex justify-end gap-2">
							<button
								onClick={() => setDeleteTarget(null)}
								className="px-3 py-1.5 rounded bg-neutral-700 hover:bg-neutral-600 text-sm"
							>
								Cancel
							</button>

							<button
								onClick={confirmDelete}
								className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-sm text-white"
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

/* ---------------- Subcomponents ---------------- */

function SidebarSection({
	title,
	icon,
	children,
	expanded,
	onToggle,
	rightActions,
}) {
	return (
		<div className="py-3">
			<div className="flex items-center px-3">
				<button
					onClick={onToggle}
					className="flex items-center gap-2 text-xs text-neutral-400 hover:bg-neutral-800/50 flex-1 py-1.5 rounded"
				>
					{icon}
					<span className="flex-1 text-left uppercase tracking-wider">
						{title}
					</span>
					<ChevronDown size={14} className={expanded ? "" : "-rotate-90"} />
				</button>

				{rightActions && <div className="ml-1">{rightActions}</div>}
			</div>

			{expanded && <div className="px-2 mt-1">{children}</div>}
		</div>
	);
}

function PageItem({ page, active, onSelect, onDelete }) {
	return (
		<div
			onClick={onSelect}
			className={`group flex items-center gap-2 px-3 py-1.5 rounded text-sm cursor-pointer ${
				active ?
					"bg-sky-500/15 text-sky-400 border border-sky-500/30"
				:	"hover:bg-neutral-800 text-neutral-300"
			}`}
		>
			<div className="flex-1 truncate">{page.name}</div>

			<button
				onClick={(e) => {
					e.stopPropagation();
					onDelete();
				}}
				className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded hover:bg-red-500/20 text-neutral-400 hover:text-red-400"
				title="Delete Page"
			>
				<Trash2 size={14} />
			</button>
		</div>
	);
}
