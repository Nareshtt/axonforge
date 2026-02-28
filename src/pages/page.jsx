export default function Page() {
  return (
    <div className="flex flex-col justify-center items-center w-full h-full bg-[linear-gradient(306deg,_#0E0F16ff_13%,_#b11536ff_100%)] text-[#ffffffff] text-base px-20">
			{/* Hero Section Container */}
			<div className="flex absolute flex-col inset-0">
				{/* Nav Bar */}
				<div className="flex justify-between items-center w-full h-17 bg-[linear-gradient(90deg,_#0E0F16ff_0%,_#4F547Cff_100%)] px-8" id="Nav bar">
					<div className="text-xl font-bold text-white" id="Logo">Acme Inc</div>
					<div className="flex gap-8">
						<span className=" text-gray-400 font-normal text-center leading-normal hover:text-white cursor-pointer">
							Home
						</span>
						<span className="text-gray-400 hover:text-white cursor-pointer">
							Products
						</span>
						<span className="text-gray-400 hover:text-white cursor-pointer">
							About
						</span>
						<span className="text-gray-400 hover:text-white cursor-pointer">
							Contact
						</span>
					</div>
					<div className="px-6 py-2 bg-[#6366f1] text-white rounded-lg">
						Get Started
					</div>
				</div>

				{/* Hero Content */}
				<div className="flex flex-1 justify-center items-center bg-[#0E0F16ff]">
					<div className="text-center max-w-3xl">
						<h1 className="text-6xl font-bold text-white mb-6">
							Build Amazing Products
						</h1>
						<p className="text-xl text-gray-400 mb-8">
							The best platform for creating stunning web applications with
							modern tools and technologies.
						</p>
						<div className="flex gap-4 justify-center">
							<button className="bg-[#6366f1c2] text-white font-medium rounded-xl px-8 py-3">
								Start Free Trial
							</button>
							<button className="bg-[#0000001c] text-white border-gray-600 font-medium rounded-xl px-8 py-3 border">
								View Demo
							</button>
						</div>
					</div>
				</div>

				{/* Feature Cards */}
				<div className="flex justify-center items-center h-64 gap-8 bg-[#0E0F16ff] rounded-full px-8">
					<div className="w-64 p-6 bg-[#18181b] rounded-xl border border-[#27272a]">
						<div className="flex justify-center items-center w-12 h-12 bg-[#6366f1]/20 rounded-lg mb-4">
							<span className="text-[#6366f1] text-xl">⚡</span>
						</div>
						<h3 className="text-white font-semibold mb-2">Fast Performance</h3>
						<p className="text-gray-400 text-sm">
							Lightning fast speed optimized for best user experience.
						</p>
					</div>
					<div className="w-64 p-6 bg-[#18181b] rounded-xl border border-[#27272a]">
						<div className="w-12 h-12 bg-[#22c55e]/20 rounded-lg mb-4 flex items-center justify-center">
							<span className="text-[#22c55e] text-xl">🔒</span>
						</div>
						<h3 className="text-white font-semibold mb-2">Secure by Default</h3>
						<p className="text-gray-400 text-sm">
							Enterprise-grade security for your applications.
						</p>
					</div>
					<div className="w-64 p-6 bg-[#18181b] rounded-xl border border-[#27272a]">
						<div className="w-12 h-12 bg-[#f59e0b]/20 rounded-lg mb-4 flex items-center justify-center">
							<span className="text-[#f59e0b] text-xl">🎨</span>
						</div>
						<h3 className="text-white font-semibold mb-2">Beautiful Design</h3>
						<p className="text-gray-400 text-sm">
							Stunning UI components and modern aesthetics.
						</p>
					</div>
				</div>
			</div>
		</div>);

}