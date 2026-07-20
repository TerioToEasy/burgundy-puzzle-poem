# Happy Birthday, Nabila 🎂

Eine interaktive Geburtstagskarte für Nabila – gebaut mit [TanStack Start](https://tanstack.com/start) und [Tailwind CSS v4](https://tailwindcss.com).

## Was ist das?

Diese Webseite ist eine digitale Geburtstagskarte, die wie ein iPhone-Erlebnis aussieht:

1. **Liquid-Glass-Sperrbildschirm** – Zum Entsperren nach rechts schieben.
2. **Mathe-Quiz** – "Bist du wirklich Lala?" mit zwei einfachen Aufgaben.
3. **Happy-Birthday-Feier** – Herzen und Fotos regnen herab.
4. **Zweiseitiger Brief** – Moderner 3D-Papier-Look mit animiertem Umblättern.
5. **Vollbild-Video** – Ein persönliches Geburtstagsvideo.

Im Hintergrund läuft leise **ILYSB – LANY**.

---

## Schnellstart (lokal)

Voraussetzungen: [Bun](https://bun.sh) (oder Node.js 20+ mit `npm`/`pnpm`/`yarn`).

```bash
# 1. Repository klonen
git clone https://github.com/DEIN_USERNAME/happy-birthday-nabila.git
cd happy-birthday-nabila

# 2. Abhängigkeiten installieren
bun install

# 3. Entwicklungsserver starten
bun dev
```

Die App ist dann unter `http://localhost:8080` erreichbar.

### Build & Preview

```bash
bun run build      # Produktions-Build
bun run preview    # Lokalen Produktions-Build testen
```

---

## Assets austauschen

Alle persönlichen Medien liegen unter `public/` oder `src/assets/`.

| Inhalt | Pfad | Anmerkung |
|--------|------|-----------|
| Sperrbildschirm-Hintergrund | `src/assets/lockscreen-bg.jpg` | Hochformat, iPhone-ähnlich |
| Fallback-Bild (altes Puzzle) | `src/assets/us.jpg` | Wird aktuell nicht genutzt, aber vorhanden |
| 10 Fotos für den Brief & die Feier | `public/photos/1.jpg` … `10.jpg` | Werden im Brief und beim Happy-Birthday-Fenster rotierend angezeigt |
| Hintergrundmusik | `public/music/ilysb.mp3` | Wird automatisch im Brief-Bereich abgespielt |
| Geburtstagsvideo | `public/video/birthday.mp4` | Wird nach dem Brief im Vollbild abgespielt |

> **Tipp:** Ersetze die Dateien einfach durch eigene Dateien mit **gleichem Dateinamen**. Wenn du über GitHub arbeitest, lade sie direkt in die entsprechenden Ordner hoch.

---

## Auf GitHub veröffentlichen

### Option A: Lovable → GitHub Sync (empfohlen)

Der einfachste Weg, den Code auf GitHub zu hosten:

1. Öffne das Lovable-Projekt.
2. Klicke unten links auf das **+**-Menü → **GitHub** → **Connect project**.
3. Autorisiere die Lovable GitHub App.
4. Wähle dein GitHub-Konto / deine Organisation aus.
5. Klicke auf **Create Repository**.

Danach wird jede Änderung in Lovable automatisch zu GitHub gepusht – und umgekehrt.

### Option B: Manuelles Repository

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/DEIN_USERNAME/happy-birthday-nabila.git
git push -u origin main
```

---

## Live gehen

Diese App ist ein **Full-Stack-React-Projekt** mit serverseitigen Funktionen. Sie kann nicht direkt auf **GitHub Pages** gehostet werden, weil GitHub Pages nur statische Seiten unterstützt.

### Empfohlene Hosting-Optionen

| Plattform | Hinweis |
|-----------|---------|
| **Lovable Publish** | Einfachsten Button oben rechts in Lovable klicken. Keine extra Konfiguration nötig. |
| **Cloudflare Pages / Workers** | Passt gut zum mitgelieferten Nitro/Cloudflare-Setup. Siehe `.github/workflows/deploy-cloudflare.yml`. |
| **Vercel** | Importiere das Repo in Vercel, Framework-Preset auf "Other" oder "Vite" lassen. |
| **Netlify** | Build-Befehl: `bun run build`, Publish-Verzeichnis: `.output/public`. |

### GitHub Actions CI

Bei jedem Push auf `main` wird automatisch ein Build-Check ausgeführt (`.github/workflows/ci.yml`).

---

## Wichtige Dateien

| Datei | Zweck |
|-------|-------|
| `src/routes/index.tsx` | Die komplette Geburtstagskarte (Sperrbildschirm, Quiz, Feier, Brief, Video) |
| `src/routes/__root.tsx` | App-Shell, Meta-Tags, Schriftarten |
| `src/styles.css` | Design-Tokens, Burgundy-Farbschema, Animationen |
| `vite.config.ts` | Vite + TanStack Start Konfiguration |
| `src/server.ts` | SSR-Einstiegspunkt |

---

## Technischer Hinweis

Das Projekt verwendet:

- **TanStack Start v1** für Routing, SSR und Server-Funktionen
- **React 19** und **TypeScript**
- **Tailwind CSS v4** mit nativen CSS-Theme-Variablen
- **Bun** als Package-Manager

Bei Fragen oder Problemen: Prüfe zuerst, ob alle Assets im richtigen Ordner liegen und die Dateinamen exakt übereinstimmen (Groß-/Kleinschreibung beachten!).
