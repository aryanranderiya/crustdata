import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Embedding from "@/models/Embedding";
import { pipeline } from "@huggingface/transformers";
import fs from "fs/promises";
import path from "path";

export async function loadAndProcessJSON() {
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

    // Process each section and save to MongoDB
    for (const section of data) {
      const text =
        `${section.header} ` + section.content.map((c) => c.text).join(" ");
      console.log(`Processing: ${section.header}`);

      // Generate embeddings
      const embeddings = await embedder(text, {
        pooling: "mean",
        normalize: true,
      });

      // Flatten embeddings
      const vector = Array.isArray(embeddings)
        ? embeddings[0]
        : Array.from(embeddings[0]);

      // Save to MongoDB
      await Embedding.create({ text, vector });
    }

    console.log("Data upload complete.");
  } catch (error) {
    console.error("Error during processing:", error);
  }
}

// POST handler for the embeddings API
export async function GET(req) {
  try {
    loadAndProcessJSON();
    // Return the stored data
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error generating embeddings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
