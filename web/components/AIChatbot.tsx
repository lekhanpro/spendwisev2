// components/AIChatbot.tsx - AI Chatbot with Scorecard & Investment tabs
import React, { useState, useRef, useEffect, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { X, Send, Bot, Loader2 } from './Icons';
import {
  computeFinancialScorecard,
  getInvestmentSuggestions,
  FinancialScorecard,
  InvestmentSuggestion,
} from '../lib/ai';

// AI requests are proxied through /api/chat (Vercel edge function) — key never in browser bundle.
const CHAT_ENDPOINT = '/api/chat';

/** User-friendly messages for each server error code */
const ERROR_MESSAGES: Record<string, string> = {
  NO_KEY: "The AI service isn't configured yet. Ask the site admin to add the GROQ_API_KEY environment variable in Vercel.",
  AUTH_ERROR: "AI authentication failed on the server. The API key may have expired.",
  RATE_LIMIT: "You've hit the AI rate limit. Please wait a moment and try again.",
  TIMEOUT: "The AI took too long to respond. Please try again.",
  MALFORMED: "The AI returned an unexpected response. Please try again.",
  EMPTY_REPLY: "The AI returned an empty response. Please try again.",
  API_ERROR: "The AI service returned an error. Please try again shortly.",
  INTERNAL: "An internal server error occurred. Please try again.",
  NETWORK: "Could not reach the AI service. Check your internet connection.",
};

type Tab = 'chat' | 'scorecard' | 'invest';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatbotProps {
  onClose?: () => void;
}

const QUICK_CHIPS = [
  'How are my finances?',
  'Am I overspending?',
  'Tips to save more',
  'Budget recommendations',
  'Goal progress summary',
];

const typeLabels: Record<string, string> = {
  stock: 'Stock', mutual_fund: 'Fund', etf: 'ETF',
  fixed_income: 'Fixed', savings_scheme: 'Scheme', crypto: 'Crypto',
};

const riskClass: Record<string, string> = {
  low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const gradeColor: Record<string, string> = {
  A: 'text-emerald-500', B: 'text-blue-500', C: 'text-yellow-500', D: 'text-orange-500', F: 'text-red-500',
};

function renderMarkdown(text: string): React.ReactNode {
  return text.split('\n').map((line, i) => {
    const bold = line.replace(/\*\*(.*?)\*\*/g, (_, m) => `<b>${m}</b>`);
    return <p key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: bold || '&nbsp;' }} />;
  });
}

export const AIChatbot: React.FC<AIChatbotProps> = ({ onClose }) => {
  const ctx = useContext(AppContext);
  const transactions = ctx?.transactions || [];
  const budgets = ctx?.budgets || [];
  const goals = ctx?.goals || [];
  const currency = ctx?.currency || { symbol: '$', code: 'USD' };
  const formatCurrency = ctx?.formatCurrency || ((n: number) => `$${n.toFixed(2)}`);

  const [tab, setTab] = useState<Tab>('chat');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm SpendWise AI. Ask me anything about your finances, or check your Scorecard and Invest tabs above!" },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scorecard tab state
  const [scorecard, setScorecard] = useState<FinancialScorecard | null>(null);

  // Invest tab state
  const [suggestions, setSuggestions] = useState<InvestmentSuggestion[] | null>(null);
  const [investLoading, setInvestLoading] = useState(false);
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (tab === 'chat') setTimeout(() => inputRef.current?.focus(), 100);
    if (tab === 'scorecard' && !scorecard) {
      setScorecard(computeFinancialScorecard(transactions, budgets, goals));
    }
    if (tab === 'invest' && !suggestions) {
      setInvestLoading(true);
      getInvestmentSuggestions(transactions, goals, currency.code || 'USD', currency.symbol || '$')
        .then(setSuggestions)
        .finally(() => setInvestLoading(false));
    }
  }, [tab]);

  const buildContext = () => {
    const now = new Date();
    const ms = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const mtx = transactions.filter(t => t.date >= ms);
    const income = mtx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = mtx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const cats: Record<string, number> = {};
    mtx.filter(t => t.type === 'expense').forEach(t => { cats[t.category] = (cats[t.category] || 0) + t.amount; });
    const sym = currency.symbol;
    return `Financial context (this month): Income ${sym}${income.toFixed(0)}, Expenses ${sym}${expenses.toFixed(0)}, Savings ${sym}${(income - expenses).toFixed(0)}, Rate ${income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0}%. Categories: ${Object.entries(cats).map(([c, a]) => `${c}:${sym}${(a as number).toFixed(0)}`).join(', ')}. Budgets: ${budgets.length}, Goals: ${goals.length}.`;
  };

  const sendMessage = async (text?: string) => {
    const userMessage = (text || input).trim();
    if (!userMessage || isLoading) return;
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30_000);

      const res = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages
            .filter(m => m.role === 'user' || m.role === 'assistant')
            .slice(-8)
            .map(m => ({ role: m.role, content: m.content })),
          context: buildContext(),
        }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      let data: { reply?: string; error?: string; code?: string; retryAfter?: number };
      try {
        data = await res.json();
      } catch {
        throw new Error('MALFORMED');
      }

      if (!res.ok) {
        const code = data.code ?? 'API_ERROR';
        const msg = ERROR_MESSAGES[code] ?? data.error ?? `AI error (${res.status})`;
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${msg}` }]);
        return;
      }

      if (!data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${ERROR_MESSAGES.EMPTY_REPLY}` }]);
        return;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply! }]);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${ERROR_MESSAGES.TIMEOUT}` }]);
      } else if (err instanceof TypeError) {
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${ERROR_MESSAGES.NETWORK}` }]);
      } else {
        const code = err instanceof Error ? err.message : 'INTERNAL';
        const msg = ERROR_MESSAGES[code] ?? ERROR_MESSAGES.INTERNAL;
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${msg}` }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSuggestions = useMemo(() =>
    (suggestions || []).filter(s => riskFilter === 'all' || s.risk === riskFilter),
    [suggestions, riskFilter]
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e1e1e]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#2d2d2d]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-[#e8e8e8] text-sm">SpendWise AI</h3>
            <p className="text-[11px] text-gray-500 dark:text-[#8e8e8e]">Financial Assistant</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2d2d2d] transition-colors">
          <X className="w-4 h-4 text-gray-500 dark:text-[#8e8e8e]" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-[#2d2d2d]">
        {(['chat', 'scorecard', 'invest'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-semibold capitalize transition-colors ${tab === t ? 'border-b-2 border-amber-500 text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
            {t === 'chat' ? '💬 Chat' : t === 'scorecard' ? '📊 Scorecard' : '💼 Invest'}
          </button>
        ))}
      </div>

      {/* ── CHAT TAB ── */}
      {tab === 'chat' && (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {/* Quick chips */}
            <div className="flex gap-1.5 flex-wrap pb-1">
              {QUICK_CHIPS.map(chip => (
                <button key={chip} onClick={() => sendMessage(chip)}
                  className="px-2.5 py-1 text-[11px] bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-700/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors">
                  {chip}
                </button>
              ))}
            </div>
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-[#2d2d2d] text-gray-900 dark:text-[#e8e8e8]'}`}>
                  {renderMarkdown(msg.content)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 items-center text-gray-400 dark:text-[#8e8e8e]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs">Thinking…</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t border-gray-200 dark:border-[#2d2d2d] p-3">
            <div className="flex gap-2">
              <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Ask about your finances…"
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-[#2d2d2d] text-gray-900 dark:text-[#e8e8e8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-gray-400 dark:placeholder-[#6e6e6e]"
                maxLength={500} />
              <button onClick={() => sendMessage()} disabled={!input.trim() || isLoading}
                className="p-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-40 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-[#6e6e6e] mt-1.5 text-center">AI can make mistakes. Verify important info.</p>
          </div>
        </>
      )}

      {/* ── SCORECARD TAB ── */}
      {tab === 'scorecard' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {scorecard ? (
            <>
              <div className="text-center">
                <div className={`text-5xl font-bold ${gradeColor[scorecard.grade]}`}>{scorecard.grade}</div>
                <div className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{scorecard.overall}/100</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{scorecard.summary}</p>
              </div>
              <div className="space-y-3">
                {scorecard.components.map(comp => (
                  <div key={comp.label} className="bg-gray-50 dark:bg-zinc-900/50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{comp.label}</span>
                      <span className={`text-sm font-bold ${gradeColor[comp.grade]}`}>{comp.grade} ({comp.score})</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all"
                        style={{ width: `${comp.score}%` }} />
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{comp.detail}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setScorecard(computeFinancialScorecard(transactions, budgets, goals))}
                className="w-full py-2 text-xs text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                Refresh Scorecard
              </button>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* ── INVEST TAB ── */}
      {tab === 'invest' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {/* Risk filter */}
          <div className="flex gap-1.5">
            {(['all', 'low', 'medium', 'high'] as const).map(r => (
              <button key={r} onClick={() => setRiskFilter(r)}
                className={`px-3 py-1 text-xs rounded-full capitalize transition-colors ${riskFilter === r ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300'}`}>
                {r}
              </button>
            ))}
            <button onClick={() => { setSuggestions(null); setInvestLoading(true); getInvestmentSuggestions(transactions, goals, currency.code || 'USD', currency.symbol || '$').then(setSuggestions).finally(() => setInvestLoading(false)); }}
              className="ml-auto px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
              ↻ Refresh
            </button>
          </div>

          {investLoading ? (
            <div className="flex items-center justify-center h-32 text-gray-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Finding suggestions…</span>
            </div>
          ) : filteredSuggestions.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">No suggestions for this filter.</p>
          ) : (
            filteredSuggestions.map(s => (
              <div key={s.name} className="bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <button onClick={() => setExpanded(expanded === s.name ? null : s.name)}
                  className="w-full flex items-center gap-3 p-3 text-left">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{s.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${riskClass[s.risk]}`}>{s.risk}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">{typeLabels[s.type] || s.type}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {s.expectedReturn} · Min {formatCurrency(s.minAmount)}
                    </p>
                  </div>
                  <span className="text-gray-400 text-xs">{expanded === s.name ? '▲' : '▼'}</span>
                </button>
                {expanded === s.name && (
                  <div className="px-3 pb-3 border-t border-gray-200 dark:border-zinc-700 pt-2">
                    <p className="text-xs text-gray-600 dark:text-gray-300">{s.description}</p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {s.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 text-[10px] bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          <p className="text-[10px] text-gray-400 text-center pb-2">Not financial advice. Consult a professional before investing.</p>
        </div>
      )}
    </div>
  );
};

export default AIChatbot;
