'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { authService } from '../../lib/auth'
import GlassBackground from '@/components/GlassBackground'
import GuestModeBanner from '@/components/GuestModeBanner'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';


interface Message {
  role: 'user' | 'assistant'
  content: string
  aiUsed?: string
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = 'synapse_conversations'
const SUGGESTIONS = [
  'Explique-moi ce code',
  'Analyse cette image',
  'Écris une histoire',
  'Résume cet article',
  'Traduis en anglais',
  'Génère un plan',
]

export default function ChatPage() {
  const router = useRouter()
  const [user, setUser] = useState(authService.getUser())
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([])
  const [typewriterIdx, setTypewriterIdx] = useState<number | null>(null)
  const [typewriterText, setTypewriterText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [suggestionIndex, setSuggestionIndex] = useState(0)
  const [showSuggestion, setShowSuggestion] = useState(true)
  const [useWebSearch] = useState(false)
  const [isGuest, setIsGuest] = useState(false)
  const [guestRequestCount, setGuestRequestCount] = useState(0)
  const GUEST_LIMIT = 20

  // Charger les conversations au montage du composant
  useEffect(() => {
    const currentUser = authService.getUser()
    if (!currentUser) {
      // Mode invité
      setIsGuest(true)
      const storedCount = localStorage.getItem('guest_request_count')
      setGuestRequestCount(storedCount ? parseInt(storedCount) : 0)
    } else {
      setUser(currentUser)
    }

    // Récupérer le profil du backend pour avoir le plan à jour
    authService.refreshProfile().then(updatedUser => {
      if (updatedUser) {
        setUser(updatedUser)
      }
    })

    // Charger depuis le backend si connecté, sinon localStorage
    if (currentUser) {
      fetch(`${API_URL}/api/auth/conversations`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setConversations(data);
          }
        })
        .catch(e => console.error('Erreur chargement backend:', e));
    } else if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const convs = JSON.parse(saved)
          setConversations(convs)
        }
      } catch (e) {
        console.error('Erreur chargement localStorage:', e)
      }
    }
    setMounted(true)
  }, [router])

  // Rotation des suggestions toutes les 4s
  useEffect(() => {
    if (input.length > 0) return // Arrêter si l'utilisateur tape

    const interval = setInterval(() => {
      setShowSuggestion(false)
      setTimeout(() => {
        setSuggestionIndex(prev => (prev + 1) % SUGGESTIONS.length)
        setShowSuggestion(true)
      }, 400)
    }, 4000)
    return () => clearInterval(interval)
  }, [input])

  const saveConversations = useCallback((convs: Conversation[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(convs))
    }
    setConversations(convs)
  }, [])

  const generateConversationTitle = (firstMessage: string) => {
    return firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : '')
  }

  // Animation typewriter pour l'IA
  useEffect(() => {
    if (typewriterIdx === null) return;
    const msg = messages[typewriterIdx];
    if (!msg || msg.role !== 'assistant') return;
    let i = 0;
    setTypewriterText('');
    const interval = setInterval(() => {
      setTypewriterText(msg.content.slice(0, i));
      i += 6; // vitesse d'apparition (plus = plus rapide)
      if (i > msg.content.length) {
        clearInterval(interval);
        setTypewriterIdx(null);
        setTypewriterText('');
        setDisplayedMessages(messages.slice(0, typewriterIdx + 1));
      }
    }, 12); // vitesse d'intervalle (ms)
    return () => clearInterval(interval);
  }, [typewriterIdx, messages]);

  // Scroll smooth à chaque nouveau message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayedMessages, typewriterText, isLoading]);

  // Affichage progressif des messages
  useEffect(() => {
    if (messages.length > displayedMessages.length) {
      const nextIdx = displayedMessages.length;
      if (messages[nextIdx]?.role === 'assistant') {
        setTypewriterIdx(nextIdx);
      } else {
        setDisplayedMessages(messages.slice(0, nextIdx + 1));
      }
    }
  }, [messages, displayedMessages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    // Limite pour le mode invité
    if (isGuest && guestRequestCount >= GUEST_LIMIT) {
      alert("Limite de messages atteinte pour le mode invité (20 questions). Veuillez vous connecter pour continuer à discuter.");
      router.push('/auth/login');
      return;
    }

    let userMessage = input;
    setInput('');

    // Ajout d'une instruction automatique si Websearch est activé
    if (useWebSearch) {
      userMessage += '\n\n[INSTRUCTION POUR L\'IA: Effectue une recherche web sur ce sujet et intègre les résultats à ta réponse.]';
    }

    // Si pas de conversation active, en créer une
    let convId = currentConversationId;

    if (!convId) {
      convId = Date.now().toString();
      const newConv: Conversation = {
        id: convId,
        title: generateConversationTitle(userMessage),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      const updatedConvs = [newConv, ...conversations];
      saveConversations(updatedConvs);
      setCurrentConversationId(convId);
    }

    const userMsg: Message = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Incrémenter le compteur guest
    if (isGuest) {
      const newCount = guestRequestCount + 1
      setGuestRequestCount(newCount)
      localStorage.setItem('guest_request_count', newCount.toString())
    }

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({
          message: userMessage,
          searchWeb: useWebSearch,
          image: selectedImage,
          conversationId: convId,
          history: messages // Envoyer tout l'historique pour le contexte
        })
      });

      const data = await response.json();

      // Update conversation ID if backend returned a new one
      if (data.conversationId && data.conversationId !== convId) {
        convId = data.conversationId;
        setCurrentConversationId(convId);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        aiUsed: data.aiUsed
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Sauvegarder la conversation mise à jour
      setConversations(prevConvs => {
        const updatedConvs = prevConvs.map(conv =>
          conv.id === convId
            ? {
              ...conv,
              messages: [...conv.messages, userMsg, assistantMessage],
              updatedAt: Date.now()
            }
            : conv
        );
        saveConversations(updatedConvs);
        return updatedConvs;
      });

    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Erreur: ' + (error as Error).message
      };
      setMessages(prev => [...prev, errorMessage]);

      // Sauvegarder aussi l'erreur
      setConversations(prevConvs => {
        const updatedConvs = prevConvs.map(conv =>
          conv.id === convId
            ? {
              ...conv,
              messages: [...conv.messages, userMsg, errorMessage],
              updatedAt: Date.now()
            }
            : conv
        );
        saveConversations(updatedConvs);
        return updatedConvs;
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleNewConversation = () => {
    setCurrentConversationId(null)
    setMessages([])
    setDisplayedMessages([])
    setTypewriterIdx(null)
    setTypewriterText('')
    setInput('')
  }

  const loadConversation = (convId: string) => {
    const conv = conversations.find(c => c.id === convId)
    if (conv) {
      setCurrentConversationId(convId)
      setMessages(conv.messages)
    }
  }

  const getAILabel = (name?: string) => {
    if (!name) return 'AI'
    const key = name.toLowerCase()
    if (key.includes('openai')) return 'OpenAI'
    if (key.includes('claude')) return 'Claude'
    if (key.includes('cohere')) return 'Cohere'
    if (key.includes('huggingface')) return 'HuggingFace'
    if (key.includes('azure')) return 'Azure'
    if (key.includes('google') || key.includes('palm')) return 'Google'
    if (key.includes('mistral')) return 'Mistral'
    if (key.includes('deepseek')) return 'DeepSeek'
    return 'AI'
  }

  const deleteConversation = (convId: string) => {
    const updatedConvs = conversations.filter(c => c.id !== convId)
    saveConversations(updatedConvs)
    if (currentConversationId === convId) {
      handleNewConversation()
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-950 to-black flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-linear-to-br from-gray-950 to-black">
      <GlassBackground />
      {/* Sidebar - Hauteur 100vh, scrollable indépendamment */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 flex flex-col border-r border-white/10 overflow-hidden h-screen sticky top-0`}>
        <div className="flex-1 flex flex-col p-5 overflow-y-auto">
          {/* Header Sidebar */}
          <div className="mb-6">
            <Link href="/" className="text-lg font-bold tracking-wider hover:text-gray-300 transition flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 17v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" />
              </svg>
              SYNAPSE
            </Link>
            {isGuest ? (
              <div className="mt-3">
                <GuestModeBanner requestCount={guestRequestCount} limit={GUEST_LIMIT} />
                <Link
                  href="/auth/login"
                  className="text-xs text-blue-400 hover:text-blue-300 mt-2 block font-semibold"
                >
                  → Se connecter pour un accès illimité
                </Link>
              </div>
            ) : (
              <>
                <div className="mt-3 text-xs text-gray-400 truncate">{user?.email}</div>
                <div className="mt-1 text-xs font-semibold text-gray-300">
                  {authService.canUseAI() ? `${user?.plan || 'BAS'}` : 'Gratuit (limité)'}
                </div>
              </>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="space-y-2 mb-6">
            <button
              onClick={handleNewConversation}
              className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-medium px-4 py-2.5 rounded-lg transition-all duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouveau chat
            </button>

            <Link
              href="/pricing"
              className="w-full flex items-center justify-center gap-2 bg-blue-600/80 hover:bg-blue-600 text-white font-medium px-4 py-2.5 rounded-lg transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Choisir un plan
            </Link>
          </div>

          {/* Historique */}
          <div className="flex-1 min-h-0 flex flex-col">
            <p className="text-xs text-gray-400 font-semibold mb-3 px-1">Historique</p>
            <div className="flex-1 overflow-y-auto space-y-1.5">
              {conversations.length === 0 ? (
                <p className="text-gray-500 text-xs px-2 py-3">Aucune conversation</p>
              ) : (
                conversations.map(conv => (
                  <div
                    key={conv.id}
                    onClick={() => loadConversation(conv.id)}
                    className={`p-3 rounded-lg cursor-pointer text-sm transition-all group relative ${currentConversationId === conv.id
                      ? 'bg-white/15 text-white'
                      : 'hover:bg-white/8 text-gray-300'
                      }`}
                  >
                    <div className="font-medium truncate">{conv.title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(conv.updatedAt).toLocaleDateString('fr-FR')}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteConversation(conv.id)
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Pied sidebar */}
        <div className="border-t border-white/10 p-4 space-y-2">
          <button
            onClick={() => {
              authService.logout()
              router.push('/auth/login')
            }}
            className="w-full flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 font-medium px-3 py-2 rounded-lg transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative">
        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 left-4 z-50 p-2 rounded-lg hover:bg-white/10 transition-all"
          title={sidebarOpen ? 'Masquer' : 'Afficher'}
        >
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>

        {/* Messages Area - Prend tout l'espace restant et scrolle indépendamment */}
        <div className="flex-1 overflow-y-auto p-6 pt-16 pb-40">
          {messages.length === 0 ? (
            <motion.div 
              className="flex items-center justify-center h-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center max-w-2xl">
                <motion.h1 
                  className="text-4xl font-bold mb-3 text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  Que puis-je faire pour vous?
                </motion.h1>
                <motion.p 
                  className="text-gray-400 mb-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  Posez une question ou décrivez une tâche. SYNAPSE AI choisira automatiquement la meilleure IA pour répondre.
                </motion.p>

                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  {['Explique-moi ce code', 'Rédige un email professionnel', 'Résume cet article', 'Aide-moi à brainstormer'].map((suggestion, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setInput(suggestion)
                      }}
                      className="text-left p-4 rounded-lg bg-white/8 hover:bg-white/12 border border-white/10 transition-all text-sm text-gray-300 hover:text-white"
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {displayedMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-2xl ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.role === 'assistant' && msg.aiUsed && (
                      <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 17v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" />
                        </svg>
                        {getAILabel(msg.aiUsed)}
                      </div>
                    )}
                    <div className={`inline-block p-4 rounded-lg ${msg.role === 'user'
                      ? 'bg-blue-600/80 text-white'
                      : 'bg-white/8 text-gray-100 border border-white/10'}`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              {/* Animation typewriter pour le message IA en cours */}
              {typewriterIdx !== null && messages[typewriterIdx]?.role === 'assistant' && (
                <div className="flex justify-start">
                  <div className="max-w-2xl text-left">
                    <div className="inline-block p-4 rounded-lg bg-white/8 text-gray-100 border border-white/10">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{typewriterText}</p>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-white/8 border border-white/10">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-400">En cours...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Section - Fixe en bas */}
        <div className="fixed bottom-0 right-0 flex-none border-t border-white/10 bg-black/80 backdrop-blur-md p-6 w-full max-w-7xl"
          style={{ left: sidebarOpen ? '288px' : '0' }}>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="flex gap-3 items-end">
                {/* Bouton Image */}
                <label className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer border border-white/10" title="Image">
                  <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0] || null;
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => setSelectedImage(ev.target?.result as string);
                      reader.readAsDataURL(file);
                    } else {
                      setSelectedImage(null);
                    }
                  }} />
                </label>

                {/* Bouton Websearch désactivé pour la bêta */}
                <div className="relative group">
                  <button
                    type="button"
                    className={
                      `flex items-center justify-center w-10 h-10 rounded-lg border border-white/10 transition bg-white/10 text-gray-400 cursor-not-allowed opacity-60`
                    }
                    title="Recherche web (désactivé en bêta)"
                    disabled
                    tabIndex={-1}
                    style={{ pointerEvents: 'none' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      {/* Croix sur l'icône pour indiquer désactivation */}
                      <line x1="4" y1="4" x2="20" y2="20" stroke="red" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                  {/* Tooltip custom */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-12 z-20 hidden group-hover:block bg-black/90 text-white text-xs rounded px-3 py-2 border border-white/10 shadow-lg whitespace-nowrap pointer-events-none select-none">
                    Fonction désactivée pendant la bêta<br />Websearch sera disponible à la sortie officielle !
                  </div>
                </div>

                {/* Champ texte avec suggestions animées */}
                <div className="flex-1 relative">
                  {/* Placeholder animé */}
                  {input.length === 0 && (
                    <div className={`absolute left-4 top-3 text-gray-500 pointer-events-none transition-all duration-300 ${showSuggestion ? 'slide-up-enter' : 'slide-up-exit'
                      }`}>
                      {SUGGESTIONS[suggestionIndex]}
                    </div>
                  )}
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={false}
                    placeholder=""
                    className={`w-full bg-white/8 border border-white/20 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500/50 transition-all`}
                  />
                </div>

                {/* Bouton Envoyer */}
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition border border-white/10"
                  title="Envoyer"
                >
                  <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>

              {/* Indicateurs d'état */}
              {(selectedImage || useWebSearch) && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {selectedImage && (
                    <span className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded text-xs text-gray-300 border border-white/10">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Image jointe
                    </span>
                  )}
                  {useWebSearch && (
                    <span className="inline-flex items-center gap-1.5 bg-blue-600/30 px-2.5 py-1 rounded text-xs text-blue-300 border border-blue-500/30">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Web activé
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}