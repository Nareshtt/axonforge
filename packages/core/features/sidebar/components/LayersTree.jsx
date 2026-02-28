import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Folder, Square } from "lucide-react";
import { useEditorStore } from "../../../stores/editorStore";

function pathKey(path) {
	return Array.isArray(path) ? path.join(".") : "";
}

function isPrefix(prefix, full) {
	if (!Array.isArray(prefix) || !Array.isArray(full)) return false;
	if (prefix.length > full.length) return false;
	for (let i = 0; i < prefix.length; i += 1) {
		if (prefix[i] !== full[i]) return false;
	}
	return true;
}

function buildTree(rootEl, basePath = []) {
	if (!(rootEl instanceof HTMLElement)) return null;
	const tag = rootEl.tagName.toLowerCase();
	const id = rootEl.getAttribute("id") || "";
	const children = [];
	for (let i = 0; i < rootEl.children.length; i += 1) {
		const child = rootEl.children[i];
		const node = buildTree(child, [...basePath, i]);
		if (node) children.push(node);
	}
	return { tag, id, path: basePath, children };
}

function getPageRootDom(selectedPageId) {
	const container = selectedPageId
		? document.querySelector(`[data-editor-page-id="${selectedPageId}"]`)
		: null;
	if (!container) return null;
	return container.firstElementChild;
}

function displayName(node) {
	if (!node) return "";
	if (node.id) return node.id;
	return node.tag.toUpperCase();
}

function LayerRow({ node, depth, expandedMap, setExpandedMap, selectedPath, onSelect, onRename }) {
	const hasChildren = node.children && node.children.length > 0;
	const expanded = expandedMap[pathKey(node.path)] ?? depth < 2;
	const selected = Array.isArray(selectedPath) && pathKey(selectedPath) === pathKey(node.path);

	return (
		<>
			<div
				onClick={() => onSelect(node.path)}
				onDoubleClick={() => onRename(node)}
				className={[
					"flex items-center gap-1.5 px-2 py-1 rounded",
					"cursor-pointer select-none",
					selected ? "bg-[#1a1a1a] text-white" : "text-[#b3b3b3] hover:bg-[#141414] hover:text-white",
				].join(" ")}
				style={{ paddingLeft: 8 + depth * 12 }}
				title={node.tag}
			>
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						if (!hasChildren) return;
						setExpandedMap((prev) => ({ ...prev, [pathKey(node.path)]: !expanded }));
					}}
					className={[
						"w-5 h-5 flex items-center justify-center rounded",
						hasChildren ? "hover:bg-[#202020]" : "opacity-30 cursor-default",
					].join(" ")}
				>
					<ChevronRight
						size={14}
						className={hasChildren && expanded ? "rotate-90 transition-transform" : "transition-transform"}
					/>
				</button>
				{hasChildren ? <Folder size={14} className="text-[#888]" /> : <Square size={12} className="text-[#666]" />}
				<span className="text-xs truncate">{displayName(node)}</span>
				<span className="ml-auto text-[10px] text-[#555]">{node.tag}</span>
			</div>
			{hasChildren && expanded &&
				node.children.map((c) => (
					<LayerRow
						key={pathKey(c.path)}
						node={c}
						depth={depth + 1}
						expandedMap={expandedMap}
						setExpandedMap={setExpandedMap}
						selectedPath={selectedPath}
						onSelect={onSelect}
						onRename={onRename}
					/>
				))}
		</>
	);
}

export function LayersTree() {
	const mode = useEditorStore((s) => s.mode);
	const selectedPageId = useEditorStore((s) => s.selectedPageId);
	const selectedElementPath = useEditorStore((s) => s.selectedElementPath);
	const selectElementPath = useEditorStore((s) => s.selectElementPath);
	const selectPage = useEditorStore((s) => s.selectPage);
	const clearElementSelection = useEditorStore((s) => s.clearElementSelection);

	const [tree, setTree] = useState(null);
	const [expandedMap, setExpandedMap] = useState({});
	const [editingKey, setEditingKey] = useState(null);
	const [editingValue, setEditingValue] = useState("");

	useEffect(() => {
		if (mode !== "edit") return;
		if (!selectedPageId) {
			setTree(null);
			return;
		}
		const root = getPageRootDom(selectedPageId);
		if (!root) {
			setTree(null);
			return;
		}
		setTree(buildTree(root, []));
	}, [mode, selectedPageId]);

	const onSelect = (path) => {
		if (!selectedPageId) return;
		selectPage(selectedPageId);
		if (!Array.isArray(path) || path.length === 0) {
			clearElementSelection();
			return;
		}
		selectElementPath(path);
	};

	const onRenameStart = (node) => {
		const key = pathKey(node.path);
		setEditingKey(key);
		setEditingValue(node.id || "");
	};

	const commitRename = async () => {
		if (!editingKey || !tree || !selectedPageId) {
			setEditingKey(null);
			return;
		}

		// Find node path from key
		const path = editingKey === "" ? [] : editingKey.split(".").map((n) => parseInt(n));
		const nextId = editingValue.trim();

		await fetch("/__pages/update", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				pageId: selectedPageId,
				elementPath: path,
				attributes: { id: nextId },
			}),
		});

		setEditingKey(null);
		setEditingValue("");
		// refresh tree after HMR
		setTimeout(() => {
			const root = getPageRootDom(selectedPageId);
			if (root) setTree(buildTree(root, []));
		}, 100);
	};

	const selectedKey = useMemo(() => (Array.isArray(selectedElementPath) ? pathKey(selectedElementPath) : null), [selectedElementPath]);

	if (mode !== "edit") {
		return <div className="px-3 py-1.5 text-[#444] text-xs">Switch to edit mode</div>;
	}
	if (!selectedPageId) {
		return <div className="px-3 py-1.5 text-[#444] text-xs">Select a page</div>;
	}
	if (!tree) {
		return <div className="px-3 py-1.5 text-[#444] text-xs">No layers found</div>;
	}

	return (
		<div className="px-2 pb-2">
			{editingKey !== null && (
				<div className="px-2 py-2">
					<input
						autoFocus
						value={editingValue}
						onChange={(e) => setEditingValue(e.target.value)}
						onBlur={commitRename}
						onKeyDown={(e) => {
							if (e.key === "Enter") commitRename();
							if (e.key === "Escape") {
								setEditingKey(null);
								setEditingValue("");
							}
						}}
						placeholder="Element id (optional)"
						className="w-full h-9 px-3 bg-[#0f0f12] border border-[#27272a] rounded-lg text-sm text-[#e4e4e7] focus:border-[#6366f1] focus:outline-none"
					/>
					<div className="text-[10px] text-[#555] mt-1">Double click an element to rename (writes id=\"...\")</div>
				</div>
			)}
			<LayerRow
				node={tree}
				depth={0}
				expandedMap={expandedMap}
				setExpandedMap={setExpandedMap}
				selectedPath={selectedElementPath}
				onSelect={onSelect}
				onRename={onRenameStart}
			/>
		</div>
	);
}
