import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import usImage from "../assets/us.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Alles Liebe zum Geburtstag, Lebrana" },
      {
        name: "description",
        content: "Eine interaktive Geburtstagskarte für Lebrana — mit Puzzle, Liebesbrief und Musik.",
      },
      { property: "og:title", content: "Alles Liebe zum Geburtstag, Lebrana" },
      {
        property: "og:description",
        content: "Eine interaktive Geburtstagskarte in Burgunderrot — mit Puzzle, Liebesbrief und Musik.",
      },
    ],
  }),
  component: Index,
});

const poems = [
  {
    title: "Für Lebrana",
    body: `In deinen Augen wohnt ein stiller Morgen,
in deinem Lächeln tanzt das ganze Licht.
Ich hab kein Wort für diese sanften Sorgen —
nur dieses eine: ohne dich geht's nicht.`,
  },
  {
    title: "Burgunder",
    body: `Wie Wein, der langsam in den Gläsern kreist,
so tief, so warm, so ruhig ist mein Halten.
Du bist die Farbe, die mein Herz umkreist —
ein Rot, in dem die Zeit sich sanft entfalten.`,
  },
  {
    title: "Für immer",
    body: `Wenn Sterne fallen, fang ich sie für dich,
wenn Regen kommt, dann trag ich dir den Schirm.
Und wenn die Welt einmal vergisst, wer ich —
dann weißt du: ich bin dein, in jedem Sturm.`,
  },
  {
    title: "Heute",
    body: `Heute ist dein Tag, mein liebster Stern,
ein Jahr voll Liebe, das dir leise klingt.
Ich hab dich nah, ich hab dich niemals fern —
solang mein Herz für dich, nur für dich singt.`,
  },
];

function Index() {
  const [solved, setSolved] = useState(false);

  return (
    <main className="min-h-screen bg-background text-foreground">
      {!solved ? (
        <PuzzleCaptcha onSolved={() => setSolved(true)} />
      ) : (
        <LoveLetter />
      )}
    </main>
  );
}

/* ---------------- Puzzle Captcha ---------------- */

function PuzzleCaptcha({ onSolved }: { onSolved: () => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);
  const pieceSize = 64;
  const targetXRef = useRef(0);
  const maxXRef = useRef(0);

  // Choose a random target position for the puzzle notch (within the image)
  const [targetX] = useState(() => 180 + Math.floor(Math.random() * 120));

  useEffect(() => {
    targetXRef.current = targetX;
  }, [targetX]);

  const startDrag = (clientX: number) => {
    if (done) return;
    setDragging(true);
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    maxXRef.current = rect.width - pieceSize;
    const move = (cx: number) => {
      const newX = Math.max(0, Math.min(maxXRef.current, cx - rect.left - pieceSize / 2));
      setX(newX);
    };
    move(clientX);

    const onMove = (e: MouseEvent | TouchEvent) => {
      const cx = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      move(cx);
    };
    const onUp = () => {
      setDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
      // Check success on release
      setX((current) => {
        if (Math.abs(current - targetXRef.current) < 8) {
          setDone(true);
          setTimeout(() => onSolved(), 900);
          return targetXRef.current;
        }
        // Snap back
        return 0;
      });
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-primary/70">Sicherheitsprüfung</p>
          <h1 className="mt-2 font-serif text-3xl italic text-foreground">
            Beweise, dass du Lebrana bist
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Schiebe das Puzzlestück an die richtige Stelle
          </p>
        </div>

        {/* Puzzle canvas */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card shadow-[0_20px_60px_-15px_hsl(var(--primary-shadow))]">
          <div className="relative h-72 w-full">
            <img
              src={usImage}
              alt="Wir"
              className="absolute inset-0 h-full w-full object-cover"
              width={768}
              height={1024}
            />
            {/* Target hole */}
            <div
              className="absolute top-1/2 -translate-y-1/2 rounded-lg bg-background/70 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)] backdrop-blur-[2px]"
              style={{
                width: pieceSize,
                height: pieceSize,
                left: targetX,
              }}
            />
            {/* Sliding piece */}
            <div
              className="absolute top-1/2 -translate-y-1/2 overflow-hidden rounded-lg border-2 border-primary shadow-[0_6px_20px_rgba(0,0,0,0.5)] transition-transform"
              style={{
                width: pieceSize,
                height: pieceSize,
                transform: `translate(${x}px, -50%)`,
                transitionDuration: dragging ? "0ms" : "300ms",
              }}
            >
              <img
                src={usImage}
                alt=""
                className="absolute h-72 max-w-none"
                style={{
                  left: -targetX,
                  top: `calc(-50% + 32px)`,
                  width: "100%",
                  height: "18rem",
                  objectFit: "cover",
                }}
              />
            </div>
            {done && (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/40 backdrop-blur-sm">
                <p className="font-serif text-2xl italic text-primary-foreground">
                  ✓ Willkommen, Liebste
                </p>
              </div>
            )}
          </div>

          {/* Slider track */}
          <div
            ref={trackRef}
            className="relative h-14 select-none border-t border-primary/30 bg-secondary"
          >
            <div
              className="absolute inset-y-0 left-0 bg-primary/30"
              style={{ width: x + pieceSize / 2 }}
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {done ? "Geöffnet" : "→ Ziehen zum Freischalten"}
            </div>
            <div
              role="slider"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round((x / (maxXRef.current || 1)) * 100)}
              onMouseDown={(e) => startDrag(e.clientX)}
              onTouchStart={(e) => startDrag(e.touches[0].clientX)}
              className="absolute top-1/2 flex h-12 w-14 -translate-y-1/2 cursor-grab items-center justify-center rounded-md bg-primary text-primary-foreground shadow-lg active:cursor-grabbing"
              style={{ left: x }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Nur für die einzige Lebrana ♥
        </p>
      </div>
    </div>
  );
}

/* ---------------- Love Letter ---------------- */

function LoveLetter() {
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setOpened(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-12">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,hsl(var(--primary-glow)/0.25),transparent_50%),radial-gradient(circle_at_80%_90%,hsl(var(--primary-glow)/0.2),transparent_50%)]" />
      <FloatingHearts />

      {/* Autoplay Mamma Mia — hidden YouTube iframe (user gesture in captcha allows audio) */}
      <iframe
        title="Mamma Mia — ABBA"
        src="https://www.youtube.com/embed/unfzfe8f9NI?autoplay=1&loop=1&playlist=unfzfe8f9NI"
        allow="autoplay; encrypted-media"
        className="pointer-events-none absolute -z-10 h-1 w-1 opacity-0"
      />

      <div className="relative mx-auto max-w-2xl">
        <div
          className={`transition-all duration-1000 ${
            opened ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"
          }`}
        >
          {/* Envelope flap */}
          <div className="relative">
            <div
              className={`mx-auto h-32 origin-bottom transition-transform duration-1000 ease-out ${
                opened ? "[transform:rotateX(180deg)]" : ""
              }`}
              style={{
                width: "100%",
                background:
                  "linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(var(--primary-deep)) 100%)",
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                transformStyle: "preserve-3d",
              }}
            />
          </div>

          {/* Letter body */}
          <article
            className={`relative -mt-6 rounded-b-3xl border border-primary/30 bg-card px-6 py-10 shadow-[0_30px_80px_-20px_hsl(var(--primary-shadow))] transition-all duration-1000 sm:px-12 ${
              opened ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
            style={{
              backgroundImage:
                "linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--card)) 60%, hsl(var(--secondary)) 100%)",
            }}
          >
            <header className="text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-primary/70">
                Ein Brief für dich
              </p>
              <h1 className="mt-3 font-serif text-4xl italic leading-tight text-primary sm:text-5xl">
                Alles Liebe, Lebrana
              </h1>
              <div className="mx-auto mt-4 h-px w-24 bg-primary/40" />
            </header>

            <p className="mt-8 text-center font-serif text-lg italic text-foreground/90">
              An dem Tag, an dem du geboren wurdest, wurde die Welt heimlich schöner.
              Heute schreibe ich dir, was mein Herz das ganze Jahr flüstert.
            </p>

            <div className="mt-10 space-y-10">
              {poems.map((p, i) => (
                <section
                  key={p.title}
                  className="relative"
                  style={{
                    animation: opened
                      ? `fadeUp 800ms ${400 + i * 300}ms both cubic-bezier(0.22,1,0.36,1)`
                      : undefined,
                  }}
                >
                  <h2 className="font-serif text-2xl italic text-primary">
                    {p.title}
                  </h2>
                  <p className="mt-3 whitespace-pre-line font-serif text-lg leading-relaxed text-foreground/90">
                    {p.body}
                  </p>
                </section>
              ))}
            </div>

            <footer className="mt-12 border-t border-primary/20 pt-6 text-center">
              <p className="font-serif text-xl italic text-primary">
                Für immer dein ♥
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Happy Birthday · Mamma Mia
              </p>
            </footer>
          </article>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function FloatingHearts() {
  const hearts = Array.from({ length: 14 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {hearts.map((_, i) => {
        const left = (i * 7.3) % 100;
        const delay = (i * 0.7) % 8;
        const duration = 10 + (i % 5) * 2;
        const size = 10 + (i % 4) * 6;
        return (
          <span
            key={i}
            className="absolute bottom-[-40px] text-primary/60"
            style={{
              left: `${left}%`,
              fontSize: size,
              animation: `rise ${duration}s ${delay}s linear infinite`,
            }}
          >
            ♥
          </span>
        );
      })}
      <style>{`
        @keyframes rise {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
