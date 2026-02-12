export default function ChatMessage({ message }) {
  return (
    <div className={`message ${message.role}`}>
      {message.content}
    </div>
  );
}
