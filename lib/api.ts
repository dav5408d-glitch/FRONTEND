// frontend/lib/api.ts
import { authService } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

if (!API_URL) {
  console.warn('⚠️ API_URL not configured. Using localhost:3002');
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = authService.getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  } as Record<string, string>;

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers,
    });

    // Handle token expiration
    if (response.status === 401) {
      authService.logout();
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function sendMessage(message: string, conversationId?: string) {
  return fetchWithAuth('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message, conversationId }),
  });
}

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