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
                content: 'ΓÜá∩╕Å AI Assistant is not configured. Please add VITE_GROQ_API_KEY to your environment variables. You can get a free API key from https://console.groq.com'
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
                content: `ΓÜá∩╕Å ${errorMessage}\n\nPlease check:\n1. Your VITE_GROQ_API_KEY is set in .env file\n2. You have an active internet connection\n3. Your API key is valid at https://console.groq.com`
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
            {/* Premium AI FAB Button - Claude Style - Positioned Left and Higher */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-24 left-6 w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 dark:from-amber-600 dark:via-orange-600 dark:to-amber-700 text-white shadow-2xl hover:shadow-amber-500/50 hover:scale-105 transition-all duration-300 z-50 flex items-center justify-center group"
                style={{ boxShadow: '0 10px 40px rgba(245, 158, 11, 0.4)' }}
            >
                {isOpen ? (
                    <X className="w-6 h-6 transition-transform group-hover:rotate-90 duration-300" />
                ) : (
                    <MessageCircle className="w-6 h-6 transition-transform group-hover:scale-110 duration-300" />
                )}
            </button>

            {/* Premium Chat Panel - Claude Style */}
            {isOpen && (
                <div className="fixed bottom-[6.5rem] left-6 w-[420px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-10rem)] bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#2d2d2d] flex flex-col z-50 overflow-hidden">
                    {/* Minimal Header - Claude Style */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-[#2d2d2d]">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-[#e8e8e8] text-base">SpendWise AI</h3>
                                <p className="text-xs text-gray-500 dark:text-[#8e8e8e]">Financial Assistant</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
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
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2d2d2d] transition-colors"
                                title="Get AI Insights"
                            >
                                <Icons.TrendUp className="w-4 h-4 text-gray-600 dark:text-[#8e8e8e]" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2d2d2d] transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-600 dark:text-[#8e8e8e]" />
                            </button>
                        </div>
                    </div>

                    {/* Messages - Claude Style */}
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 bg-white dark:bg-[#1e1e1e]">
                        {messages.map((msg, i) => (
                            <div key={i} className="flex gap-3 group">
                                {msg.role === 'assistant' && (
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                )}
                                <div className={`flex-1 ${msg.role === 'user' ? 'ml-10' : ''}`}>
                                    <div className={`${msg.role === 'user' 
                                        ? 'bg-gray-100 dark:bg-[#2d2d2d] rounded-2xl px-4 py-3' 
                                        : ''
                                    }`}>
                                        <p className="text-[15px] leading-relaxed text-gray-900 dark:text-[#e8e8e8] whitespace-pre-wrap">
                                            {msg.content}
                                        </p>
                                    </div>
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-white text-sm font-medium">You</span>
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-[#8e8e8e]">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input - Claude Style */}
                    <div className="border-t border-gray-200 dark:border-[#2d2d2d] p-4 bg-white dark:bg-[#1e1e1e]">
                        <div className="flex items-end gap-2">
                            <div className="flex-1 relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Message SpendWise AI..."
                                    className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-[#2d2d2d] text-gray-900 dark:text-[#e8e8e8] rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 border-0 placeholder-gray-500 dark:placeholder-[#6e6e6e] resize-none"
                                    maxLength={500}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-2 bottom-2 p-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <p className="text-[11px] text-gray-400 dark:text-[#6e6e6e] mt-2 text-center">
                            AI can make mistakes. Check important info.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIChatbot;
