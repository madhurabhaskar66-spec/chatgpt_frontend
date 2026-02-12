import React, { useState, useRef, useEffect } from "react";

const Home = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const currentInput = input;
    const userMessage = { role: "user", content: currentInput };

    setInput("");
    setLoading(true);
    setMessages((prev) => [...prev, userMessage]);

    try {
      const token = localStorage.getItem("access_token");
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ message: currentInput }),
      });

      const data = await res.json();
      const aiResponse = {
        role: "assistant",
        content: data.response || data.message || "No response from AI."
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      console.error("Failed to send message:", err);
      const errorMessage = {
        role: "assistant",
        content: "Unable to connect to the server."
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-10">
      {/* Messages area */}
      <div className="w-full max-w-2xl flex-1 overflow-y-auto mb-6 px-2">
        {messages.length === 0 ? (
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 text-center mt-20">
            What can I help with?
          </h1>
        ) : (
          <div className="space-y-6">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${msg.role === "user"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-800 border border-gray-200"
                    }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-400 text-xs px-4 py-2 rounded-2xl animate-pulse">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input box */}
      <div className="w-full max-w-xl sticky bottom-0 bg-white pt-2">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-2 border border-gray-300 rounded-2xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-gray-300 bg-white"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything"
            className="flex-1 outline-none text-gray-700 placeholder-gray-400 bg-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="text-gray-500 hover:text-indigo-600 transition disabled:opacity-30"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </form>

        {/* Action buttons (only show when no message yet to keep it clean, or keep them always) */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {["Attach", "Search", "Study", "Create image"].map((item) => (
              <button
                key={item}
                className="px-4 py-1.5 text-sm border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition"
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {/* Footer text */}
        <p className="text-[10px] text-gray-400 mt-4 text-center">
          By messaging ChatGPT, you agree to our Terms and have read our Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Home;

