
import { heritageData } from "../heritage-knowledge/heritage-data.js";

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 2);
}

export function searchHeritage(question, monumentId = "general") {
  const questionWords = new Set(normalize(question));

  const results = [];

  for (const item of heritageData) {
    const isSelected =
      monumentId !== "general" && item.id === monumentId;

    const searchableText = [
      item.name,
      item.category,
      item.region,
      ...(item.topics || []),
      ...(item.facts || [])
    ].join(" ");

    const words = normalize(searchableText);
    const uniqueWords = new Set(words);

    let score = 0;

    for (const word of questionWords) {
      if (uniqueWords.has(word)) {
        score += 1;
      }
    }

    // Give a small preference to the selected place.
    if (isSelected) {
      score += 2;
    }

    if (score > 0) {
      results.push({
        id: item.id,
        name: item.name,
        score,
        facts: item.facts
      });
    }
  }

  results.sort((a, b) => b.score - a.score);

  return results.slice(0, 3);
}