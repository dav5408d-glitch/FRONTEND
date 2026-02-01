import { NextRequest, NextResponse } from 'next/server';

// Configuration Ollama
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mixtral';

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message requis et doit être une chaîne' },
        { status: 400 }
      );
    }

    console.log(`🤖 Message reçu: "${message.substring(0, 50)}..."`);
    console.log(`🌐 Ollama URL: ${OLLAMA_HOST}`);

    // Construire l'historique pour Ollama
    const messages = [
      ...history.map((msg: any) => ({
        role: msg.role || 'user',
        content: msg.content || ''
      })),
      { role: 'user', content: message }
    ];

    // Appeler Ollama
    const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.message.content;

    console.log(`✅ Réponse générée: "${aiResponse.substring(0, 50)}..."`);

    return NextResponse.json({
      response: aiResponse,
      aiUsed: `Ollama (${OLLAMA_MODEL})`,
      providerKey: 'ollama',
      costUSD: 0,
      chargedUSD: 0,
      tokensUsed: 0,
      mode: 'LOCAL_LLM',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erreur API chat:', error.message);

    // Message d'erreur amical
    const errorMessage = error.message.includes('ECONNREFUSED')
      ? "🤖 Ollama n'est pas démarré. Lancez 'ollama serve' dans un terminal."
      : `❌ Erreur: ${error.message}`;

    return NextResponse.json({
      error: errorMessage,
      response: errorMessage,
      aiUsed: "Error",
      providerKey: "none",
      costUSD: 0,
      chargedUSD: 0,
      tokensUsed: 0,
      mode: 'ERROR'
    }, { status: 500 });
  }
}

// Health check
export async function GET() {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`, {
      method: 'GET'
    });

    const isHealthy = response.ok;
    const models = isHealthy ? await response.json() : null;

    return NextResponse.json({
      status: isHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      services: {
        api: true,
        ollama: isHealthy,
        model: OLLAMA_MODEL,
        ollamaUrl: OLLAMA_HOST,
        models: models?.models || []
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
