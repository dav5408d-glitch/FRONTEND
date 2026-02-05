// frontend/components/ChatWithWebLLM.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { initWebLLM, generateLocalResponse, isWebLLMAvailable } from '../lib/webllm';
import { Send, Loader2, Bot, User, Sparkles, Image as ImageIcon, Zap, Menu, X, MoreHorizontal } from 'lucide-react';
import { UI_STRINGS } from '../lib/constants';
import { authService } from '../lib/auth';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWithWebLLM() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isWebGPUAvailable, setIsWebGPUAvailable] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentResponse]);

  // Configuration pour Mixtral 7B local
  useEffect(() => {
    console.log('🤖 Configuration: Mixtral 7B Local Mode');
    setIsWebGPUAvailable(false);
    setEngineReady(true); // Backend est prêt
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    setCurrentResponse('');

    try {
      let response = '';

      if (engineReady && isWebGPUAvailable) {
        // Utiliser WebLLM local
        console.log('🧠 Using WebLLM (local inference)');
        response = await generateLocalResponse(userMessage, (chunk: string) => {
          setCurrentResponse(prev => prev + chunk);
        });
      } else {
        // Fallback : appeler le backend (si disponible)
        console.log('☁️ Falling back to backend API');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

        // Préparer l'historique (10 derniers messages) pour le contexte
        const history = messages.slice(-10).map(m => ({
          role: m.role,
          content: m.content
        }));

        const token = authService.getToken(); // Récupérer le token

        const res = await fetch(`${apiUrl}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || ''}` // Ajouter le token
          },
          body: JSON.stringify({
            message: userMessage,
            history: history // Envoi de l'historique
          })
        });

        if (res.status === 401) {
          response = "⚠️ Vous devez être connecté pour discuter. Si vous n'avez pas de compte, l'inscription est requise (mode Docker nécessaire).";
          // Optionnel : redirect vers auth
        } else {
          const data = await res.json();
          response = data.response || 'No response';
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setCurrentResponse('');
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Erreur lors de la génération de réponse' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#000000] text-white overflow-hidden font-sans selection:bg-blue-500/30">

      {/* SIDEBAR */}
      <aside
        className={`
          ${sidebarOpen ? 'w-full md:w-[300px]' : 'w-0'} 
          glass-sober border-r border-white/5 transition-all duration-300 ease-in-out
          flex flex-col relative z-20 md:relative absolute h-full
        `}
      >
        <div className="p-5 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3 font-bold text-lg tracking-tight">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Synapse</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase px-2 mb-3 tracking-wider">Aujourd'hui</p>
          {/* Mock history items */}
          {['Projet React', 'Analyse financière', 'Idée de startup'].map((item, i) => (
            <button key={i} className="w-full text-left p-3 rounded-xl hover:bg-white/5 text-sm text-gray-300 hover:text-white transition-all flex items-center gap-3 group border border-transparent hover:border-white/5">
              <MoreHorizontal className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
              {item}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer group border border-transparent hover:border-white/5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-xs font-bold text-black shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              DV
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate text-gray-200 group-hover:text-white transition-colors">Dav54</p>
              <p className="text-xs text-gray-500">Plan Local</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col relative h-full bg-gradient-to-b from-[#0a0a0a] to-[#000000]">

        {/* HEADER */}
        <header className="absolute top-0 left-0 right-0 h-16 bg-white/0 backdrop-blur-md z-10 flex items-center justify-between px-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 -ml-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className={`w-2 h-2 rounded-full ${engineReady ? 'bg-[#30d158] shadow-[0_0_8px_#30d158]' : 'bg-yellow-500 animate-pulse'}`}></span>
              <span className="text-xs font-medium text-gray-300">
                {engineReady ? 'Mixtral 7B (Local)' : 'Connexion au backend...'}
              </span>
            </div>
          </div>
        </header>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto pt-24 pb-36 px-4 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-8">

            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 page-enter">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative w-24 h-24 bg-[#1a1a1a] rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                </div>

                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tight">
                  {UI_STRINGS.WELCOME_TITLE}
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-8">
                  {UI_STRINGS.SUGGESTIONS.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(suggestion)}
                      className="glass-card p-5 text-left group hover:border-blue-500/30 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{suggestion}</span>
                        <Zap className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} ${msg.role === 'user' ? 'message-user' : 'message-assistant'}`}
              >

                {msg.role === 'assistant' && (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/10 flex items-center justify-center shrink-0 mt-1 shadow-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] md:max-w-[75%] p-5 rounded-2xl shadow-sm leading-7 ${msg.role === 'user'
                    ? 'bg-[#2563eb] text-white rounded-br-none shadow-blue-900/20 backdrop-blur-sm'
                    : 'glass border border-white/5 rounded-bl-none text-gray-100'
                    }`}
                >
                  <p className="whitespace-pre-wrap font-light tracking-wide">{msg.content}</p>
                </div>

                {msg.role === 'user' && (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-white/10 flex items-center justify-center shrink-0 mt-1 shadow-lg">
                    <User className="w-5 h-5 text-gray-300" />
                  </div>
                )}
              </div>
            ))}

            {/* ERROR / LOADING HELPERS */}
            {loading && !currentResponse && (
              <div className="flex gap-5 message-assistant">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/10 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="glass p-5 rounded-2xl rounded-bl-none flex items-center gap-3">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            {currentResponse && (
              <div className="flex gap-5 justify-start message-assistant">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/10 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="max-w-[85%] p-5 rounded-2xl rounded-bl-none glass text-gray-100">
                  <p className="whitespace-pre-wrap font-light tracking-wide">
                    {currentResponse}
                    <span className="inline-block w-2 h-4 ml-1 align-middle bg-blue-500 animate-pulse rounded-full"></span>
                  </p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* INPUT AREA */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-10">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSendMessage} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative flex items-center gap-2 p-2 bg-[#1a1a1e]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl focus-within:border-blue-500/50 transition-colors">

                <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors" title="Upload Image (Demo)">
                  <ImageIcon className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={UI_STRINGS.CHAT_PLACEHOLDER}
                  className="flex-1 bg-transparent text-white px-2 py-3 focus:outline-none text-base placeholder-gray-500"
                  disabled={loading}
                  autoFocus
                />

                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className={`p-2 rounded-xl transition-all duration-300 ${input.trim()
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transform hover:scale-105'
                    : 'bg-white/5 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>

              <div className="text-center mt-3">
                <p className="text-[11px] text-gray-600">
                  Synapse AI peut faire des erreurs. Vérifiez les informations importantes.
                </p>
              </div>
            </form>
          </div>
        </div>

      </main>
    </div>
  );
}

