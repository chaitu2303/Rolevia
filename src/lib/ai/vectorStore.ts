import { getOllamaEmbedding } from './ollama-embeddings';

export interface Document {
  id: string;
  text: string;
  metadata?: Record<string, any>;
  embedding?: number[];
}

// Simple in-memory cosine similarity vector store for Level 1 RAG
class InMemoryVectorStore {
  private documents: Document[] = [];

  constructor() {}

  async addDocuments(docs: Document[]) {
    for (const doc of docs) {
      if (!doc.embedding) {
        doc.embedding = await getOllamaEmbedding(doc.text);
      }
      this.documents.push(doc);
    }
  }

  async similaritySearch(query: string, k: number = 3): Promise<Document[]> {
    const queryEmbedding = await getOllamaEmbedding(query);
    
    // Calculate cosine similarity for all docs
    const scoredDocs = this.documents.map(doc => {
      const similarity = this.cosineSimilarity(queryEmbedding, doc.embedding!);
      return { doc, similarity };
    });

    // Sort descending by similarity
    scoredDocs.sort((a, b) => b.similarity - a.similarity);

    // Return top K
    return scoredDocs.slice(0, k).map(scored => scored.doc);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) throw new Error("Vector lengths do not match");
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

// Export a singleton instance
export const vectorStore = new InMemoryVectorStore();
