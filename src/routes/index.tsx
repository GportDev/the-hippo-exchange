import { SignUpButton, useUser } from "@clerk/clerk-react";
import { Navigate, createFileRoute } from "@tanstack/react-router";

// Forward '/' as the route for this file, the file will export the component App
export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const { isSignedIn } = useUser();

	if (isSignedIn) {
		return <Navigate to="/home" />;
	}

	return (
		<div className="bg-primary-yellow font-sans text-black relative">
			{/* Global noise texture overlay */}
			<div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')] opacity-40 pointer-events-none z-50 mix-blend-overlay" />

			<section className="relative overflow-hidden py-20 md:py-28 lg:py-32">
				{/* Enhanced background patterns */}
				<div className="absolute -top-1/2 right-[-20%] size-[800px] rounded-full bg-[radial-gradient(circle,rgba(254,239,76,0.3)_0%,transparent_70%)] blur-3xl" />
				<div className="absolute -top-1/4 right-[10%] size-[600px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.4)_0%,transparent_60%)] blur-2xl" />
				<div className="absolute left-[-5%] top-[20%] size-[200px] bg-[radial-gradient(circle,#000_2px,transparent_2px)] bg-[length:20px_20px] opacity-10" />
				<div className="absolute left-[10%] top-[60%] size-[150px] bg-[linear-gradient(45deg,transparent_48%,rgba(0,0,0,0.05)_49%,rgba(0,0,0,0.05)_51%,transparent_52%)] bg-[length:10px_10px]" />
				<div className="absolute right-[5%] bottom-[10%] size-[100px] rotate-12 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.03)_10px,rgba(0,0,0,0.03)_20px)]" />

				<div className="container mx-auto px-5">
					<div className="grid min-h-[60vh] items-center gap-16 md:grid-cols-2">
						<div className="relative z-10 text-center md:text-left">
							<div className="absolute -left-8 -top-8 size-32 rounded-full bg-white/20 blur-3xl" />
							<h1 className="mb-6 text-primary-gray bg-clip-text text-5xl font-bold leading-tight md:text-6xl lg:text-7xl drop-shadow-sm">
								Don't buy. Borrow.
							</h1>
							<p className="mx-auto mb-10 max-w-md text-lg text-primary-gray/90 md:mx-0 leading-relaxed">
								Access thousands of tools and equipment from your neighbors.
								From lawn mowers to power tools, get what you need when you need
								it.
							</p>
							<SignUpButton>
								<button
									type="button"
									className="group cursor-pointer inline-flex items-center gap-3 rounded-full bg-white/90 px-8 py-4 text-lg font-semibold text-primary-gray shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-sm border border-black/5 transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.16)] hover:bg-white"
								>
									Start Borrowing
									<span className="transition-transform group-hover:translate-x-1">
										→
									</span>
								</button>
							</SignUpButton>
						</div>

						<div className="relative flex items-center justify-center">
							<div className="relative size-80 md:size-96 lg:size-[400px]">
								{/* Decorative elements */}
								<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-64 rounded-full border border-primary-gray/10" />
								<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-80 rounded-full border border-primary-gray/5" />

								<div className="animate-float absolute left-0 top-0 w-52 rounded-2xl border-2 border-black/10 bg-gradient-to-br from-white/95 to-white/85 p-6 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:shadow-[0_12px_40px_rgb(0,0,0,0.16)] md:w-52">
									<div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-gray to-primary-gray/90 text-2xl shadow-lg">
										🔨
									</div>
									<h3 className="text-md font-semibold text-primary-gray">
										Power Tools
									</h3>
									<p className="text-xs text-primary-gray/70">
										Drills, saws, sanders & more
									</p>
									<div className="absolute -right-2 -top-2 size-4 rounded-full bg-primary-yellow border-2 border-white shadow-md" />
								</div>
								<div
									className="animate-float absolute right-0 top-28 w-52 rounded-2xl border-2 border-black/10 bg-gradient-to-br from-white/95 to-white/85 p-6 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:shadow-[0_12px_40px_rgb(0,0,0,0.16)]"
									style={{ animationDelay: "2s" }}
								>
									<div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-gray to-primary-gray/90 text-2xl shadow-lg">
										🌿
									</div>
									<h3 className="text-md font-semibold text-primary-gray">
										Garden Tools
									</h3>
									<p className="text-xs text-primary-gray/70">
										Mowers, trimmers, blowers
									</p>
									<div className="absolute -right-2 -top-2 size-4 rounded-full bg-primary-yellow border-2 border-white shadow-md" />
								</div>
								<div
									className="animate-float absolute -bottom-3 left-12 w-52 rounded-2xl border-2 border-black/10 bg-gradient-to-br from-white/95 to-white/85 p-6 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:shadow-[0_12px_40px_rgb(0,0,0,0.16)]"
									style={{ animationDelay: "4s" }}
								>
									<div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-gray to-primary-gray/90 text-2xl shadow-lg">
										🛠️
									</div>
									<h3 className="text-md font-semibold text-primary-gray">
										Hand Tools
									</h3>
									<p className="text-xs text-primary-gray/70">
										Hammers, wrenches, screwdrivers
									</p>
									<div className="absolute -right-2 -top-2 size-4 rounded-full bg-primary-yellow border-2 border-white shadow-md" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section className="relative bg-gradient-to-b from-black/5 to-black/10 py-20 md:py-24 overflow-hidden border-t border-black/5">
				{/* Enhanced background patterns */}
				<div className="absolute right-[-5%] top-[10%] size-[200px] bg-[radial-gradient(circle,#000_2px,transparent_2px)] bg-[length:20px_20px] opacity-10" />
				<div className="absolute left-[-10%] bottom-[20%] size-[300px] rounded-full bg-[radial-gradient(circle,rgba(254,239,76,0.2)_0%,transparent_70%)] blur-3xl" />
				<div className="absolute right-[15%] bottom-[30%] size-[250px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.3)_0%,transparent_60%)] blur-2xl" />
				<div className="absolute left-[20%] top-[15%] size-[120px] bg-[repeating-conic-gradient(from_0deg,transparent_0deg_45deg,rgba(0,0,0,0.02)_45deg_90deg)] rounded-full" />

				<div className="container mx-auto px-5 relative z-10">
					<h2 className="mb-5 text-center text-4xl text-primary-gray font-bold md:text-5xl drop-shadow-sm">
						How It Works
					</h2>
					<p className="mx-auto max-w-2xl text-primary-gray/80 text-center text-lg">
						Get started in three simple steps
					</p>

					<div className="mt-16 grid gap-10 md:grid-cols-3">
						<div className="group relative rounded-2xl border-2 border-black/10 bg-gradient-to-br from-white/80 to-white/60 p-8 text-center transition-all hover:-translate-y-2 hover:border-primary-yellow/30 hover:shadow-[0_20px_50px_rgb(0,0,0,0.15)] backdrop-blur-sm">
							<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
							<div className="relative">
								<div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-gray to-primary-gray/90 text-2xl text-primary-yellow font-bold shadow-lg ring-4 ring-white/50">
									1
								</div>
								<h3 className="mb-2 text-xl font-bold text-primary-gray">
									Browse & Discover
								</h3>
								<p className="text-primary-gray/70 leading-relaxed">
									Search thousands of tools available in your neighborhood. Find
									exactly what you need.
								</p>
								{/* Decorative corner accent */}
								<div className="absolute -right-2 -top-2 size-12 bg-[radial-gradient(circle,rgba(254,239,76,0.3)_0%,transparent_70%)] rounded-full blur-xl" />
							</div>
						</div>

						<div className="group relative rounded-2xl border-2 border-black/10 bg-gradient-to-br from-white/80 to-white/60 p-8 text-center transition-all hover:-translate-y-2 hover:border-primary-yellow/30 hover:shadow-[0_20px_50px_rgb(0,0,0,0.15)] backdrop-blur-sm">
							<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
							<div className="relative">
								<div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-gray to-primary-gray/90 text-2xl text-primary-yellow font-bold shadow-lg ring-4 ring-white/50">
									2
								</div>
								<h3 className="mb-2 text-xl font-bold text-primary-gray">
									Connect & Request
								</h3>
								<p className="text-primary-gray/70 leading-relaxed">
									Send a request to your neighbor. Arrange pickup times and
									coordinate through our platform.
								</p>
								<div className="absolute -right-2 -top-2 size-12 bg-[radial-gradient(circle,rgba(254,239,76,0.3)_0%,transparent_70%)] rounded-full blur-xl" />
							</div>
						</div>

						<div className="group relative rounded-2xl border-2 border-black/10 bg-gradient-to-br from-white/80 to-white/60 p-8 text-center transition-all hover:-translate-y-2 hover:border-primary-yellow/30 hover:shadow-[0_20px_50px_rgb(0,0,0,0.15)] backdrop-blur-sm">
							<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
							<div className="relative">
								<div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-gray to-primary-gray/90 text-2xl text-primary-yellow font-bold shadow-lg ring-4 ring-white/50">
									3
								</div>
								<h3 className="mb-2 text-xl font-bold text-primary-gray">
									Borrow & Return
								</h3>
								<p className="text-primary-gray/70 leading-relaxed">
									Pick up the tool, complete your project, and return it. Build
									trust in the community.
								</p>
								<div className="absolute -right-2 -top-2 size-12 bg-[radial-gradient(circle,rgba(254,239,76,0.3)_0%,transparent_70%)] rounded-full blur-xl" />
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="relative bg-gradient-to-b from-black/10 to-black/5 py-20 md:py-24 overflow-hidden border-t border-black/5">
				{/* Enhanced background patterns */}
				<div className="absolute left-[5%] top-[15%] size-[150px] bg-[radial-gradient(circle,#000_2px,transparent_2px)] bg-[length:20px_20px] opacity-10" />
				<div className="absolute right-[-15%] bottom-[10%] size-[400px] rounded-full bg-[radial-gradient(circle,rgba(254,239,76,0.2)_0%,transparent_70%)] blur-3xl" />
				<div className="absolute left-[10%] top-[40%] size-[200px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.3)_0%,transparent_60%)] blur-2xl" />
				<div className="absolute right-[25%] top-[20%] size-[80px] bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,rgba(0,0,0,0.02)_8px,rgba(0,0,0,0.02)_16px)] rotate-45" />

				<div className="container mx-auto px-5 relative z-10">
					<h2 className="mb-5 text-center text-4xl text-primary-gray font-bold md:text-5xl drop-shadow-sm">
						Why Choose Hippo Exchange?
					</h2>
					<p className="mx-auto max-w-2xl text-primary-gray/80 text-center text-lg leading-relaxed">
						Join thousands of neighbors sharing tools and equipment in a
						sustainable, cost-effective way.
					</p>

					<div className="mt-16 grid gap-10 md:grid-cols-3">
						<div className="group relative rounded-2xl border-2 border-black/10 bg-gradient-to-br from-white/80 to-white/60 p-8 text-center transition-all hover:-translate-y-2 hover:border-primary-yellow/30 hover:shadow-[0_20px_50px_rgb(0,0,0,0.15)] backdrop-blur-sm">
							<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
							<div className="relative">
								<div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-gray to-primary-gray/90 text-3xl shadow-lg ring-4 ring-white/50">
									💰
								</div>
								<h3 className="mb-2 text-xl font-bold text-primary-gray">
									Save Money
								</h3>
								<p className="text-primary-gray/70 leading-relaxed">
									Why buy expensive tools you'll rarely use? Borrow from
									neighbors and save hundreds of dollars.
								</p>
								<div className="absolute -left-2 -top-2 size-12 bg-[radial-gradient(circle,rgba(254,239,76,0.3)_0%,transparent_70%)] rounded-full blur-xl" />
							</div>
						</div>

						<div className="group relative rounded-2xl border-2 border-black/10 bg-gradient-to-br from-white/80 to-white/60 p-8 text-center transition-all hover:-translate-y-2 hover:border-primary-yellow/30 hover:shadow-[0_20px_50px_rgb(0,0,0,0.15)] backdrop-blur-sm">
							<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
							<div className="relative">
								<div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-gray to-primary-gray/90 text-3xl shadow-lg ring-4 ring-white/50">
									🤝
								</div>
								<h3 className="mb-2 text-xl font-bold text-primary-gray">
									Build Community
								</h3>
								<p className="text-primary-gray/70 leading-relaxed">
									Connect with your neighbors, share resources, and strengthen
									your local community bonds.
								</p>
								<div className="absolute -left-2 -top-2 size-12 bg-[radial-gradient(circle,rgba(254,239,76,0.3)_0%,transparent_70%)] rounded-full blur-xl" />
							</div>
						</div>

						<div className="group relative rounded-2xl border-2 border-black/10 bg-gradient-to-br from-white/80 to-white/60 p-8 text-center transition-all hover:-translate-y-2 hover:border-primary-yellow/30 hover:shadow-[0_20px_50px_rgb(0,0,0,0.15)] backdrop-blur-sm">
							<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
							<div className="relative">
								<div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-gray to-primary-gray/90 text-3xl shadow-lg ring-4 ring-white/50">
									🌍
								</div>
								<h3 className="mb-2 text-xl font-bold text-primary-gray">
									Go Green
								</h3>
								<p className="text-primary-gray/70 leading-relaxed">
									Reduce waste and environmental impact by sharing resources
									instead of buying new items.
								</p>
								<div className="absolute -left-2 -top-2 size-12 bg-[radial-gradient(circle,rgba(254,239,76,0.3)_0%,transparent_70%)] rounded-full blur-xl" />
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
