import { useEffect, useRef, useState } from "react";
import {
	ChevronDown,
	ChevronRight,
	ChevronLeft,
	Layers,
	FileText,
} from "lucide-react";

const ICON_RAIL_WIDTH = 48;
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 256;

export function LeftSidebar() {
	const [width, setWidth] = useState(DEFAULT_WIDTH);
	const [isResizing, setIsResizing] = useState(false);

	const [pagesExpanded, setPagesExpanded] = useState(true);
	const [layersExpanded, setLayersExpanded] = useState(true);

	const sidebarRef = useRef(null);
	const lastExpandedWidthRef = useRef(DEFAULT_WIDTH);

	/* ---------------- Resize logic ---------------- */

	useEffect(() => {
		if (!isResizing) return;

		const onMouseMove = (e) => {
			if (!sidebarRef.current) return;

			const { left } = sidebarRef.current.getBoundingClientRect();
			const rawWidth = e.clientX - left;

			const clamped = Math.max(ICON_RAIL_WIDTH, Math.min(MAX_WIDTH, rawWidth));

			setWidth(clamped);

			if (clamped > ICON_RAIL_WIDTH) {
				lastExpandedWidthRef.current = clamped;
			}
		};

		const onMouseUp = () => {
			setIsResizing(false);
			document.body.style.cursor = "default";
		};

		document.addEventListener("mousemove", onMouseMove);
		document.addEventListener("mouseup", onMouseUp);

		return () => {
			document.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseup", onMouseUp);
		};
	}, [isResizing]);

	const startResize = (e) => {
		e.preventDefault();
		setIsResizing(true);
		document.body.style.cursor = "col-resize";
	};

	/* ---------------- FIXED toggle logic ---------------- */

	const handleToggle = () => {
		// Fully collapsed → expand
		if (width === ICON_RAIL_WIDTH) {
			setWidth(lastExpandedWidthRef.current);
			return;
		}

		// Fully expanded → collapse
		if (width === lastExpandedWidthRef.current) {
			setWidth(ICON_RAIL_WIDTH);
			return;
		}

		// In-between → nearest
		const collapsedDistance = Math.abs(width - ICON_RAIL_WIDTH);
		const expandedDistance = Math.abs(width - lastExpandedWidthRef.current);

		if (collapsedDistance < expandedDistance) {
			setWidth(ICON_RAIL_WIDTH);
		} else {
			setWidth(lastExpandedWidthRef.current);
		}
	};

	const visuallyCollapsed = width <= ICON_RAIL_WIDTH + 1;

	return (
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
					<span className="text-xs font-medium text-neutral-400 uppercase tracking-wider px-1">
						Explorer
					</span>
				)}

				<button
					onClick={handleToggle}
					className={`
						w-7 h-7 rounded
						flex items-center justify-center
						hover:bg-neutral-800 transition
						${visuallyCollapsed ? "mx-auto" : ""}
					`}
				>
					<ChevronLeft
						size={16}
						className={`transition-transform ${
							visuallyCollapsed ? "rotate-180" : ""
						}`}
					/>
				</button>
			</div>

			{/* CONTENT */}
			{visuallyCollapsed ? (
				<div className="flex flex-col items-center gap-4 mt-6 px-2">
					<button className="w-8 h-8 flex items-center justify-center rounded hover:bg-neutral-800">
						<FileText size={18} />
					</button>
					<button className="w-8 h-8 flex items-center justify-center rounded hover:bg-neutral-800">
						<Layers size={18} />
					</button>
				</div>
			) : (
				<div className="overflow-y-auto h-full">
					<SidebarSection
						title="Pages"
						icon={<FileText size={14} />}
						expanded={pagesExpanded}
						onToggle={() => setPagesExpanded((v) => !v)}
					>
						<PageItem name="Home" active />
						<PageItem name="Login" />
						<PageItem name="Dashboard" />
					</SidebarSection>

					<div className="h-px bg-neutral-800/50 mx-2" />

					<SidebarSection
						title="Layers"
						icon={<Layers size={14} />}
						expanded={layersExpanded}
						onToggle={() => setLayersExpanded((v) => !v)}
					>
						<TreeItem name="Home" defaultExpanded>
							<TreeItem name="Header" />
							<TreeItem name="Hero" />
							<TreeItem name="Footer" defaultExpanded>
								<TreeItem name="Text" />
								<TreeItem name="Button" />
							</TreeItem>
						</TreeItem>
					</SidebarSection>
				</div>
			)}

			{/* Resize handle */}
			<div
				onMouseDown={startResize}
				className="
					absolute top-0 right-0 bottom-0
					w-1 cursor-col-resize
					hover:bg-sky-500/40
				"
			/>
		</div>
	);
}

/* ---------- helpers ---------- */

function SidebarSection({ title, icon, children, expanded, onToggle }) {
	return (
		<div className="py-3">
			<button
				onClick={onToggle}
				className="
					w-full px-3 py-1.5
					flex items-center gap-2
					text-xs font-medium text-neutral-400
					hover:text-neutral-200 hover:bg-neutral-800/50
				"
			>
				{icon}
				<span className="flex-1 text-left uppercase tracking-wider">
					{title}
				</span>
				<ChevronDown
					size={14}
					className={`transition-transform ${expanded ? "" : "-rotate-90"}`}
				/>
			</button>

			{expanded && (
				<div className="mt-1 px-2 flex flex-col gap-0.5">{children}</div>
			)}
		</div>
	);
}

function PageItem({ name, active }) {
	return (
		<div
			className={`px-3 py-1.5 rounded cursor-pointer text-sm ${
				active
					? "bg-sky-500/10 text-sky-400 border border-sky-500/30"
					: "hover:bg-neutral-800 text-neutral-300"
			}`}
		>
			{name}
		</div>
	);
}

function TreeItem({ name, children, defaultExpanded = false }) {
	const [expanded, setExpanded] = useState(defaultExpanded);
	const hasChildren = Boolean(children);

	return (
		<div>
			<div
				onClick={() => hasChildren && setExpanded((v) => !v)}
				className="flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer hover:bg-neutral-800"
			>
				{hasChildren ? (
					<ChevronRight
						size={14}
						className={`transition-transform ${expanded ? "rotate-90" : ""}`}
					/>
				) : (
					<span className="w-[14px]" />
				)}
				<span className="truncate text-sm">{name}</span>
			</div>

			{hasChildren && expanded && (
				<div className="ml-4 border-l border-neutral-800/50 pl-2 mt-0.5">
					{children}
				</div>
			)}
		</div>
	);
}
