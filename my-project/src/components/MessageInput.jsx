import { useState, useContext } from "react";
import { ChatContext } from "../context/ChatContext";

export default function MessageInput() {
    const [text, setText] = useState("");
    const { sendMessage, loading } = useContext(ChatContext);

    const handleSend = (e) => {
        if (e) e.preventDefault();
        if (!text.trim() || loading) return;
        sendMessage(text);
        setText("");
    };

    return (
        <div className="px-4 pb-4">
            <form
                onSubmit={handleSend}
                className="max-w-3xl mx-auto flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 shadow-md focus-within:ring-2 focus-within:ring-indigo-500"
            >
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Message ChatGPT..."
                    className="flex-1 bg-transparent outline-none text-white text-sm placeholder-gray-400"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading || !text.trim()}
                    className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 transition disabled:opacity-40"
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        "➤"
                    )}
                </button>
            </form>
        </div>
    );
}
