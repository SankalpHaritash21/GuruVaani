// VITE_GEMINI_KEY is available via import.meta.env in Vite

import { useState } from "react";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import { personas, PersonaKey, Gemini_API } from "../util/constant";

type Provider = "openai" | "gemini";

export default function useChat() {
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<Provider>("gemini");
  const [persona, setPersona] = useState<PersonaKey>("hitesh");
  const [chatLog, setChatLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  const speak = (text: string) => {
    try {
      if (!ttsEnabled) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-IN";
      utterance.rate = 1;
      speechSynthesis.cancel(); // stop previous
      speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis not supported:", err);
    }
  };

  const stopSpeaking = () => {
    try {
      speechSynthesis.cancel();
    } catch {
      console.warn("Speech synthesis not supported");
    }
  };

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
    return response.data.choices[0].message.content as string;
  };

  const sendToGemini = async (prompt: string) => {
    try {
      const geminiApiKey = apiKey || Gemini_API;
      if (!geminiApiKey) throw new Error("Missing Gemini API key");

      const ai = new GoogleGenAI({ apiKey: geminiApiKey });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${personas[persona].systemPrompt}\n${prompt}`,
      });

      const text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
      return text || "No response from Gemini.";
    } catch (err) {
      console.error("Gemini API Error:", err);
      return "Error: Failed to get response from Gemini.";
    }
  };

  const sendMessage = async (userInput: string) => {
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
      setChatLog((prev) => [...prev, "Error: API request failed."]);
    } finally {
      setLoading(false);
    }
  };

  return {
    apiKey,
    setApiKey,
    provider,
    setProvider,
    persona,
    setPersona,
    chatLog,
    sendMessage,
    loading,
    ttsEnabled,
    setTtsEnabled,
    stopSpeaking,
  };
}
