import {
	CanvasRoot,
	PageDOMRoot,
	TopBar,
	LeftSidebar,
	TimelinePanel,
} from "@axonforge/core";

const App = () => {
	return (
		<div className="w-screen h-screen bg-black overflow-hidden">
			<TopBar />
			<LeftSidebar />
			<CanvasRoot />
			<PageDOMRoot />
			<TimelinePanel />
		</div>
	);
};

export default App;
