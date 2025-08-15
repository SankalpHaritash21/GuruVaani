import { Send, Square } from "lucide-react";

type Props = {
  onSend: (value: string) => void;
  loading: boolean;
  ttsEnabled: boolean;
  setTtsEnabled: (v: boolean) => void;
  stopSpeaking: () => void;
};

import { useState } from "react";

export default function MessageInput({
  onSend,
  loading,
  ttsEnabled,
  setTtsEnabled,
  stopSpeaking,
}: Props) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (!value.trim() || loading) return;
    onSend(value.trim());
    setValue("");
  };

  return (
    <div className="relative">
      <textarea
        className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl p-4 pr-28 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400 resize-none"
        placeholder="Type your message..."
        rows={2}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />
      <div className="absolute right-2 bottom-2 flex items-center gap-2">
        <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">
          <input
            type="checkbox"
            checked={ttsEnabled}
            onChange={(e) => setTtsEnabled(e.target.checked)}
          />
          TTS
        </label>
        <button
          className="px-3 py-2 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          title="Stop speech"
          onClick={stopSpeaking}
        >
          <Square className="w-4 h-4" />
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            loading
              ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-500 text-white"
          }`}
          onClick={handleSend}
          disabled={loading}
          title="Send"
        >
          <Send className="w-4 h-4" />
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
