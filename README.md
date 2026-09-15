# Spotter

**Built for [AI Builders Hackathon 2026](https://ai-builders-hackathon-2026.devpost.com/)**

[![AI Builders Hackathon 2026](https://img.shields.io/badge/Devpost-AI%20Builders%20Hackathon%202026-0A66C2?style=for-the-badge&logo=devpost&logoColor=white)](https://ai-builders-hackathon-2026.devpost.com/)

### [→ Enter / view the challenge on Devpost](https://ai-builders-hackathon-2026.devpost.com/)

This repo is our submission to **[AI Builders Hackathon: Building the Future of Intelligent Systems](https://ai-builders-hackathon-2026.devpost.com/)** — an online public challenge ($33,900+ in prizes) focused on AI products people would actually use, not demos.

**Deadline:** Sep 15, 2026 @ 11:00pm EDT

---

Spotter is a live gym form coach. Point a phone camera at a lifter: MediaPipe locks onto a real body, draws a 33-point skeleton, counts full-cycle reps, flags positioning errors, and a Gemini coach writes the post-set debrief from the actual log.

## What it does

- **Pose lock** — waits until a real person is in frame (no timer fake)
- **Skeleton overlay** — wrists map to wrists, joints stay on the body
- **Rep counting** — one count per full range of motion, not half-cycles
- **Form cues** — swing, lean, wrist stack, uneven bar, without blocking counts
- **Gemini coach** — set recap from the session log after real reps only

## Run it

Live pose needs a **dev client** on a physical phone (Expo SDK 57). Web/Expo Go cannot run the native MediaPipe path.

```bash
npm install
npx expo prebuild
npx expo run:ios
# or: npx expo run:android
```

Start Metro with the native client:

```bash
npm run start:dev
```

Optional Gemini coach (port 8787):

```bash
cp backend/.env.example backend/.env   # set GEMINI_API_KEY
npm run backend
```

## Hackathon

| | |
| --- | --- |
| Challenge | [AI Builders Hackathon 2026](https://ai-builders-hackathon-2026.devpost.com/) |
| Tagline | Building the Future of Intelligent Systems. The Internet Needs Better AI. |
| Devpost | **https://ai-builders-hackathon-2026.devpost.com/** |
| Format | Online · Public |
| Prizes | $33,900+ |
| Source | This repository |

Judges: see the live camera flow (Frame → lock → reps → form cues → set recap) and the Devpost brief for submission requirements (working product, public source, demo video, presentation).
