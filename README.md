# <img src="frontend/public/logo.png" width="28" height="28" alt="HandInHand Logo"> HandInHand — AI-Powered ASL Learning

### *Swipe. Sign. Learn.*

An interactive American Sign Language learning platform that uses **computer vision** and **multimodal AI** to give you real-time feedback on your signing. Practice signs, earn XP, level up, and master ASL through gamified lessons.

[![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python_3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-0097A7?style=for-the-badge&logo=google&logoColor=white)](https://mediapipe.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![OpenCV](https://img.shields.io/badge/OpenCV-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white)](https://opencv.org/)
[![Google AI](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

[Getting Started](#-getting-started) • [Features](#-features) • [Tech Stack](#-tech-stack) • [How It Works](#-how-it-works) • [API](#-api-documentation)

<hr>

## ✨ Features

- **AI-Powered Evaluation** — Record yourself signing and get instant feedback from Google's Gemini AI with detailed pros/cons
- **Gamified Learning** — Earn XP, level up (1-10), maintain daily streaks, and unlock achievements
- **Adaptive Mastery System** — Lessons automatically adjust based on your performance; weaker words get more practice time
- **Multiple Quiz Types** — Watch & record (SS1), multiple choice recognition (SS2), and pure production (SS3) challenges
- **Custom Pixel Art Avatars** — Build your own character with customizable skin, eyes, hair, and accessories
- **21 ASL Signs** — Across 4 themed units: Greetings & Basics, Family, Daily Life, and Out & About
- **Space-Themed UI** — Beautiful pixel art lesson path with planets, galaxies, and smooth animations
- **Progress Tracking** — Detailed stats dashboard, configurable daily goals, streak counter, and personal dictionary
- **Flexible Evaluation** — Pass threshold of 3/4; all video slots must pass to earn XP
- **Pre-Extracted Landmarks** — Fast evaluation using cached reference sign data

<hr>

## 🎬 How It Works

```
1. 👀 Watch → Learn the correct ASL sign from a reference video
2. 📹 Record → Perform the sign yourself using your webcam
3. 🤖 Get Scored → AI analyzes your landmarks and gives you feedback (0-4 scale)
4. 🚀 Progress → Earn XP, level up, and master your ASL vocabulary
```

**Behind the scenes:**
HandInHand uses **MediaPipe** to extract hand and body landmarks from your video, compares them against reference landmarks, and sends both to **Gemini 2.5 Flash** for intelligent evaluation. The AI judges your performance on 12 detailed criteria and returns a score with personalized feedback.

<hr>

## 🏗️ Architecture

```
┌─────────────────┐
│  React Frontend │ ◄───── User records ASL sign via webcam
│   (Vite + TS)   │
└────────┬────────┘
         │ POST /api/evaluate-sign
         ▼
┌─────────────────┐
│  FastAPI Server │ ◄───── Receives WebM/MP4 video upload
└────────┬────────┘
         │
         ├─► ffmpeg (transcode to MP4 if needed)
         │
         ├─► MediaPipe (extract hand + face landmarks)
         │
         ├─► Load reference landmarks (pre-extracted JSON)
         │
         └─► Google Gemini API
             │
             ├─ Send: user landmarks + reference landmarks
             ├─ Send: judging rubric (12 criteria)
             └─ Receive: score (0-4) + pros/cons feedback
                         │
                         ▼
             Return JSON response to frontend
```

<hr>

## 🛠️ Tech Stack

### Frontend
- **React 18** with **TypeScript** — Component-based UI architecture with type safety
- **Vite** — Lightning-fast build tool and hot module replacement
- **Tailwind CSS** — Utility-first styling with custom space-themed design system
- **Motion** (Framer Motion) — Smooth animations and page transitions
- **Radix UI** — Accessible, unstyled component primitives for modals, dialogs, and dropdowns
- **Lucide React** — Consistent icon library

### Backend
- **FastAPI** — Modern Python web framework with automatic OpenAPI documentation
- **MediaPipe** — Google's ML solution for real-time hand and pose landmark extraction (21 hand joints + 8 face keypoints)
- **OpenCV** — Video processing and frame extraction
- **Google Gemini API** (gemini-2.5-flash) — Multimodal AI for intelligent sign evaluation with vision + text understanding
- **ffmpeg** — Video transcoding (WebM → MP4 conversion)
- **Pydantic** — Data validation and JSON serialization
- **Uvicorn** — ASGI server for production deployment

### AI & Computer Vision
- **MediaPipe Hands** — Extracts 21 3D hand landmarks per hand from video frames
- **MediaPipe Pose** — Detects 8 key facial/body reference points for context
- **Gemini 2.5 Flash** — Evaluates user landmarks vs. reference landmarks using multimodal reasoning
- **Custom Rubric System** — 12-criteria evaluation framework with lenient scoring bias

<hr>

## 🚀 Getting Started

### Prerequisites

- **Python 3.9+** (3.11 recommended)
- **Node.js 16+**
- **ffmpeg** — Install via `brew install ffmpeg` (macOS) or [download here](https://ffmpeg.org/download.html)
- **Google AI Studio API Key** — Get yours free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### Backend Setup

```bash
# Create and activate virtual environment
python3.11 -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Set up your Gemini API key
echo 'GEMINI_API_KEY=your_key_here' > backend/.env

# Start the FastAPI Server
fastapi run dev
```

✅ Verify it's running: Visit `http://localhost:8000/health` (should return `{"status": "healthy"}`)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
HandinHand/
├── frontend/
│   ├── src/app/
│   │   ├── App.tsx                          # Root component
│   │   ├── components/
│   │   │   ├── lesson-path.tsx              # Main game hub (state, progression, XP)
│   │   │   ├── learning-path.tsx            # Visual SVG lesson path with pixel art
│   │   │   ├── lesson-node.tsx              # Individual lesson node
│   │   │   ├── sublesson-screen1.tsx        # SS1: Watch + record
│   │   │   ├── sublesson-screen2.tsx        # SS2: Multiple choice quiz
│   │   │   ├── sublesson-screen3.tsx        # SS3: Pure production
│   │   │   ├── EvaluationModal.tsx          # AI feedback display
│   │   │   ├── lesson-complete-modal.tsx    # End-of-lesson XP summary
│   │   │   ├── sidebar.tsx                  # Profile, stats, dictionary, settings
│   │   │   ├── avatar-builder.tsx           # Customizable avatar creator
│   │   │   └── confetti.tsx                 # Celebration animation
│   │   └── lib/
│   │       └── lesson-algorithm.ts          # Slot generation, mastery, word selection
│   ├── public/videos/                       # Reference sign videos
│   ├── package.json
│   └── vite.config.ts
│
├── backend/app/
│   ├── main.py                              # FastAPI app & endpoints
│   ├── routes/
│   │   └── asl_routes.py                    # ASL evaluation routes
│   ├── schemas/
│   │   └── evaluation.py                    # Pydantic response models
│   ├── services/
│   │   ├── video_convert.py                 # Video → landmarks
│   │   ├── landmark_extractor.py            # Reference video extraction
│   │   ├── landmark_load.py                 # Load reference JSONs
│   │   ├── reference_landmarks/             # Pre-extracted landmark JSONs
│   │   └── reference_videos/                # Source reference videos
│   └── gemini/
│       ├── getresponse.py                   # Gemini API integration
│       └── context/
│           ├── prompt.json                  # Judging task & rules
│           ├── rubric.json                  # 12 evaluation criteria
│           └── format.json                  # Expected output format
│
└── requirements.txt                         # Python dependencies
```