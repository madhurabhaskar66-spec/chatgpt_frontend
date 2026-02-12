import { useContext } from "react";
import { ChatContext } from "../context/ChatContext";

export default function Sidebar() {
  const {
    sidebarOpen,
    setSidebarOpen,
    chats,
    setActiveChat,
    addNewChat,
    searchTerm,
    setSearchTerm
  } = useContext(ChatContext);

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
      
      <div className="top">
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
        {sidebarOpen && <button onClick={addNewChat}>+ New Chat</button>}
      </div>

      {sidebarOpen && (
        <>
          <input
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="section">
            <h4>Recent</h4>
            {filteredChats.map(chat => (
              <div
                key={chat.id}
                className="chat-item"
                onClick={() => setActiveChat(chat.id)}
              >
                {chat.title}
              </div>
            ))}
          </div>

          <div className="section">
            <h4>Projects</h4>
            <div className="chat-item">AI Voting System</div>
            <div className="chat-item">ADBMS Mini Project</div>
          </div>
        </>
      )}
    </div>
  );
}
