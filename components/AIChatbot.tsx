// components/AIChatbot.tsx - AI Chatbot FAB with Groq integration
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useApp } from '../context/AppContext';
import { Colors } from '../constants/app';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export const AIChatbot: React.FC = () => {
    const [visible, setVisible] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hi! I\'m your SpendWise AI assistant. Ask me anything about your finances!' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const { transactions, budgets, goals, formatCurrency, currency } = useApp();
    const theme = Colors.dark;

    // Calculate financial context
    const getFinancialContext = () => {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        const monthTransactions = transactions.filter(t => t.date >= monthStart);

        const totalIncome = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const categorySpending: Record<string, number> = {};
        monthTransactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
            });

        return `
User's Financial Data (Current Month):
- Total Income: ${currency.symbol}${totalIncome.toFixed(2)}
- Total Expenses: ${currency.symbol}${totalExpenses.toFixed(2)}
- Savings: ${currency.symbol}${(totalIncome - totalExpenses).toFixed(2)}
- Savings Rate: ${totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0}%

Spending by Category:
${Object.entries(categorySpending).map(([cat, amt]) => `- ${cat}: ${currency.symbol}${amt.toFixed(2)}`).join('\n')}

Active Budgets: ${budgets.length}
Active Goals: ${goals.length}
        `;
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        // Check if API key is configured
        if (!GROQ_API_KEY) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '⚠️ AI Assistant is not configured.\n\nTo enable AI features:\n1. Get a free API key from https://console.groq.com\n2. Add EXPO_PUBLIC_GROQ_API_KEY=your_key to your .env file\n3. Restart the app'
            }]);
            setLoading(false);
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
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            const assistantMessage = data.choices?.[0]?.message?.content;

            if (!assistantMessage) {
                console.error('Empty response from API:', data);
                throw new Error('Empty response from API');
            }

            setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
        } catch (error) {
            console.error('AI Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I\'m having trouble connecting. Please check your internet connection and API key, then try again.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }, [messages]);

    return (
        <>
            {/* FAB Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setVisible(true)}
                activeOpacity={0.8}
            >
                <FontAwesome name="comments" size={28} color="#fff" />
            </TouchableOpacity>

            {/* Chat Modal */}
            <Modal
                visible={visible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalContainer}
                >
                    <View style={styles.chatContainer}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerLeft}>
                                <FontAwesome name="comments" size={28} color="#3b82f6" />
                                <View>
                                    <Text style={styles.headerTitle}>AI Assistant</Text>
                                    <Text style={styles.headerSubtitle}>Powered by Groq</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeButton}>
                                <Text style={styles.closeText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Messages */}
                        <ScrollView
                            ref={scrollViewRef}
                            style={styles.messagesContainer}
                            contentContainerStyle={styles.messagesContent}
                        >
                            {messages.map((msg, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.messageBubble,
                                        msg.role === 'user' ? styles.userMessage : styles.assistantMessage
                                    ]}
                                >
                                    <Text style={[
                                        styles.messageText,
                                        msg.role === 'user' && styles.userMessageText
                                    ]}>
                                        {msg.content}
                                    </Text>
                                </View>
                            ))}
                            {loading && (
                                <View style={[styles.messageBubble, styles.assistantMessage]}>
                                    <ActivityIndicator size="small" color="#3b82f6" />
                                </View>
                            )}
                        </ScrollView>

                        {/* Input */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={input}
                                onChangeText={setInput}
                                placeholder="Ask about your finances..."
                                placeholderTextColor="#6b7280"
                                multiline
                                maxLength={500}
                                onSubmitEditing={sendMessage}
                            />
                            <TouchableOpacity
                                style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
                                onPress={sendMessage}
                                disabled={!input.trim() || loading}
                            >
                                <Text style={styles.sendIcon}>↑</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 90,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        zIndex: 100,
    },
    fabIcon: {
        fontSize: 24,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    chatContainer: {
        backgroundColor: '#000',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '80%',
        borderTopWidth: 1,
        borderColor: '#27272a',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#27272a',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerIcon: {
        fontSize: 28,
    },
    headerTitle: {
        color: '#f8fafc',
        fontSize: 18,
        fontWeight: '600',
    },
    headerSubtitle: {
        color: '#9ca3af',
        fontSize: 12,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeText: {
        color: '#f8fafc',
        fontSize: 16,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: 16,
        gap: 12,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#3b82f6',
        borderBottomRightRadius: 4,
    },
    assistantMessage: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(24, 24, 27, 0.8)',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#27272a',
    },
    messageText: {
        color: '#f8fafc',
        fontSize: 14,
        lineHeight: 20,
    },
    userMessageText: {
        color: '#fff',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#27272a',
        gap: 8,
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(24, 24, 27, 0.8)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        color: '#f8fafc',
        fontSize: 14,
        maxHeight: 100,
        borderWidth: 1,
        borderColor: '#27272a',
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#27272a',
    },
    sendIcon: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default AIChatbot;
