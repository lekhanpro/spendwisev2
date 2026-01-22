// components/AIChatbot.tsx
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
        { role: 'assistant', content: "Hi! I'm your SpendWise AI assistant!" }
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
        if (inputRef.current) setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;
        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);
        setMessages(prev => [...prev, { role: 'assistant', content: 'AI response here' }]);
        setIsLoading(false);
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
                    </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2d2d2d]">
                    <X className="w-4 h-4" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 bg-white dark:bg-[#1e1e1e]">
                {messages.map((msg, i) => (
                    <div key={i} className="flex gap-3">
                        {msg.role === 'assistant' && <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>}
                        <div className="flex-1">
                            <p className="text-[15px] text-gray-900 dark:text-[#e8e8e8]">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && <div className="flex gap-3"><Loader2 className="w-4 h-4 animate-spin" /><span>Thinking...</span></div>}
                <div ref={messagesEndRef} />
            </div>
            <div className="border-t p-4">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message SpendWise AI..."
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-[#2d2d2d] rounded-xl"
                />
            </div>
        </div>
    );
};

export default AIChatbot;
