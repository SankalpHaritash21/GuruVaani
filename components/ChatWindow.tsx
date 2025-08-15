import { useEffect, useRef } from "react";

const ChatWindow = ({
  chatLog,
  personaName,
}: {
  chatLog: string[];
  personaName: string;
}) => {
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  return (
    <div className="h-96 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
      {chatLog.map((msg, i) => {
        const isUser = msg.startsWith("You:");
        const text = msg.split(": ").slice(1).join(": "); // in case colon appears in text
        return (
          <div
            key={i}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                isUser
                  ? "bg-purple-600 text-white shadow-md ml-12"
                  : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mr-12 border border-gray-200 dark:border-gray-700"
              }`}
            >
              <span className="block text-[11px] opacity-70 mb-1">
                {isUser ? "You" : personaName}
              </span>
              <p>{text}</p>
            </div>
          </div>
        );
      })}
      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatWindow;
