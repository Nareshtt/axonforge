import { useEffect, useRef, useState } from "react";
import {
	GitBranch,
	ZoomIn,
	ZoomOut,
	Maximize2,
	Undo2,
	Redo2,
	Clock,
	AlertCircle,
	GitMerge,
} from "lucide-react";
import { useEditorStore } from "../stores/editorStore";
import { useTimelineViewport } from "../stores/useTimelineViewport";

const COMMIT_WIDTH = 280;
const COMMIT_HEIGHT = 100;
const HORIZONTAL_SPACING = 120;
const VERTICAL_SPACING = 140;

export function TimelinePanel() {
	const open = useEditorStore((s) => s.timelineOpen);
	const toggleTimeline = useEditorStore((s) => s.toggleTimeline);
	const focusedSurface = useEditorStore((s) => s.focusedSurface);
	const setFocusedSurface = useEditorStore((s) => s.setFocusedSurface);

	const { x, y, scale, pan, zoomAt, reset } = useTimelineViewport();

	const [commits, setCommits] = useState([]);
	const [currentHash, setCurrentHash] = useState(null);
	const [history, setHistory] = useState([]);
	const [historyIndex, setHistoryIndex] = useState(-1);
	const [isDetached, setIsDetached] = useState(false);
	const [connections, setConnections] = useState([]);

	const panelRef = useRef(null);

	/* ---------- Calculate connection points ---------- */
	useEffect(() => {
		if (commits.length === 0) return;

		const newConnections = [];

		commits.forEach((commit) => {
			commit.parents.forEach((parentHash) => {
				const parent = commits.find((c) => c.hash === parentHash);
				if (!parent) return;

				// Calculate circle positions
				const parentCircle = {
					x: parent.depth * (COMMIT_WIDTH + HORIZONTAL_SPACING) + COMMIT_WIDTH, // Right side of parent
					y: parent.branch * VERTICAL_SPACING + COMMIT_HEIGHT / 2, // Center vertically
				};

				const childCircle = {
					x: commit.depth * (COMMIT_WIDTH + HORIZONTAL_SPACING), // Left side of child
					y: commit.branch * VERTICAL_SPACING + COMMIT_HEIGHT / 2, // Center vertically
				};

				newConnections.push({
					id: `${parent.hash}-${commit.hash}`,
					from: parentCircle,
					to: childCircle,
					isBranch: commit.branch !== parent.branch,
					parentHash: parent.hash,
					childHash: commit.hash,
				});
			});
		});

		setConnections(newConnections);
	}, [commits]);

	/* ---------- Wheel zoom handler ---------- */
	useEffect(() => {
		const panel = panelRef.current;
		if (!panel) return;

		const handleWheel = (e) => {
			if (focusedSurface !== "timeline") return;

			e.preventDefault();
			const rect = panel.getBoundingClientRect();
			const cx = e.clientX - rect.left;
			const cy = e.clientY - rect.top;
			const factor = e.deltaY > 0 ? 0.9 : 1.1;
			zoomAt(factor, cx, cy);
		};

		panel.addEventListener("wheel", handleWheel, { passive: false });
		return () => panel.removeEventListener("wheel", handleWheel);
	}, [focusedSurface, zoomAt]);

	/* ---------- Fetch timeline ---------- */
	useEffect(() => {
		if (!open) return;
		fetchTimeline();
	}, [open]);

	const fetchTimeline = async () => {
		try {
			const res = await fetch("/__timeline");
			const data = await res.json();
			const newCommits = data.commits || [];

			setCommits(newCommits);

			const head = newCommits.find((c) => c.isHead);
			if (head) {
				setCurrentHash(head.hash);
				setIsDetached(false);
			}

			if (history.length === 0) {
				setHistory([newCommits]);
				setHistoryIndex(0);
			}
		} catch (err) {
			console.error("[timeline] fetch failed:", err);
		}
	};

	/* ---------- Undo/Redo Functions ---------- */
	const saveToHistory = (newCommits) => {
		const newHistory = history.slice(0, historyIndex + 1);
		newHistory.push([...newCommits]);
		setHistory(newHistory);
		setHistoryIndex(newHistory.length - 1);
	};

	const undo = () => {
		if (historyIndex > 0) {
			const prevState = history[historyIndex - 1];
			setCommits(prevState);
			setHistoryIndex(historyIndex - 1);
		}
	};

	const redo = () => {
		if (historyIndex < history.length - 1) {
			const nextState = history[historyIndex + 1];
			setCommits(nextState);
			setHistoryIndex(historyIndex + 1);
		}
	};

	useEffect(() => {
		window.__timelineUndo = undo;
		window.__timelineRedo = redo;
		return () => {
			delete window.__timelineUndo;
			delete window.__timelineRedo;
		};
	}, [historyIndex, history]);

	if (!open) return null;

	const canUndo = historyIndex > 0;
	const canRedo = historyIndex < history.length - 1;

	/* ---------- Git Operations ---------- */

	const checkout = async (hash) => {
		try {
			console.log("[timeline] Checking out:", hash);

			const res = await fetch("/__timeline/checkout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ hash }),
			});

			if (res.ok) {
				const data = await res.json();

				// Update current hash but DON'T clear commits
				setCurrentHash(hash);

				// Check if we're viewing a past commit
				const commit = commits.find((c) => c.hash === hash);
				setIsDetached(!commit?.isHead);

				console.log(
					"[timeline] Checkout successful, reloading with preserved state"
				);

				// Reload the page to reflect the checked out state
				window.location.reload();
			}
		} catch (err) {
			console.error("[timeline] checkout failed:", err);
			setCurrentHash(hash);
			const commit = commits.find((c) => c.hash === hash);
			setIsDetached(!commit?.isHead);
		}
	};

	const clearAll = async () => {
		try {
			const res = await fetch("/__timeline/clear", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
			});

			if (res.ok) {
				// Clear the UI state
				setCommits([]);
				setCurrentHash(null);
				setHistory([[]]);
				setHistoryIndex(0);
				setIsDetached(false);
				setConnections([]);

				// Reload to ensure clean state
				window.location.reload();
			}
		} catch (err) {
			console.error("[timeline] clear all failed:", err);
		}
	};

	/* ---------- Render ---------- */

	const isAtHead = currentHash === commits.find((c) => c.isHead)?.hash;

	// Calculate canvas dimensions
	const maxDepth = Math.max(...commits.map((c) => c.depth || 0), 0);
	const maxBranch = Math.max(...commits.map((c) => c.branch || 0), 0);
	const canvasWidth =
		(maxDepth + 1) * (COMMIT_WIDTH + HORIZONTAL_SPACING) + 200;
	const canvasHeight = (maxBranch + 1) * VERTICAL_SPACING + 200;

	return (
		<div
			ref={panelRef}
			onMouseEnter={() => setFocusedSurface("timeline")}
			onMouseLeave={() => setFocusedSurface("canvas")}
			className="fixed bottom-0 left-0 right-0 h-80 bg-[#0b0b0b] border-t border-neutral-800 z-50 flex flex-col select-none"
		>
			{/* Header */}
			<div className="h-12 flex items-center justify-between px-4 border-b border-neutral-800/70 bg-[#0a0a0a]">
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2 text-neutral-300">
						<GitBranch size={16} />
						<span className="text-sm font-semibold">History</span>
					</div>

					<div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900/50 rounded-md border border-neutral-800">
						<Clock size={12} className="text-neutral-500" />
						<span className="text-xs text-neutral-400">
							{commits.length} {commits.length === 1 ? "commit" : "commits"}
						</span>
					</div>

					{isDetached && (
						<div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-md border border-amber-500/30">
							<AlertCircle size={12} className="text-amber-400" />
							<span className="text-xs text-amber-300">
								Viewing past state - Edit to create branch
							</span>
						</div>
					)}
				</div>

				<div className="flex items-center gap-2">
					<button
						onClick={undo}
						disabled={!canUndo}
						className="p-2 rounded hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-400 hover:text-white transition-colors"
						title="Undo (Ctrl+Z)"
					>
						<Undo2 size={16} />
					</button>

					<button
						onClick={redo}
						disabled={!canRedo}
						className="p-2 rounded hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-400 hover:text-white transition-colors"
						title="Redo (Ctrl+Shift+Z)"
					>
						<Redo2 size={16} />
					</button>

					<div className="w-px h-6 bg-neutral-700" />

					<button
						onClick={() => zoomAt(1.2, panelRef.current.clientWidth / 2, 0)}
						className="p-2 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
						title="Zoom In"
					>
						<ZoomIn size={16} />
					</button>

					<button
						onClick={() => zoomAt(0.8, panelRef.current.clientWidth / 2, 0)}
						className="p-2 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
						title="Zoom Out"
					>
						<ZoomOut size={16} />
					</button>

					<button
						onClick={reset}
						className="p-2 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
						title="Reset View (R)"
					>
						<Maximize2 size={16} />
					</button>

					<div className="w-px h-6 bg-neutral-700" />

					<button
						onClick={clearAll}
						disabled={commits.length === 0}
						className="px-3 py-1.5 text-xs rounded hover:bg-red-500/10 text-red-400 hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed border border-transparent hover:border-red-500/30 transition-colors"
					>
						Clear All
					</button>

					<div className="w-px h-6 bg-neutral-700" />

					<button
						onClick={toggleTimeline}
						className="px-3 py-1.5 text-xs rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
					>
						Close
					</button>
				</div>
			</div>

			{/* Timeline viewport */}
			<div className="relative flex-1 overflow-hidden bg-gradient-to-b from-[#0a0a0a] to-[#050505]">
				{commits.length === 0 ? (
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="text-center text-neutral-600">
							<GitBranch size={32} className="mx-auto mb-3 opacity-50" />
							<p className="text-sm">No commits yet</p>
							<p className="text-xs mt-1">Make changes to create history</p>
						</div>
					</div>
				) : (
					<div
						className="absolute"
						style={{
							transform: `translate(${x}px, ${y}px) scale(${scale})`,
							transformOrigin: "0 0",
							width: `${canvasWidth}px`,
							height: `${canvasHeight}px`,
						}}
					>
						{/* SVG for connection lines */}
						<svg
							className="absolute inset-0 pointer-events-none"
							style={{
								width: `${canvasWidth}px`,
								height: `${canvasHeight}px`,
								overflow: "visible",
							}}
						>
							{connections.map((conn) => {
								const midX = (conn.from.x + conn.to.x) / 2;

								return (
									<g key={conn.id}>
										{/* Connection line with bezier curve */}
										<path
											d={`M ${conn.from.x} ${conn.from.y} C ${midX} ${conn.from.y}, ${midX} ${conn.to.y}, ${conn.to.x} ${conn.to.y}`}
											stroke={conn.isBranch ? "#8b5cf6" : "#6b7280"}
											strokeWidth="2"
											fill="none"
											opacity="0.6"
											strokeLinecap="round"
										/>

										{/* Connection circles */}
										<circle
											cx={conn.from.x}
											cy={conn.from.y}
											r="5"
											fill={conn.isBranch ? "#8b5cf6" : "#6b7280"}
											opacity="0.8"
										/>
										<circle
											cx={conn.to.x}
											cy={conn.to.y}
											r="5"
											fill={conn.isBranch ? "#8b5cf6" : "#6b7280"}
											opacity="0.8"
										/>
									</g>
								);
							})}
						</svg>

						{/* Commit nodes */}
						{commits.map((commit) => (
							<div
								key={commit.hash}
								style={{
									position: "absolute",
									left: commit.depth * (COMMIT_WIDTH + HORIZONTAL_SPACING),
									top: commit.branch * VERTICAL_SPACING,
									width: COMMIT_WIDTH,
								}}
							>
								<TimelineNode
									commit={commit}
									isCurrent={commit.hash === currentHash}
									isHead={commit.isHead}
									onCheckout={() => checkout(commit.hash)}
									hasBranches={commit.children?.length > 1}
								/>
							</div>
						))}
					</div>
				)}

				<div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-neutral-900/80 backdrop-blur-sm rounded-md border border-neutral-800/50">
					<p className="text-xs text-neutral-500 text-center">
						<span className="text-neutral-400 font-medium">Scroll</span> to zoom
						• <span className="text-neutral-400 font-medium">Drag</span> to pan
						•<span className="text-neutral-400 font-medium ml-2">R</span> to
						reset view
					</p>
				</div>
			</div>
		</div>
	);
}

function TimelineNode({ commit, isCurrent, isHead, onCheckout, hasBranches }) {
	const [showMenu, setShowMenu] = useState(false);
	const menuRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (menuRef.current && !menuRef.current.contains(e.target)) {
				setShowMenu(false);
			}
		};

		if (showMenu) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [showMenu]);

	return (
		<div
			className={`
				relative px-4 py-3.5 rounded-lg border-2 shadow-lg
				transition-all duration-200 cursor-pointer group
				${
					isHead && isCurrent
						? "border-sky-500/60 bg-gradient-to-br from-sky-500/15 to-sky-600/10"
						: isCurrent
						? "border-amber-500/60 bg-gradient-to-br from-amber-500/15 to-amber-600/10"
						: isHead
						? "border-neutral-600/50 bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 hover:border-neutral-500/50"
						: "border-neutral-700/30 bg-gradient-to-br from-neutral-900/30 to-neutral-900/50 hover:border-neutral-600/40"
				}
			`}
			onClick={() => !isCurrent && onCheckout()}
		>
			{/* Left connection circle */}
			<div
				className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-neutral-700 border-2 border-neutral-900"
				style={{ zIndex: 10 }}
			/>

			{/* Right connection circle */}
			<div
				className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-neutral-700 border-2 border-neutral-900"
				style={{ zIndex: 10 }}
			/>

			{(isHead || isCurrent || hasBranches) && (
				<div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-medium border shadow-lg flex items-center gap-1 z-20">
					{hasBranches && <GitMerge size={12} className="text-indigo-400" />}
					{isHead && isCurrent ? (
						<div className="bg-sky-500/20 border-sky-500/50 text-sky-300 backdrop-blur-sm px-2 py-0.5 rounded-full">
							HEAD
						</div>
					) : isCurrent ? (
						<div className="bg-amber-500/20 border-amber-500/50 text-amber-300 backdrop-blur-sm px-2 py-0.5 rounded-full">
							VIEWING
						</div>
					) : isHead ? (
						<div className="bg-neutral-700/20 border-neutral-600/50 text-neutral-400 backdrop-blur-sm px-2 py-0.5 rounded-full">
							LATEST
						</div>
					) : null}
				</div>
			)}

			<div className="flex items-start justify-between gap-3">
				<div className="flex-1 min-w-0">
					<div
						className={`font-medium text-sm ${
							isHead && isCurrent
								? "text-sky-200"
								: isCurrent
								? "text-amber-200"
								: "text-neutral-300 group-hover:text-neutral-200"
						}`}
					>
						{commit.message}
					</div>

					<div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
						<span className="font-mono">{commit.shortHash}</span>
						{commit.timestamp && (
							<>
								<span>•</span>
								<span>{new Date(commit.timestamp).toLocaleTimeString()}</span>
							</>
						)}
					</div>
				</div>

				<div className="relative z-20" ref={menuRef}>
					<button
						onClick={(e) => {
							e.stopPropagation();
							setShowMenu(!showMenu);
						}}
						className="p-1.5 rounded hover:bg-neutral-700/50 text-neutral-500 hover:text-neutral-300 transition-colors"
					>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
							<circle cx="8" cy="3" r="1.5" />
							<circle cx="8" cy="8" r="1.5" />
							<circle cx="8" cy="13" r="1.5" />
						</svg>
					</button>

					{showMenu && (
						<div className="absolute right-0 top-full mt-1 w-48 py-1 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-30">
							{!isCurrent && (
								<button
									onClick={(e) => {
										e.stopPropagation();
										onCheckout();
										setShowMenu(false);
									}}
									className="w-full px-3 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-800 flex items-center gap-2"
								>
									<Clock size={14} />
									Travel to this point
								</button>
							)}
						</div>
					)}
				</div>
			</div>

			{!isCurrent && (
				<div className="absolute inset-x-0 bottom-0 translate-y-full pt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
					<div className="text-xs text-neutral-500 text-center">
						Click to time travel
					</div>
				</div>
			)}
		</div>
	);
}
