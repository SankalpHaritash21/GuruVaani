import useChat from "../hooks/useChat";
import Header from "../components/Header";
import ChatWindow from "../components/ChatWindow";
import ProfileCard from "../components/ProfileCard";
import MessageInput from "../components/MessageInput";
import { ThemeProvider } from "../contexts/ThemeProvider";
import PersonaSelector from "../components/PersonSelector";
import { github, personas, twitter } from "../util/constant";
import ProviderControls from "../components/ProviderControls";

export default function App() {
  const {
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
  } = useChat();

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <Header
            title="Persona Chat"
            subtitle="Chat with your favorite mentors"
            github={github}
            twitter={twitter}
          />

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 md:p-6 space-y-6">
            <ProfileCard persona={persona} />
            <ProviderControls
              provider={provider}
              setProvider={setProvider}
              apiKey={apiKey}
              setApiKey={setApiKey}
            />
            <PersonaSelector persona={persona} setPersona={setPersona} />
            <ChatWindow
              chatLog={chatLog}
              personaName={personas[persona].name}
            />
            <MessageInput
              onSend={sendMessage}
              loading={loading}
              ttsEnabled={ttsEnabled}
              setTtsEnabled={setTtsEnabled}
              stopSpeaking={stopSpeaking}
            />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
