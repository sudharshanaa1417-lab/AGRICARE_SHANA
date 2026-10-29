import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, Mic, MicOff, Volume2, Send, Bot, 
  User as UserIcon, Sparkles, ExternalLink, HelpCircle 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useIoT } from '../context/IoTContext';
import { useAuth } from '../context/AuthContext';
import { sendChatMessage } from '../services/api';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  sources?: string[];
  timestamp: string;
}

export const AiVoiceChatbot: React.FC = () => {
  const { t, language } = useLanguage();
  const { reading } = useIoT();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hello ${user?.name || 'Farmer'}! I am AgriCare Advisor, your multilingual AI agricultural specialist. How can I assist you with your ${user?.farm_name || 'farm'} today? You can type or tap the microphone to speak!`,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Speech-To-Text via Web Speech API
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser. Please use Google Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      // Language code mapping
      const langMap: Record<string, string> = {
        en: 'en-IN',
        ta: 'ta-IN',
        hi: 'hi-IN',
        te: 'te-IN',
        kn: 'kn-IN',
        ml: 'ml-IN',
        mr: 'mr-IN'
      };
      recognition.lang = langMap[language] || 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  // Text-To-Speech playback
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = {
      en: 'en-IN',
      ta: 'ta-IN',
      hi: 'hi-IN',
      te: 'te-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      mr: 'mr-IN'
    };
    utterance.lang = langMap[language] || 'en-IN';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    try {
      const res = await sendChatMessage(
        query,
        language,
        'Tomato',
        reading?.moisture ?? 42.5
      );

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: res.reply,
        sources: res.sources,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  const promptChips = [
    'Why are my tomato leaves turning yellow?',
    'What does my 42.5% soil moisture reading mean?',
    'When should I irrigate my groundnut crop?',
    'Today available mandi market prices?'
  ];

  return (
    <div className="space-y-4 pb-12 h-[calc(100vh-140px)] flex flex-col">
      {/* Title */}
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="text-forest-700" size={24} />
            AgriCare Advisor — Voice & Text AI Chatbot
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Speech-to-text, spoken voice audio, and context-aware crop troubleshooting
          </p>
        </div>
      </div>

      {/* Chat Conversation Scroll Area */}
      <div className="flex-1 bg-white rounded-3xl p-4 sm:p-6 border border-forest-100 shadow-xs overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isBot = m.sender === 'bot';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isBot ? '' : 'flex-row-reverse'}`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                  isBot ? 'bg-forest-700 text-white' : 'bg-gray-800 text-white'
                }`}
              >
                {isBot ? <Bot size={18} /> : <UserIcon size={18} />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[70%] rounded-3xl p-4 space-y-2 ${
                  isBot
                    ? 'bg-forest-50/70 border border-forest-100/80 text-forest-950'
                    : 'bg-forest-700 text-white'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                    {isBot ? 'AgriCare Advisor' : user?.name || 'You'}
                  </span>
                  <span className="text-[9px] opacity-50">{m.timestamp}</span>
                </div>

                <p className="text-xs leading-relaxed whitespace-pre-line font-medium">
                  {m.text}
                </p>

                {isBot && (
                  <div className="flex items-center justify-between pt-1 border-t border-forest-200/50">
                    {m.sources && m.sources.length > 0 && (
                      <span className="text-[10px] text-gray-400 italic">
                        Sources: {m.sources[0]}
                      </span>
                    )}
                    <button
                      onClick={() => speakText(m.text)}
                      className="p-1 rounded-full text-forest-700 hover:bg-white transition-colors ml-auto"
                      title="Speak Audio"
                    >
                      <Volume2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium p-2">
            <Bot size={16} className="text-forest-600 animate-bounce" />
            <span>AgriCare Advisor is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
        {promptChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            className="px-3 py-1.5 rounded-full bg-white border border-forest-200 hover:bg-forest-50 text-[11px] font-medium text-forest-900 shrink-0 shadow-2xs transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="bg-white rounded-3xl p-2 border border-forest-200 shadow-sm flex items-center gap-2 shrink-0">
        <button
          onClick={toggleSpeechRecognition}
          className={`p-3 rounded-2xl transition-all ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-forest-50 text-forest-700 hover:bg-forest-100'
          }`}
          title={isListening ? 'Listening...' : 'Voice Input (Microphone)'}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={t('ask_question')}
          className="flex-1 px-2 py-2 text-xs font-medium focus:outline-none bg-transparent"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim()}
          className="p-3 rounded-2xl bg-forest-700 hover:bg-forest-800 disabled:opacity-40 text-white transition-all shadow-xs"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
