
import React from 'react';
import { Icons } from './Icons';

export const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 font-sans">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20">
                            <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                                <span className="text-xl">💰</span>
                            </div>
                        </div>
                        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">SpendWise</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#about" className="hover:text-white transition-colors">About</a>
                        <a href="https://github.com/lekhanpro/spendwisev2" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
                    </div>
                    <a
                        href="https://spendwisev2.vercel.app"
                        className="px-6 py-2.5 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    >
                        Launch App
                    </a>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-screen flex items-center">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -z-10 animate-pulse" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] -z-10" />

                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Column: Text */}
                </h1>

                <p className="text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                    Experience the future of personal finance. Track expenses, set smart budgets, and achieve your goals with our beautiful, glass-morphic interface.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                    <a
                        href="https://spendwisev2.vercel.app"
                        className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-2xl font-bold transition-all hover:scale-105 shadow-[0_10px_40px_-10px_rgba(37,99,235,0.5)] flex items-center justify-center gap-2"
                    >
                        <Icons.Layout /> Open Web App
                    </a>
                    <a
                        href="https://github.com/lekhanpro/spendwisev2"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
                    >
                        <Icons.Github /> View Source
                    </a>
                </div>

                <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-gray-500 text-sm">
                    <div className="flex items-center gap-2">
                        <Icons.Check /> Free Forever
                    </div>
                    <div className="flex items-center gap-2">
                        <Icons.Check /> No Credit Card
                    </div>
                    <div className="flex items-center gap-2">
                        <Icons.Check /> Open Source
                    </div>
                </div>
        </div>

                    {/* Right Column: Phone Mockup */ }
    <div className="relative lg:h-[800px] flex items-center justify-center perspective-1000">
        <div className="relative w-[320px] md:w-[380px] aspect-[9/19] bg-black rounded-[3rem] border-8 border-zinc-800 shadow-2xl transform rotate-y-12 rotate-z-6 hover:rotate-0 transition-all duration-700 ease-out overflow-hidden z-10">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-zinc-800 rounded-b-2xl z-20" />

            {/* Screen Content */}
            <div className="w-full h-full bg-zinc-900 overflow-hidden relative">
                {/* App Header */}
                <div className="pt-10 pb-4 px-6 flex justify-between items-center bg-zinc-900/90 backdrop-blur-md z-10 relative">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <span className="text-sm">💰</span>
                        </div>
                        <span className="font-bold">SpendWise</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-zinc-800" />
                </div>

                {/* App Body Mockup */}
                <div className="p-4 space-y-4">
                    {/* Balance Card */}
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg">
                        <div className="text-blue-100 text-sm mb-1">Total Balance</div>
                        <div className="text-3xl font-bold">$12,450.00</div>
                        <div className="mt-4 flex gap-2">
                            <div className="h-1 flex-1 bg-white/20 rounded-full" />
                            <div className="h-1 w-12 bg-white rounded-full" />
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700/50">
                            <div className="text-green-400 text-sm mb-1">Income</div>
                            <div className="text-lg font-bold">+$4,200</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700/50">
                            <div className="text-red-400 text-sm mb-1">Expenses</div>
                            <div className="text-lg font-bold">-$1,850</div>
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="space-y-3 pt-2">
                        <div className="text-sm text-gray-400 font-medium px-1">Recent Activity</div>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-zinc-800/30 border border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${i === 1 ? 'bg-orange-500/20 text-orange-400' : i === 2 ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>
                                        {i === 1 ? <Icons.Chart /> : i === 2 ? <Icons.Target /> : <Icons.Budget />}
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">{i === 1 ? 'Grocery' : i === 2 ? 'Netflix' : 'Salary'}</div>
                                        <div className="text-xs text-gray-500">Today, 10:23 AM</div>
                                    </div>
                                </div>
                                <div className={`font-bold text-sm ${i === 3 ? 'text-green-400' : 'text-white'}`}>
                                    {i === 3 ? '+' : '-'}${i === 1 ? '120.50' : i === 2 ? '14.99' : '3,500'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Nav Mockup */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-zinc-900/90 backdrop-blur-md border-t border-zinc-800 flex justify-around items-center px-6 pb-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`w-6 h-6 rounded-full ${i === 1 ? 'bg-blue-500' : 'bg-zinc-700'}`} />
                    ))}
                </div>
            </div>
        </div>

        {/* Decorative Elements behind phone */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[500px] bg-blue-500/30 rounded-full blur-[80px] -z-10" />
    </div>
                </div >
            </section >

    {/* Features Grid */ }
    < section id = "features" className = "py-32 px-6 relative bg-zinc-900/30" >
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything you need.</h2>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg">Powerful features to help you take control of your financial future.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {[
                    {
                        icon: <Icons.Chart />,
                        title: "Smart Analytics",
                        desc: "Visualize your spending patterns with interactive charts and detailed reports.",
                        color: "blue"
                    },
                    {
                        icon: <Icons.Budget />,
                        title: "Budget Tracking",
                        desc: "Set monthly limits for categories and get notified when you're close to overspending.",
                        color: "purple"
                    },
                    {
                        icon: <Icons.Target />,
                        title: "Goal Setting",
                        desc: "Create savings goals and track your progress with visual milestones.",
                        color: "green"
                    }
                ].map((feature, i) => (
                    <div key={i} className="p-8 rounded-[2rem] bg-black border border-zinc-800 hover:border-zinc-700 transition-all hover:-translate-y-2 duration-300 group">
                        <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-500/10 flex items-center justify-center text-${feature.color}-400 mb-6 group-hover:scale-110 transition-transform`}>
                            {feature.icon}
                        </div>
                        <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                        <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
            </section >

    {/* Footer */ }
    < footer className = "py-12 px-6 border-t border-white/5 text-center text-gray-500 text-sm bg-black" >
                <p>© 2024 SpendWise. Open source project by Lekhan HR.</p>
                <div className="flex justify-center gap-6 mt-6">
                    <a href="#" className="hover:text-white transition-colors">Privacy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms</a>
                    <a href="https://github.com/lekhanpro/spendwisev2" className="hover:text-white transition-colors">GitHub</a>
                </div>
            </footer >
        </div >
    );
};
