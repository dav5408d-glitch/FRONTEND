'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendMessage, ChatMessage, storage } from '../../lib/api-simple';
import AnimatedCard from '../../components/AnimatedCard';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function ChatSimple() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId] = useState(() => `user_${Date.now()}`);

  // Charger l'historique au démarrage
  useEffect(() => {
    const savedHistory = storage.loadHistory(userId);
    if (savedHistory.length > 0) {
      setMessages(savedHistory);
    } else {
      // Message de bienvenue
      setMessages([{
        role: 'assistant',
        content: '👋 Bonjour ! Je suis SYNAPSE AI, votre assistant intelligent. Comment puis-je vous aider aujourd\'hui ?',
        timestamp: new Date().toISOString()
      }]);
    }
  }, [userId]);

  // Sauvegarder l'historique
  useEffect(() => {
    if (messages.length > 1) { // Ne pas sauvegarder juste le message de bienvenue
      storage.saveHistory(userId, messages);
    }
  }, [messages, userId]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendMessage(inputMessage.trim(), messages);
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: '❌ Une erreur est survenue. Veuillez réessayer.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearHistory = () => {
    storage.clearHistory(userId);
    setMessages([{
      role: 'assistant',
      content: '👋 Bonjour ! Je suis SYNAPSE AI, votre assistant intelligent. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date().toISOString()
    }]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            SYNAPSE AI <span className="text-blue-400">Simple</span>
          </h1>
          <p className="text-gray-400">
            Chat intelligent avec Mixtral 7B • Mode invité illimité
          </p>
        </motion.div>

        {/* Messages */}
        <div className="max-w-4xl mx-auto mb-8">
          <AnimatedCard className="min-h-[500px] p-6">
            <div className="space-y-4 overflow-y-auto max-h-[500px]">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-100'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-2">
                        {new Date(message.timestamp || '').toLocaleTimeString('fr-FR')}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-800 text-gray-100 p-4 rounded-lg">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </AnimatedCard>
        </div>

        {/* Input */}
        <div className="max-w-4xl mx-auto">
          <AnimatedCard className="p-6">
            <div className="flex gap-4">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message ici..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="px-6"
              >
                {isLoading ? '...' : 'Envoyer'}
              </Button>
              <Button
                onClick={clearHistory}
                variant="outline"
                className="px-4"
              >
                🗑️
              </Button>
            </div>
          </AnimatedCard>
        </div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <p className="text-gray-500 text-sm">
            💬 Historique sauvegardé localement • 🤖 Mixtral 7B • 🌐 Version simplifiée
          </p>
        </motion.div>
      </div>
    </div>
  );
}
