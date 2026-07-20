import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import lockBg from "../assets/lockscreen-bg.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Happy Birthday, Nabila" },
      {
        name: "description",
        content: "Eine interaktive Geburtstagskarte für Nabila.",
      },
    ],
  }),
  component: Index,
});

type Stage = "lock" | "quiz" | "celebrate" | "letter" | "video";

function Index() {
  const [stage, setStage] = useState<Stage>("lock");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Start music once we leave the quiz (celebrate onwards)
  useEffect(() => {
    if (stage === "celebrate" || stage === "letter") {
      const a = audioRef.current;
      if (a) {
        a.volume = 0.25;
        a.play().catch(() => {});
      }
    }
    if (stage === "video") {
      // pause background music during video
      audioRef.current?.pause();
    }
  }, [stage]);

  return (
    <main className="min-h-screen bg-black text-foreground">
      {/* Hidden background audio – replace /music/ilysb.mp3 on GitHub */}
      <audio ref={audioRef} src="/music/ilysb.mp3" loop preload="auto" />

      {stage === "lock" && <LockScreen onUnlock={() => setStage("quiz")} />}
      {stage === "quiz" && <MathQuiz onSolved={() => setStage("celebrate")} />}
      {stage === "celebrate" && (
        <Celebration onContinue={() => setStage("letter")} />
      )}
      {stage === "letter" && (
        <Letter onPlayVideo={() => setStage("video")} audioRef={audioRef} />
      )}
      {stage === "video" && <FullscreenVideo onEnd={() => setStage("letter")} />}
    </main>
  );
}

/* ---------------- 1. iPhone Lock Screen ---------------- */

function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const knob = 56;

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setTime(
        d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
      );
      setDate(
        d.toLocaleDateString("de-DE", {
          weekday: "long",
          day: "numeric",
          month: "long",
        }),
      );
    };
    update();
    const t = setInterval(update, 30_000);
    return () => clearInterval(t);
  }, []);

  const startDrag = (clientX: number) => {
    setDragging(true);
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const max = rect.width - knob - 8;

    const move = (cx: number) => {
      const nx = Math.max(0, Math.min(max, cx - rect.left - knob / 2));
      setX(nx);
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
      setX((cur) => {
        if (cur >= max - 8) {
          setTimeout(() => onUnlock(), 250);
          return max;
        }
        return 0;
      });
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);
  };

  return (
    <div
      className="relative mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-between overflow-hidden px-6 py-10 text-white"
      style={{
        backgroundImage: `url(${lockBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay for contrast */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/60" />

      {/* Status bar */}
      <div className="relative z-10 flex w-full items-center justify-between px-2 pt-1 text-xs font-semibold">
        <span>{time || "9:41"}</span>
        <div className="flex items-center gap-1">
          <span>•••</span>
          <span>􀙇</span>
          <span>100%</span>
        </div>
      </div>

      {/* Time & date */}
      <div className="relative z-10 mt-6 flex flex-col items-center">
        <p className="text-sm font-medium tracking-wide opacity-90">{date}</p>
        <p
          className="mt-1 text-[96px] font-thin leading-none tracking-tight"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {time || "9:41"}
        </p>
      </div>

      <div className="flex-1" />

      {/* Notification card — Liquid Glass */}
      <div className="liquid-glass relative z-10 mb-8 w-full rounded-2xl px-4 py-3">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-2xl bg-gradient-to-b from-white/25 to-transparent" />
        <div className="relative flex items-start gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-lg">
            ♥
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between">
              <p className="text-[13px] font-semibold">Für mein kleines baby</p>
              <p className="text-[11px] opacity-70">jetzt</p>
            </div>
            <p className="truncate text-[13px] opacity-95">
              bitte öffnen
            </p>
          </div>
        </div>
      </div>

      {/* Slide to unlock — Liquid Glass */}
      <div className="relative z-10 w-full pb-6">
        <div
          ref={trackRef}
          className="liquid-glass relative h-16 w-full overflow-hidden rounded-full"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/40 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 rounded-b-full bg-gradient-to-t from-white/10 to-transparent" />

          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-medium"
            style={{
              opacity: 1 - Math.min(1, x / 80),
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.35), rgba(255,255,255,0.95), rgba(255,255,255,0.35))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              animation: "shimmer 2.4s linear infinite",
            }}
          >
            zum Entsperren schieben
          </div>
          <div
            role="slider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
            onMouseDown={(e) => startDrag(e.clientX)}
            onTouchStart={(e) => startDrag(e.touches[0].clientX)}
            className="liquid-knob absolute top-1/2 flex h-14 w-14 -translate-y-1/2 cursor-grab items-center justify-center rounded-full active:cursor-grabbing"
            style={{
              left: 4 + x,
              transition: dragging ? "none" : "left 300ms ease",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
        .liquid-glass {
          background: linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06));
          backdrop-filter: blur(30px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.35);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.5),
            inset 0 -1px 0 rgba(255,255,255,0.1),
            0 10px 30px rgba(0,0,0,0.35);
        }
        .liquid-knob {
          background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.6));
          backdrop-filter: blur(20px) saturate(200%);
          border: 1px solid rgba(255,255,255,0.7);
          box-shadow:
            inset 0 1px 2px rgba(255,255,255,0.9),
            inset 0 -2px 4px rgba(0,0,0,0.15),
            0 6px 20px rgba(0,0,0,0.35);
          color: rgba(0,0,0,0.8);
        }
      `}</style>
    </div>
  );
}

/* ---------------- 2. Math Quiz ---------------- */

function MathQuiz({ onSolved }: { onSolved: () => void }) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [err, setErr] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (a.trim() === "12" && b.trim() === "4") {
      onSolved();
    } else {
      setErr(true);
      setTimeout(() => setErr(false), 600);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 py-10">
      <div className="w-full rounded-3xl border border-primary/30 bg-card/80 p-8 backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
        <p className="text-center text-xs uppercase tracking-[0.35em] text-primary/70">
          Verifizierung
        </p>
        <h1 className="mt-3 text-center font-serif text-3xl italic text-foreground">
          Bist du wirklich Lala?
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {"\n"}
        </p>

        <form
          onSubmit={submit}
          className={`mt-8 space-y-5 ${err ? "animate-shake" : ""}`}
        >
          <label className="block">
            <span className="mb-2 block text-center font-serif text-2xl italic text-foreground">
              4 + 8 ={"\u00a0"}
            </span>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              value={a}
              onChange={(e) => setA(e.target.value)}
              className="w-full rounded-xl border border-primary/30 bg-background/60 px-4 py-3 text-center text-2xl font-medium text-foreground outline-none focus:border-primary"
              placeholder="?"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-center font-serif text-2xl italic text-foreground">
              7 − 3 = ?
            </span>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              value={b}
              onChange={(e) => setB(e.target.value)}
              className="w-full rounded-xl border border-primary/30 bg-background/60 px-4 py-3 text-center text-2xl font-medium text-foreground outline-none focus:border-primary"
              placeholder="?"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-xl bg-primary py-3 font-medium text-primary-foreground shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Bestätigen
          </button>

          {err && (
            <p className="text-center text-sm text-destructive">
              Hmm… versuch es nochmal 🤍
            </p>
          )}
        </form>
      </div>

      <style>{`
        @keyframes shake {
          10%, 90% { transform: translateX(-2px); }
          20%, 80% { transform: translateX(4px); }
          30%, 50%, 70% { transform: translateX(-6px); }
          40%, 60% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 500ms both; }
      `}</style>
    </div>
  );
}

/* ---------------- 3. Celebration ---------------- */

function Celebration({ onContinue }: { onContinue: () => void }) {
  return (
    <div
      className="relative mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center overflow-hidden px-6 py-10 text-center"
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, rgba(138,30,44,0.35), transparent 60%), radial-gradient(ellipse at 50% 100%, rgba(90,18,32,0.5), transparent 70%), #0a0405",
      }}
    >
      <FallingPhotos />
      <FallingHearts />
      <Confetti />

      <div className="relative z-10">
        <p
          className="text-xs uppercase tracking-[0.5em] text-primary/70"
          style={{ animation: "fadeIn 800ms both" }}
        >
          Heute feiern wir dich
        </p>
        <p
          className="mt-4 text-6xl font-thin leading-none tracking-tight text-white drop-shadow-[0_4px_20px_rgba(201,74,91,0.6)]"
          style={{
            animation: "pop 900ms 200ms cubic-bezier(0.22,1,0.36,1) both",
            fontFamily: "var(--font-serif)",
          }}
        >
          Happy
        </p>
        <p
          className="mt-1 text-7xl italic leading-none tracking-tight text-primary drop-shadow-[0_4px_30px_rgba(201,74,91,0.8)]"
          style={{
            animation: "pop 900ms 500ms cubic-bezier(0.22,1,0.36,1) both",
            fontFamily: "var(--font-serif)",
          }}
        >
          Birthday
        </p>
        <p
          className="mt-4 font-serif text-2xl italic text-white/90"
          style={{ animation: "pop 900ms 850ms cubic-bezier(0.22,1,0.36,1) both" }}
        >
          to my baby ♥
        </p>
        <p
          className="mt-8 text-4xl"
          style={{ animation: "pop 900ms 1100ms cubic-bezier(0.22,1,0.36,1) both" }}
        >
          🤍🎂🤍
        </p>

        <button
          onClick={onContinue}
          className="mt-12 rounded-full bg-primary px-8 py-3 font-medium text-primary-foreground shadow-[0_10px_40px_-10px_rgba(201,74,91,0.9)] transition-transform hover:scale-105 active:scale-95"
          style={{ animation: "fadeIn 800ms 1600ms both" }}
        >
          Ein Brief für dich →
        </button>
      </div>

      <style>{`
        @keyframes pop {
          0% { opacity: 0; transform: scale(0.6); }
          60% { opacity: 1; transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  );
}

function FallingPhotos() {
  // Falling polaroids from top to bottom with hearts
  const items = Array.from({ length: 14 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((_, i) => {
        const left = (i * 7.3 + 3) % 95;
        const delay = (i * 0.6) % 7;
        const duration = 8 + (i % 5) * 1.5;
        const size = 60 + (i % 4) * 18;
        const rotate = (i * 47) % 40 - 20;
        const n = (i % PHOTO_COUNT) + 1;
        return (
          <div
            key={i}
            className="absolute -top-40"
            style={{
              left: `${left}%`,
              animation: `photoFall ${duration}s ${delay}s linear infinite`,
              transform: `rotate(${rotate}deg)`,
            }}
          >
            <FallingPolaroid n={n} size={size} />
          </div>
        );
      })}
      <style>{`
        @keyframes photoFall {
          0% { transform: translateY(-20vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(120vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function FallingPolaroid({ n, size }: { n: number; size: number }) {
  const [failed, setFailed] = useState(false);
  const h = size * 1.2;
  return (
    <div
      className="bg-white p-1.5 shadow-2xl"
      style={{ width: size + 12 }}
    >
      {failed ? (
        <div
          className="grid place-items-center text-[9px] uppercase tracking-widest text-primary/80"
          style={{
            width: size,
            height: h,
            background:
              "linear-gradient(135deg, rgba(201,74,91,0.35), rgba(60,20,10,0.6))",
          }}
        >
          Foto {n}
        </div>
      ) : (
        <img
          src={`/photos/${n}.jpg`}
          alt=""
          onError={() => setFailed(true)}
          style={{ width: size, height: h, objectFit: "cover", display: "block" }}
          loading="lazy"
        />
      )}
    </div>
  );
}

function FallingHearts() {
  const hearts = Array.from({ length: 20 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {hearts.map((_, i) => {
        const left = (i * 5.1 + 1) % 100;
        const delay = (i * 0.4) % 6;
        const duration = 6 + (i % 4) * 1.2;
        const size = 14 + (i % 5) * 8;
        return (
          <span
            key={i}
            className="absolute -top-10 text-primary"
            style={{
              left: `${left}%`,
              fontSize: size,
              animation: `heartFall ${duration}s ${delay}s linear infinite`,
              filter: "drop-shadow(0 0 8px rgba(201,74,91,0.6))",
            }}
          >
            ♥
          </span>
        );
      })}
      <style>{`
        @keyframes heartFall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(115vh) rotate(180deg); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

function Confetti() {
  const bits = Array.from({ length: 40 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {bits.map((_, i) => {
        const left = (i * 13) % 100;
        const delay = (i % 10) * 0.15;
        const duration = 3 + (i % 5);
        const size = 6 + (i % 4) * 3;
        const colors = ["#8a1e2c", "#c94a5b", "#f2c0c7", "#ffffff", "#5a1220"];
        const c = colors[i % colors.length];
        return (
          <span
            key={i}
            className="absolute -top-6 rounded-sm"
            style={{
              left: `${left}%`,
              width: size,
              height: size * 0.4,
              background: c,
              animation: `fall ${duration}s ${delay}s linear infinite`,
              transform: `rotate(${i * 37}deg)`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

function FloatingHearts() {
  const hearts = Array.from({ length: 12 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {hearts.map((_, i) => {
        const left = (i * 8.3) % 100;
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

/* ---------------- 4. Burnt Letter ---------------- */

const PHOTO_COUNT = 10;

function Letter({
  onPlayVideo,
  audioRef,
}: {
  onPlayVideo: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}) {
  const page1 = [
    "Mein Herz, heute gehört dieser Tag ganz dir.",
    "Ich liebe dich – mehr als jedes Wort es fassen kann.",
    "Danke, dass es dich gibt und dass du meins bist.",
    "Danke für dein Lachen, das jeden Tag heller macht.",
    "Danke für deine Wärme, die mich zuhause fühlen lässt.",
    "Für jedes stille Wir, für jedes laute Wir.",
    "Für jeden Blick, der alles sagt, ohne ein Wort.",
  ];
  const page2 = [
    "Du bist mein Ruhepol, mein Abenteuer, mein Zuhause.",
    "Ich bin so dankbar, an deiner Seite zu wachsen.",
    "Für alles, was war. Für alles, was ist.",
    "Und für alles, was noch kommen wird – mit dir.",
    "Du bist das Schönste, was mir passieren konnte.",
    "Happy Birthday, baby. Heute feiern wir dich.",
    "Für immer dein ♥",
  ];

  const [page, setPage] = useState<1 | 2>(1);
  const [flipping, setFlipping] = useState(false);

  const goNext = () => {
    if (flipping || page === 2) return;
    setFlipping(true);
    setTimeout(() => {
      setPage(2);
      setFlipping(false);
    }, 850);
  };
  const goPrev = () => {
    if (flipping || page === 1) return;
    setFlipping(true);
    setTimeout(() => {
      setPage(1);
      setFlipping(false);
    }, 850);
  };

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-md px-4 py-8">
      <FloatingHearts />

      {/* Book */}
      <div className="relative mx-auto mt-4 max-w-sm" style={{ perspective: "1600px" }}>
        <div className="relative">
          {/* Current page */}
          <LetterPage
            key={`p${page}`}
            title={page === 1 ? "Dear my baby," : "… für immer."}
            lines={page === 1 ? page1 : page2}
            showStamp={page === 1}
            showSignature={page === 2}
          />

          {/* Flipping overlay page */}
          {flipping && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                transformStyle: "preserve-3d",
                transformOrigin: page === 1 ? "left center" : "right center",
                animation: `pageFlip${page} 850ms cubic-bezier(0.65,0.05,0.36,1) both`,
              }}
            >
              <div
                className="absolute inset-0"
                style={{ backfaceVisibility: "hidden" }}
              >
                <LetterPage
                  title={page === 1 ? "Dear my baby," : "… für immer."}
                  lines={page === 1 ? page1 : page2}
                  showStamp={page === 1}
                  showSignature={page === 2}
                />
              </div>
              <div
                className="absolute inset-0"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <LetterPage
                  title={page === 1 ? "… für immer." : "Dear my baby,"}
                  lines={page === 1 ? page2 : page1}
                  showStamp={page !== 1}
                  showSignature={page === 1}
                />
              </div>
            </div>
          )}
        </div>

        {/* Page indicator + nav */}
        <div className="mt-6 flex items-center justify-between text-xs text-white/70">
          <button
            onClick={goPrev}
            disabled={page === 1 || flipping}
            className="rounded-full border border-white/20 bg-white/5 px-4 py-2 backdrop-blur transition disabled:opacity-30"
          >
            ← zurück
          </button>
          <span className="font-serif italic">Seite {page} / 2</span>
          <button
            onClick={goNext}
            disabled={page === 2 || flipping}
            className="rounded-full border border-primary/40 bg-primary/20 px-4 py-2 backdrop-blur transition disabled:opacity-30"
          >
            umblättern →
          </button>
        </div>
      </div>

      <PressMeButton onPlayVideo={onPlayVideo} />

      {/* Spotify-style vinyl bottom-left */}
      <VinylWidget audioRef={audioRef} />

      <style>{`
        @keyframes pageFlip1 {
          0%   { transform: rotateY(0deg); box-shadow: 0 0 0 rgba(0,0,0,0); }
          50%  { box-shadow: -30px 20px 60px rgba(0,0,0,0.5); }
          100% { transform: rotateY(-180deg); }
        }
        @keyframes pageFlip2 {
          0%   { transform: rotateY(-180deg); }
          50%  { box-shadow: 30px 20px 60px rgba(0,0,0,0.5); }
          100% { transform: rotateY(0deg); }
        }
      `}</style>
    </div>
  );
}

function LetterPage({
  title,
  lines,
  showStamp,
  showSignature,
}: {
  title: string;
  lines: string[];
  showStamp?: boolean;
  showSignature?: boolean;
}) {
  return (
    <div className="modern-paper-wrap relative">
      <div className="modern-paper relative px-7 py-12 sm:px-10">
        <div className="pointer-events-none absolute inset-0 modern-paper-sheen" />

        <p className="relative text-center font-serif text-2xl italic text-[#1a1a1a]">
          {title}
        </p>
        <div className="relative mx-auto mt-3 h-px w-16 bg-[#1a1a1a]/25" />

        <div className="relative mt-6 space-y-3 font-serif text-[15px] leading-relaxed text-[#232323]">
          {lines.map((line, i) => (
            <p
              key={i}
              style={{
                animation: `fadeUp 600ms ${i * 160}ms both cubic-bezier(0.22,1,0.36,1)`,
              }}
            >
              {line}
            </p>
          ))}
          {showSignature && (
            <p
              className="pt-4 text-right font-serif text-xl italic text-[#1a1a1a]"
              style={{ animation: `fadeUp 800ms ${lines.length * 160 + 200}ms both` }}
            >
              dein Herz ♥
            </p>
          )}
        </div>
      </div>

      <style>{`
        .modern-paper-wrap {
          transform: perspective(1400px) rotateX(4deg) rotateY(-2deg);
          transform-style: preserve-3d;
          filter: drop-shadow(0 40px 60px rgba(0,0,0,0.55));
        }
        .modern-paper-wrap::before,
        .modern-paper-wrap::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 18px;
          background: linear-gradient(180deg, #fafaf7, #ececec);
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          z-index: -1;
        }
        .modern-paper-wrap::before {
          transform: translate(6px, 10px) rotate(1.2deg);
          opacity: 0.85;
        }
        .modern-paper-wrap::after {
          transform: translate(-5px, 14px) rotate(-1.4deg);
          opacity: 0.7;
        }
        .modern-paper {
          background:
            radial-gradient(ellipse at 20% 10%, rgba(255,255,255,0.9), transparent 55%),
            radial-gradient(ellipse at 85% 90%, rgba(0,0,0,0.06), transparent 60%),
            linear-gradient(180deg, #fdfcf9 0%, #f4f1ea 100%);
          border-radius: 18px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.9),
            inset 0 -1px 0 rgba(0,0,0,0.06),
            0 30px 60px -30px rgba(0,0,0,0.5),
            0 10px 30px -15px rgba(0,0,0,0.4);
        }
        .modern-paper-sheen {
          background:
            linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%);
          border-radius: 18px;
          mix-blend-mode: soft-light;
          opacity: 0.9;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}


function PressMeButton({ onPlayVideo }: { onPlayVideo: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      onPlayVideo();
    }, 1400);
  };

  return (
    <div className="mt-10 flex justify-center pb-28">
      <button
        onClick={handleClick}
        disabled={loading}
        className="relative overflow-hidden rounded-full bg-primary px-8 py-4 font-medium text-primary-foreground shadow-xl transition-transform hover:scale-105 active:scale-95 disabled:cursor-wait disabled:hover:scale-100"
      >
        <span className={loading ? "invisible" : "visible"}>▶ press me</span>
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
            <span className="text-sm">lädt…</span>
          </span>
        )}
      </button>
    </div>
  );
}

function VinylWidget({
  audioRef,
}: {
  audioRef: React.RefObject<HTMLAudioElement | null>;
}) {
  // Autoplay-only, no controls. Just a spinning vinyl label.
  useEffect(() => {
    const a = audioRef.current;
    if (a) {
      a.volume = 0.25;
      a.play().catch(() => {});
    }
  }, [audioRef]);

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-40 flex items-center gap-3">
      <div className="flex flex-col items-end">
        <p className="text-[12px] font-semibold text-white/90 drop-shadow">ILYSB</p>
        <p className="text-[10px] text-white/60 drop-shadow">LANY</p>
      </div>
      <div
        className="relative h-14 w-14 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
        aria-hidden
        style={{
          background:
            "repeating-radial-gradient(circle at center, #1a1a1a 0 2px, #050505 2px 4px)",
          animation: "spin 4s linear infinite",
        }}
      >
        <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[inset_0_0_0_2px_rgba(0,0,0,0.5)]" />
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}


/* ---------------- 5. Fullscreen video ---------------- */

function FullscreenVideo({ onEnd }: { onEnd: () => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.play().catch(() => {});
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
      {failed ? (
        <div className="flex flex-col items-center justify-center px-6 text-center text-white">
          <p className="font-serif text-2xl italic">Video-Platzhalter</p>
          <p className="mt-2 text-sm opacity-70">
            Lege dein Video als <code>/public/video/birthday.mp4</code> ab.
          </p>
        </div>
      ) : (
        <video
          ref={videoRef}
          src="/video/birthday.mp4"
          controls
          autoPlay
          playsInline
          onEnded={onEnd}
          onError={() => setFailed(true)}
          className="h-full w-full object-contain"
        />
      )}
      <button
        onClick={onEnd}
        className="absolute right-4 top-4 rounded-full bg-white/20 px-4 py-2 text-sm text-white backdrop-blur"
      >
        ✕ Schließen
      </button>
    </div>
  );
}
