import { useNavigate } from "react-router";
import { usePageText } from "../i18n/page";
import { tourGuideText } from "../i18n/pages/tourGuide";
import virtualTourImg from "./assets/virtual_tour.png";
import arWalkImg from "./assets/ar-walk.png";

export default function TourGuidePage() {
  const navigate = useNavigate();
  const { t, dir } = usePageText(tourGuideText);

  return (
    <main dir={dir} className="min-h-screen bg-parchment px-6 py-12 md:px-10 lg:px-16">
      <div className="mx-auto max-w-1500px">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-serif text-4xl uppercase tracking-wide text-maroon md:text-5xl">
            {t("title")}
          </h1>

          <p className="mt-2 text-base text-ink/80 md:text-lg">
            {t("subtitle")}
          </p>
        </div>

        {/* Tour Options */}
        <div className="mt-10 grid min-h-[65vh] gap-6 md:grid-cols-2">
          
          {/* Virtual Tour */}
          <article
            className="group relative min-h-[65vh] overflow-hidden rounded-2xl border border-maroon/20 bg-ink bg-cover bg-center shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            style={{
              backgroundImage: `url(${virtualTourImg})`,
            }}
          >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />

            <div className="relative flex h-full min-h-[65vh] flex-col justify-end p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-white">
                ◯ {t("virtualTitle")}
              </p>

              <p className="mt-2 max-w-sm text-sm leading-5 text-white/90">
                {t("virtualDesc")}
              </p>

              <button
                type="button"
                onClick={() => navigate("/virtual-heritage")}
                className="mt-5 w-fit rounded-md bg-terracotta px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-maroon"
              >
                {t("explore")}
              </button>
            </div>
          </article>

          {/* AR Walk */}
          <article
            className="group relative min-h-[65vh] overflow-hidden rounded-2xl border border-maroon/20 bg-ink bg-cover bg-center shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            style={{
              backgroundImage: `url(${arWalkImg})`,
            }}
          >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />

            <div className="relative flex h-full min-h-[330px] flex-col justify-end p-7">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-white">
                ◯ {t("arTitle")}
              </p>

              <p className="mt-2 max-w-sm text-sm leading-5 text-white/90">
                {t("arDesc")}
              </p>

              <button
                type="button"
                onClick={() => navigate("/ar-walk")}
                className="mt-5 w-fit rounded-md border border-turmeric/70 bg-maroon px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-terracotta"
              >
                {t("startAr")}
              </button>
            </div>
          </article>

        </div>
      </div>
    </main>
  );
}