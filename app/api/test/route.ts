import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Embedding from "@/models/Embedding";
import { pipeline } from "@huggingface/transformers";
import fs from "fs/promises";
import path from "path";

// Function to chunk text into smaller parts based on the max token limit
function chunkText(text: string, maxTokens: number) {
  const words = text.split(" "); // Split text into words
  const chunks = [];
  let currentChunk = "";

  for (const word of words) {
    // If adding the word exceeds maxTokens, start a new chunk
    if ((`${currentChunk} ` + word).length > maxTokens) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = word; // Start a new chunk with the current word
    } else {
      currentChunk += ` ${word}`;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.trim()); // Add the last chunk
  }

  return chunks;
}

// Function to process and generate embeddings
async function loadAndProcessJSON() {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Adjust the path to point to the root of the project
    const filePath = path.resolve(process.cwd(), "public", "sections.json");

    // Load JSON data
    const fileContent = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent);

    // Initialize the embedding model
    const embedder = await pipeline(
      "feature-extraction",
      "sentence-transformers/all-MiniLM-L6-v2"
    );

    // Define the max number of tokens per chunk (adjust this based on model's limit)
    const maxTokens = 512; // Example max tokens per chunk (adjust according to model limit)

    // Process each section and save to MongoDB
    for (const section of data) {
      const header = section.header;
      const contentText = section.content
        .map((c: { text: string }) => c.text)
        .join(" ");
      console.log(`Processing: ${header}`);

      // Chunk the content text into smaller parts
      const contentChunks = chunkText(contentText, maxTokens - header.length);

      // Add the header to each chunk
      const chunksWithHeader = contentChunks.map(
        (chunk) => `${header} ${chunk}`
      );

      console.log(`Total chunks for "${header}": ${chunksWithHeader.length}`);

      // Process each chunk with header included
      for (const chunk of chunksWithHeader) {
        // Generate embeddings for each chunk
        const embeddings = await embedder(chunk, {
          pooling: "mean",
          normalize: true,
        });

        // Flatten the embedding tensor
        const vector = Array.isArray(embeddings)
          ? embeddings[0]
          : Array.from(embeddings);

        // Save the embedding and text to MongoDB
        await Embedding.create({
          text: chunk, // Save the chunk text
          vector, // Save the vector for this chunk
        });
      }
    }

    console.log("Data upload complete.");
  } catch (error) {
    console.error("Error during processing:", error);
    throw error;
  }
}

// POST handler for the embeddings API
export const GET = async () => {
  try {
    await loadAndProcessJSON();
    // Return the stored data
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error generating embeddings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
