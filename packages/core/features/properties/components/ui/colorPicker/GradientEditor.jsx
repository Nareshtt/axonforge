import { useState, useRef, useEffect, useMemo, useCallback } from "react";
// Change imports to non-alpha pickers to avoid duplicate opacity slider
import { HexColorPicker, RgbColorPicker, HslColorPicker } from "react-colorful";
import { Plus, Minus } from "lucide-react";
import { Select } from "../Select";
import { Slider } from "../Slider";
import { ColorInputGroup } from "./ColorInputGroup";
import { PRESET_COLORS, GRADIENT_TYPES } from "./constants";
import { hexToRgbObj, hexToHslObj, rgbObjToHex, hslObjToHex } from "./utils";

export function GradientEditor({ value, onChange }) {
	const [gradientType, setGradientType] = useState("linear");
	const [angle, setAngle] = useState(90);
	const [stops, setStops] = useState([
		{ id: "1", color: "#0E0F16", pos: 0, opacity: 100 },
		{ id: "2", color: "#4F547C", pos: 100, opacity: 100 },
	]);
	const [activeStop, setActiveStop] = useState("1");
	const barRef = useRef(null);
	const [isDragging, setIsDragging] = useState(null);
	const [format, setFormat] = useState("HEX");

	const active = stops.find((s) => s.id === activeStop) || stops[0];

	const gradientCSS = useMemo(() => {
		const sorted = [...stops].sort((a, b) => a.pos - b.pos);
		const colors = sorted
			.map((s) => {
				const opacity = s.opacity / 100;
				const alphaHex = Math.round(opacity * 255)
					.toString(16)
					.padStart(2, "0");
				const cleanHex = s.color.startsWith("#") ? s.color : "#FFFFFF";
				return `${cleanHex}${alphaHex} ${s.pos}%`;
			})
			.join(", ");

		if (gradientType === "radial") return `radial-gradient(circle, ${colors})`;
		if (gradientType === "conic")
			return `conic-gradient(from ${angle}deg, ${colors})`;
		return `linear-gradient(${angle}deg, ${colors})`;
	}, [stops, gradientType, angle]);

	useEffect(() => {
		onChange(gradientCSS);
	}, [gradientCSS]);

	const handleMouseMove = useCallback(
		(e) => {
			if (!isDragging || !barRef.current) return;
			const rect = barRef.current.getBoundingClientRect();
			const pos = Math.max(
				0,
				Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)
			);
			setStops((prev) =>
				prev.map((s) =>
					s.id === isDragging ? { ...s, pos: Math.round(pos) } : s
				)
			);
		},
		[isDragging]
	);

	useEffect(() => {
		if (isDragging) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", () => setIsDragging(null));
			return () => {
				document.removeEventListener("mousemove", handleMouseMove);
				document.removeEventListener("mouseup", () => setIsDragging(null));
			};
		}
	}, [isDragging, handleMouseMove]);

	const updateActiveColor = (newColor) => {
		setStops((prev) =>
			prev.map((s) => (s.id === activeStop ? { ...s, color: newColor } : s))
		);
	};

	// --- PICKER LOGIC START ---
	// Select the correct component
	const PickerComponent =
		format === "HSL" ? HslColorPicker
		: format === "RGB" ? RgbColorPicker
		: HexColorPicker;

	// Convert the current HEX state to the object format required by RGB/HSL pickers
	const getPickerColor = () => {
		if (format === "RGB") return hexToRgbObj(active.color);
		if (format === "HSL") return hexToHslObj(active.color);
		return active.color; // Hex expects string
	};

	// Convert the picker's output object back to HEX string for state
	const handlePickerChange = (v) => {
		if (format === "RGB") updateActiveColor(rgbObjToHex(v));
		else if (format === "HSL") updateActiveColor(hslObjToHex(v));
		else updateActiveColor(v);
	};
	// --- PICKER LOGIC END ---

	return (
		<div className="space-y-5 pb-4">
			<Select
				className="w-full"
				value={gradientType}
				onChange={setGradientType}
				options={GRADIENT_TYPES}
			/>
			{gradientType !== "radial" && (
				<Slider
					label="Angle"
					value={angle}
					min={0}
					max={360}
					onChange={setAngle}
					showValue
				/>
			)}

			{/* Gradient Bar */}
			<div
				ref={barRef}
				className="relative h-10 rounded-md border border-white/10 cursor-pointer"
				style={{ background: gradientCSS }}
			>
				{stops.map((s) => (
					<div
						key={s.id}
						onMouseDown={(e) => {
							e.stopPropagation();
							setActiveStop(s.id);
							setIsDragging(s.id);
						}}
						className={`absolute top-0 h-full w-5 -ml-2.5 flex flex-col items-center cursor-grab ${s.id === activeStop ? "z-20" : "z-10"}`}
						style={{ left: `${s.pos}%` }}
					>
						<div
							className={`w-full h-full rounded-sm border-2 ${s.id === activeStop ? "border-[#6366f1] scale-110 shadow-[0_0_10px_rgba(99,102,241,0.4)]" : "border-black/40"}`}
							style={{ backgroundColor: s.color }}
						/>
						{s.id === activeStop && (
							<div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[5px] border-b-[#6366f1] -mt-1.5" />
						)}
					</div>
				))}
			</div>

			{/* Stops List */}
			<div className="space-y-2">
				<div className="flex items-center justify-between text-[11px] font-bold text-[#71717a] uppercase tracking-wider">
					<span>Stops</span>
					<button
						onClick={() => {
							const ns = {
								id: Date.now().toString(),
								color: "#ffffff",
								pos: 50,
								opacity: 100,
							};
							setStops([...stops, ns]);
							setActiveStop(ns.id);
						}}
						className="p-1 hover:bg-white/10 rounded transition-colors"
					>
						<Plus size={14} />
					</button>
				</div>
				<div className="space-y-1.5">
					{stops.map((s) => (
						<div
							key={s.id}
							onClick={() => setActiveStop(s.id)}
							className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors ${s.id === activeStop ? "bg-[#27272a]" : "hover:bg-[#27272a]/40"}`}
						>
							<div className="w-14 bg-[#0f0f12] rounded px-1 py-2 text-xs text-[#a1a1aa] text-center font-medium">
								{s.pos}%
							</div>
							<div className="flex-1 bg-[#0f0f12] rounded flex items-center px-3 py-2 gap-3 overflow-hidden">
								<div
									className="w-4 h-4 rounded-sm border border-white/10 shrink-0 shadow-sm"
									style={{ backgroundColor: s.color }}
								/>
								<span className="text-xs font-mono text-[#e4e4e7] uppercase truncate tracking-tight">
									{s.color}
								</span>
							</div>
							<div className="w-14 bg-[#0f0f12] rounded px-1 py-2 text-xs text-[#e4e4e7] text-center font-medium">
								{s.opacity}%
							</div>
							<button
								disabled={stops.length <= 2}
								onClick={(e) => {
									e.stopPropagation();
									setStops(stops.filter((x) => x.id !== s.id));
								}}
								className="p-1.5 text-[#71717a] hover:text-red-400 disabled:opacity-20 transition-colors"
							>
								<Minus size={16} />
							</button>
						</div>
					))}
				</div>
			</div>

			<div className="space-y-5 pt-2">
				{/* Dynamic Picker rendering using converted values */}
				<PickerComponent
					color={getPickerColor()}
					onChange={handlePickerChange}
					style={{ width: "100%", height: "180px" }}
				/>

				<ColorInputGroup
					color={active.color}
					onChange={updateActiveColor}
					format={format}
					setFormat={setFormat}
				/>

				<div className="space-y-2">
					<span className="text-xs font-semibold text-[#71717a] uppercase tracking-wider">
						Opacity
					</span>
					<div className="relative h-7 w-full rounded-md overflow-hidden bg-checkered border border-white/5">
						<style>{`.bg-checkered { background-image: conic-gradient(#333 90deg, #111 90deg 180deg, #333 180deg 270deg, #111 270deg); background-size: 8px 8px; }`}</style>
						<div
							className="absolute inset-0"
							style={{
								background: `linear-gradient(to right, transparent, ${active.color})`,
							}}
						/>
						<input
							type="range"
							min="0"
							max="100"
							value={active.opacity}
							onChange={(e) =>
								setStops((prev) =>
									prev.map((s) =>
										s.id === activeStop ?
											{ ...s, opacity: parseInt(e.target.value) }
										:	s
									)
								)
							}
							className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
						/>
						<div
							className="absolute top-0 bottom-0 w-2.5 bg-[#6366f1] border-x border-white/20 shadow-[0_0_8px_rgba(0,0,0,0.5)]"
							style={{ left: `calc(${active.opacity}% - 5px)` }}
						/>
					</div>
				</div>

				<div className="grid grid-cols-5 gap-2.5">
					{PRESET_COLORS.map((c) => (
						<button
							key={c}
							onClick={() => updateActiveColor(c)}
							className="w-full aspect-square rounded-lg border border-white/5 hover:scale-105 transition-transform"
							style={{ backgroundColor: c }}
						/>
					))}
				</div>

				<div className="space-y-2 pt-4 border-t border-white/10">
					<span className="text-xs font-semibold text-[#71717a] uppercase tracking-wider">
						Preview
					</span>
					<div className="h-24 w-full rounded-xl border border-white/10 overflow-hidden shadow-inner relative">
						<div className="absolute inset-0 bg-subtle-checkered" />
						<style>{`.bg-subtle-checkered { background-image: linear-gradient(45deg, #1a1a1a 25%, transparent 25%), linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a1a 75%), linear-gradient(-45deg, transparent 75%, #1a1a1a 75%); background-size: 12px 12px; background-position: 0 0, 0 6px, 6px -6px, -6px 0px; background-color: #111; }`}</style>
						<div
							className="relative w-full h-full"
							style={{ background: gradientCSS }}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
