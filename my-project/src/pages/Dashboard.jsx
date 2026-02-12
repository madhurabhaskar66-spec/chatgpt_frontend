import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);

    const [user, setUser] = useState(null);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // 🔥 New Chat Architecture
    const [chats, setChats] = useState([
        { id: 1, title: "Welcome Chat", date: "Today", messages: [], loaded: true }
    ]);

    const [activeChatId, setActiveChatId] = useState(1);
    const [groups, setGroups] = useState([]);

    const activeChat = chats.find(chat => chat.id === activeChatId);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeChat?.messages, loading]);

    // Auth check
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
            setUser({ email: localStorage.getItem("user_email") || "User" });
            fetchConversations(token);
            fetchGroups();
        }
    }, []);

    const fetchConversations = async (token) => {
        try {
            const response = await fetch("http://127.0.0.1:8000/conversations", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                if (data.length > 0) {
                    const savedChats = data.map(conv => ({
                        id: conv.id,
                        title: conv.title,
                        date: "Past",
                        messages: [],
                        loaded: false
                    }));
                    setChats(prev => {
                        const welcome = prev.find(c => c.id === 1);
                        return welcome ? [welcome, ...savedChats] : savedChats;
                    });
                }
            }
        } catch (err) {
            console.error("Failed to fetch conversations:", err);
        }
    };

    const fetchConversationMessages = async (convId) => {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        try {
            const res = await fetch(`http://127.0.0.1:8000/conversations/${convId}/messages`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const formattedMessages = data.flatMap(m => [
                    { role: "user", content: m.user_message },
                    { role: "assistant", content: m.ai_response }
                ]);
                setChats(prev => prev.map(chat =>
                    chat.id === convId ? { ...chat, messages: formattedMessages, loaded: true } : chat
                ));
            }
        } catch (err) {
            console.error("Failed to fetch messages:", err);
        }
    };

    const fetchGroups = async () => {
        try {
            const res = await fetch("http://127.0.0.1:8000/groups");
            if (res.ok) {
                const data = await res.json();
                setGroups(data);
            }
        } catch (err) {
            console.error("Failed to fetch groups:", err);
        }
    };

    const handleCreateGroup = async () => {
        const name = prompt("Enter group name:");
        if (!name) return;

        try {
            const res = await fetch("http://127.0.0.1:8000/groups", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name })
            });

            if (res.ok) {
                fetchGroups();
            }
        } catch (err) {
            console.error("Failed to create group:", err);
        }
    };

    // Handle switching chat
    const switchChat = (chatId) => {
        setActiveChatId(chatId);
        const chat = chats.find(c => c.id === chatId);
        if (chat && !chat.loaded && chat.id !== 1 && typeof chat.id === 'number') {
            fetchConversationMessages(chatId);
        }
    };

    // Send Message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const currentChatId = activeChatId;
        const userMessage = { role: "user", content: input };
        const currentInput = input;
        setInput("");
        setLoading(true);

        // Add user message to active chat
        setChats(prev =>
            prev.map(chat => {
                if (chat.id === currentChatId) {
                    const isFirstMessage = chat.messages.length === 0;
                    return {
                        ...chat,
                        title: isFirstMessage ? currentInput.slice(0, 25) : chat.title,
                        messages: [...chat.messages, userMessage]
                    };
                }
                return chat;
            })
        );

        try {
            const token = localStorage.getItem("access_token");
            const headers = { "Content-Type": "application/json" };
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const body = { message: currentInput };
            if (typeof currentChatId === 'number' && currentChatId !== 1) {
                body.conversation_id = currentChatId;
            }

            const response = await fetch("http://127.0.0.1:8000/chat", {
                method: "POST",
                headers: headers,
                body: JSON.stringify(body),
            });

            const data = await response.json();
            const assistantMessage = {
                role: "assistant",
                content: data.response || data.message || "No response"
            };

            setChats(prev =>
                prev.map(chat => {
                    if (chat.id === currentChatId) {
                        const updated = { ...chat, messages: [...chat.messages, assistantMessage] };
                        if (data.conversation_id && (chat.id === 1 || typeof chat.id !== 'number')) {
                            updated.id = data.conversation_id;
                            updated.loaded = true;
                            if (activeChatId === currentChatId) setActiveChatId(data.conversation_id);
                        }
                        return updated;
                    }
                    return chat;
                })
            );

        } catch (err) {
            const errorMessage = {
                role: "assistant",
                content: "Unable to connect to the server."
            };

            setChats(prev =>
                prev.map(chat =>
                    chat.id === currentChatId
                        ? { ...chat, messages: [...chat.messages, errorMessage] }
                        : chat
                )
            );
        } finally {
            setLoading(false);
        }
    };

    // New Chat
    const handleNewChat = () => {
        const newChat = {
            id: Date.now(),
            title: "New Chat",
            date: "Today",
            messages: []
        };

        setChats(prev => [newChat, ...prev]);
        setActiveChatId(newChat.id);
    };

    // Logout
    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    // Delete Chat
    const handleDeleteChat = async (chatId, e) => {
        if (e) e.stopPropagation();
        if (!window.confirm("Delete this chat?")) return;

        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`http://127.0.0.1:8000/conversations/${chatId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.ok) {
                setChats(prev => prev.filter(c => c.id !== chatId));
                if (activeChatId === chatId) {
                    setActiveChatId(chats[0]?.id || null);
                }
            }
        } catch (err) {
            console.error("Failed to delete chat:", err);
        }
    };

    // Filtered chats
    const filteredChats = chats.filter(chat =>
        chat.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-gray-900 text-white overflow-hidden">

            {/* Sidebar */}
            <div className={`${sidebarOpen ? "w-64" : "w-0"} bg-gray-950 transition-all duration-300 overflow-hidden flex flex-col`}>

                <div className="p-3">
                    <button
                        onClick={handleNewChat}
                        className="w-full px-4 py-3 rounded-lg border border-gray-700 hover:bg-gray-800 transition text-sm font-medium"
                    >
                        + New Chat
                    </button>
                </div>

                <div className="px-3">
                    <input
                        type="text"
                        placeholder="Search chats..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full mb-3 px-3 py-2 rounded-lg bg-gray-800 text-sm outline-none"
                    />
                </div>

                <div className="flex-1 overflow-y-auto px-3 space-y-1">
                    <p className="text-xs text-gray-500 uppercase px-2 py-2 font-semibold">
                        Recent
                    </p>

                    {filteredChats.map(chat => (
                        <div
                            key={chat.id}
                            className={`group w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition cursor-pointer
                                ${activeChatId === chat.id
                                    ? "bg-gray-800 text-white"
                                    : "text-gray-300 hover:bg-gray-800"
                                }`}
                            onClick={() => switchChat(chat.id)}
                        >
                            <span className="truncate flex-1">{chat.title}</span>
                            <button
                                onClick={(e) => handleDeleteChat(chat.id, e)}
                                className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition px-1"
                            >
                                🗑️
                            </button>
                        </div>
                    ))}

                    <div className="pt-4">
                        <p className="text-xs text-gray-500 uppercase px-2 py-2 font-semibold">
                            Group Chats 👥
                        </p>
                        <div className="px-2 space-y-1">
                            <button
                                onClick={handleCreateGroup}
                                className="w-full text-left text-xs text-gray-400 hover:text-white transition"
                            >
                                + Create Group
                            </button>
                            {/* Group list could go here */}
                            {groups.map(group => (
                                <button
                                    key={group.id}
                                    onClick={() => navigate(`/groups/${group.id}`)}
                                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 truncate"
                                >
                                    # {group.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-3 border-t border-gray-800 flex items-center justify-between">
                    <span className="text-sm truncate">{user?.email}</span>
                    <button
                        onClick={handleLogout}
                        className="text-red-400 text-sm"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">

                {/* Header */}
                <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg hover:bg-gray-800"
                        >
                            ☰
                        </button>
                        <h1 className="text-lg font-semibold">ChatGPT</h1>
                    </div>
                    <span className="text-xs bg-gray-800 px-3 py-1 rounded-full">
                        GPT-4
                    </span>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-6">
                    {!activeChat?.messages.length ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <h2 className="text-2xl font-semibold mb-2">
                                What can I help with?
                            </h2>
                            <p className="text-gray-400 text-sm">
                                Ask me anything — writing, coding, ideas and more.
                            </p>
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto space-y-6">
                            {activeChat.messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-xl px-4 py-3 rounded-2xl text-sm
                                            ${msg.role === "user"
                                                ? "bg-indigo-600 text-white"
                                                : "bg-gray-800 text-gray-200"
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="text-gray-400 text-sm">
                                    Thinking...
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="px-4 pb-4">
                    <form
                        onSubmit={handleSendMessage}
                        className="max-w-3xl mx-auto flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Message ChatGPT..."
                            className="flex-1 bg-transparent outline-none text-sm"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="px-4 py-2 bg-indigo-600 rounded-lg disabled:opacity-40"
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
