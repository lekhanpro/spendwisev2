// components/AIChatbot.tsx - AI Chatbot Modal for web
import React, { useState, useRef, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { X, Send, Bot, Loader2, Icons } from './Icons';
import { getFinancialInsights } from '../lib/ai';

const GROQ_API_KEY = (import.meta as any).env?.VITE_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface AIChatbotProps {
  onClose?: () => void;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({ onClose }) => {
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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, []);

    const getFinancialContext = () => {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        const monthTransactions = transactions.filter((t: any) => t.date >= monthStart);
        const totalIncome = monthTransactions.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + t.amount, 0);
        const totalExpenses = monthTransactions.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + t.amount, 0);
        const categorySpending: Record<string, number> = {};
        monthTransactions.filter((t: any) => t.type === 'expense').forEach((t: any) => {
            categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
        });
        const symbol = currency?.symbol || '$';
        return `User's Financial Data (Current Month):
- Total Income: ${symbol}${totalIncome.toFixed(2)}
- Total Expenses: ${symbol}${totalExpenses.toFixed(2)}
- Savings: ${symbol}${(totalIncome - totalExpenses).toFixed(2)}
- Savings Rate: ${totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0}%
Spending by Category:
${Object.entries(categorySpending).map(([cat, amt]) => `- ${cat}: ${symbol}${(amt as number).toFixed(2)}`).join('\n')}
Active Budgets: ${budgets.length}
Active Goals: ${goals.length}`;
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;
        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);
        if (!GROQ_API_KEY) {
            setMessages(prev => [...prev, { role: 'assistant', content: ' AI Assistant is not configured. Please add VITE_GROQ_API_KEY to your environment variables.' }]);
            setIsLoading(false);
            return;
        }
        try {
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: `You are a helpful financial advisor assistant for the SpendWise app. Be concise and friendly.\n${getFinancialContext()}` },
                        ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
                        { role: 'user', content: userMessage }
                    ],
                    temperature: 0.7,
                    max_tokens: 500,
                }),
            });
            if (!response.ok) throw new Error(`API error: ${response.status}`);
            const data = await response.json();
            const assistantMessage = data.choices?.[0]?.message?.content || "Sorry, I couldn't process your request.";
            setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: ` Error: ${error instanceof Error ? error.message : 'Unknown error'}` }]);
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
        <div className="flex flex-col h-full">
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
                                const insights = await getFinancialInsights(transactions, budgets, goals, currency?.symbol || '$');
                                const content = `Health Score: ${insights.healthScore}/100\n\nSummary: ${insights.summary}\n\nRecommendations:\n${insights.recommendations.map((r, i) => `${i+1}. ${r}`).join('\n')}`;
                                setMessages(prev => [...prev, { role: 'assistant', content }]);
                            } catch (error) {
                                setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't fetch insights right now." }]);
                            } finally {
                                setIsLoading(false);
                            }
                        }}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2d2d2d] transition-colors"
                        title="Get AI Insights"
                    >
                        <Icons.TrendUp />
                    </button>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2d2d2d] transition-colors">
                        <X className="w-4 h-4 text-gray-600 dark:text-[#8e8e8e]" />
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 bg-white dark:bg-[#1e1e1e]">
                {messages.map((msg, i) => (
                    <div key={i} className="flex gap-3 group">
                        {msg.role === 'assistant' && (
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                        )}
                        <div className={`flex-1 ${msg.role === 'user' ? 'ml-10' : ''}`}>
                            <div className={msg.role === 'user' ? 'bg-gray-100 dark:bg-[#2d2d2d] rounded-2xl px-4 py-3' : ''}>
                                <p className="text-[15px] leading-relaxed text-gray-900 dark:text-[#e8e8e8] whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                        {msg.role === 'user' && (
                            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-xs font-medium">You</span>
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
                            className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-[#2d2d2d] text-gray-900 dark:text-[#e8e8e8] rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 border-0 placeholder-gray-500 dark:placeholder-[#6e6e6e]"
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
    );
};

export default AIChatbot;
