import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sentence_transformers import SentenceTransformer
import numpy as np

# Load the file
with open("sections.json", "r", encoding="utf-8") as file:
    data = json.load(file)

# Initialize embedding model
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# Preprocess the data
processed_data = []
for section in data:
    header = section.get("header", "")
    print(header)
    content = " ".join([item["text"] for item in section.get("content", [])])
    if content.strip():
        # Embed the chunk
        embedding = embedding_model.encode(content)
        processed_data.append(
            {"header": header, "content": content, "embedding": embedding.tolist()}
        )

# Save processed data
with open("processed_data.json", "w", encoding="utf-8") as outfile:
    json.dump(processed_data, outfile, ensure_ascii=False, indent=4)

print("Preprocessing complete.")
