/* eslint-disable @typescript-eslint/no-explicit-any */
// frontend/lib/webllm.ts
// Wrapper pour WebLLM - inférence locale dans le navigateur

let engine: any = null;
const modelId = 'Mistral-7B-Instruct-v0.2-q4f32_1'

export async function initWebLLM() {
  if (engine) return engine;
  
  try {
    // @ts-expect-error - MLCEngine is loaded dynamically
    const { MLCEngine } = await import('@mlc-ai/web-llm');
    
    engine = new MLCEngine({
      model: modelId,
      initProgressCallback: (info: any) => {
        console.log('🔄 WebLLM Loading:', info.text);
      }
    } as any);
    
    await (engine as any).ready();
    console.log('✅ WebLLM Initialized');
    return engine;
  } catch (err) {
    console.error('❌ WebLLM init failed:', err);
    return null;
  }
}

export async function generateLocalResponse(prompt: string, onProgress?: (chunk: string) => void): Promise<string> {
  if (!engine) {
    engine = await initWebLLM();
  }
  
  if (!engine) {
    throw new Error('WebLLM not available');
  }
  
  try {
    const messages: any[] = [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: prompt }
    ];
    
    let fullResponse = '';
    
    const response = await (engine as any).chat.completions.create({
      messages,
      temperature: 0.7,
      max_tokens: 1024,
      stream: true
    });
    
    for await (const chunk of response) {
      const content = chunk.choices?.[0]?.delta?.content || '';
      fullResponse += content;
      onProgress?.(content);
    }
    
    return fullResponse;
  } catch (err) {
    console.error('❌ WebLLM generation failed:', err);
    throw err;
  }
}

export function isWebLLMAvailable(): boolean {
  // Vérifier si le navigateur supporte WebGPU
  if (typeof navigator === 'undefined') return false;
  return 'gpu' in navigator;
}
