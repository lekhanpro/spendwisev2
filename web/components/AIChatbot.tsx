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
            {/* FAB Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:scale-105 transition-all z-50 flex items-center justify-center"
                style={{ boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)' }}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-8rem)] bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 flex flex-col z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">AI Assistant</h3>
                                <p className="text-xs text-zinc-500">Powered by Groq</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
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
                                className="w-8 h-8 rounded-full hover:bg-zinc-800 flex items-center justify-center transition-colors"
                                title="Get AI Insights"
                            >
                                <Icons.TrendUp />
                            </button>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-full hover:bg-zinc-800 flex items-center justify-center transition-colors"
                            >
                                <X className="w-4 h-4 text-zinc-400" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-md'
                                            : 'bg-zinc-800 text-zinc-100 rounded-bl-md border border-zinc-700'
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-zinc-800 text-zinc-100 px-4 py-3 rounded-2xl rounded-bl-md border border-zinc-700">
                                    <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-zinc-800 bg-zinc-900/80">
                        <div className="flex items-center gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about your finances..."
                                className="flex-1 bg-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-zinc-700 placeholder-zinc-500"
                                maxLength={500}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || isLoading}
                                className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIChatbot;
