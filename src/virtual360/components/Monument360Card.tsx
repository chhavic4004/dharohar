import type { Monument360 } from "../monuments360";

interface Monument360CardProps {
  monument: Monument360;
}

export default function Monument360Card({
  monument,
}: Monument360CardProps) {
  const handleExplore = () => {
    if (!monument.google360Url) return;

    window.open(
      monument.google360Url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <article className="group overflow-hidden rounded-xl bg-white card-shadow stitch-border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Monument Image */}
      <div className="relative aspect-4/3 overflow-hidden bg-parchment">
        <img
          src={monument.image}
          alt={monument.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* 360° Badge */}
        <div className="absolute left-4 top-4 rounded-full bg-ink/90 px-3 py-1.5 text-xs font-semibold tracking-wide text-white">
          360° VIEW
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-turmeric">
            {monument.category}
          </span>
        </div>

        <h3 className="font-serif text-2xl text-maroon">
          {monument.name}
        </h3>

        <p className="mt-1 text-sm font-medium text-ink/60">
          {monument.city}, {monument.state}
        </p>

        <p className="mt-3 text-sm leading-6 text-ink/75">
          {monument.shortDescription}
        </p>

        {/* Explore Button */}
        <button
          type="button"
          onClick={handleExplore}
          disabled={!monument.google360Url}
          className="mt-5 w-full rounded-lg bg-terracotta px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-maroon disabled:cursor-not-allowed disabled:opacity-50"
        >
          {monument.google360Url
            ? "Explore 360°"
            : "360° Coming Soon"}
        </button>
      </div>
    </article>
  );
}