import React from "react";
import { CATEGORIES } from "../data/categories";

export default function FilterChips({ activeCategory, onChange }) {
  return (
    <div className="filter-chips">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          className={`filter-chip ${activeCategory === cat.id ? "filter-chip--active" : ""}`}
          style={
            activeCategory === cat.id
              ? { backgroundColor: cat.id === "All" ? "#7a1f33" : cat.color, borderColor: "transparent" }
              : undefined
          }
          onClick={() => onChange(cat.id)}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
