import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [chatHistory, setChatHistory] = useState([
        { id: 1, title: 'Welcome Chat', date: 'Today' },
    ]);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
        } else {
            setUser({ email: 'User' });
        }
    }, [navigate]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://127.0.0.1:8000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ message: input }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: data.response || data.message },
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
                ]);
            }
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: 'Unable to connect to the server.' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_type');
        navigate('/login');
    };

    const handleNewChat = () => {
        setMessages([]);
        setChatHistory((prev) => [
            { id: Date.now(), title: 'New Chat', date: 'Today' },
            ...prev,
        ]);
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
            {/* Sidebar */}
            <div
                className={`${sidebarOpen ? 'w-64' : 'w-0'
                    } bg-gray-950 transition-all duration-300 overflow-hidden flex flex-col`}
            >
                {/* New Chat Button */}
                <div className="p-3">
                    <button
                        onClick={handleNewChat}
                        className="w-full flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-700 hover:bg-gray-800 transition text-sm font-medium"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        New Chat
                    </button>
                </div>

                {/* Chat History */}
                <div className="flex-1 overflow-y-auto px-3 space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wider px-2 py-2 font-semibold">
                        Recent
                    </p>
                    {chatHistory.map((chat) => (
                        <button
                            key={chat.id}
                            className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 transition truncate"
                        >
                            {chat.title}
                        </button>
                    ))}
                </div>

                {/* User Section */}
                <div className="p-3 border-t border-gray-800">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
                            U
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.email || 'User'}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-gray-400 hover:text-red-400 transition"
                            title="Logout"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Bar */}
                <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg hover:bg-gray-800 transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h1 className="text-lg font-semibold">ChatGPT</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                            GPT-4
                        </span>
                    </div>
                </header>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-4 py-6">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="bg-gray-800 p-4 rounded-2xl mb-6">
                                <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-semibold mb-2">What can I help with?</h2>
                            <p className="text-gray-400 text-sm max-w-md">
                                Ask me anything — from writing code, brainstorming ideas, learning new topics, and much more.
                            </p>

                            {/* Quick Action Cards */}
                            <div className="grid grid-cols-2 gap-3 mt-8 max-w-lg w-full">
                                {[
                                    { icon: '✍️', label: 'Write', desc: 'Essays, emails, stories' },
                                    { icon: '💡', label: 'Brainstorm', desc: 'Ideas & strategies' },
                                    { icon: '📊', label: 'Analyze', desc: 'Data & documents' },
                                    { icon: '💻', label: 'Code', desc: 'Debug & build' },
                                ].map((item) => (
                                    <button
                                        key={item.label}
                                        onClick={() => setInput(`Help me ${item.label.toLowerCase()}`)}
                                        className="flex items-center gap-3 p-4 rounded-xl border border-gray-700 hover:bg-gray-800 hover:border-gray-600 transition text-left"
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        <div>
                                            <p className="text-sm font-medium">{item.label}</p>
                                            <p className="text-xs text-gray-500">{item.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto space-y-6">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-xl px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-indigo-600 text-white rounded-br-md'
                                                : 'bg-gray-800 text-gray-200 rounded-bl-md'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
                                        <div className="flex space-x-1.5">
                                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="px-4 pb-4 pt-2">
                    <form
                        onSubmit={handleSendMessage}
                        className="max-w-3xl mx-auto flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 focus-within:border-indigo-500 transition"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Message ChatGPT..."
                            className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-500"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="p-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>
                    </form>
                    <p className="text-center text-xs text-gray-600 mt-2">
                        ChatGPT can make mistakes. Check important info.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
