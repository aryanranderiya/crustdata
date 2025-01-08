import mongoose from "mongoose";

const EmbeddingSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    vector: { type: [Number], required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Embedding ||
  mongoose.model("Embedding", EmbeddingSchema);
