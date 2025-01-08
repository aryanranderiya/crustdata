import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Embedding from "@/models/Embedding";
import { pipeline } from "@huggingface/transformers";

/**
 * Computes cosine similarity between two vectors.
 * @param {number[]} vec1
 * @param {number[]} vec2
 * @returns {number} Cosine similarity
 */
function cosineSimilarity(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    console.warn("Skipping due to vector length mismatch.");
    return 0;
  }

  const dotProduct = vec1.reduce((sum, v, i) => sum + v * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, v) => sum + v * v, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, v) => sum + v * v, 0));

  return dotProduct / (magnitude1 * magnitude2 + 1e-8);
}

// POST handler for the embeddings API
export async function POST(req) {
  try {
    const { text, query, topK = 5 } = await req.json();
    if (!text && !query) {
      return NextResponse.json(
        { error: "Text or query is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const embedder = await pipeline(
      "feature-extraction",
      "sentence-transformers/all-MiniLM-L6-v2"
    );

    if (text) {
      const embeddings = await embedder(text, {
        pooling: "mean",
        normalize: true,
      });
      const vector = Array.isArray(embeddings[0])
        ? embeddings[0]
        : Array.from(embeddings[0]);

      const savedEmbedding = await Embedding.create({ text, vector });
      return NextResponse.json(
        { success: true, data: savedEmbedding },
        { status: 201 }
      );
    }

    if (query) {
      const queryEmbedding = await embedder(query, {
        pooling: "mean",
        normalize: true,
      });
      const queryVector = Array.isArray(queryEmbedding[0])
        ? queryEmbedding[0]
        : Array.from(queryEmbedding[0]);

      const storedEmbeddings = await Embedding.find();

      const results = storedEmbeddings
        .map((doc) => {
          const score = cosineSimilarity(queryVector, doc.vector);
          return {
            text: doc.text,
            score: isNaN(score) ? 0 : score,
          };
        })
        .filter((result) => result.score > 0); // Filter out zero scores

      results.sort((a, b) => b.score - a.score);
      const topResults = results.slice(0, topK);

      return NextResponse.json(
        { success: true, results: topResults },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error performing similarity search:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
