import { CanvasRoot, PageDOMRoot, TopBar, LeftSidebar } from "@axonforge/core";

const App = () => {
	return (
		<div className="w-screen h-screen bg-black overflow-hidden">
			<TopBar />
			<LeftSidebar />
			<CanvasRoot />
			<PageDOMRoot />
		</div>
	);
};

export default App;
