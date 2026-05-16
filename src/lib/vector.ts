import { pipeline } from "@xenova/transformers";

let extractor: any;

export async function getEmbedding(text: string) {
  if (!extractor) {
    extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }

  const output = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
}
export function cosineSimilarity(
  vecA: number[],
  vecB: number[]
) {
  let dotProduct = 0;

  let normA = 0;

  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];

    normA += vecA[i] * vecA[i];

    normB += vecB[i] * vecB[i];
  }

  return (
    dotProduct /
    (Math.sqrt(normA) * Math.sqrt(normB))
  );
}