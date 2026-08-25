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
  <img src="https://img.shields.io/badge/PDF.js-Document%20Processing-red" alt="PDF.js">
  <img src="https://img.shields.io/badge/Mammoth.js-DOCX%20Processing-orange" alt="Mammoth.js">
  <img src="https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel&logoColor=white" alt="Vercel">
</p>

---

# 🌐 Live Application

## 🚀 [Open ReadX](https://dyslexia-1.vercel.app/)

**Production URL:** https://dyslexia-1.vercel.app/

ReadX is deployed as a live web application using Vercel.

The platform can be accessed directly from a modern web browser without requiring users to install a desktop application.

---

# 📖 Table of Contents

- [What is ReadX?](#-what-is-readx)
- [Understanding Dyslexia](#-understanding-dyslexia)
- [Problem Statement](#-problem-statement)
- [Project Goal](#-project-goal)
- [Project Objectives](#-project-objectives)
- [Our Solution](#-our-solution)
- [Why ReadX?](#-why-readx)
- [Core Features](#-core-features)
- [Accessibility Features](#-accessibility-features)
- [Typography Controls](#-typography-controls)
- [Reading Guide](#-reading-guide)
- [Line Focus](#-line-focus)
- [Read Aloud](#-read-aloud)
- [ReadX Mode](#-readx-mode)
- [Learning Library](#-learning-library)
- [Reader](#-reader)
- [Document Upload](#-document-upload)
- [PDF Support](#-pdf-support)
- [AI-Powered Learning](#-ai-powered-learning)
- [AI Simplification](#-ai-text-simplification)
- [AI Explanations](#-ai-concept-explanation)
- [AI Summarization](#-ai-summarization)
- [AI Quiz Generation](#-ai-quiz-generation)
- [Make My Notes](#-make-my-notes)
- [Notes Panel](#-notes-panel)
- [Practice](#-practice)
- [Authentication](#-authentication)
- [Forgot Password](#-forgot-password)
- [Profile](#-user-profile)
- [Progress](#-learning-progress)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [AI Architecture](#-ai-architecture)
- [Project Structure](#-project-structure)
- [Application Workflow](#-application-workflow)
- [Security](#-security)
- [Responsive Design](#-responsive-design)
- [Design Philosophy](#-design-philosophy)
- [Getting Started](#-getting-started)
- [Environment Configuration](#-environment-configuration)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Future Scope](#-future-scope)
- [Project Status](#-project-status)
- [Team](#-team)
- [Disclaimer](#-disclaimer)
- [License](#-license)

---

# 📖 What is ReadX?

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
- Notes Panel
- Learning Library
- Practice
- Authentication
- Password recovery
- User profiles
- Learning progress

The central philosophy of ReadX is:

> **Reading should adapt to the learner — not the learner to the reading interface.**

---

# 🧠 Understanding Dyslexia

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

# 💻 Dyslexia and Digital Reading

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

🎯 Problem Statement

Modern education increasingly depends on digital content.

Students regularly interact with websites, PDFs, online documentation, assignments, and digital study material.

However, most platforms still follow a one-size-fits-all reading model.

This creates several problems.

Problem 1 — Fixed Typography

Most websites provide limited control over typography.

Users often cannot freely customize:

Font size
Font family
Letter spacing
Word spacing
Line height

A fixed typography system may not provide the most comfortable reading experience for every learner.

Problem 2 — Dense Content

Educational material can contain long paragraphs and large amounts of information.

Dense content can make it harder to maintain visual focus while reading.

Problem 3 — Losing Reading Position

When reading long paragraphs, users can lose track of the line they were reading.

This becomes particularly inconvenient when the page contains large amounts of text.

Problem 4 — Complex Language

Academic and technical material often contains terminology that is difficult to understand immediately.

A learner may understand the topic better if the same concept is explained using simpler language.

Problem 5 — Long Documents

Students frequently work with:

PDFs
DOCX files
Lecture notes
Assignments
Study material

These documents are not always designed with accessibility-focused reading controls.

Problem 6 — Limited Audio Support

Some learners may benefit from hearing educational content instead of relying entirely on visual reading.

Traditional document readers may not provide an integrated reading workflow around this.

Problem 7 — Manual Note Making

Students often spend additional time converting long educational content into concise notes.

This separates the reading process from the revision process.

Problem 8 — Fragmented Learning Tools

A typical learning workflow may require multiple applications:
```
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

🎯 Project Goal

The main goal of ReadX is to create a single, accessible learning environment where users can read, understand, organize, practice, and track educational content.

The intended workflow is:
```
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

🎯 Project Objectives
01 — Improve Reading Comfort

Provide learners with controls that allow them to customize the visual presentation of content.

02 — Improve Reading Focus

Provide tools such as Reading Guide and Line Focus to help users concentrate on relevant content.

03 — Provide Alternative Reading Methods

Support audio-assisted reading through Read Aloud.

04 — Simplify Complex Content

Use Gemini AI to transform difficult content into easier-to-understand explanations.

05 — Support Revision

Generate structured notes from learning material.

06 — Encourage Active Learning

Generate quizzes and provide practice functionality.

07 — Centralize Learning Tools

Bring reading, accessibility, AI, notes, practice, and progress into one platform.

💡 Our Solution

ReadX combines accessibility, AI, and learning tools into one environment.
```
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
    Line Focus                           Progress
    Read Aloud
          │                │                │
          └────────────────┼────────────────┘
                           ▼
                 Personalized Learning
```

✨ Core Features:
1. Feature	Description
2. ReadX Mode	Accessibility-focused reading environment
3. Typography Controls	Customizable font and reading presentation
4. Spacing Controls	Adjust visual spacing for comfortable reading
5. Reading Guide	Helps maintain reading position
6. Line Focus	Focuses attention on the current reading area
7. Read Aloud	Converts content into speech
8. Library	Structured learning resources
9. Reader	Dedicated educational reading environment
10. PDF Support	Browser-based PDF reading
11. Document Upload	Upload and process learning documents
12. AI Simplification	Makes complex content easier to understand
13. AI Explanation	Explains difficult concepts
14. AI Summary	Creates concise summaries
15. AI Quiz	Generates multiple-choice questions
16. Make My Notes	Converts content into structured notes
17. Notes Panel	Dedicated notes interface
18. Practice	Supports active learning
19. Authentication	Account-based user experience
20. Forgot Password	Password recovery workflow
21. Profile	Personalized user information
22. Progress	Learning progress functionality

♿ Accessibility Features

Accessibility is a core part of ReadX.

The platform does not treat accessibility as a single feature.

Instead, multiple accessibility controls work together.
```
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

🔤 Typography Controls

Typography is one of the most important parts of a digital reading interface.

ReadX gives users greater control over how written content is displayed.

Font Size

Users can adjust the size of displayed text according to their preference.

This helps users avoid being restricted to one predefined text size.

Font Family

Different fonts can produce different visual reading experiences.

ReadX provides typography customization so users can select a more comfortable presentation.

Letter Spacing

Letter spacing controls the amount of horizontal space between individual characters.

This provides additional control over text density.

Word Spacing

Word spacing controls the visual separation between words.

This can help users who prefer more clearly separated words.

Line Height

Line height controls the vertical distance between lines.

Increasing line height can create more visual separation between consecutive lines

📏 Spacing Customization

ReadX provides additional control over text spacing.

Users can customize aspects of the reading layout including:

Letter spacing
Word spacing
Line spacing
Text density

The objective is to allow users to create a reading environment that feels more comfortable for their preferences.

🎯 Reading Guide

The Reading Guide helps users maintain visual focus while moving through content.

Long-form reading can make it difficult to continuously track the current line.

The Reading Guide provides a visual reference that directs attention toward the relevant reading area.
```
Long Educational Content
          ↓
     Reading Guide
          ↓
   Focused Reading Area
          ↓
   Easier Visual Tracking
```

🔎 Line Focus

Line Focus provides another visual concentration mechanism.

Instead of requiring the user to visually process the entire page at once, Line Focus emphasizes the relevant reading area.

This can be useful for:

Long paragraphs
Articles
Technical documentation
Educational content
Large reading sections
🔊 Read Aloud

ReadX includes a browser-based Read Aloud feature.

It uses speech capabilities available in the browser to convert written content into audio.

Read Aloud provides:
Audio-assisted reading
Alternative content consumption
Multi-modal learning
Reading reinforcement
Support for longer reading sessions

The feature is integrated directly into the ReadX reading experience.

📖 ReadX Mode

ReadX Mode is the dedicated accessibility-focused reading environment.

Instead of presenting content through a standard page layout, ReadX Mode brings the reading controls together.
```
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

📚 Learning Library

The Library is the central content discovery area of ReadX.

It organizes educational material into structured learning topics.

Instead of presenting every resource together, the Library separates content into manageable sections.
```
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

📑 PDF Support

ReadX uses PDF.js for PDF-related functionality.

PDF documents can be processed and displayed inside the browser.

The objective is to connect PDF reading with ReadX's accessibility and learning features.
```
PDF
 ↓
PDF.js
 ↓
ReadX Reader
 ↓
Accessibility Controls
 ↓
AI Assistance
 ↓
Notes
📄 DOCX Support
```
ReadX uses Mammoth.js for processing Word documents.

This allows supported DOCX content to be transformed into browser-readable content.

The processed content can then be used within the broader ReadX learning workflow.

🤖 AI-Powered Learning

ReadX integrates Google Gemini into its learning experience.

The AI layer provides multiple specialized operations instead of functioning only as a general chatbot.

AI capabilities include:
Text Simplification
Concept Explanation
Summarization
Quiz Generation
General Text Generation

🧠 AI Text Simplification

The Simplify feature converts complex educational material into easier-to-understand language.
```
Complex Content
      │
      ▼
Google Gemini
      │
      ▼
Simplified Content
```
This can be useful when learners encounter dense or complicated explanations.

💡 AI Concept Explanation

The Explain feature allows users to request an explanation of a difficult concept or technical term.
```
Difficult Concept
       ↓
    AI Request
       ↓
  Explanation
       ↓
Better Understanding
```
This keeps AI assistance close to the learning content.

📝 AI Summarization

The Summarize feature creates a concise version of longer educational material.

This can be useful for:

Revision
Quick review
Long articles
Study material
Documents
Long Content
     ↓
  Gemini AI
     ↓
Concise Summary
❓ AI Quiz Generation

ReadX can generate multiple-choice quiz questions from educational content.

This helps move the learner from passive reading toward active recall.

Learning Material
       ↓
    Gemini AI
       ↓
Generated Questions
       ↓
     Practice

The quiz workflow provides an additional way for learners to check their understanding.

📝 Make My Notes

Make My Notes is designed to reduce the manual effort involved in creating revision material.

Instead of reading a long document and manually writing every important point, the learner can use the notes workflow.

Educational Content
        ↓
   Make My Notes
        ↓
     AI Processing
        ↓
   Structured Notes
        ↓
      Revision

The generated notes can then be accessed through the Notes Panel.

🗒️ Notes Panel

The Notes Panel provides a dedicated interface for accessing learning notes.

The purpose is to keep note-taking connected to the reading experience.

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

This allows users to transition from reading to revision without leaving the learning environment.

🧩 Practice

ReadX connects reading with active learning through its Practice functionality.

The objective is to prevent the learning experience from ending immediately after reading.

The workflow becomes:

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
🔐 Authentication

ReadX provides user authentication functionality.

The authentication workflow includes:

Account registration
Login
Logout
User sessions
Protected functionality
User-specific information

Authentication allows ReadX to provide a more personalized learning experience.

🔑 Forgot Password

ReadX includes a password recovery workflow.

Login
  ↓
Forgot Password
  ↓
Recovery
  ↓
Reset Password
  ↓
Login Again

This allows users to recover their accounts without creating a new account.

👤 User Profile

The Profile section provides a dedicated space for user information.

It forms part of the personalized experience of the platform.

The profile system can also act as the foundation for future personalized learning features.

📊 Learning Progress

ReadX includes learning progress functionality.

Progress tracking connects the user's reading and practice activity with a longer-term learning journey.

Content
  ↓
Reading
  ↓
Practice
  ↓
Progress
  ↓
Continued Learning

Future versions can extend this functionality into deeper learning analytics.

💾 Data Persistence

ReadX uses client-side persistence where appropriate to retain application state, preferences, and user-related information.

This helps maintain a consistent experience across sessions.

Persistent data can support:

User preferences
Reading settings
Application state
Learning information
🏗️ System Architecture

ReadX follows a lightweight web architecture built around frontend technologies, browser APIs, document-processing libraries, and serverless AI functionality.

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
   Spacing                  Practice              Mammoth.js
   Reading Guide            Notes
   Line Focus               Progress
   Read Aloud
          │                     │                     │
          └─────────────────────┼─────────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   /api/gemini   │
                       │ Serverless API  │
                       └────────┬────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Google Gemini   │
                       │      API        │
                       └─────────────────┘
🤖 AI Architecture

The frontend communicates with the serverless backend through:

POST /api/gemini

The request flow is:

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

This keeps the external AI credential away from the browser-side application code.

🔌 Gemini Client Module

The frontend Gemini helper provides reusable functions:

ReadXGemini.generate()

ReadXGemini.simplifyText()

ReadXGemini.explainConcept()

ReadXGemini.summarizeText()

ReadXGemini.generateQuiz()

This abstraction keeps the AI request logic centralized.

Individual application features can use these functions without duplicating the API request implementation.

🛠️ Technology Stack
Frontend
Technology	Purpose
HTML5	Structure and semantic page content
CSS3	Styling, responsive layouts and accessibility UI
JavaScript ES6+	Application logic and interaction
LocalStorage	Client-side persistence
Web Speech API	Read Aloud functionality
AI & Backend
Technology	Purpose
Google Gemini API	AI-powered learning assistance
Vercel Serverless Functions	Backend API layer
Vercel	Production deployment
Document Processing
Technology	Purpose
PDF.js	PDF rendering
Mammoth.js	DOCX processing
📁 Project Structure
Dyslexia-Furnished/
│
├── api/
│   ├── gemini.js
│   └── auth-reset.js
│
├── css/
│   ├── auth.css
│   ├── components.css
│   ├── home.css
│   ├── library.css
│   ├── pages.css
│   └── style.css
│
├── js/
│   ├── animations.js
│   ├── auth.js
│   ├── data.js
│   ├── gemini.js
│   ├── home.js
│   ├── library.js
│   ├── main.js
│   ├── notes.js
│   ├── practice.js
│   ├── profile.js
│   ├── progress.js
│   ├── reader.js
│   ├── topics.js
│   ├── upload.js
│   ├── mammoth.browser.min.js
│   ├── pdf.min.js
│   └── pdf.worker.min.js
│
├── index.html
├── login.html
├── signup.html
├── forgot-password.html
├── reset-password.html
├── library.html
├── reader.html
├── upload.html
├── practice.html
├── profile.html
├── progress.html
│
├── package.json
├── vercel.json
└── README.md
🧱 Core JavaScript Modules
Module	Responsibility
auth.js	Authentication and user session handling
data.js	Shared application data
gemini.js	Client-side Gemini request helper
home.js	Landing page functionality
library.js	Library functionality
main.js	Shared application functionality
notes.js	Notes Panel and notes functionality
practice.js	Practice functionality
profile.js	User profile
progress.js	Learning progress
reader.js	Reading interface
topics.js	Topic and content functionality
upload.js	Document upload and processing
🔄 Complete Application Workflow
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
                     MAKE MY NOTES
                           │
                           ▼
                       NOTES PANEL
                           │
                           ▼
                        PRACTICE
                           │
                           ▼
                         PROGRESS
🔒 Security

ReadX uses a server-side proxy architecture for Gemini integration.

The Gemini API key should never be hardcoded into client-side JavaScript.

The frontend communicates with:

/api/gemini

and the serverless backend handles the external Gemini API request.

Security principles
API credentials remain server-side
Sensitive values should use environment variables
API keys should not be committed to GitHub
Frontend code should not directly expose secrets
Backend errors should be handled safely
📱 Responsive Design

ReadX is designed as a responsive web application.

The interface is intended to remain usable across:

Desktop
Laptop
Tablet
Mobile

Responsive behavior is particularly important for an accessibility-focused reading application because the available screen size directly affects the reading experience.

🎨 Design Philosophy

ReadX follows five primary design principles.

01 — Accessibility

Accessibility should be part of the core interface rather than an afterthought.

02 — Personalization

Different learners have different preferences.

ReadX provides controls so users can customize their experience.

03 — Focus

The reading environment should minimize unnecessary visual distractions.

04 — Intelligence

AI should assist users when content becomes difficult.

05 — Continuity

Reading, understanding, note-making, practice, and progress should form one continuous workflow.

📚 Learning Philosophy

ReadX follows an active learning model.

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

The purpose is to move the learner from simply consuming information toward understanding and actively working with it.

🧪 Testing Checklist
Authentication
 Registration
 Login
 Logout
 Forgot Password
 Password Reset
 Protected pages
Accessibility
 ReadX Mode
 Font size
 Font family
 Letter spacing
 Word spacing
 Line height
 Reading Guide
 Line Focus
 Read Aloud
AI
 Text Simplification
 Concept Explanation
 Summarization
 Quiz Generation
 General Generation
 Error Handling
 Empty Response Handling
Documents
 PDF loading
 PDF navigation
 DOCX processing
 Upload workflow
 Reader integration
Learning
 Library
 Topics
 Notes
 Practice
 Profile
 Progress
🚀 Getting Started
Prerequisites

Before running ReadX locally, make sure you have:

Git
Node.js
A modern web browser
Vercel CLI
Required Gemini API configuration
Clone Repository
git clone https://github.com/Anandsahab/Dyslexia-Furnished.git
Navigate to Project
cd Dyslexia-Furnished
Install Dependencies
npm install
Run Locally

Because ReadX contains serverless API functionality, use a Vercel development environment when testing the complete application locally.

vercel dev

The local Vercel environment allows the frontend and /api functions to operate together.

🔑 Environment Configuration

Sensitive API credentials should be configured through environment variables.

The Gemini API key should remain on the server-side.

Do not place the API key inside:

js/gemini.js

or any other public frontend file.

The intended request architecture is:

Frontend
   ↓
/api/gemini
   ↓
Gemini API
☁️ Deployment

ReadX is deployed using Vercel.

Deployment architecture
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
Production URL

https://dyslexia-1.vercel.app/

🗺️ Development Roadmap
Phase 1 — Accessibility
 ReadX Mode
 Typography controls
 Spacing controls
 Reading Guide
 Line Focus
 Read Aloud
Phase 2 — Learning Platform
 Library
 Topics
 Reader
 Practice
 Profile
 Progress
Phase 3 — AI Learning
 Gemini integration
 Simplification
 Explanation
 Summarization
 Quiz generation
 Make My Notes
Phase 4 — User Management
 Registration
 Login
 Logout
 Forgot Password
 Password Reset
Future Enhancements
 Personalized AI tutor
 Adaptive learning recommendations
 Advanced learning analytics
 More accessibility profiles
 Multilingual AI assistance
 Offline reading
 Advanced voice interaction
 Personalized study plans
 Expanded practice system
 Mobile application
🔮 Future Scope

ReadX can be expanded into a broader personalized learning ecosystem.

🤖 Personalized AI Tutor

Future versions could provide a context-aware AI tutor capable of maintaining the learner's current topic and providing personalized explanations.

🧠 Adaptive Learning

The system could recommend content based on:

Learning history
Practice performance
Topic completion
Reading activity
📊 Advanced Analytics

Future progress analytics could include:

Reading time
Topic mastery
Practice accuracy
Learning streaks
Revision frequency
🌍 Multilingual Accessibility

AI-powered translation and multilingual explanations could help make learning material accessible to more users.

📱 Mobile Application

ReadX could eventually be extended into dedicated Android and iOS applications.

📡 Offline Reading

Frequently used learning material could eventually be available for offline access.

🎙️ Advanced Voice Learning

The current Read Aloud functionality could be expanded into interactive voice-based learning.

📌 Project Status

Status: Active Development

ReadX currently provides an integrated environment for:

Accessibility-focused reading
Typography customization
Visual reading assistance
Read Aloud
Educational content
Document reading
PDF support
AI assistance
Notes generation
Practice
Authentication
Password recovery
User profiles
Learning progress

The platform is deployed and available as a live web application.

🎯 Why ReadX?

ReadX is built around one central idea:

Learning should adapt to the learner.

A learner should not have to leave the reading platform every time they need a different kind of assistance.

Instead:

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
  Read Aloud       Quiz           Notes
                                  Progress
       │              │              │
       └──────────────┼──────────────┘
                      ▼
             COMPLETE LEARNING
                 EXPERIENCE
🌱 Impact

The purpose of ReadX is not simply to add accessibility controls to an existing reader.

The larger objective is to create a learning environment where:

Content can be personalized
Difficult information can be simplified
Learners can listen instead of only reading
Long content can be converted into notes
Learners can practice what they study
Progress can be tracked
Multiple learning tools can exist in one place

ReadX therefore combines accessibility + AI + education into one platform.

👥 Team

ReadX was developed as a collaborative academic project.

The project involved contributions across areas including:

Frontend development
UI/UX design
Accessibility implementation
Authentication
AI integration
Document processing
Notes functionality
Learning modules
Practice functionality
Testing
Debugging
Deployment
🌐 Project Links
Resource	Link
🚀 Live Application	https://dyslexia-1.vercel.app/
💻 GitHub Repository	https://github.com/Anandsahab/Dyslexia-Furnished
⚠️ Disclaimer

ReadX is an educational and accessibility-focused software project.

It is intended to provide reading assistance and learning support.

ReadX is not a medical diagnostic tool, medical device, or replacement for professional assessment, diagnosis, or treatment.

AI-generated explanations, summaries, notes, and quizzes may contain inaccuracies and should be reviewed by the learner.

📄 License

This project was developed for educational and academic purposes.

<div align="center">
🧠 ReadX
Accessible Reading • AI Assistance • Smarter Learning

Read better. Understand easier. Learn your way.

<br> <a href="https://dyslexia-1.vercel.app/">

🚀 Experience ReadX

</a>

<br><br>

Made with ❤️ by the ReadX Team

</div> ```

This is actually expanded rather than padding the README with repeated sentences. It covers the complete product story from dyslexia → problem → goal → solution → accessibility → typography → reading tools → AI → notes → learning → architecture → implementation → deployment → future scope.
