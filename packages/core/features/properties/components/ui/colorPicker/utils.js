// colorPicker/utils.js

export const convertColor = (color, toFormat) => {
	if (!color || typeof color !== "string") return "#FFFFFF";

	if (toFormat === "HEX" && color.startsWith("#")) return color;
	if (toFormat === "RGB" && color.startsWith("rgb")) return color;
	if (toFormat === "HSL" && color.startsWith("hsl")) return color;

	if (color.startsWith("#")) {
		let hex = color.replace("#", "");
		if (hex.length === 3)
			hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];

		// Handle 8-digit hex (with alpha)
		let alpha = 1;
		if (hex.length === 8) {
			alpha = parseInt(hex.substring(6, 8), 16) / 255;
			hex = hex.substring(0, 6);
		}

		if (hex.length !== 6) return color;

		const r = parseInt(hex.substring(0, 2), 16);
		const g = parseInt(hex.substring(2, 4), 16);
		const b = parseInt(hex.substring(4, 6), 16);

		if (toFormat === "RGB") {
			return alpha < 1 ?
					`rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`
				:	`rgb(${r}, ${g}, ${b})`;
		}
		if (toFormat === "HSL") {
			let rN = r / 255,
				gN = g / 255,
				bN = b / 255;
			const max = Math.max(rN, gN, bN),
				min = Math.min(rN, gN, bN);
			let h,
				s,
				l = (max + min) / 2;
			if (max === min) {
				h = s = 0;
			} else {
				const d = max - min;
				s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
				switch (max) {
					case rN:
						h = (gN - bN) / d + (gN < bN ? 6 : 0);
						break;
					case gN:
						h = (bN - rN) / d + 2;
						break;
					case bN:
						h = (rN - gN) / d + 4;
						break;
				}
				h /= 6;
			}
			return alpha < 1 ?
					`hsla(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%, ${alpha.toFixed(2)})`
				:	`hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
		}
	}
	return color;
};

export const extractColor = (str) => {
	if (!str || !str.includes("gradient")) return str;
	// Match 8-digit or 6-digit hex
	const match = str.match(/#[0-9a-fA-F]{8}|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/);
	return match ? match[0] : "#ffffff";
};

// --- OBJECT CONVERSION HELPERS ---

export const hexToRgbObj = (hex) => {
	if (!hex || !hex.startsWith("#")) return { r: 255, g: 255, b: 255 };
	let h = hex.replace("#", "");
	if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
	// Ignore alpha for the picker object (it only needs r,g,b)
	return {
		r: parseInt(h.substring(0, 2), 16),
		g: parseInt(h.substring(2, 4), 16),
		b: parseInt(h.substring(4, 6), 16),
	};
};

export const hexToHslObj = (hex) => {
	const { r, g, b } = hexToRgbObj(hex);
	let rN = r / 255,
		gN = g / 255,
		bN = b / 255;
	const max = Math.max(rN, gN, bN),
		min = Math.min(rN, gN, bN);
	let h,
		s,
		l = (max + min) / 2;

	if (max === min) {
		h = s = 0;
	} else {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case rN:
				h = (gN - bN) / d + (gN < bN ? 6 : 0);
				break;
			case gN:
				h = (bN - rN) / d + 2;
				break;
			case bN:
				h = (rN - gN) / d + 4;
				break;
		}
		h /= 6;
	}
	return {
		h: Math.round(h * 360),
		s: Math.round(s * 100),
		l: Math.round(l * 100),
	};
};

export const rgbObjToHex = ({ r, g, b }) => {
	return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
};

export const hslObjToHex = ({ h, s, l }) => {
	s /= 100;
	l /= 100;
	const k = (n) => (n + h / 30) % 12;
	const a = s * Math.min(l, 1 - l);
	const f = (n) =>
		l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
	return (
		"#" +
		[f(0), f(8), f(4)]
			.map((x) =>
				Math.round(x * 255)
					.toString(16)
					.padStart(2, "0")
			)
			.join("")
	);
};

// HELPER: Get Alpha (0-100) from Hex string
export const getAlphaFromHex = (hex) => {
	if (!hex || !hex.startsWith("#")) return 100;
	const clean = hex.replace("#", "");
	if (clean.length === 8) {
		return Math.round((parseInt(clean.substring(6, 8), 16) / 255) * 100);
	}
	return 100;
};

// HELPER: Apply Alpha (0-100) to Hex string
export const applyAlphaToHex = (hex, alpha) => {
	if (!hex || !hex.startsWith("#")) return hex;
	let clean = hex.replace("#", "");
	if (clean.length === 3)
		clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
	// Strip existing alpha if present (length 8)
	if (clean.length === 8) clean = clean.substring(0, 6);

	const alphaHex = Math.round((alpha / 100) * 255)
		.toString(16)
		.padStart(2, "0");
	return `#${clean}${alphaHex}`;
};
