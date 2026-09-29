import { useEffect, useRef, useState, type FormEvent } from "react";
import { Camera, CameraOff, Info, ScanLine } from "lucide-react";
import { Modal } from "./Modal";
import { usePassportText } from "./usePassportText";

/** Minimal typing for the Shape Detection API (Chrome/Edge/Android). */
interface DetectedBarcode {
  rawValue: string;
}
interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>;
}
type BarcodeDetectorCtor = new (opts?: { formats?: string[] }) => BarcodeDetectorLike;

function getDetectorCtor(): BarcodeDetectorCtor | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
}

interface ScanModalProps {
  open: boolean;
  onClose: () => void;
  onResult: (raw: string) => void;
}

export function ScanModal({ open, onClose, onResult }: ScanModalProps) {
  const { t, dir } = usePassportText();
  const [camera, setCamera] = useState<"off" | "on" | "denied">("off");
  const [manual, setManual] = useState("");
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const supported = !!getDetectorCtor() && typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

  const stop = () => {
    stream.current?.getTracks().forEach((tr) => tr.stop());
    stream.current = null;
    setCamera((c) => (c === "on" ? "off" : c));
  };

  // Always release the camera when the dialog closes or unmounts.
  useEffect(() => {
    if (!open) {
      stream.current?.getTracks().forEach((tr) => tr.stop());
      stream.current = null;
      setCamera("off");
      setManual("");
    }
    return () => {
      stream.current?.getTracks().forEach((tr) => tr.stop());
      stream.current = null;
    };
  }, [open]);

  // Attach the stream once the <video> is rendered.
  useEffect(() => {
    const v = video.current;
    if (camera === "on" && v && stream.current && v.srcObject !== stream.current) {
      v.srcObject = stream.current;
      void v.play().catch(() => undefined);
    }
  }, [camera]);

  // Detection loop while the camera is live.
  useEffect(() => {
    if (camera !== "on") return;
    const Ctor = getDetectorCtor();
    if (!Ctor) return;
    const detector = new Ctor({ formats: ["qr_code"] });
    let cancelled = false;
    const tick = async () => {
      const v = video.current;
      if (cancelled || !v) return;
      if (v.readyState >= 2) {
        try {
          const found = await detector.detect(v);
          if (!cancelled && found.length > 0 && found[0].rawValue) {
            onResult(found[0].rawValue);
            return;
          }
        } catch {
          /* frame not ready; try again */
        }
      }
      if (!cancelled) timer = window.setTimeout(tick, 350);
    };
    let timer = window.setTimeout(tick, 350);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [camera, onResult]);

  const start = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      stream.current = s;
      setCamera("on");
    } catch {
      setCamera("denied");
    }
  };

  const submitManual = (e: FormEvent) => {
    e.preventDefault();
    if (manual.trim()) onResult(manual);
  };

  return (
    <Modal open={open} onClose={onClose} title={t("scanTitle")} titleId="passport-scan-title" description={t("scanDesc")} closeLabel={t("close")} dir={dir}>
      {supported ? (
        <div className="space-y-4">
          <div className="relative aspect-square sm:aspect-video rounded-xl overflow-hidden bg-ink flex items-center justify-center">
            {camera === "on" ? (
              <>
                <video ref={video} aria-label={t("videoLabel")} className="absolute inset-0 w-full h-full object-cover" muted playsInline />
                <div className="absolute inset-8 border-2 border-turmeric rounded-lg pointer-events-none" aria-hidden="true">
                  <div className="absolute inset-x-0 top-1/2 h-0.5 bg-turmeric/80 animate-pulse" />
                </div>
                <p role="status" className="absolute bottom-3 inset-x-0 text-center text-xs text-white/90">
                  {t("scanning")}
                </p>
              </>
            ) : (
              <ScanLine className="w-16 h-16 text-white/30" aria-hidden="true" />
            )}
          </div>
          {camera === "denied" && (
            <p role="alert" className="flex gap-2 text-sm text-alert bg-alert/10 border border-alert/20 rounded-lg p-3">
              <Info className="w-4 h-4 shrink-0 mt-0.5" /> {t("scanDenied")}
            </p>
          )}
          <button
            type="button"
            data-autofocus
            onClick={camera === "on" ? stop : start}
            className="w-full bg-terracotta text-white py-2.5 rounded-lg font-medium hover:bg-maroon transition-colors flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-terracotta"
          >
            {camera === "on" ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            {camera === "on" ? t("scanStop") : t("scanStart")}
          </button>
        </div>
      ) : (
        <p className="flex gap-2 text-sm text-ink/80 bg-turmeric/10 border border-turmeric/30 rounded-lg p-3">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-turmeric" /> {t("scanUnsupported")}
        </p>
      )}

      <form onSubmit={submitManual} className="mt-5 pt-5 border-t border-maroon/10">
        <label htmlFor="passport-scan-manual" className="block text-sm font-medium text-ink mb-2">
          {t("scanManual")}
        </label>
        <div className="flex gap-2">
          <input
            id="passport-scan-manual"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder={t("searchPlaceholder")}
            autoComplete="off"
            spellCheck={false}
            dir="ltr"
            {...(supported ? {} : { "data-autofocus": true })}
            className="flex-1 min-w-0 rounded-lg border border-maroon/25 bg-parchment/40 px-3 py-2.5 font-mono text-sm uppercase placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-terracotta"
          />
          <button type="submit" className="shrink-0 px-4 rounded-lg bg-maroon text-white text-sm font-medium hover:bg-terracotta transition-colors">
            {t("verifyBtn")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
