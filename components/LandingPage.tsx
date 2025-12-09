
import React from 'react';
import { Icons } from './Icons';

export const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 p-0.5">
                            <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                                <span className="text-xl">💰</span>
                            </div>
                        </div>
                        <span className="text-xl font-bold tracking-tight">SpendWise</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#about" className="hover:text-white transition-colors">About</a>
                        <a href="https://github.com/lekhanpro/spendwise" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
                    </div>
                    <a
                        href="https://spendwisev2.vercel.app"
                        className="px-5 py-2.5 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors text-sm"
                    >
                        Launch App
                    </a>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] -z-10" />

                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-blue-400 mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        v1.0.1 is now live
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                        Master your money <br /> with SpendWise.
                    </h1>

                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        A comprehensive personal finance tracker built for the modern web.
                        Track expenses, set budgets, and achieve your financial goals with a beautiful, glass-morphism interface.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="https://spendwisev2.vercel.app"
                            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-semibold transition-all hover:scale-105 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                        >
                            <Icons.Layout /> Open Web App
                        </a>
                        <a
                            href="https://github.com/lekhanpro/spendwise"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-semibold transition-all flex items-center justify-center gap-2"
                        >
                            <Icons.Github /> View Source
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 px-6 relative">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: <Icons.Chart />,
                                title: "Smart Analytics",
                                desc: "Visualize your spending patterns with interactive charts and detailed reports."
                            },
                            {
                                icon: <Icons.Budget />,
                                title: "Budget Tracking",
                                desc: "Set monthly limits for categories and get notified when you're close to overspending."
                            },
                            {
                                icon: <Icons.Target />,
                                title: "Goal Setting",
                                desc: "Create savings goals and track your progress with visual milestones."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-colors group">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Preview Section */}
            <section className="py-24 px-6 border-t border-white/5 bg-zinc-900/30">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-8">
                        <h2 className="text-4xl font-bold">Designed for clarity.</h2>
                        <div className="space-y-6">
                            {[
                                "Dark mode by default",
                                "Real-time data sync",
                                "Secure authentication",
                                "Mobile responsive design"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-sm">✓</div>
                                    <span className="text-lg text-gray-300">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 relative">
                        <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full" />
                        <div className="relative bg-black border border-zinc-800 rounded-3xl p-6 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                            {/* Mock UI Card */}
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <div className="text-sm text-gray-400">Total Balance</div>
                                    <div className="text-3xl font-bold">$12,450.00</div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-zinc-800" />
                            </div>
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-zinc-800" />
                                            <div className="w-24 h-4 rounded bg-zinc-800" />
                                        </div>
                                        <div className="w-16 h-4 rounded bg-zinc-800" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-white/5 text-center text-gray-500 text-sm">
                <p>© 2024 SpendWise. Open source project by Lekhan HR.</p>
                <div className="flex justify-center gap-6 mt-4">
                    <a href="#" className="hover:text-white transition-colors">Privacy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms</a>
                    <a href="https://github.com/lekhanpro/spendwise" className="hover:text-white transition-colors">GitHub</a>
                </div>
            </footer>
        </div>
    );
};
