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
      {stage === "letter" && <Letter onPlayVideo={() => setStage("video")} />}
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

      {/* Notification card */}
      <div className="relative z-10 mb-8 w-full rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-start gap-3">
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

      {/* Slide to unlock */}
      <div className="relative z-10 w-full pb-6">
        <div
          ref={trackRef}
          className="relative h-16 w-full overflow-hidden rounded-full border border-white/20 bg-white/10 backdrop-blur-xl"
        >
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-medium"
            style={{
              opacity: 1 - Math.min(1, x / 80),
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.4), rgba(255,255,255,0.9), rgba(255,255,255,0.4))",
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
            className="absolute top-1/2 flex h-14 w-14 -translate-y-1/2 cursor-grab items-center justify-center rounded-full bg-white text-black shadow-lg active:cursor-grabbing"
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
        <p className="mt-3 text-center text-[11px] uppercase tracking-[0.3em] opacity-70">
          {"\n"}
        </p>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
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
    <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center overflow-hidden px-6 py-10 text-center">
      <Confetti />
      <FloatingHearts />

      <div className="relative z-10">
        <p
          className="font-serif text-5xl italic leading-tight text-primary"
          style={{ animation: "pop 900ms cubic-bezier(0.22,1,0.36,1) both" }}
        >
          Happy Birthday
        </p>
        <p
          className="mt-3 font-serif text-3xl italic text-foreground"
          style={{ animation: "pop 900ms 300ms cubic-bezier(0.22,1,0.36,1) both" }}
        >
          to my baby
        </p>
        <p
          className="mt-6 text-4xl"
          style={{ animation: "pop 900ms 600ms cubic-bezier(0.22,1,0.36,1) both" }}
        >
          🤍🎂🤍
        </p>

        <button
          onClick={onContinue}
          className="mt-12 rounded-full bg-primary px-8 py-3 font-medium text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
          style={{ animation: "fadeIn 800ms 1400ms both" }}
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

function Letter({ onPlayVideo }: { onPlayVideo: () => void }) {
  const letterLines = [
    "Mein Herz, heute gehört dieser Tag ganz dir.",
    "Ich liebe dich – mehr als jedes Wort es fassen kann.",
    "Danke, dass es dich gibt und dass du meins bist.",
    "Danke für dein Lachen, das jeden Tag heller macht.",
    "Danke für deine Wärme, die mich zuhause fühlen lässt.",
    "Für jedes stille Wir, für jedes laute Wir.",
    "Für jeden Blick, der alles sagt, ohne ein Wort.",
    "Du bist mein Ruhepol, mein Abenteuer, mein Zuhause.",
    "Ich bin so dankbar, an deiner Seite zu wachsen.",
    "Für alles, was war. Für alles, was ist.",
    "Und für alles, was noch kommen wird – mit dir.",
    "Du bist das Schönste, was mir passieren konnte.",
    "Happy Birthday, baby. Heute feiern wir dich.",
    "Für immer dein ♥",
  ];

  const [leftIdx, setLeftIdx] = useState(0);
  const [rightIdx, setRightIdx] = useState(1);

  useEffect(() => {
    const t1 = setInterval(() => {
      setLeftIdx((i) => (i + 2) % PHOTO_COUNT);
    }, 3800);
    const t2 = setInterval(() => {
      setRightIdx((i) => (i + 2) % PHOTO_COUNT);
    }, 4600);
    return () => {
      clearInterval(t1);
      clearInterval(t2);
    };
  }, []);

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-md px-4 py-8">
      <FloatingHearts />

      {/* Side photos */}
      <PhotoFrame side="left" index={leftIdx} />
      <PhotoFrame side="right" index={rightIdx} />

      {/* Burnt letter paper */}
      <div className="relative mx-auto mt-4 max-w-sm">
        <div className="burnt-paper relative px-6 py-10 sm:px-8">
          {/* Wax stamp */}
          <div className="absolute -top-5 right-6 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-deep text-primary-foreground shadow-lg" style={{ transform: "rotate(-12deg)" }}>
            <span className="font-serif text-xl italic">N ♥</span>
          </div>
          <div className="absolute -bottom-3 left-8 grid h-12 w-12 place-items-center rounded-full border-2 border-primary/70 text-primary/80 text-[10px] uppercase tracking-widest" style={{ transform: "rotate(8deg)", background: "rgba(255,240,220,0.4)" }}>
            Par<br />Avion
          </div>

          <p className="text-center font-serif text-2xl italic text-[#3a1a10]">
            Dear my baby,
          </p>
          <div className="mx-auto mt-3 h-px w-16 bg-[#3a1a10]/40" />

          <div className="mt-6 space-y-3 font-serif text-[15px] leading-relaxed text-[#2a120a]">
            {letterLines.map((line, i) => (
              <p
                key={i}
                style={{
                  animation: `fadeUp 600ms ${i * 180}ms both cubic-bezier(0.22,1,0.36,1)`,
                }}
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-center pb-10">
        <button
          onClick={onPlayVideo}
          className="rounded-full bg-primary px-8 py-4 font-medium text-primary-foreground shadow-xl transition-transform hover:scale-105 active:scale-95"
        >
          ▶ Eine Überraschung für dich
        </button>
      </div>

      <style>{`
        .burnt-paper {
          background:
            radial-gradient(ellipse at 20% 10%, rgba(120,60,20,0.35), transparent 40%),
            radial-gradient(ellipse at 80% 90%, rgba(80,30,10,0.4), transparent 45%),
            radial-gradient(ellipse at 100% 30%, rgba(60,20,5,0.35), transparent 40%),
            linear-gradient(180deg, #f6e4c4 0%, #ecd3a8 50%, #e0bd85 100%);
          border-radius: 6px;
          box-shadow:
            0 30px 80px -20px rgba(0,0,0,0.7),
            inset 0 0 60px rgba(80,30,10,0.3);
          filter: drop-shadow(0 0 0 rgba(0,0,0,0));
          clip-path: polygon(
            2% 1%, 8% 0%, 15% 2%, 24% 0%, 33% 3%, 42% 1%, 55% 0%, 68% 2%,
            78% 0%, 88% 2%, 96% 0%, 100% 5%, 98% 12%, 100% 22%, 97% 32%,
            100% 44%, 98% 58%, 100% 70%, 97% 82%, 100% 92%, 95% 100%,
            85% 98%, 74% 100%, 62% 97%, 50% 100%, 38% 98%, 26% 100%,
            15% 97%, 6% 100%, 0% 94%, 2% 82%, 0% 68%, 3% 54%, 0% 40%,
            2% 26%, 0% 14%, 3% 6%
          );
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function PhotoFrame({ side, index }: { side: "left" | "right"; index: number }) {
  // Show 2 stacked frames per side, top-ish and bottom-ish
  return (
    <>
      <div
        className="pointer-events-none absolute z-0 hidden sm:block"
        style={{
          top: side === "left" ? "8%" : "22%",
          [side === "left" ? "left" : "right"]: "-40px",
          transform: `rotate(${side === "left" ? -6 : 5}deg)`,
        }}
      >
        <PhotoCard index={index} />
      </div>
      <div
        className="pointer-events-none absolute z-0 hidden sm:block"
        style={{
          bottom: side === "left" ? "18%" : "8%",
          [side === "left" ? "left" : "right"]: "-32px",
          transform: `rotate(${side === "left" ? 4 : -7}deg)`,
        }}
      >
        <PhotoCard index={(index + 5) % PHOTO_COUNT} />
      </div>

      {/* Mobile: single small frame at top */}
      <div
        className="pointer-events-none absolute z-0 sm:hidden"
        style={{
          top: side === "left" ? "1.5rem" : "6rem",
          [side === "left" ? "left" : "right"]: "-10px",
          transform: `rotate(${side === "left" ? -8 : 6}deg)`,
        }}
      >
        <PhotoCard index={index} small />
      </div>
    </>
  );
}

function PhotoCard({ index, small = false }: { index: number; small?: boolean }) {
  const [failed, setFailed] = useState(false);
  const n = index + 1;
  const w = small ? 72 : 110;
  const h = small ? 90 : 140;
  return (
    <div
      key={n}
      className="relative bg-white p-2 shadow-2xl"
      style={{
        width: w + 16,
        animation: "photoFade 600ms both",
      }}
    >
      {failed ? (
        <div
          className="grid place-items-center text-[10px] uppercase tracking-widest text-primary/80"
          style={{
            width: w,
            height: h,
            background:
              "linear-gradient(135deg, hsl(var(--primary-glow)/0.4), rgba(60,20,10,0.6))",
          }}
        >
          Foto {n}
        </div>
      ) : (
        <img
          src={`/photos/${n}.jpg`}
          alt={`Wir ${n}`}
          onError={() => setFailed(true)}
          style={{ width: w, height: h, objectFit: "cover", display: "block" }}
          loading="lazy"
        />
      )}
      <style>{`
        @keyframes photoFade {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
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
