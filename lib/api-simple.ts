const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface ChatResponse {
  response: string;
  aiUsed: string;
  providerKey: string;
  costUSD: number;
  chargedUSD: number;
  tokensUsed: number;
  mode: string;
  timestamp?: string;
  error?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

// API simplifiée - directement vers Ollama
export async function sendMessage(
  message: string,
  history: ChatMessage[] = []
): Promise<ChatResponse> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Health check de l'API
export async function checkHealth() {
  try {
    const response = await fetch('/api/chat');
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return null;
  } catch (error) {
    console.error('Health check failed:', error);
    return null;
  }
}

// Sauvegarde locale des conversations
export const storage = {
  // Sauvegarder l'historique
  saveHistory: (userId: string, history: ChatMessage[]) => {
    if (typeof window !== 'undefined') {
      const key = `synapse_history_${userId}`;
      localStorage.setItem(key, JSON.stringify(history));
    }
  },

  // Charger l'historique
  loadHistory: (userId: string): ChatMessage[] => {
    if (typeof window !== 'undefined') {
      const key = `synapse_history_${userId}`;
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  },

  // Effacer l'historique
  clearHistory: (userId: string) => {
    if (typeof window !== 'undefined') {
      const key = `synapse_history_${userId}`;
      localStorage.removeItem(key);
    }
  },

  // Sauvegarder les préférences
  savePreferences: (prefs: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('synapse_preferences', JSON.stringify(prefs));
    }
  },

  // Charger les préférences
  loadPreferences: () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('synapse_preferences');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  }
};
