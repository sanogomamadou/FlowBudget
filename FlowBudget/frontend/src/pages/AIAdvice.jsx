import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';

const AIAdvice = () => {
    // --- State Management ---
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            content: "Yo! I'm your AI financial bestie. 🤖💸 Ask me anything about your budget, savings, or how to stop spending on things you don't need!",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);
    const messagesEndRef = useRef(null);

    const suggestedQuestions = [
        "Analyze my spending habits 📊",
        "How can I save more money? 💰",
        "Am I spending too much on food? 🍔",
        "Create a budget for next month 📅"
    ];

    // --- Effects ---
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        fetch('http://localhost/FlowBudget/pages/api/getUser.php')
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    console.error('Error fetching user:', data.error);
                } else {
                    setUser(data);
                }
            })
            .catch(err => console.error('Error fetching user:', err));
    }, []);

    // --- Helpers ---
    const formatAIResponse = (text) => {
        let formatted = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br />');
        return formatted;
    };

    const handleSuggestedClick = (question) => {
        setInput(question);
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !user) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: input,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8000/ask-agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: input, user_id: user.id })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: data.response,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'ai',
                content: "Oof, brain freeze! 🧠❄️ Check the backend connection.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Render ---
    return (
        // Main Page Container - Absolute positioning to fill the entire relative parent (main)
        // This ignores parent padding and ensures we use 100% of the available space
        <div className="absolute inset-0 flex flex-col p-6 gap-4">

            {/* Header Section */}
            <div className="mb-2 flex-shrink-0">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary font-display tracking-tighter mb-2">
                    AI Financial Advisor v2.1
                </h1>
                <p className="text-gray-400">Get personalized money tips powered by AI ✨</p>
            </div>

            {/* Chat Card - Takes remaining space */}
            <div className="flex-1 bg-dark-lighter/50 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl overflow-hidden flex flex-col relative w-full min-h-0">

                {/* Decorative Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

                {/* Messages Scroll Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-10">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex items-end gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.type === 'user'
                                ? 'bg-primary text-dark shadow-[0_0_15px_rgba(204,255,0,0.3)]'
                                : 'bg-secondary text-white shadow-[0_0_15px_rgba(217,70,239,0.3)]'
                                }`}>
                                {msg.type === 'user' ? <User size={20} /> : <Bot size={20} />}
                            </div>

                            {/* Message Bubble */}
                            <div className={`max-w-[80%] p-4 rounded-2xl shadow-lg ${msg.type === 'user'
                                ? 'bg-primary text-dark rounded-tr-none'
                                : 'bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-tl-none'
                                }`}>
                                {msg.type === 'ai' ? (
                                    <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formatAIResponse(msg.content) }} />
                                ) : (
                                    <p className="text-sm font-medium">{msg.content}</p>
                                )}
                                <p className={`text-[10px] mt-2 font-bold opacity-50 ${msg.type === 'user' ? 'text-dark' : 'text-gray-400'}`}>
                                    {msg.timestamp}
                                </p>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex items-end gap-3">
                            <div className="w-10 h-10 rounded-xl bg-secondary text-white shadow-[0_0_15px_rgba(217,70,239,0.3)] flex items-center justify-center flex-shrink-0">
                                <Bot size={20} />
                            </div>
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                                <span className="w-2 h-2 bg-secondary rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-secondary rounded-full animate-bounce delay-100"></span>
                                <span className="w-2 h-2 bg-secondary rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Suggested Questions Area */}
                {!isLoading && messages.length < 3 && (
                    <div className="px-6 pb-2 flex gap-2 overflow-x-auto custom-scrollbar flex-shrink-0 relative z-10">
                        {suggestedQuestions.map((q, i) => (
                            <button
                                key={i}
                                onClick={() => handleSuggestedClick(q)}
                                className="whitespace-nowrap px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-gray-300 transition-colors flex items-center gap-2 hover:scale-105 transform duration-200"
                            >
                                <Sparkles size={14} className="text-primary" />
                                {q}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input Area - Pinned to bottom */}
                <div className="p-4 bg-dark/50 border-t border-white/5 backdrop-blur-xl flex-shrink-0 relative z-10">
                    <form onSubmit={sendMessage} className="flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about your spending..."
                            className="flex-1 bg-dark-lighter border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="bg-primary hover:bg-primary/90 text-dark p-3 rounded-xl transition-all shadow-[0_0_15px_rgba(204,255,0,0.3)] hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default AIAdvice;
