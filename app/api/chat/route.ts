import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Embedding from "@/models/embedding";
import { pipeline } from "@huggingface/transformers";

/**
 * Computes cosine similarity between two vectors.
 * @param {number[]} vec1
 * @param {number[]} vec2
 * @returns {number} Cosine similarity
 */
function cosineSimilarity(vec1: number[], vec2: number[]) {
  if (vec1.length !== vec2.length) {
    console.warn("Skipping due to vector length mismatch.");
    return 0;
  }

  const dotProduct = vec1.reduce(
    (sum: number, v: number, i: number) => sum + v * vec2[i],
    0
  );
  const magnitude1 = Math.sqrt(
    vec1.reduce((sum: number, v: number) => sum + v * v, 0)
  );
  const magnitude2 = Math.sqrt(
    vec2.reduce((sum: number, v: number) => sum + v * v, 0)
  );

  return dotProduct / (magnitude1 * magnitude2 + 1e-8);
}

/**
 * POST handler to fetch stored embeddings and pass them to the LLM along with user data.
 */
export async function POST(req: NextRequest) {
  try {
    const { prompt, topK = 10 } = await req.json(); // Using req.json() from NextRequest

    if (!prompt) {
      return NextResponse.json(
        { error: "User data (prompt) is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Use Huggingface pipeline to generate the embedding for the prompt
    const embedder = await pipeline(
      "feature-extraction",
      "sentence-transformers/all-MiniLM-L6-v2"
    );

    // Generate query embedding
    const queryEmbedding = await embedder(prompt, {
      pooling: "mean",
      normalize: true,
    });

    const queryVector = Array.isArray(queryEmbedding)
      ? queryEmbedding[0]
      : Array.from(queryEmbedding);

    // Retrieve stored embeddings from MongoDB
    const storedEmbeddings = await Embedding.find();

    // Find the most similar content using cosine similarity
    const results = storedEmbeddings
      .map((doc) => {
        const score = cosineSimilarity(queryVector, doc.vector);
        return {
          text: doc.text,
          score: isNaN(score) ? 0 : score,
        };
      })
      .filter((result) => result.score > 0); // Filter out zero scores

    // Sort and get the top K results
    results.sort((a, b) => b.score - a.score);
    const topResults = results.slice(0, topK);

    // Prepare the request payload for the LLM
    const llmPayload = {
      stream: "false",
      temperature: 0.6,
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content: `Provide the user with appropriately formatted Markdown and short, concise.`,
        },
        {
          role: "user",
          content:
            `Question: ${prompt}. Context for their question: ${JSON.stringify(
              topResults
            )}`.slice(0, 131_000),
        },
      ],
    };

    const llmResponse = await fetch(
      "https://llm.aryanranderiya1478.workers.dev/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(llmPayload),
      }
    );

    if (!llmResponse.ok) {
      throw new Error(`LLM Error: ${llmResponse.statusText}`);
    }

    const llmData = await llmResponse.json();

    return NextResponse.json(
      { success: true, llmResponse: llmData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error performing similarity search:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
