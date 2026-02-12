import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

const GroupChat = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);

    const [group, setGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
            setUser({ email: localStorage.getItem("user_email") || "User" });
        }
        fetchGroupDetails();
        fetchMessages();

        // Polling for new messages since we don't have WebSockets
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [groupId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchGroupDetails = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/groups/${groupId}`);
            if (res.ok) {
                const data = await res.json();
                setGroup(data);
            }
        } catch (err) {
            console.error("Failed to fetch group details:", err);
        }
    };

    const fetchMessages = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/groups/${groupId}/messages`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (err) {
            console.error("Failed to fetch group messages:", err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const currentInput = input;
        setInput("");
        setLoading(true);

        try {
            const token = localStorage.getItem("access_token");
            const headers = { "Content-Type": "application/json" };
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const res = await fetch(`http://127.0.0.1:8000/groups/${groupId}/messages`, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({ message: currentInput })
            });

            if (res.ok) {
                fetchMessages();
            }
        } catch (err) {
            console.error("Failed to send message:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate("/dashboard")} className="text-gray-400 hover:text-white transition">
                        ← Back
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white flex items-center gap-2">
                            # {group?.name || "Loading..."} <span className="text-[10px] bg-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">Group</span>
                        </h1>
                        <p className="text-[10px] text-gray-500">Shared AI Group Chat</p>
                    </div>
                </div>
                <div className="text-xs text-gray-400">
                    Logged in as: <span className="text-indigo-400">{user?.email}</span>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
                {messages.length === 0 && !loading && (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div key={index} className={`flex flex-col ${msg.is_ai ? "items-start" : "items-end"}`}>
                        <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-sm ${msg.is_ai
                            ? "bg-gray-800 text-gray-200 border border-gray-700"
                            : "bg-indigo-600 text-white"
                            }`}>
                            <p className="whitespace-pre-wrap">{msg.message}</p>
                        </div>
                        <span className="text-[10px] text-gray-600 mt-1 px-1">
                            {msg.is_ai ? "🤖 AI Assistant" : `👤 User ${msg.user_id || "Guest"}`}
                        </span>
                    </div>
                ))}

                {loading && (
                    <div className="flex flex-col items-start">
                        <div className="bg-gray-800 text-gray-400 text-xs px-4 py-3 rounded-2xl border border-gray-700 animate-pulse">
                            AI is responding... 🪄
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-6 bg-gray-950 border-t border-gray-800">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3 bg-gray-900 border border-gray-700 rounded-2xl px-4 py-3 shadow-inner focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a group message..."
                        className="flex-1 bg-transparent outline-none text-sm placeholder-gray-500"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="px-5 py-2 bg-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40 transition shadow-lg"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default GroupChat;
