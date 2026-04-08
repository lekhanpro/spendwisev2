// components/AIChatbot.tsx - AI Chatbot Modal for web
import React, { useState, useRef, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { X, Send, Bot, Loader2, Icons } from './Icons';
import { getFinancialInsights, AIError } from '../lib/ai';

// NOTE: The VITE_GROQ_API_KEY is a client-side fallback for local dev.
// For production security, create web/api/chat.ts as a Vercel serverless
// function (see .env.example) and set GROQ_API_KEY (no VITE_ prefix).
const HAS_CLIENT_KEY = !!(import.meta as any).env?.VITE_GROQ_API_KEY;

interface Message {
    role: 'user' | 'assistant';
    content: string;
    isError?: boolean;
}

interface AIChatbotProps {
  onClose?: () => void;
}

function errToMessage(err: unknown): string {
    if (err instanceof AIError) return err.message;
    if (err instanceof Error) return err.message;
    return 'Something went wrong. Please try again.';
}

export const AIChatbot: React.FC<AIChatbotProps> = ({ onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hi! I'm your SpendWise AI assistant. Ask me anything about your finances!" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [lastUserMessage, setLastUserMessage] = useState('');
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

    const doSendMessage = async (userMessage: string) => {
        setIsLoading(true);
        setLastUserMessage(userMessage);
        // Remove previous error message if retrying
        setMessages(prev => {
            const last = prev[prev.length - 1];
            return last?.isError ? prev.slice(0, -1) : prev;
        });

        const SYSTEM_PROMPT = `You are a helpful financial advisor assistant for the SpendWise app. Be concise, friendly, and actionable.\n${getFinancialContext()}`;

        // Use fetch via the callAI internal logic — here we call the server proxy or Groq
        // through lib/ai's logic. We do a simpler direct call here for chat (not JSON-only).
        const SERVER_PROXY_URL = '/api/chat';
        const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
        const GROQ_API_KEY_VAL = (import.meta as any).env?.VITE_GROQ_API_KEY || '';
        const TIMEOUT_MS = 20000;

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

        try {
            const chatMessages = [
                ...messages.filter(m => !m.isError).slice(-10).map(m => ({ role: m.role, content: m.content })),
                { role: 'user', content: userMessage }
            ];

            // Try server proxy first
            let assistantMessage = '';
            let triedProxy = false;
            try {
                const probeRes = await fetch(SERVER_PROXY_URL, { method: 'HEAD', signal: controller.signal }).catch(() => null);
                if (probeRes && probeRes.status !== 404) {
                    triedProxy = true;
                    const proxyRes = await fetch(SERVER_PROXY_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ messages: chatMessages, systemPrompt: SYSTEM_PROMPT }),
                        signal: controller.signal,
                    });
                    if (proxyRes.ok) {
                        const data = await proxyRes.json();
                        assistantMessage = data?.content || '';
                    } else if (proxyRes.status === 429) {
                        throw new AIError('rate_limit', 'Rate limit reached. Please wait a moment and try again.');
                    } else if (proxyRes.status === 503) {
                        throw new AIError('not_configured', 'AI assistant is not configured on this server. See deployment docs.');
                    }
                }
            } catch (err) {
                if (err instanceof AIError) throw err;
            }

            // Fall back to direct Groq call
            if (!assistantMessage && !triedProxy) {
                if (!GROQ_API_KEY_VAL) {
                    throw new AIError('not_configured', 'AI assistant is not configured. Add GROQ_API_KEY (or VITE_GROQ_API_KEY for local dev) to your environment. See .env.example.');
                }
                const groqRes = await fetch(GROQ_API_URL, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${GROQ_API_KEY_VAL}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...chatMessages],
                        temperature: 0.7,
                        max_tokens: 500,
                    }),
                    signal: controller.signal,
                });
                if (!groqRes.ok) {
                    if (groqRes.status === 401) throw new AIError('auth', 'Invalid Groq API key. Check VITE_GROQ_API_KEY in .env.local.');
                    if (groqRes.status === 429) throw new AIError('rate_limit', 'Rate limit reached. Please wait a moment and try again.');
                    throw new AIError('upstream', `AI service error (${groqRes.status}). Try again.`);
                }
                const data = await groqRes.json();
                assistantMessage = data.choices?.[0]?.message?.content || '';
            }

            if (!assistantMessage) throw new AIError('empty', 'AI returned an empty response. Try again.');
            setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
        } catch (err: unknown) {
            const errMsg = errToMessage(err);
            const isAbort = err instanceof Error && err.name === 'AbortError';
            const finalMsg = isAbort ? 'Request timed out. Please try a shorter message.' : errMsg;
            setMessages(prev => [...prev, { role: 'assistant', content: finalMsg, isError: true }]);
        } finally {
            clearTimeout(timer);
            setIsLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;
        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        await doSendMessage(userMessage);
    };

    const retryLastMessage = async () => {
        if (!lastUserMessage || isLoading) return;
        await doSendMessage(lastUserMessage);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const lastMsg = messages[messages.length - 1];
    const showRetry = lastMsg?.isError && !isLoading;

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-[#2d2d2d]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-[#e8e8e8] text-base">SpendWise AI</h3>
                        <p className="text-xs text-gray-500 dark:text-[#8e8e8e]">
                            {HAS_CLIENT_KEY ? 'Financial Assistant' : 'Requires API Key'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={async () => {
                            if (isLoading) return;
                            setIsLoading(true);
                            try {
                                const insights = await getFinancialInsights(transactions, budgets, goals, currency?.symbol || '$');
                                const content = `📊 Health Score: ${insights.healthScore}/100\n\n${insights.summary}\n\n💡 Recommendations:\n${insights.recommendations.map((r, i) => `${i+1}. ${r}`).join('\n')}`;
                                setMessages(prev => [...prev, { role: 'assistant', content }]);
                            } catch (error) {
                                const msg = errToMessage(error);
                                setMessages(prev => [...prev, { role: 'assistant', content: msg, isError: true }]);
                            } finally {
                                setIsLoading(false);
                            }
                        }}
                        disabled={isLoading}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2d2d2d] transition-colors disabled:opacity-40"
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
                {!HAS_CLIENT_KEY && (
                    <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-4 py-3 border border-amber-200 dark:border-amber-800">
                        ⚠️ <strong>AI not configured.</strong> Add <code>VITE_GROQ_API_KEY</code> to <code>.env.local</code> or set <code>GROQ_API_KEY</code> in your Vercel environment. See <code>.env.example</code>.
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className="flex gap-3 group">
                        {msg.role === 'assistant' && (
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                        )}
                        <div className={`flex-1 ${msg.role === 'user' ? 'ml-10' : ''}`}>
                            <div className={
                                msg.isError
                                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-3'
                                    : msg.role === 'user'
                                        ? 'bg-gray-100 dark:bg-[#2d2d2d] rounded-2xl px-4 py-3'
                                        : ''
                            }>
                                {msg.isError && <span className="text-red-500 font-medium text-xs block mb-1">⚠️ Error</span>}
                                <p className={`text-[15px] leading-relaxed whitespace-pre-wrap ${msg.isError ? 'text-red-700 dark:text-red-300' : 'text-gray-900 dark:text-[#e8e8e8]'}`}>{msg.content}</p>
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
                                <span className="text-sm">Thinking…</span>
                            </div>
                        </div>
                    </div>
                )}
                {showRetry && (
                    <div className="flex justify-center">
                        <button
                            onClick={retryLastMessage}
                            className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                        >
                            ↻ Retry
                        </button>
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
                            placeholder="Message SpendWise AI…"
                            disabled={isLoading}
                            className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-[#2d2d2d] text-gray-900 dark:text-[#e8e8e8] rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 border-0 placeholder-gray-500 dark:placeholder-[#6e6e6e] disabled:opacity-60"
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
                    AI can make mistakes. Verify important financial info.
                </p>
            </div>
        </div>
    );
};

export default AIChatbot;

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
