// Ollama local embeddings client

export async function getOllamaEmbedding(text: string, model: string = 'nomic-embed-text'): Promise<number[]> {
  try {
    const OLLAMA_URL = process.env.NEXT_PUBLIC_OLLAMA_API_URL || 'http://localhost:11434';
    const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: text
      })
    });
    
    if (!res.ok) {
      throw new Error(`Ollama embedding error: ${res.statusText}`);
    }
    
    const data = await res.json();
    return data.embedding;
  } catch (err) {
    console.error('Failed to get Ollama embedding', err);
    throw err;
  }
}
