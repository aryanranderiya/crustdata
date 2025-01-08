import { pipeline } from "@huggingface/transformers";

export async function GET() {
  try {
    const extractor = await pipeline(
      "feature-extraction",
      "sentence-transformers/bert-large-nli-mean-tokens"
    );

    const sentences = ["hey buddies"];

    // Perform feature extraction
    const output = await extractor(sentences, {
      pooling: "mean",
      normalize: true,
    });

    // // Combine sentences with their embeddings
    // const result = sentences.map((sentence, index) => ({
    //   sentence: sentence,
    //   embedding: output[index], // This will be the vector for the current sentence
    // }));

    return new Response(JSON.stringify(output), { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return new Response("Error generating embeddings", { status: 500 });
  }
}
