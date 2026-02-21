import { useState, useEffect } from "react";
import { Pipette, Check } from "lucide-react";
import { FORMATS } from "./constants";
import { convertColor } from "./utils";

export function ColorInputGroup({ color, onChange, format, setFormat }) {
	const [inputValue, setInputValue] = useState(() =>
		convertColor(color, format)
	);

	useEffect(() => {
		const activeEl = document.activeElement;
		const isFocused = activeEl && activeEl.id === "color-input-field";
		if (!isFocused) {
			setInputValue(convertColor(color, format));
		}
	}, [color, format]);

	const handleInputChange = (e) => {
		const newVal = e.target.value;
		setInputValue(newVal);

		let isValid = false;

		if (format === "HEX") {
			isValid = /^#([0-9A-Fa-f]{3}){1,2}$/.test(newVal);
		} else if (format === "RGB") {
			isValid = newVal.startsWith("rgb") && newVal.includes(")");
		} else if (format === "HSL") {
			isValid = newVal.startsWith("hsl") && newVal.includes(")");
		}

		if (isValid) {
			onChange(newVal);
		}
	};

	const handleBlur = () => {
		setInputValue(convertColor(color, format));
	};

	return (
		<div className="space-y-3">
			<div className="flex bg-[#0f0f12] rounded-lg p-1 gap-1">
				{FORMATS.map((f) => (
					<button
						key={f}
						onClick={() => setFormat(f)}
						className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-colors ${format === f ? "bg-[#27272a] text-[#6366f1]" : "text-[#71717a]"}`}
					>
						{f}
					</button>
				))}
			</div>

			<div className="flex items-center gap-3">
				<div className="p-2.5 bg-[#0f0f12] rounded-lg border border-white/5">
					<Pipette size={18} className="text-[#71717a]" />
				</div>
				<div className="relative flex-1">
					<input
						id="color-input-field"
						value={inputValue}
						onChange={handleInputChange}
						onBlur={handleBlur}
						className="w-full bg-[#0f0f12] border border-[#27272a] rounded-xl h-11 px-4 text-sm font-mono uppercase focus:border-[#6366f1] outline-none transition-all pr-10"
					/>
					<Check
						size={14}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6366f1]"
					/>
				</div>
			</div>
		</div>
	);
}
