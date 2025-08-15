import axios from "axios";
import { personas } from "./util/constant";
import React, { useState, useRef, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";

const PersonaChat: React.FC = () => {
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<"gemini" | "openai">("gemini");
  const [persona, setPersona] = useState<"hitesh" | "piyush" | "harkirat">(
    "hitesh"
  );
  const [userInput, setUserInput] = useState("");
  const [chatLog, setChatLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  // 🔊 Text-to-speech
  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 1;
    speechSynthesis.speak(utterance);
  };

  // 🟢 OpenAI
  const sendToOpenAI = async (prompt: string) => {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          { role: "system", content: personas[persona].systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    return response.data.choices[0].message.content;
  };

  // 🔵 Gemini (new SDK)
  const sendToGemini = async (prompt: string) => {
    try {
      // Get API key from state or env
      const envKey = import.meta.env.VITE_GEMINI_KEY;
      const geminiApiKey = apiKey || envKey;

      if (!geminiApiKey) {
        throw new Error(
          "Gemini API key is missing. Please provide a valid API key."
        );
      }

      // ✅ New style client
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });

      // ✅ Call the model
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", // or "gemini-2.0-flash"
        contents: `${personas[persona].systemPrompt}\n${prompt}`,
      });

      // ✅ Extract the text from the correct property
      const text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
      return text || "No response from Gemini.";
    } catch (err) {
      console.error("Gemini API Error:", err);
      return "Error: Failed to get response from Gemini.";
    }
  };

  // 📤 Handle sending message
  const handleSend = async () => {
    if (!userInput || (provider === "openai" && !apiKey)) return;
    setChatLog((prev) => [...prev, `You: ${userInput}`]);
    setLoading(true);

    try {
      const response =
        provider === "openai"
          ? await sendToOpenAI(userInput)
          : await sendToGemini(userInput);
      setChatLog((prev) => [...prev, `${personas[persona].name}: ${response}`]);
      speak(response);
    } catch (err) {
      console.error(err);
      setChatLog((prev) => [
        ...prev,
        "Error: Failed to get response from the API.",
      ]);
    } finally {
      setUserInput("");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-6 transition-colors duration-300">
      <header className="mb-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Persona Chat
        </h1>
        <p className="mt-2 text-gray-400">Chat with your favorite mentors</p>
      </header>

      <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-2xl p-4 md:p-6 space-y-6">
        {/* Profile Section */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <img
            src={personas[persona].image}
            alt={personas[persona].name}
            className="w-24 h-24 rounded-full object-cover border-4 border-purple-500/50 hover:border-purple-500 transition-all duration-300"
          />
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold">
              Chatting with {personas[persona].name}
            </h2>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="password"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400 disabled:opacity-60"
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
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
            value={provider}
            onChange={(e) => setProvider(e.target.value as "openai" | "gemini")}
          >
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
          </select>
        </div>

        {/* Persona Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.entries(personas).map(([key, p]) => (
            <button
              key={key}
              className={`p-3 rounded-lg transition-all duration-200 ${
                persona === key
                  ? "bg-purple-600/80 shadow-lg shadow-purple-500/20"
                  : "bg-gray-700 hover:bg-gray-600/80"
              }`}
              onClick={() =>
                setPersona(key as "hitesh" | "piyush" | "harkirat")
              }
            >
              <span className="font-medium">{p.name}</span>
            </button>
          ))}
        </div>

        {/* Chat Display */}
        <div className="h-96 bg-gray-900/50 rounded-xl p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {chatLog.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.startsWith("You:") ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-xl p-3 ${
                  msg.startsWith("You:")
                    ? "bg-purple-600/80 ml-12"
                    : "bg-gray-700 mr-12"
                }`}
              >
                <span className="text-sm font-medium">
                  {msg.startsWith("You:") ? "You" : personas[persona].name}:
                </span>
                <p className="mt-1 text-gray-100">{msg.split(": ")[1]}</p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="relative">
          <textarea
            className="w-full bg-gray-700 border border-gray-600 rounded-xl p-4 pr-20 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400 resize-none"
            placeholder="Type your message..."
            rows={2}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            className={`absolute right-4 bottom-4 px-6 py-2 rounded-lg font-medium transition-all ${
              loading || !userInput
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-500"
            }`}
            onClick={handleSend}
            disabled={loading || !userInput}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
                Sending...
              </div>
            ) : (
              "Send →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonaChat;
