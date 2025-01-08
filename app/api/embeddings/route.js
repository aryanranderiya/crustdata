import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Embedding from "@/models/Embedding";
import { pipeline } from "@huggingface/transformers";

// POST handler for the embeddings API
export async function POST(req) {
  try {
    // Parse the request body
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Connect to MongoDB
    await connectToDatabase();

    // Load the transformer model
    const embedder = await pipeline(
      "feature-extraction",
      "sentence-transformers/all-MiniLM-L6-v2"
    );

    // Generate embedding for the entire text
    const embeddings = await embedder(text, {
      pooling: "mean",
      normalize: true,
    });

    // Flatten the embedding tensor properly
    const vector = Array.isArray(embeddings)
      ? embeddings[0]
      : Array.from(embeddings[0]);

    // Save embedding and text to MongoDB
    const savedEmbedding = await Embedding.create({ text, vector });

    // Return the stored data
    return NextResponse.json(
      { success: true, data: savedEmbedding },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error generating embeddings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
