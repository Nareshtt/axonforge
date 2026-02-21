import {
	CanvasRoot,
	PageDOMRoot,
	TopBar,
	LeftSidebar,
	RightSidebar,
	TimelinePanel,
} from "@axonforge/core";

const App = () => {
	return (
		<div className="w-screen h-screen bg-black overflow-hidden">
			<TopBar />
			<LeftSidebar />
			<CanvasRoot />
			<PageDOMRoot />
			<RightSidebar />
			<TimelinePanel />
		</div>
	);
};

export default App;
