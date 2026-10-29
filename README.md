# 🧠 ReadX

### AI-Powered Accessible Reading & Learning Platform

> **Making digital reading more accessible, personalized, and easier to understand.**

<p align="center">
  <a href="https://dyslexia-1.vercel.app/">
    <img src="https://img.shields.io/badge/🚀%20LIVE%20DEMO-ReadX-black?style=for-the-badge" alt="Live Demo">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Google%20Gemini-AI-4285F4?logo=google&logoColor=white" alt="Gemini">
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white" alt="MongoDB Atlas">
  <img src="https://img.shields.io/badge/PDF.js-Document%20Processing-red" alt="PDF.js">
  <img src="https://img.shields.io/badge/Mammoth.js-DOCX%20Processing-orange" alt="Mammoth.js">
  <img src="https://img.shields.io/badge/Web%20Speech-TTS%20%26%20STT-blue" alt="Web Speech API">
  <img src="https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel&logoColor=white" alt="Vercel">
</p>

---

## 🌐 Live Application

### 🚀 [Open ReadX](https://dyslexia-1.vercel.app/)

**Production URL:** https://dyslexia-1.vercel.app/

ReadX is deployed as a live web application using Vercel.

The platform can be accessed directly from a modern web browser without requiring users to install a desktop application.

---

## 📖 Table of Contents

- [What is ReadX?](#what-is-readx)
- [Understanding Dyslexia](#understanding-dyslexia)
- [Dyslexia and Digital Reading](#dyslexia-and-digital-reading)
- [Problem Statement](#problem-statement)
- [Project Goal](#project-goal)
- [Project Objectives](#project-objectives)
- [Our Solution](#our-solution)
- [Core Features](#core-features)
- [Accessibility Features](#accessibility-features)
  - [Typography Controls](#typography-controls)
  - [Spacing Customization](#spacing-customization)
  - [Reading Guide](#reading-guide)
  - [Line Focus](#line-focus)
  - [Read Aloud](#read-aloud)
  - [ReadX Mode](#readx-mode)
- [Learning Library](#learning-library)
- [Document Upload & Processing](#document-upload--processing)
  - [PDF Support](#pdf-support)
  - [DOCX Support](#docx-support)
- [AI-Powered Learning](#ai-powered-learning)
  - [AI Text Simplification](#ai-text-simplification)
  - [AI Concept Explanation](#ai-concept-explanation)
  - [AI Summarization](#ai-summarization)
  - [AI Quiz Generation](#ai-quiz-generation)
- [Make My Notes & Speak-to-Write](#make-my-notes--speak-to-write)
  - [Make My Notes](#make-my-notes)
  - [Notes Panel](#notes-panel)
  - [Speak-to-Write & Audio Visualizer](#speak-to-write--audio-visualizer)
- [Practice](#practice)
- [Authentication](#authentication)
- [Forgot Password](#forgot-password)
- [User Profile](#user-profile)
- [Learning Progress & Gamification](#learning-progress--gamification)
  - [Learning Progress](#learning-progress)
  - [Login Streak & Daily Coins System](#login-streak--daily-coins-system)
- [Data Persistence](#data-persistence)
- [System Architecture](#system-architecture)
- [AI Architecture](#ai-architecture)
- [Gemini Client Module](#gemini-client-module)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Core JavaScript Modules](#core-javascript-modules)
- [Complete Application Workflow](#complete-application-workflow)
- [Security](#security)
- [Responsive Design](#responsive-design)
- [Design Philosophy](#design-philosophy)
- [Learning Philosophy](#learning-philosophy)
- [Testing Checklist](#testing-checklist)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Deployment](#deployment)
- [Development Roadmap](#development-roadmap)
- [Future Scope](#future-scope)
- [Project Status](#project-status)
- [Why ReadX?](#why-readx)
- [Impact](#impact)
- [Team](#team)
- [Project Links](#project-links)
- [Disclaimer](#disclaimer)
- [License](#license)

---

## 📖 What is ReadX?

**ReadX** is an AI-powered, accessibility-focused reading and learning platform designed to make digital educational content easier to read, understand, organize, and revise.

The platform is designed particularly with learners who experience reading difficulties such as dyslexia in mind.

Traditional educational websites generally provide the same reading interface to every user.

The same:

- Font
- Font size
- Line spacing
- Letter spacing
- Paragraph structure
- Visual hierarchy
- Reading environment

is presented to everyone.

ReadX takes a different approach.

Instead of forcing every learner to use the same reading environment, ReadX provides accessibility controls that allow users to personalize how educational content is presented.

The platform combines accessibility tools with AI-powered learning assistance and study functionality.

### ReadX brings together:

- Accessible reading
- Typography customization
- Reading Guide
- Line Focus
- Read Aloud
- AI text simplification
- AI concept explanation
- AI summarization
- AI quiz generation
- Document reading
- PDF support
- Make My Notes
- Notes Panel & Speak-to-Write voice dictation
- Learning Library
- Practice
- Authentication
- Password recovery
- User profiles
- Learning progress, reading statistics & live streak tracking
- Daily coin rewards

The central philosophy of ReadX is:

> **Reading should adapt to the learner — not the learner to the reading interface.**

---

## 🧠 Understanding Dyslexia

Dyslexia is a learning difference that can affect reading, spelling, writing, and the processing of written information.

It is important to understand that dyslexia is **not a measure of intelligence**.

Different learners can experience reading difficulties in different ways.

Some learners may find it difficult to:

- Process written words quickly
- Maintain reading accuracy
- Follow dense paragraphs
- Maintain their position while reading
- Process large amounts of text
- Understand complex written explanations
- Read for long periods without fatigue

The experience is different for every individual.

Therefore, there cannot be a single interface that is guaranteed to work perfectly for every learner.

---

## 💻 Dyslexia and Digital Reading

Digital learning has increased access to educational material.

Students can now access:

- Online articles
- Digital textbooks
- PDFs
- Assignments
- Programming documentation
- Lecture notes
- Study resources
- Online courses

However, accessibility of **information** and accessibility of **information presentation** are two different things.

A document may technically be available to a student while still being difficult to read.

For example:

```text
Large block of text
        ↓
    Small font
        ↓
Tight line spacing
        ↓
 No visual focus
        ↓
Complex terminology
        ↓
Long reading session
```

---

## 🎯 Problem Statement

Modern education increasingly depends on digital content.

Students regularly interact with websites, PDFs, online documentation, assignments, and digital study material.

However, most platforms still follow a one-size-fits-all reading model.

This creates several problems.

### Problem 1 — Fixed Typography

Most websites provide limited control over typography.

Users often cannot freely customize:

- Font size
- Font family
- Letter spacing
- Word spacing
- Line height

A fixed typography system may not provide the most comfortable reading experience for every learner.

### Problem 2 — Dense Content

Educational material can contain long paragraphs and large amounts of information.

Dense content can make it harder to maintain visual focus while reading.

### Problem 3 — Losing Reading Position

When reading long paragraphs, users can lose track of the line they were reading.

This becomes particularly inconvenient when the page contains large amounts of text.

### Problem 4 — Complex Language

Academic and technical material often contains terminology that is difficult to understand immediately.

A learner may understand the topic better if the same concept is explained using simpler language.

### Problem 5 — Long Documents

Students frequently work with:

- PDFs
- DOCX files
- Lecture notes
- Assignments
- Study material

These documents are not always designed with accessibility-focused reading controls.

### Problem 6 — Limited Audio Support

Some learners may benefit from hearing educational content instead of relying entirely on visual reading.

Traditional document readers may not provide an integrated reading workflow around this.

### Problem 7 — Manual Note Making

Students often spend additional time converting long educational content into concise notes.

This separates the reading process from the revision process.

### Problem 8 — Fragmented Learning Tools

A typical learning workflow may require multiple applications:

```text
PDF Reader
    +
AI Chatbot
    +
Text-to-Speech Tool
    +
Notes Application
    +
Practice Platform
    +
Progress Tracker
```

Switching between multiple applications creates unnecessary friction.

---

## 🎯 Project Goal

The main goal of ReadX is to create a single, accessible learning environment where users can read, understand, organize, practice, and track educational content.

The intended workflow is:

```text
READ
  ↓
UNDERSTAND
  ↓
CUSTOMIZE
  ↓
LISTEN
  ↓
SIMPLIFY
  ↓
MAKE NOTES
  ↓
PRACTICE
  ↓
REVIEW
  ↓
TRACK PROGRESS
```

ReadX aims to reduce the number of separate tools required to complete this learning cycle.

---

## 🎯 Project Objectives

### 01 — Improve Reading Comfort

Provide learners with controls that allow them to customize the visual presentation of content.

### 02 — Improve Reading Focus

Provide tools such as Reading Guide and Line Focus to help users concentrate on relevant content.

### 03 — Provide Alternative Reading Methods

Support audio-assisted reading through Read Aloud.

### 04 — Simplify Complex Content

Use Gemini AI to transform difficult content into easier-to-understand explanations.

### 05 — Support Revision

Generate structured notes from learning material and provide voice dictation.

### 06 — Encourage Active Learning

Generate quizzes and provide practice functionality.

### 07 — Centralize Learning Tools

Bring reading, accessibility, AI, notes, practice, and progress into one platform.

---

## 💡 Our Solution

ReadX combines accessibility, AI, and learning tools into one environment.

```text
                         READX
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
   Accessibility           AI            Learning
       Tools             Support           Tools
          │                │                │
          ▼                ▼                ▼
    Typography         Simplify          Library
    Font Controls      Explain           Reader
    Spacing            Summarize         Practice
    Reading Guide      Quiz              Notes
    Line Focus                           Progress & Streaks
    Read Aloud
          │                │                │
          └────────────────┼────────────────┘
                           ▼
                 Personalized Learning
```

---

## ✨ Core Features

| # | Feature | Description |
| :--- | :--- | :--- |
| 1 | **ReadX Mode** | Accessibility-focused reading environment |
| 2 | **Typography Controls** | Customizable font and reading presentation (OpenDyslexic, Lexend, System) |
| 3 | **Spacing Controls** | Adjust visual spacing for comfortable reading (font size, line height, letter/word spacing) |
| 4 | **Reading Guide** | Movable horizontal ruler to help maintain reading position |
| 5 | **Line Focus** | Focuses attention on the current reading area with background dimming |
| 6 | **Read Aloud** | Converts content into speech using Web Speech Synthesis |
| 7 | **Library** | Structured educational topics and learning resources |
| 8 | **Reader** | Dedicated accessible reading environment for topics and documents |
| 9 | **PDF Support** | In-browser PDF reading and navigation via PDF.js |
| 10 | **Document Upload** | Upload and process learning documents (PDF, DOCX, TXT, CSV) |
| 11 | **AI Simplification** | Converts complex material into short, accessible sentences |
| 12 | **AI Explanation** | Explains difficult concepts using analogies and step-by-step logic |
| 13 | **AI Summary** | Generates high-level overviews and key takeaway bullet points |
| 14 | **AI Quiz** | Generates multiple-choice comprehension questions |
| 15 | **Make My Notes** | Contextual note-taking drawer per topic and document |
| 16 | **Speak-to-Write** | Speech-to-text voice dictation with real-time microphone audio visualizer |
| 17 | **Notes Panel** | Dedicated notes drawer interface with create, edit, and delete tools |
| 18 | **Practice** | Active recall quizzes and comprehension exercises |
| 19 | **Authentication** | Account-based registration, login, and user sessions |
| 20 | **Forgot Password** | Captcha-verified password recovery workflow |
| 21 | **Profile Dashboard** | Personalized profile, reading statistics, and theme preferences |
| 22 | **Learning Progress** | Reading history, sessions completed, words read, and accuracy metrics |
| 23 | **Login Streak & Daily Coins** | Daily login tracking, streak counter, longest streak, weekly activity dots, and +1 coin rewards |

---

## ♿ Accessibility Features

Accessibility is a core part of ReadX.

The platform does not treat accessibility as a single feature.

Instead, multiple accessibility controls work together.

```text
                    ACCESSIBILITY
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   Typography       Visual Focus         Audio
        │                │                │
        ▼                ▼                ▼
    Font Size       Reading Guide      Read Aloud
    Font Family     Line Focus
    Letter Space
    Word Space
    Line Height
        │                │                │
        └────────────────┼────────────────┘
                         ▼
                Personalized Reading
```

---

## 🔤 Typography Controls

Typography is one of the most important parts of a digital reading interface.

ReadX gives users greater control over how written content is displayed.

### Font Size

Users can adjust the size of displayed text according to their preference.

This helps users avoid being restricted to one predefined text size.

### Font Family

Different fonts can produce different visual reading experiences.

ReadX provides typography customization including **OpenDyslexic** (weighted bottom gravity to prevent letter flipping), **Lexend** (designed to reduce visual stress and improve fluency), and clean system sans-serif fonts so users can select a more comfortable presentation.

### Letter Spacing

Letter spacing controls the amount of horizontal space between individual characters.

This provides additional control over text density and reduces character crowding.

### Word Spacing

Word spacing controls the visual separation between words.

This can help users who prefer more clearly separated words.

### Line Height

Line height controls the vertical distance between lines.

Increasing line height creates more visual separation between consecutive lines to minimize accidental line skipping.

---

## 📏 Spacing Customization

ReadX provides additional control over text spacing.

Users can customize aspects of the reading layout including:

- Letter spacing
- Word spacing
- Line spacing
- Text density

The objective is to allow users to create a reading environment that feels more comfortable for their preferences.

---

## 🎯 Reading Guide

The Reading Guide helps users maintain visual focus while moving through content.

Long-form reading can make it difficult to continuously track the current line.

The Reading Guide provides a visual horizontal reference that follows the mouse or touch point, directing attention toward the relevant reading area.

```text
Long Educational Content
          ↓
     Reading Guide
          ↓
   Focused Reading Area
          ↓
   Easier Visual Tracking
```

---

## 🔎 Line Focus

Line Focus provides another visual concentration mechanism.

Instead of requiring the user to visually process the entire page at once, Line Focus emphasizes the relevant reading area and dims the rest of the screen.

This is particularly useful for:

- Long paragraphs
- Articles
- Technical documentation
- Educational content
- Large reading sections

---

## 🔊 Read Aloud

ReadX includes a browser-based Read Aloud feature.

It uses speech capabilities available in the browser (`window.speechSynthesis`) to convert written content into audio.

Read Aloud provides:

- Audio-assisted reading
- Alternative content consumption
- Multi-modal learning
- Reading reinforcement
- Support for longer reading sessions

The feature is integrated directly into the ReadX reading experience with controls for rate (0.75x–1.75x), pitch, and playback status.

---

## 📖 ReadX Mode

ReadX Mode is the dedicated accessibility-focused reading environment.

Instead of presenting content through a standard page layout, ReadX Mode brings the reading controls together.

```text
                    ReadX Mode
                        │
       ┌────────────────┼────────────────┐
       │                │                │
       ▼                ▼                ▼
   Typography       Visual Focus       Audio
       │                │                │
       ▼                ▼                ▼
 Font Size         Reading Guide     Read Aloud
 Font Family       Line Focus
 Spacing
```

The user can combine these controls according to their reading preferences.

---

## 📚 Learning Library

The Library is the central content discovery area of ReadX.

It organizes educational material into structured learning topics.

Instead of presenting every resource together, the Library separates content into manageable sections.

```text
Library
│
├── Topics
│
├── Learning Resources
│
├── My Content
│
└── Practice
```

The Library acts as the entry point for structured learning.

---

## 📑 Document Upload & Processing

ReadX allows users to import external documents into the accessible reading environment.

### 📑 PDF Support

ReadX uses **PDF.js** for browser-based PDF reading.

PDF documents are processed and rendered directly inside the browser using client-side Web Workers, eliminating the need to upload sensitive documents to third-party file conversion servers.

```text
PDF Document
     ↓
   PDF.js
     ↓
ReadX Reader
     ↓
Accessibility Controls + AI Assistance + Notes
```

### 📄 DOCX Support

ReadX uses **Mammoth.js** (`mammoth.browser.min.js`) for processing Word documents.

This allows supported `.docx` content to be transformed into browser-readable HTML in real time.

The processed content can then be used within the broader ReadX learning workflow with complete access to typography controls, Read Aloud, and note-taking.

---

## 🤖 AI-Powered Learning

ReadX integrates Google Gemini into its learning experience through a secure serverless backend proxy (`/api/gemini`).

The AI layer provides multiple specialized operations instead of functioning only as a general chatbot:

- Text Simplification
- Concept Explanation
- Summarization
- Quiz Generation
- Visual Concept Cards

### 🧠 AI Text Simplification

The Simplify feature converts complex educational material into easier-to-understand language.

```text
Complex Content
      │
      ▼
Google Gemini (/api/gemini)
      │
      ▼
Simplified, Shorter Sentences with Bold Keywords
```

### 🧠 AI Concept Explanation

The Explain Concept feature provides intuitive breakdowns for highlighted terms:

- Real-world analogies
- Step-by-step logic
- Plain-language definitions without unnecessary jargon

### 📊 AI Summarization

The Summarize feature extracts essential takeaways:

- A 1-sentence high-level overview
- 3 to 5 concise bullet points covering key insights

### 🧩 AI Quiz Generation

The quiz workflow generates 3 to 5 multiple-choice questions directly from the text to test comprehension.

```text
Educational Content
        ↓
    AI Quiz
        ↓
Multiple Choice Questions
        ↓
Immediate Comprehension Check
```

---

## 📝 Make My Notes & Speak-to-Write

### 📝 Make My Notes

Make My Notes is designed to reduce the manual effort involved in creating revision material.

Instead of reading a long document and manually writing every important point, the learner can open the notes drawer directly beside the text.

```text
Educational Content
        ↓
   Make My Notes
        ↓
 Contextual Note Drawer
        ↓
    Save & Revise
```

### 🗒️ Notes Panel

The Notes Panel provides a dedicated interface for accessing and managing learning notes per topic and document.

```text
┌─────────────────────────────┐
│       Learning Content      │
│                             │
│     Read / Understand       │
│                             │
└──────────────┬──────────────┘
               │
               ▼
      ┌─────────────────┐
      │   Notes Panel   │
      │                 │
      │   Key Points    │
      │   Summary       │
      │   Revision      │
      └─────────────────┘
```

This allows users to transition from reading to revision without leaving the learning environment.

### 🎙️ Speak-to-Write & Audio Visualizer

ReadX includes a built-in voice dictation and visualizer feature in the notes drawer (`js/notes.js`):

- **Speech-to-Text Dictation:** Powered by the browser's `SpeechRecognition` / `webkitSpeechRecognition` API. Supports real-time speech recognition, interim results, language selection (such as `en-IN` or `en-US`), and automated transcript insertion.
- **Microphone Audio Visualizer:** Uses the Web Audio API (`AudioContext`, `AnalyserNode`) to measure real-time microphone input volume, displaying an animated input level bar (`#rxAudioLevelBar`), numeric level percentage (`#rxAudioLevelVal`), and a Voice Activity Detection badge (`#rxVoiceActivityBadge`).

---

## 🧩 Practice

ReadX connects reading with active learning through its Practice functionality.

The objective is to prevent the learning experience from ending immediately after reading.

The workflow becomes:

```text
Read
 ↓
Understand
 ↓
Make Notes
 ↓
Practice
 ↓
Review
 ↓
Progress
```

---

## 🔐 Authentication

ReadX provides user authentication functionality.

The authentication workflow includes:

- Account registration
- Login
- Logout
- User sessions
- Protected functionality
- User-specific data isolation

Authentication allows ReadX to provide a more personalized learning experience where settings and statistics belong strictly to the active user.

---

## 🔑 Forgot Password

ReadX includes a password recovery workflow in `forgot-password.html` and `reset-password.html`.

```text
Login
  ↓
Forgot Password
  ↓
Captcha Verification
  ↓
Reset Password
  ↓
Login Again
```

This allows users to recover their accounts safely without creating a new profile.

---

## 👤 User Profile

The Profile section provides a dedicated space for user information, reading settings, and performance statistics.

It forms part of the personalized experience of the platform, linking reading activity with gamified progress.

---

## 📊 Learning Progress & Gamification

### 📊 Learning Progress

ReadX includes learning progress functionality that connects the user's reading and practice activity with a longer-term learning journey.

```text
Content
  ↓
Reading
  ↓
Practice
  ↓
Progress
  ↓
Continued Learning
```

Key performance metrics tracked include:

- Completed reading sessions
- Total words read
- Reading time (minutes and hours)
- Practice quiz accuracy (%)
- Interactive 7-day and 30-day activity charts

---

### 🔥 Login Streak & Daily Coins System

The dashboard (`profile.html` / `js/profile.js`) features a fully functional **Live Login Streak & Daily Coins** system managed by `js/data.js` and synchronized via `api/streak.js`.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   LIVE LOGIN STREAK & DAILY COINS                      │
│                                                                        │
│     🔥  3                  │              🪙  15                       │
│        DAY STREAK          │                 COINS BALANCE             │
│                                                                        │
│     ┌────────────────────────────────────────────────────────────┐     │
│     │  🪙  +1 coin  earned today  ✓                              │     │
│     └────────────────────────────────────────────────────────────┘     │
│                                                                        │
│     THIS WEEK'S LOGIN ACTIVITY                                         │
│      [M]       [T]       [W]       [T]       [F]       [S]       [S]   │
│      (✓)       (✓)       (●)       ( )       ( )       ( )       ( )   │
│     Active    Active    Today                                          │
│                                                                        │
│     Longest streak: 7 days      •      Total coins: 24 coins           │
└────────────────────────────────────────────────────────────────────────┘
```

#### How the Streak System Works

1. **Triggered on Authentication:**
   Streak evaluation is executed on every successful user login or signup (`ReadXData.recordUserLogin(userId)`).
2. **Calendar-Day Difference Calculation:**
   Dates are normalized into local calendar strings (`YYYY-MM-DD`). Calendar difference is calculated using noon-anchored UTC math to eliminate daylight savings time shifts:
   - **First Login (`!lastLoginDate`):** Current streak starts at `1`, longest streak is initialized to `1`, and `+1` coin is awarded (`coins = 1`, `totalEarned = 1`).
   - **Same-Day Login (`diffDays === 0`):** Idempotent operation. The user maintains their current streak and coin balance without duplicate increments.
   - **Consecutive-Day Login (`diffDays === 1`):** Current streak increments by `+1`. If `streakCount > longestStreak`, the all-time record is updated. Awards `+1` coin.
   - **Broken Streak (`diffDays > 1`):** Current streak resets to `1`. The historic `longestStreak` is preserved intact. Awards `+1` coin for logging in today.
3. **Daily Coin Rewards:**
   - Users earn `+1 coin` per distinct calendar day on their first login of that day.
   - The UI includes an interactive status badge (`#coinRewardBadge` / `#coinRewardStatus`) displaying `+1 coin earned today ✓` if already claimed, or indicating available reward on next login.
   - Tracks both current spendable balance (`#coinBalance`) and lifetime coins accumulated (`#coinTotalEarned`).
4. **7-Day Weekly Login Activity Dots (`#streakWeekDots`):**
   - Automatically computes Monday through Sunday dates for the user's active week.
   - Days with recorded logins are marked with `.active` styling and checkmark indicators.
   - Today's date is dynamically highlighted with a glowing accent ring (`.today`).
   - Accessible screen reader attributes (`title`, `aria-label`, and `data-date="YYYY-MM-DD"`) on every indicator.
5. **Data Persistence & Isolation:**
   - Stored in browser `localStorage` under user-isolated keys (`readx_user_${userId}_learning_stats`).
   - Progressively synchronized with MongoDB Atlas via `/api/streak` when database credentials are configured.

---

## 💾 Data Persistence

ReadX uses client-side persistence as its primary data layer to retain application state, preferences, and user-related information with zero latency.

Persistent data supports:

- User preferences and typography settings
- Reading progress and completed sessions
- Notes per topic and document
- Login dates, streak counts, and coin balances

### User Isolation via LocalStorage Keys

To ensure that different user accounts on the same machine do not overwrite each other's data, all persistent keys are scoped to the user ID:

- `readx_user_${userId}_learning_stats`: Streak data, coins, reading time, words read
- `readx_user_${userId}_progress`: Topic progress tracking
- `readx_user_${userId}_settings`: Custom typography and theme preferences
- `readx_notes_${type}_${id}`: Content notes indexed by type and topic ID
- `readx_active_user`: Active session reference

> **Note on Cross-Device Synchronization:**
> Browser `localStorage` is local to the device and browser profile used. Without configuring a backend database (MongoDB Atlas), user progress will not automatically sync across different devices.

---

## 🏗️ System Architecture

ReadX follows a lightweight web architecture built around frontend technologies, browser APIs, document-processing libraries, and serverless AI functionality.

```text
                         ┌───────────────┐
                         │     USER      │
                         └───────┬───────┘
                                 │
                                 ▼
                    ┌───────────────────────┐
                    │     ReadX Frontend    │
                    │                       │
                    │   HTML + CSS + JS     │
                    └───────────┬───────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
          ▼                     ▼                     ▼
   Accessibility          Learning System        Documents
      System                    │                     │
          │                     │                     │
          ▼                     ▼                     ▼
   Typography              Library               PDF.js
   Spacing                 Practice              Mammoth.js
   Reading Guide           Notes
   Line Focus              Progress & Streaks
   Read Aloud
          │                     │                     │
          └─────────────────────┼─────────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   /api/gemini   │
                       │   /api/streak   │
                       │   /api/notes    │
                       │ Serverless API  │
                       └────────┬────────┘
                                │
               ┌────────────────┴────────────────┐
               ▼                                 ▼
      ┌─────────────────┐              ┌──────────────────┐
      │  Google Gemini  │              │  MongoDB Atlas   │
      │       API       │              │    (Optional)    │
      └─────────────────┘              └──────────────────┘
```

---

## 🤖 AI Architecture

The frontend communicates with the serverless backend through:

```text
POST /api/gemini
```

The request flow is:

```text
User
 │
 ▼
ReadX UI
 │
 ▼
js/gemini.js
 │
 │ POST /api/gemini
 ▼
Vercel Serverless Function
 │
 ▼
Google Gemini API
 │
 ▼
AI Response
 │
 ▼
ReadX
```

This keeps the external AI credentials away from browser-side application code.

---

## 🔌 Gemini Client Module

The frontend Gemini helper (`js/gemini.js`) provides reusable functions:

- `ReadXGemini.generate()`
- `ReadXGemini.simplifyText()`
- `ReadXGemini.explainConcept()`
- `ReadXGemini.summarizeText()`
- `ReadXGemini.generateQuiz()`

This abstraction keeps the AI request logic centralized. Individual application features can use these functions without duplicating the API request implementation.

---

## 🛠️ Technology Stack

### Frontend

| Technology | Purpose |
| :--- | :--- |
| **HTML5** | Structure and semantic accessible page content |
| **CSS3** | Styling, custom design tokens, themes, and responsive layouts |
| **JavaScript (ES6+)** | Modular client application logic and interaction |
| **LocalStorage** | Client-side user-isolated persistence |
| **Web Speech API** | Read Aloud (Synthesis) and Speak-to-Write (Recognition) |
| **Web Audio API** | Real-time microphone audio visualizer and level analysis |

### AI & Backend

| Technology | Purpose |
| :--- | :--- |
| **Google Gemini API** | AI-powered text simplification, explanation, and quiz generation |
| **Vercel Serverless Functions** | Backend API proxy layer (`/api/gemini`, `/api/streak`, `/api/notes`) |
| **MongoDB Atlas** | Cloud database persistence for notes and streaks via official `mongodb` driver |
| **Node.js** | Standalone dev server runtime (`dev-server.js`) |
| **Vercel** | Production hosting and serverless deployment |

### Document Processing

| Technology | Purpose |
| :--- | :--- |
| **PDF.js** | Client-side PDF rendering and navigation |
| **Mammoth.js** | Client-side DOCX document extraction |

---

## 📁 Project Structure

```text
Dyslexia-Furnished/
├── api/
│   ├── db.js                      # MongoDB connection manager
│   ├── gemini.js                  # Google Gemini API proxy
│   ├── notes.js                   # MongoDB notes persistence (CRUD)
│   └── streak.js                  # MongoDB login streak & coins persistence
│
├── css/
│   ├── auth.css                   # Authentication form styling
│   ├── components.css             # Modals, buttons, cards, toolbars
│   ├── home.css                   # Landing page layout
│   ├── library.css                # Library topic cards
│   ├── pages.css                  # Dashboard, streak card, and progress styles
│   └── style.css                  # Global tokens, themes, and typography
│
├── js/
│   ├── animations.js              # Page transitions and reveals
│   ├── auth.js                    # User registration, login, and sessions
│   ├── data.js                    # Streak calculation, coins, and learning stats
│   ├── gemini.js                  # Frontend Gemini helper module
│   ├── home.js                    # Landing page interactions
│   ├── library.js                 # Library content browser
│   ├── main.js                    # Navigation, theme switching, and reader tools
│   ├── notes.js                   # Notes drawer, SpeechRecognition & Audio Visualizer
│   ├── practice.js                # Practice quizzes
│   ├── profile.js                 # Dashboard and Live Streak Widget renderer
│   ├── progress.js                # Reading analytics and charts
│   ├── reader.js                  # Core reading interface
│   ├── topics.js                  # Curated topic curriculum
│   ├── upload.js                  # Document upload and parsing
│   ├── mammoth.browser.min.js     # DOCX parser
│   ├── pdf.min.js                 # PDF.js library
│   └── pdf.worker.min.js          # PDF.js worker
│
├── test_files/                    # Automated verification scripts
│   ├── test_dev_server.js         # Local dev server test
│   ├── test_gemini_api.js         # Gemini API test suite (npm test)
│   └── test_readx_login_streak_complete.js # Complete streak & coins test suite
│
├── dev-server.js                  # Zero-dependency local Node.js development server
├── forgot-password.html           # Password recovery page
├── index.html                     # Landing page
├── library.html                   # Learning library
├── login.html                     # User login page
├── package.json                   # Node.js dependencies and scripts
├── practice.html                  # Active recall practice
├── profile.html                   # User profile and streak dashboard
├── progress.html                  # Learning progress and stats
├── reader.html                    # Accessible reader interface
├── README.md                      # Project documentation
├── reset-password.html            # Password reset page
├── signup.html                    # User registration page
├── upload.html                    # Document upload page
└── vercel.json                    # Vercel serverless routing configuration
```

---

## 🧱 Core JavaScript Modules

| Module | Responsibility |
| :--- | :--- |
| **`auth.js`** | Authentication, user session handling, and login streak trigger |
| **`data.js`** | User-isolated persistence, streak math, daily coins, and reading stats |
| **`gemini.js`** | Client-side Gemini request helper |
| **`home.js`** | Landing page functionality |
| **`library.js`** | Library category navigation and topic loading |
| **`main.js`** | Global application functionality, theme switcher, and header |
| **`notes.js`** | Notes drawer, voice dictation, and microphone visualizer |
| **`practice.js`** | Practice questions and quiz evaluation |
| **`profile.js`** | User profile manager and Live Streak Widget rendering |
| **`progress.js`** | Reading analytics and chart visualization |
| **`reader.js`** | Reading interface, typography controls, and focus tools |
| **`topics.js`** | Educational content data |
| **`upload.js`** | Document upload and conversion processing |

---

## 🔄 Complete Application Workflow

```text
                         HOME
                           │
                           ▼
                    LOGIN / SIGNUP
                           │
                           ▼
                        LIBRARY
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
            TOPICS                  MY CONTENT
              │                         │
              ▼                         ▼
           READER                    UPLOAD
              │                         │
              └────────────┬────────────┘
                           │
                           ▼
                     READX MODE
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
      Typography        Read Aloud       AI Tools
          │                │                │
          │                │        ┌───────┼───────┐
          │                │        │       │       │
          │                │        ▼       ▼       ▼
          │                │     Simplify Explain Summarize
          │                │
          │                │                 │
          │                │                 ▼
          │                │                Quiz
          │                │
          └────────────────┼────────────────┘
                           │
                           ▼
                     MAKE MY NOTES / SPEAK-TO-WRITE
                           │
                           ▼
                       NOTES PANEL
                           │
                           ▼
                        PRACTICE
                           │
                           ▼
                        PROGRESS & STREAKS
```

---

## 🔒 Security

ReadX uses a server-side proxy architecture for Google Gemini and MongoDB Atlas integration.

The Gemini API key should never be hardcoded into client-side JavaScript.

The frontend communicates with:

```text
/api/gemini
/api/streak
/api/notes
```

and the backend handles external API and database communications.

### Security Principles

- API credentials remain server-side in environment variables
- Sensitive keys and connection strings are excluded from Git via `.gitignore`
- Frontend code does not directly expose secrets
- Database connection strings are sanitized before any error messages are returned

---

## 📱 Responsive Design

ReadX is designed as a responsive web application.

The interface is intended to remain usable across:

- Desktop
- Laptop
- Tablet
- Mobile

Responsive behavior is particularly important for an accessibility-focused reading application because the available screen size directly affects line length, visual crowding, and readability.

---

## 🎨 Design Philosophy

ReadX follows five primary design principles:

### 01 — Accessibility
Accessibility should be part of the core interface rather than an afterthought.

### 02 — Personalization
Different learners have different preferences. ReadX provides controls so users can customize their experience.

### 03 — Focus
The reading environment should minimize unnecessary visual distractions through tools like Reading Guide and Line Focus.

### 04 — Intelligence
AI should assist users when content becomes difficult, breaking concepts into accessible components.

### 05 — Continuity
Reading, understanding, note-making, practice, and progress tracking should form one continuous workflow.

---

## 📚 Learning Philosophy

ReadX follows an active learning model:

```text
                 READ
                   │
                   ▼
              UNDERSTAND
                   │
                   ▼
               SIMPLIFY
                   │
                   ▼
              MAKE NOTES
                   │
                   ▼
                PRACTICE
                   │
                   ▼
                 REVIEW
                   │
                   ▼
                PROGRESS
```

The purpose is to move the learner from simply consuming information toward understanding and actively working with it.

---

## 🧪 Testing Checklist

### Authentication
- [x] Registration
- [x] Login
- [x] Logout
- [x] Forgot Password
- [x] Password Reset
- [x] Protected pages

### Accessibility
- [x] ReadX Mode
- [x] Font size slider
- [x] Font family switching (OpenDyslexic, Lexend, System)
- [x] Letter spacing
- [x] Word spacing
- [x] Line height
- [x] Reading Guide
- [x] Line Focus
- [x] Read Aloud

### AI Tools
- [x] Text Simplification
- [x] Concept Explanation
- [x] Summarization
- [x] Quiz Generation
- [x] Visual Concept Cards
- [x] Error and timeout handling

### Documents
- [x] PDF loading and navigation
- [x] DOCX processing
- [x] TXT and CSV parsing
- [x] Upload workflow
- [x] Reader integration

### Learning & Progress
- [x] Library and topic navigation
- [x] Make My Notes drawer
- [x] Speak-to-Write voice dictation
- [x] Microphone level visualizer
- [x] Practice quizzes
- [x] Profile dashboard
- [x] Live Login Streak & Daily Coins calculation
- [x] Weekly Monday–Sunday activity dots

---

## 🚀 Getting Started

### Prerequisites

Before running ReadX locally, ensure you have:

- **Node.js** (version 18.x or later)
- **Git**
- A modern web browser (Google Chrome or Microsoft Edge recommended for full Web Speech dictation support)
- A **Google Gemini API Key** (from Google AI Studio)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Anandsahab/Dyslexia-Furnished.git
```

### Step 2: Navigate to Project

```bash
cd Dyslexia-Furnished
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Run Locally

ReadX includes a built-in local Node development server that serves static files and routes all `/api/*` serverless functions:

```bash
npm run dev
```

The application will be accessible at:

```text
http://localhost:3000
```

Alternatively, if you use the Vercel CLI:

```bash
vercel dev
```

---

## 🔑 Environment Configuration

Sensitive API credentials should be configured through environment variables.

Create a `.env` file in the root of the project:

```env
# Google Gemini API Key for Assistive AI Features
GEMINI_API_KEY="your_gemini_api_key_placeholder"

# MongoDB Atlas Connection String (Optional for Cloud Notes & Streak Sync)
MONGODB_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority"
MONGODB_DB_NAME="readx"

# Standalone Dev Server Port (Optional, default: 3000)
PORT=3000
```

The intended request architecture is:

```text
Frontend
   ↓
/api/gemini
   ↓
Gemini API
```

---

## ☁️ Deployment

ReadX is deployed using Vercel.

```text
                    GitHub
                      │
                      ▼
                    Vercel
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
      Frontend              Serverless API
                                  │
                                  ▼
                             Gemini API
```

### Production URL

https://dyslexia-1.vercel.app/

---

## 🗺️ Development Roadmap

### Phase 1 — Accessibility
- [x] ReadX Mode
- [x] Typography controls
- [x] Spacing controls
- [x] Reading Guide
- [x] Line Focus
- [x] Read Aloud

### Phase 2 — Learning Platform
- [x] Library
- [x] Topics
- [x] Reader
- [x] Practice
- [x] Profile
- [x] Progress & Streaks

### Phase 3 — AI Learning
- [x] Gemini integration
- [x] Simplification
- [x] Explanation
- [x] Summarization
- [x] Quiz generation
- [x] Make My Notes & Speak-to-Write

### Phase 4 — User Management & Gamification
- [x] Registration
- [x] Login & Logout
- [x] Forgot Password
- [x] Password Reset
- [x] Live Login Streak tracking
- [x] Daily Coin Rewards

---

## 🔮 Future Scope

ReadX can be expanded into a broader personalized learning ecosystem.

### 🤖 Personalized AI Tutor
Future versions could provide a context-aware AI tutor capable of maintaining the learner's current topic and providing personalized interactive voice explanations.

### 🧠 Adaptive Learning
The system could recommend content based on learning history, practice performance, topic completion, and reading activity.

### 📊 Advanced Analytics
Future progress analytics could include detailed reading velocity, topic mastery indicators, and spaced repetition schedules.

### 🌍 Multilingual Accessibility
AI-powered translation and multilingual explanations could help make learning material accessible across multiple languages.

### 📱 Mobile Application
ReadX could eventually be extended into dedicated Android and iOS applications or an offline-first Progressive Web App (PWA).

### 📡 Offline Reading
Frequently used learning material could be cached for offline access.

### 🎙️ Advanced Voice Learning
The current Read Aloud and Speak-to-Write functionality could be expanded into interactive two-way voice-based learning.

---

## 📌 Project Status

**Status: Active Development**

ReadX currently provides an integrated environment for:

- Accessibility-focused reading
- Typography customization (OpenDyslexic, Lexend, System fonts)
- Visual reading assistance (Reading Guide, Line Focus)
- Read Aloud (Text-to-Speech)
- Educational content library
- Document reading (PDF, DOCX, TXT, CSV)
- AI assistance (simplification, explanations, summaries, quiz generation)
- Notes generation & Speak-to-Write dictation
- Practice and active recall
- Authentication and password recovery
- User profiles and reading statistics
- **Live Login Streak tracking and Daily Coin rewards**

The platform is deployed and available as a live web application.

---

## 🎯 Why ReadX?

ReadX is built around one central idea:

**Learning should adapt to the learner.**

A learner should not have to leave the reading platform every time they need a different kind of assistance.

Instead:

```text
                    READX
                      │
       ┌──────────────┼──────────────┐
       │              │              │
       ▼              ▼              ▼
   ACCESSIBILITY      AI          LEARNING
       │              │              │
       ▼              ▼              ▼
  Typography       Simplify       Library
  Reading Guide    Explain        Reader
  Line Focus       Summarize      Practice
  Read Aloud       Quiz           Notes & Dictation
                                  Progress & Streaks
       │              │              │
       └──────────────┼──────────────┘
                      ▼
             COMPLETE LEARNING
                 EXPERIENCE
```

---

## 🌱 Impact

The purpose of ReadX is not simply to add accessibility controls to an existing reader.

The larger objective is to create a learning environment where:

- Content can be personalized
- Difficult information can be simplified
- Learners can listen instead of only reading
- Learners can dictate notes via Speak-to-Write
- Long content can be converted into notes
- Learners can practice what they study
- Daily streaks and rewards motivate consistent learning
- Multiple learning tools exist in one unified place

ReadX therefore combines accessibility + AI + education into one platform.

---

## 👥 Team

ReadX was developed as a collaborative academic project.

The project involved contributions across areas including:

- Frontend development
- UI/UX design
- Accessibility implementation
- Authentication
- AI integration
- Document processing
- Notes functionality & Speak-to-Write
- Learning modules
- Practice functionality
- Login streak & gamification
- Testing & debugging
- Deployment

---

## 🌐 Project Links

| Resource | Link |
| :--- | :--- |
| **🚀 Live Application** | https://dyslexia-1.vercel.app/ |
| **💻 GitHub Repository** | https://github.com/Anandsahab/Dyslexia-Furnished |

---

## ⚠️ Disclaimer

ReadX is an educational and accessibility-focused software project.

It is intended to provide reading assistance and learning support.

ReadX is not a medical diagnostic tool, medical device, or replacement for professional assessment, diagnosis, or clinical treatment of dyslexia or learning disabilities.

AI-generated explanations, summaries, notes, and quizzes may contain inaccuracies and should be reviewed against primary educational materials.

---

## 📄 License

This project was developed for educational and academic purposes.

<div align="center">
  <h3>🧠 ReadX</h3>
  <p><strong>Accessible Reading • AI Assistance • Smarter Learning</strong></p>
  <p><em>Read better. Understand easier. Learn your way.</em></p>
  <br>
  <a href="https://dyslexia-1.vercel.app/">
    <strong>🚀 Experience ReadX</strong>
  </a>
  <br><br>
  <p>Made with ❤️ by the ReadX Team</p>
</div>
