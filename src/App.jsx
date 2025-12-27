import { CanvasRoot, PageDOMRoot, TopBar } from "@axonforge/core";

const App = () => {
	return (
		<div className="w-screen h-screen bg-black overflow-hidden">
			<TopBar />
			<CanvasRoot />
			<PageDOMRoot />
		</div>
	);
};

export default App;
