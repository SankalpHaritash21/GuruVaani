import axios from "axios";
import { personas } from "../util/constant";
import React, { useState, useRef, useEffect } from "react";

const PersonaChat: React.FC = () => {
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<"openai" | "gemini">("openai");
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

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN"; // 'hi-IN'
    utterance.rate = 1;
    speechSynthesis.speak(utterance);
  };

  // OpenAI API call via REST endpoint
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

  // Gemini API call via REST endpoint (using updated endpoint)
  const sendToGemini = async (prompt: string) => {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: `${personas[persona].systemPrompt}\n${prompt}` }],
          },
        ],
      }
    );
    return (
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini."
    );
  };

  const handleSend = async () => {
    if (!userInput || !apiKey) return;
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
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 p-6">
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-extrabold text-gray-800">
          Persona Chat App
        </h1>
      </header>

      {/* Main Chat Container */}
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-4 mb-4">
          <img
            src={personas[persona].image}
            alt={personas[persona].name}
            className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
          />
          <h2 className="text-2xl font-bold text-gray-700">
            Chat with {personas[persona].name}
          </h2>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="password"
            className="flex-1 border border-gray-300 p-2 rounded focus:outline-none focus:ring focus:border-blue-500"
            placeholder="Enter your API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <select
            className="border border-gray-300 rounded px-2 focus:outline-none focus:ring focus:border-blue-500"
            value={provider}
            onChange={(e) => setProvider(e.target.value as "openai" | "gemini")}
          >
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
          </select>
        </div>

        <div className="flex justify-around mb-4">
          {Object.entries(personas).map(([key, p]) => (
            <button
              key={key}
              className={`px-4 py-2 rounded transition-colors duration-200 ${
                persona === key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
              onClick={() =>
                setPersona(key as "hitesh" | "piyush" | "harkirat")
              }
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="h-64 overflow-y-auto border border-gray-200 rounded p-4 mb-4 bg-gray-50">
          {chatLog.map((msg, i) => (
            <div
              key={i}
              className={`my-2 p-2 rounded ${
                msg.startsWith("You:")
                  ? "bg-blue-100 text-blue-800 self-end"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {msg}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <textarea
          className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:border-blue-500"
          placeholder="Ask your question..."
          rows={3}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />

        <button
          className="w-full mt-4 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors"
          onClick={handleSend}
          disabled={loading}
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default PersonaChat;
