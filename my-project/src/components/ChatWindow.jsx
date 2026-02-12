import { useContext, useEffect, useRef } from "react";
import { ChatContext } from "../context/ChatContext";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";

export default function ChatWindow() {
    const { chats, activeChat, loading } = useContext(ChatContext);
    const chat = chats.find(c => c.id === activeChat);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat?.messages, loading]);

    if (!chat) return <div className="chat-window">Select a chat to start</div>;

    return (
        <div className="chat-window flex flex-col h-full bg-gray-900 overflow-hidden">
            <div className="messages flex-1 overflow-y-auto px-4 py-6 space-y-6">
                {chat.messages.length === 0 && (
                    <div className="welcome flex flex-col items-center justify-center h-full text-center">
                        <h2 className="text-2xl font-semibold text-white mb-2">What can I help with?</h2>
                        <p className="text-gray-400 text-sm">Ask me anything — writing, coding, ideas and more.</p>
                    </div>
                )}

                {chat.messages.map((msg, index) => (
                    <ChatMessage key={index} message={msg} />
                ))}

                {loading && (
                    <div className="text-gray-400 text-sm animate-pulse">
                        Thinking...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <MessageInput />
        </div>
    );
}
