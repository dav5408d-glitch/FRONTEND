// frontend/lib/api.ts
import { authService } from './auth';

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

export async function getUsage() {
  try {
    return await fetchWithAuth('/api/auth/usage');
  } catch {
    return {
      messages: { used: 0, limit: 100, remaining: 100, percentage: 0 },
      images: { used: 0, limit: 0, remaining: 0, percentage: 0 },
      plan: 'FREE'
    };
  }
}

export async function getConversations() {
  try {
    return await fetchWithAuth('/api/auth/conversations');
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    return [];
  }
}

export async function createConversation(title?: string) {
  try {
    return await fetchWithAuth('/api/auth/conversations', {
      method: 'POST',
      body: JSON.stringify({ title })
    });
  } catch (error) {
    console.error('Failed to create conversation:', error);
    throw error;
  }
}

export async function getConversation(id: string) {
  try {
    return await fetchWithAuth(`/api/auth/conversations/${id}`);
  } catch (error) {
    console.error('Failed to fetch conversation:', error);
    throw error;
  }
}

export async function deleteConversation(id: string) {
  try {
    return await fetchWithAuth(`/api/auth/conversations/${id}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Failed to delete conversation:', error);
    throw error;
  }
}

export async function checkHealth() {
  try {
    const response = await fetch(`${API_URL}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    return await response.json();
  } catch (error) {
    console.error('Backend health check failed:', error);
    return null;
  }
}