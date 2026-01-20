// components/AIChatbot.tsx - AI Chatbot FAB with Groq integration for web
import React, { useState, useRef, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { MessageCircle, X, Send, Bot, Loader2, Icons } from './Icons';
import { getFinancialInsights, getQuickTip } from '../lib/ai';

// Get API key from environment variable
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export const AIChatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hi! I'm your SpendWise AI assistant. Ask me anything about your finances!" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    let context;
    let transactions: any[] = [];
    let budgets: any[] = [];
    let goals: any[] = [];
    let currency: any = { symbol: '$' };
    
    try {
        context = useContext(AppContext);
        if (context) {
            transactions = context.transactions || [];
            budgets = context.budgets || [];
            goals = context.goals || [];
            currency = context.currency || { symbol: '$' };
        }
    } catch (error) {
        console.warn('AIChatbot: Could not access AppContext', error);
    }

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Calculate financial context for AI
    const getFinancialContext = () => {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        const monthTransactions = transactions.filter((t: any) => t.date >= monthStart);

        const totalIncome = monthTransactions
            .filter((t: any) => t.type === 'income')
            .reduce((sum: number, t: any) => sum + t.amount, 0);
        const totalExpenses = monthTransactions
            .filter((t: any) => t.type === 'expense')
            .reduce((sum: number, t: any) => sum + t.amount, 0);

        const categorySpending: Record<string, number> = {};
        monthTransactions
            .filter((t: any) => t.type === 'expense')
            .forEach((t: any) => {
                categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
            });

        const symbol = currency?.symbol || '$';

        return `
User's Financial Data (Current Month):
- Total Income: ${symbol}${totalIncome.toFixed(2)}
- Total Expenses: ${symbol}${totalExpenses.toFixed(2)}
- Savings: ${symbol}${(totalIncome - totalExpenses).toFixed(2)}
- Savings Rate: ${totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0}%

Spending by Category:
${Object.entries(categorySpending).map(([cat, amt]) => `- ${cat}: ${symbol}${(amt as number).toFixed(2)}`).join('\n')}

Active Budgets: ${budgets.length}
Active Goals: ${goals.length}
    `;
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        // Check if API key is configured
        if (!GROQ_API_KEY) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '⚠️ AI Assistant is not configured. Please add VITE_GROQ_API_KEY to your environment variables. You can get a free API key from https://console.groq.com'
            }]);
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a helpful financial advisor assistant for the SpendWise app. 
Be concise and friendly. Provide specific advice based on the user's financial data.
${getFinancialContext()}`
                        },
                        ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
                        { role: 'user', content: userMessage }
                    ],
                    temperature: 0.7,
                    max_tokens: 500,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', response.status, errorText);
                let errorMessage = `API error: ${response.status}`;
                
                if (response.status === 401) {
                    errorMessage = 'Invalid API key. Please check your VITE_GROQ_API_KEY in your .env file.';
                } else if (response.status === 429) {
                    errorMessage = 'Rate limit exceeded. Please try again in a moment.';
                } else if (response.status >= 500) {
                    errorMessage = 'Server error. Please try again later.';
                }
                
                throw new Error(errorMessage);
            }

            const data = await response.json();
            const assistantMessage = data.choices?.[0]?.message?.content || "Sorry, I couldn't process your request.";

            if (!assistantMessage || assistantMessage.trim() === '') {
                throw new Error('Empty response from API');
            }

            setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
        } catch (error) {
            console.error('AI Chat error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `⚠️ ${errorMessage}\n\nPlease check:\n1. Your VITE_GROQ_API_KEY is set in .env file\n2. You have an active internet connection\n3. Your API key is valid at https://console.groq.com`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Enhanced AI FAB Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 dark:from-purple-500 dark:via-blue-500 dark:to-cyan-500 text-white shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transition-all duration-300 z-50 flex items-center justify-center group overflow-hidden"
                style={{ boxShadow: '0 8px 32px rgba(147, 51, 234, 0.5)' }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute inset-0 rounded-full animate-pulse bg-purple-400/30"></div>
                {isOpen ? (
                    <X className="w-7 h-7 relative z-10 transition-transform group-hover:rotate-90 duration-300" />
                ) : (
                    <MessageCircle className="w-7 h-7 relative z-10 transition-transform group-hover:scale-110 duration-300" />
                )}
                {!isOpen && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-zinc-900 animate-bounce"></div>
                )}
            </button>

            {/* Enhanced Chat Panel */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[550px] max-h-[calc(100vh-8rem)] bg-white dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-zinc-700/50 flex flex-col z-50 overflow-hidden backdrop-blur-xl animate-slide-up">
                    {/* Gradient Header */}
                    <div className="relative flex items-center justify-between p-5 border-b border-gray-200 dark:border-zinc-700/50 bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-cyan-900/20">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5"></div>
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500 flex items-center justify-center shadow-lg animate-pulse">
                                <Bot className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">AI Assistant</h3>
                                <p className="text-xs text-gray-600 dark:text-zinc-400 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    Online • Powered by Groq
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 relative z-10">
                            <button
                                onClick={async () => {
                                    if (isLoading) return;
                                    setIsLoading(true);
                                    try {
                                        const insights = await getFinancialInsights(transactions, budgets, goals, currency?.symbol || currency?.code || '$');
                                        const content = `Health Score: ${insights.healthScore}/100\n\nSummary: ${insights.summary}\n\nRecommendations:\n${insights.recommendations.map((r, i) => `${i+1}. ${r}`).join('\n')}\n\nInsights:\n${insights.insights.map((it: any, i: number) => `${i+1}. ${it.icon} ${it.title}: ${it.message}`).join('\n')}`;
                                        setMessages(prev => [...prev, { role: 'assistant', content }]);
                                    } catch (error) {
                                        console.error('Insights error', error);
                                        setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't fetch insights right now." }]);
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                                className="w-10 h-10 rounded-xl bg-white/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-700 flex items-center justify-center transition-all hover:scale-110 shadow-md backdrop-blur-sm"
                                title="Get AI Insights"
                            >
                                <Icons.TrendUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </button>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-10 h-10 rounded-xl bg-white/80 dark:bg-zinc-800/80 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center transition-all hover:scale-110 shadow-md backdrop-blur-sm group"
                            >
                                <X className="w-5 h-5 text-gray-600 dark:text-zinc-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
                            </button>
                        </div>
                    </div>

                    {/* Messages with gradient background */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-900/50">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                                style={{ animationDelay: `${i * 0.05}s` }}
                            >
                                <div
                                    className={`max-w-[85%] px-5 py-3 rounded-2xl transition-all hover:scale-[1.02] ${msg.role === 'user'
                                            ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-br-md shadow-lg shadow-blue-500/30'
                                            : 'bg-white dark:bg-gradient-to-br dark:from-zinc-800 dark:to-zinc-800/50 text-gray-900 dark:text-zinc-100 rounded-bl-md border border-gray-200 dark:border-zinc-700/50 shadow-lg backdrop-blur-sm'
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start animate-slide-up">
                                <div className="bg-white dark:bg-gradient-to-br dark:from-zinc-800 dark:to-zinc-800/50 text-gray-900 dark:text-zinc-100 px-5 py-4 rounded-2xl rounded-bl-md border border-gray-200 dark:border-zinc-700/50 shadow-lg backdrop-blur-sm">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin text-purple-600 dark:text-purple-400" />
                                        <span className="text-sm text-gray-600 dark:text-zinc-400">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Enhanced Input */}
                    <div className="p-4 border-t border-gray-200 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/80 backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask me anything about your finances..."
                                className="flex-1 bg-gray-100 dark:bg-zinc-800/80 text-gray-900 dark:text-white rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 border border-gray-200 dark:border-zinc-700/50 placeholder-gray-500 dark:placeholder-zinc-500 transition-all backdrop-blur-sm shadow-inner"
                                maxLength={500}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || isLoading}
                                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110 active:scale-95 shadow-lg shadow-purple-500/30 group"
                            >
                                <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-zinc-500 mt-2 text-center">
                            AI can make mistakes. Verify important information.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIChatbot;
