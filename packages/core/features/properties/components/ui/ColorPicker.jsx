import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { HexColorPicker, RgbColorPicker, HslColorPicker } from "react-colorful";
import { ChevronDown, X } from "lucide-react";
import { GradientEditor } from "./colorPicker/GradientEditor";
import { ColorInputGroup } from "./colorPicker/ColorInputGroup";
import { PRESET_COLORS } from "./colorPicker/constants";
import {
	extractColor,
	hexToRgbObj,
	hexToHslObj,
	rgbObjToHex,
	hslObjToHex,
	getAlphaFromHex,
	applyAlphaToHex,
} from "./colorPicker/utils";

function ColorPickerPanel({ isOpen, onClose, value, onChange, triggerRect }) {
	const [activeTab, setActiveTab] = useState("gradient");
	const [format, setFormat] = useState("HEX");
	const panelRef = useRef(null);
	const [panelPos, setPanelPos] = useState({ top: 0, left: 0, maxHeight: 0 });

	useEffect(() => {
		if (value && value.includes("gradient")) setActiveTab("gradient");
		else setActiveTab("solid");
	}, [isOpen]);

	const handleTabChange = (tab) => {
		if (
			tab === "solid" &&
			typeof value === "string" &&
			value.includes("gradient")
		)
			onChange(extractColor(value));
		setActiveTab(tab);
	};

	useEffect(() => {
		if (isOpen && triggerRect) {
			const PANEL_WIDTH = 320;
			const MARGIN = 16;
			let left = triggerRect.right + MARGIN;
			if (left + PANEL_WIDTH > window.innerWidth)
				left = triggerRect.left - PANEL_WIDTH - MARGIN;
			const top = Math.max(MARGIN, triggerRect.top - 350);
			const maxHeight = window.innerHeight - top - MARGIN;
			setPanelPos({ top, left, maxHeight });
		}
	}, [isOpen, triggerRect]);

	if (!isOpen || !triggerRect) return null;

	// --- SOLID TAB LOGIC ---
	const PickerComponent =
		format === "HSL" ? HslColorPicker
		: format === "RGB" ? RgbColorPicker
		: HexColorPicker;

	const solidColor = value && !value.includes("gradient") ? value : "#FFFFFF";
	const currentAlpha = getAlphaFromHex(solidColor);

	const getPickerColor = () => {
		// Pickers (RGB/HSL/HEX) only need the base color, ignore alpha for the picker visual
		const baseColor =
			solidColor.length === 9 ? solidColor.substring(0, 7) : solidColor;
		if (format === "RGB") return hexToRgbObj(baseColor);
		if (format === "HSL") return hexToHslObj(baseColor);
		return baseColor;
	};

	const handlePickerChange = (v) => {
		let newBaseHex;
		if (format === "RGB") newBaseHex = rgbObjToHex(v);
		else if (format === "HSL") newBaseHex = hslObjToHex(v);
		else newBaseHex = v;

		// Preserve existing alpha when changing color via picker
		onChange(applyAlphaToHex(newBaseHex, currentAlpha));
	};

	const handleOpacityChange = (e) => {
		const newAlpha = parseInt(e.target.value);
		onChange(applyAlphaToHex(solidColor, newAlpha));
	};

	return createPortal(
		<div
			ref={panelRef}
			style={{
				position: "fixed",
				left: panelPos.left,
				top: panelPos.top,
				zIndex: 9999,
				maxHeight: `${panelPos.maxHeight}px`,
			}}
			className="w-[320px] flex flex-col bg-[#1c1c21] border border-[#3f3f46] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-white overflow-hidden"
		>
			<div className="flex items-center justify-between p-4 border-b border-[#3f3f46] shrink-0 bg-[#1c1c21]">
				<div className="flex gap-1.5 bg-[#0f0f12] rounded-xl p-1.5 w-full mr-3">
					<button
						onClick={() => handleTabChange("solid")}
						className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "solid" ? "bg-[#6366f1] text-white shadow-lg" : "text-[#71717a] hover:text-[#e4e4e7]"}`}
					>
						SOLID
					</button>
					<button
						onClick={() => handleTabChange("gradient")}
						className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "gradient" ? "bg-[#6366f1] text-white shadow-lg" : "text-[#71717a] hover:text-[#e4e4e7]"}`}
					>
						GRADIENT
					</button>
				</div>
				<X
					size={20}
					className="text-[#71717a] cursor-pointer hover:text-white shrink-0 transition-colors"
					onClick={onClose}
				/>
			</div>

			<div className="flex-1 overflow-y-auto p-5 custom-scrollbar min-h-0 bg-[#1c1c21]">
				<style>{`.custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 10px; border: 2px solid #1c1c21; }`}</style>

				{activeTab === "gradient" ?
					<GradientEditor value={value} onChange={onChange} />
				:	<div className="space-y-6">
						<PickerComponent
							color={getPickerColor()}
							onChange={handlePickerChange}
							style={{ width: "100%", height: "220px" }}
						/>

						<ColorInputGroup
							color={solidColor}
							onChange={onChange}
							format={format}
							setFormat={setFormat}
						/>

						{/* Solid Opacity Slider */}
						<div className="space-y-2">
							<span className="text-xs font-semibold text-[#71717a] uppercase tracking-wider">
								Opacity
							</span>
							<div className="relative h-7 w-full rounded-md overflow-hidden bg-checkered border border-white/5">
								<style>{`.bg-checkered { background-image: conic-gradient(#333 90deg, #111 90deg 180deg, #333 180deg 270deg, #111 270deg); background-size: 8px 8px; }`}</style>
								<div
									className="absolute inset-0"
									style={{
										background: `linear-gradient(to right, transparent, ${solidColor.substring(0, 7)})`,
									}}
								/>
								<input
									type="range"
									min="0"
									max="100"
									value={currentAlpha}
									onChange={handleOpacityChange}
									className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
								/>
								<div
									className="absolute top-0 bottom-0 w-2.5 bg-[#6366f1] border-x border-white/20 shadow-[0_0_8px_rgba(0,0,0,0.5)]"
									style={{ left: `calc(${currentAlpha}% - 5px)` }}
								/>
							</div>
						</div>

						<div className="grid grid-cols-5 gap-2.5 pt-2 border-t border-white/5">
							{PRESET_COLORS.map((c) => (
								<button
									key={c}
									onClick={() => onChange(c)}
									className="w-full aspect-square rounded-lg border border-white/5 hover:scale-105 transition-transform"
									style={{ backgroundColor: c }}
								/>
							))}
						</div>
					</div>
				}
			</div>
		</div>,
		document.body
	);
}

export function ColorPicker({ value = "#ffffff", onChange, label }) {
	const [isOpen, setIsOpen] = useState(false);
	const btnRef = useRef(null);

	// Check if value is gradient or solid to display correctly in trigger
	const isGradient = value && value.includes("gradient");

	return (
		<div className="w-full">
			{label && (
				<span className="text-xs font-bold text-[#71717a] mb-2 block uppercase tracking-tighter">
					{label}
				</span>
			)}
			<button
				ref={btnRef}
				onClick={() => setIsOpen(!isOpen)}
				className="w-full h-11 px-4 flex items-center justify-between bg-[#0f0f12] border border-[#27272a] rounded-xl hover:border-[#3f3f46] transition-all group"
			>
				<div className="flex items-center gap-3">
					<div className="w-6 h-6 rounded-md border border-white/10 shadow-sm relative overflow-hidden">
						{/* Checkered background for preview thumb transparency */}
						<div
							className="absolute inset-0 bg-checkered -z-10"
							style={{ backgroundSize: "4px 4px" }}
						></div>
						<div
							className="absolute inset-0"
							style={{ background: value }}
						></div>
					</div>
					<span className="text-sm font-mono text-[#e4e4e7] group-hover:text-white truncate max-w-[160px]">
						{isGradient ? "GRADIENT" : value.toUpperCase()}
					</span>
				</div>
				<ChevronDown
					size={16}
					className={`text-[#71717a] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
				/>
			</button>
			<ColorPickerPanel
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				value={value}
				onChange={onChange}
				triggerRect={btnRef.current?.getBoundingClientRect()}
			/>
		</div>
	);
}
