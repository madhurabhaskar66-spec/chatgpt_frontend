import { createContext, useState, useEffect } from "react";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [chats, setChats] = useState([
        { id: 1, title: "Welcome Chat", messages: [] }
    ]);
    const [activeChat, setActiveChat] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    const addNewChat = () => {
        const newChat = {
            id: Date.now(),
            title: "New Chat",
            messages: []
        };
        setChats([newChat, ...chats]);
        setActiveChat(newChat.id);
    };

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
            fetchHistory(token);
        }
    }, []);

    const fetchHistory = async (token) => {
        try {
            const response = await fetch("http://127.0.0.1:8000/history", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                if (data.length > 0) {
                    const historyChat = {
                        id: "history",
                        title: "Chat History",
                        messages: data.flatMap(h => [
                            { role: "user", content: h.user_message },
                            { role: "assistant", content: h.ai_response }
                        ])
                    };
                    setChats(prev => [historyChat, ...prev]);
                }
            }
        } catch (err) {
            console.error("Failed to fetch history:", err);
        }
    };

    const sendMessage = async (text) => {
        if (!text.trim() || loading) return;

        const userMessage = { role: "user", content: text };

        setChats(prevChats => prevChats.map(chat =>
            chat.id === activeChat
                ? {
                    ...chat,
                    title: chat.messages.length === 0 ? text.slice(0, 20) : chat.title,
                    messages: [...chat.messages, userMessage]
                }
                : chat
        ));

        setLoading(true);

        try {
            const token = localStorage.getItem("access_token");
            const headers = { "Content-Type": "application/json" };
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const res = await fetch("http://127.0.0.1:8000/chat", {
                method: "POST",
                headers: headers,
                body: JSON.stringify({ message: text }),
            });

            const data = await res.json();
            const aiResponse = {
                role: "assistant",
                content: data.response || data.message || "No response"
            };

            setChats(prevChats => prevChats.map(chat =>
                chat.id === activeChat
                    ? { ...chat, messages: [...chat.messages, aiResponse] }
                    : chat
            ));
        } catch (err) {
            console.error("Failed to send message:", err);
            const errorMessage = {
                role: "assistant",
                content: "Unable to connect to the server."
            };
            setChats(prevChats => prevChats.map(chat =>
                chat.id === activeChat
                    ? { ...chat, messages: [...chat.messages, errorMessage] }
                    : chat
            ));
        } finally {
            setLoading(false);
        }
    };

    return (
        <ChatContext.Provider
            value={{
                sidebarOpen,
                setSidebarOpen,
                chats,
                activeChat,
                setActiveChat,
                addNewChat,
                sendMessage,
                loading,
                searchTerm,
                setSearchTerm
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};
