import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

const ITEM_HEIGHT = 32;
const MAX_VISIBLE_ITEMS = 6;
const MAX_Z_INDEX = 2147483647;

export function Select({
	value,
	onChange,
	options,
	placeholder = "Select...",
	className = "",
	renderOption,
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
	const buttonRef = useRef(null);
	const dropdownRef = useRef(null);

	const selectedOption = options.find((opt) => opt.value === value);

	useEffect(() => {
		if (!isOpen) return;

		const handleClickOutside = (e) => {
			if (buttonRef.current && !buttonRef.current.contains(e.target)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen]);

	const updatePosition = () => {
		if (buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			setPosition({
				top: rect.bottom,
				left: rect.left,
				width: rect.width,
			});
		}
	};

	useEffect(() => {
		if (isOpen) {
			updatePosition();
		}
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;

		const handleScroll = (e) => {
			if (dropdownRef.current && dropdownRef.current.contains(e.target)) {
				return;
			}
			setIsOpen(false);
		};

		window.addEventListener("scroll", handleScroll, true);

		return () => {
			window.removeEventListener("scroll", handleScroll, true);
		};
	}, [isOpen]);

	const handleToggle = () => {
		setIsOpen((prev) => !prev);
	};

	const handleSelect = (option, e) => {
		e.preventDefault();
		e.stopPropagation();
		onChange(option.value);
		setIsOpen(false);
	};

	const dropdownHeight =
		Math.min(options.length, MAX_VISIBLE_ITEMS) * ITEM_HEIGHT;

	const dropdown =
		isOpen ?
			<div
				ref={dropdownRef}
				style={{
					position: "fixed",
					top: position.top,
					left: position.left,
					width: position.width,
					zIndex: MAX_Z_INDEX,
					pointerEvents: "auto",
				}}
			>
				<div
					className="bg-[#18181b] border border-[#27272a] rounded-lg shadow-2xl overflow-hidden"
					style={{ maxHeight: `${dropdownHeight}px` }}
				>
					<div
						className="overflow-y-auto"
						style={{ maxHeight: `${dropdownHeight}px` }}
					>
						{options.map((option) => (
							<button
								key={option.value}
								type="button"
								onMouseDown={(e) => handleSelect(option, e)}
								className={`
                w-full h-8 px-3 flex items-center justify-between gap-2
                text-sm text-left
                transition-colors duration-150
                ${
									value === option.value ?
										"bg-[#6366f1]/15 text-[#e4e4e7]"
									:	"text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#e4e4e7]"
								}
              `}
							>
								<span className="flex items-center gap-2">
									{option.icon && <option.icon size={14} />}
									{renderOption ? renderOption(option) : option.label}
								</span>
								{value === option.value && (
									<Check size={14} className="text-[#6366f1]" />
								)}
							</button>
						))}
					</div>
				</div>
			</div>
		:	null;

	return (
		<div className={`relative ${className}`}>
			<button
				ref={buttonRef}
				type="button"
				onClick={handleToggle}
				className={`
          w-full h-9 px-3 flex items-center justify-between gap-2
          bg-[#0f0f12] border border-[#27272a] rounded-lg
          text-sm text-[#e4e4e7] font-medium
          hover:border-[#3f3f46] hover:bg-[#18181b]
          transition-all duration-200 ease-out
          focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30 focus:border-[#6366f1]
        `}
			>
				<span className="truncate flex items-center gap-2">
					{selectedOption?.icon && (
						<selectedOption.icon size={14} className="text-[#a1a1aa]" />
					)}
					<span
						className={selectedOption ? "text-[#e4e4e7]" : "text-[#71717a]"}
					>
						{selectedOption?.label || placeholder}
					</span>
				</span>
				<ChevronDown
					size={14}
					className={`text-[#71717a] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
				/>
			</button>

			{isOpen && createPortal(dropdown, document.body)}
		</div>
	);
}
