import { useState } from "react";
import { localizeMonument, type Monument360 } from "../monuments360";
import { usePageText } from "../../i18n/page";
import { virtual360Text } from "../../i18n/pages/virtual360";

type CategoryKey = "catAll" | "catTemples" | "catForts" | "catPalaces" | "catMonuments";

interface Monument360CardProps {
  monument: Monument360;
}

export default function Monument360Card({
  monument: source,
}: Monument360CardProps) {
  const [show360, setShow360] = useState(false);
  const { t, lang, dir } = usePageText(virtual360Text);
  // Localizing is idempotent (keyed by id), so passing an already-localized monument is fine.
  const monument = localizeMonument(source, lang);
  const location = t("location", { city: monument.city, state: monument.state });
  const categoryLabel = t(`cat${monument.category}` as CategoryKey);

  return (
    <>
      <article className="group overflow-hidden rounded-xl bg-white card-shadow stitch-border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        {/* Monument Image */}
        <div className="relative aspect-4/3 overflow-hidden bg-parchment">
          <img
            src={monument.image}
            alt={t("imageAlt", { name: monument.name, city: monument.city })}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* 360° Badge */}
          <div className="absolute left-4 top-4 rounded-full bg-ink/90 px-3 py-1.5 text-xs font-semibold tracking-wide text-white">
            {t("badge360")}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-turmeric">
              {categoryLabel}
            </span>
          </div>

          <h3 className="font-serif text-2xl text-maroon">
            {monument.name}
          </h3>

          <p className="mt-1 text-sm font-medium text-ink/60">
            {location}
          </p>

          <p className="mt-3 text-sm leading-6 text-ink/75">
            {monument.shortDescription}
          </p>

          {/* Explore Button */}
          <button
            type="button"
            onClick={() => setShow360(true)}
            disabled={!monument.google360Url}
            aria-label={
              monument.google360Url
                ? t("exploreAria", { name: monument.name })
                : undefined
            }
            className="mt-5 w-full rounded-lg bg-terracotta px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-maroon disabled:cursor-not-allowed disabled:opacity-50"
          >
            {monument.google360Url
              ? t("explore360")
              : t("comingSoon")}
          </button>
        </div>
      </article>

      {/* 360° Viewer Modal */}
      {show360 && monument.google360Url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t("dialogAria", { name: monument.name })}
          lang={lang}
          dir={dir}
          onClick={() => setShow360(false)}
        >
          <div
            className="relative w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-maroon/10 px-5 py-4">
              <div>
                <h2 className="font-serif text-2xl text-maroon">
                  {monument.name}
                </h2>
                <p className="text-sm text-ink/60">
                  {location}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShow360(false)}
                className="rounded-lg px-3 py-2 text-xl font-semibold text-ink/60 transition hover:bg-parchment hover:text-maroon"
                aria-label={t("closeViewer")}
              >
                ×
              </button>
            </div>

            <div className="aspect-video w-full bg-black">
              <iframe
                src={monument.google360Url}
                title={t("iframeTitle", { name: monument.name })}
                className="h-full w-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
