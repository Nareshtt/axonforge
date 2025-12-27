import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { initKeyboard } from "@axonforge/core";
import { initMouse } from "@axonforge/core"; // Add this
import { initPages } from "@axonforge/core";

initPages();
initKeyboard();
initMouse(); // Initialize here

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<App />
	</StrictMode>
);
