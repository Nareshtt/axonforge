import { Crosshair } from "lucide-react";
import { Section } from "./Section";
import { Select, NumberInput } from "../ui";

const POSITION_OPTIONS = [
	{ value: "", label: "Default" },
	{ value: "static", label: "Static" },
	{ value: "relative", label: "Relative" },
	{ value: "absolute", label: "Absolute" },
	{ value: "fixed", label: "Fixed" },
	{ value: "sticky", label: "Sticky" },
];

function parsePxFromTw(cls, prefix) {
	if (!cls || typeof cls !== "string") return null;
	if (cls === `${prefix}-0`) return 0;
	const m = cls.match(new RegExp(`^${prefix}-\\[(.+)\\]$`));
	if (m) {
		const raw = m[1];
		const num = Number(String(raw).replace(/px$/, ""));
		return Number.isFinite(num) ? num : null;
	}
	return null;
}

function toTwOffset(prefix, px) {
	if (px === null || px === undefined || px === "") return "";
	const n = Number(px);
	if (!Number.isFinite(n)) return "";
	if (n === 0) return `${prefix}-0`;
	return `${prefix}-[${n}px]`;
}

export function PositionSection({ sectionProperties, addClass, addClasses, isOpen, onToggle }) {
	const selected = sectionProperties?.selectedClasses || {};
	const pos = selected.position || "";
	const showOffsets = pos === "relative" || pos === "absolute" || pos === "fixed" || pos === "sticky";

	const top = parsePxFromTw(selected.top, "top");
	const right = parsePxFromTw(selected.right, "right");
	const bottom = parsePxFromTw(selected.bottom, "bottom");
	const left = parsePxFromTw(selected.left, "left");

	return (
		<Section title="Position" icon={Crosshair} isOpen={isOpen} onToggle={onToggle}>
			<div className="space-y-4">
				<div className="space-y-2">
					<span className="text-xs font-medium text-[#71717a]">Mode</span>
					<Select
						value={pos}
						onChange={(v) => {
							if (typeof addClasses === "function") {
								if (v === "" || v === "static") {
									addClasses({
										position: v,
										top: "",
										right: "",
										bottom: "",
										left: "",
									});
								} else {
									addClasses({ position: v });
								}
								return;
							}

							addClass("position", v);
							if (v === "" || v === "static") {
								addClass("top", "");
								addClass("right", "");
								addClass("bottom", "");
								addClass("left", "");
							}
						}}
						options={POSITION_OPTIONS}
						placeholder="Default"
					/>
				</div>

				{showOffsets && (
					<div className="grid grid-cols-2 gap-3 pt-2">
						<div className="space-y-1.5">
							<span className="text-xs text-[#71717a]">Top</span>
							<NumberInput
								value={top ?? 0}
								onChange={(v) => addClass("top", toTwOffset("top", v))}
								min={-999}
								max={9999}
								showControls={true}
							/>
						</div>
						<div className="space-y-1.5">
							<span className="text-xs text-[#71717a]">Right</span>
							<NumberInput
								value={right ?? 0}
								onChange={(v) => addClass("right", toTwOffset("right", v))}
								min={-999}
								max={9999}
								showControls={true}
							/>
						</div>
						<div className="space-y-1.5">
							<span className="text-xs text-[#71717a]">Bottom</span>
							<NumberInput
								value={bottom ?? 0}
								onChange={(v) => addClass("bottom", toTwOffset("bottom", v))}
								min={-999}
								max={9999}
								showControls={true}
							/>
						</div>
						<div className="space-y-1.5">
							<span className="text-xs text-[#71717a]">Left</span>
							<NumberInput
								value={left ?? 0}
								onChange={(v) => addClass("left", toTwOffset("left", v))}
								min={-999}
								max={9999}
								showControls={true}
							/>
						</div>
					</div>
				)}
			</div>
		</Section>
	);
}
