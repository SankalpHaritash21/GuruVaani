type Props = {
  provider: "openai" | "gemini";
  setProvider: (p: "openai" | "gemini") => void;
  apiKey: string;
  setApiKey: (k: string) => void;
};

const ProviderControls = ({
  provider,
  setProvider,
  apiKey,
  setApiKey,
}: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input
        type="password"
        className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400 disabled:opacity-60"
        placeholder={
          provider === "gemini"
            ? "Uses your VITE_GEMINI_KEY by default ✨"
            : "🔑 Enter OpenAI API Key"
        }
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        disabled={provider === "gemini"}
      />
      <select
        className="cursor-pointer w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
        value={provider}
        onChange={(e) => setProvider(e.target.value as "openai" | "gemini")}
      >
        <option value="openai">OpenAI</option>
        <option value="gemini">Gemini</option>
      </select>
    </div>
  );
};

export default ProviderControls;
