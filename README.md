# ReadX

ReadX is an accessibility-focused learning platform designed to make digital educational content easier to read, understand, and interact with.

---

## 1. Project Overview

Digital learning platforms often present dense, uniform text structures that create unnecessary cognitive friction for diverse readers, particularly individuals with reading challenges such as dyslexia or visual fatigue.

**ReadX** addresses this barrier by separating educational content from its visual presentation. Instead of modifying or dumbing down the curriculum, ReadX provides an adaptable reading environment where learners can dynamically adjust typography, letter and word spacing, line height, contrast themes, sentence-level focus, and auditory feedback.

By empowering learners to customize how information is visually and aurally presented, ReadX makes complex educational material more approachable and comfortable to consume.

---

## 2. Key Features

* **ReadX Mode**: A global toggle that instantly activates dyslexia-friendly typography, optimized line/character spacing, and high-legibility styling across the interface.
* **Granular Typography & Spacing Controls**: Real-time slider and selector controls for Font Size, Letter Spacing, Word Spacing, Line Height, and Font Families (OpenDyslexic, Lexend, and Inter).
* **Sentence-Level Focus & Guide Tools**: Visual reading aids including customizable reading rulers and single-sentence spotlight focus to maintain reading tracking and prevent line jumping.
* **Text-to-Speech (TTS) Read Aloud**: Built-in browser speech synthesis integration with sentence synchronization, pause/resume, and speed controls.
* **Curated Educational Library**: Topic-based learning modules spanning Data Structures & Algorithms, Machine Learning, Web Development, and Core Computer Science concepts.
* **Interactive Code & Learning Workspace**: Multi-view reading workspace supporting side-by-side concept explanations, formatted code blocks, and visual diagrams.
* **Practice & Assessment Modules**: Topic-wise multiple-choice questions (MCQs) with instant feedback, explanation breakdowns, and score tracking.
* **My Content (Personal Document Reader)**: Upload and reader support for user documents (PDF, DOCX, TXT, code files, and images) with instant ReadX text extraction and accessible presentation.
* **Learning Analytics & Profile**: Local tracking of reading streaks, completed topics, practice accuracy, time spent reading, and saved accessibility preferences.
* **Responsive, Adaptive Interface**: Fully responsive design supporting desktop, tablet, and mobile viewing environments.

---

## 3. How ReadX Works

The standard learning flow in ReadX is structured as follows:

```text
User enters ReadX
       ↓
Explores curated curriculum or uploads personal material
       ↓
Selects a topic or document
       ↓
Opens content in the adaptive Reader
       ↓
Activates ReadX Mode or customizes typography & spacing
       ↓
Engages assistive tools (Sentence Focus / Ruler / TTS Read Aloud)
       ↓
Tests understanding with Practice MCQs & tracks progress in Profile
```

---

## 4. Pages & Navigation

| Page | File | Purpose |
| :--- | :--- | :--- |
| **Home** | `index.html` | Platform introduction, live interactive demo card, feature breakdown, and quick start access. |
| **Library** | `library.html` | Structured educational repository organized by engineering disciplines and learning tracks. |
| **My Content** | `upload.html` | Personal document hub allowing users to upload, preview, and read external files with ReadX adaptation. |
| **Practice** | `practice.html` | Topic-wise quizzes, concept verification questions, and immediate performance analysis. |
| **Reader** | `reader.html` | Dedicated clean reading environment for long-form study material. |
| **Profile** | `profile.html` | User dashboard showing learning streaks, practice accuracy, reading history, and saved settings. |
| **Authentication** | `login.html`, `signup.html` | Local user session management and personalized preference storage. |

---

## 5. Technology Stack

* **Core Structure**: HTML5 semantic markup
* **Styling & Design System**: Modern CSS3 (CSS Custom Properties, Flexbox, CSS Grid)
* **Application Logic**: Vanilla JavaScript (ES6+)
* **Browser Web APIs**:
  * Web Speech API (`SpeechSynthesis`) for Text-to-Speech
  * Web Storage API (`localStorage`) for persistence of settings and progress
  * File and Blob APIs for client-side document processing
* **Client-Side Libraries**:
  * PDF.js for client-side PDF document parsing
  * Mammoth.js for client-side `.docx` text extraction
  * SheetJS (xlsx) for spreadsheet previews
* **Deployment & Hosting**: Vercel

---

## 6. Project Structure

```text
Dyslexia-Furnished/
├── assets/                  # Brand logos, icons, and static image assets
├── css/
│   ├── auth.css             # Authentication views styling
│   ├── components.css       # Shared UI components (navbar, footer, toggles, modals)
│   ├── home.css             # Landing page layout and hero animations
│   ├── library.css          # Library grid and interactive workspace styling
│   ├── pages.css            # Practice, profile, upload, and reader view styles
│   └── style.css            # Global design tokens, color themes, and typography
├── js/
│   ├── animations.js        # Scroll reveals and interface micro-interactions
│   ├── auth.js              # Local authentication and user profile sessions
│   ├── data.js              # Educational content database and practice questions
│   ├── home.js              # Landing page interactive demonstrations
│   ├── library.js           # Topic filtering, workspace rendering, and search
│   ├── main.js              # Global application controller, navbar, and settings panel
│   ├── mammoth.browser.min.js # DOCX client-side parsing library
│   ├── notes.js             # Personal notes and bookmarking utilities
│   ├── pdf.min.js           # PDF parsing engine
│   ├── pdf.worker.min.js    # PDF.js background worker
│   ├── practice.js          # MCQ assessment engine and score evaluation
│   ├── profile.js           # Learning metrics and analytics dashboard
│   ├── reader.js            # Standalone long-form reader logic
│   ├── topics.js            # Learning pathway taxonomies
│   ├── upload.js            # File upload processing and document reader modal
│   └── xlsx.mini.min.js     # Spreadsheet processing engine
├── index.html               # Home landing page
├── library.html             # Library and topic workspace
├── login.html               # Sign-in page
├── practice.html            # Practice quizzes page
├── profile.html             # User profile and metrics page
├── reader.html              # Dedicated reader view
├── signup.html              # Registration page
├── upload.html              # My Content document reader
├── vercel.json              # Vercel deployment routing configuration
├── package.json             # Project metadata
└── README.md                # Project documentation
```

---

## 7. Accessibility Approach

ReadX is built around evidence-informed accessibility best practices for digital reading:

* **Specialized Typography**: Support for OpenDyslexic (weighted bottom design to prevent letter flipping/swapping), Lexend (empirically designed for improved reading fluency), and Inter.
* **Controlled Spacing**: User-adjustable letter tracking and word spacing to reduce visual crowding.
* **Customizable Line Spacing**: Flexible line-height scaling to assist readers in tracking from the end of one line to the beginning of the next.
* **Reduced Visual Complexity**: Clean content chunking that breaks dense paragraphs into digestible reading blocks.
* **Auditory Support**: Natural multi-voice speech synthesis that pairs auditory intake with visual reading.
* **Visual Guides**: Adjustable horizontal ruler overlays and focus lines that anchor reader eye movement.
* **User Control**: All accessibility enhancements are optional and adjustable to each individual's needs.

> *Note: ReadX is an educational assistive technology tool designed to enhance reading comfort and clarity. It is not a medical diagnostic or treatment platform.*

---

## 8. Design System

ReadX uses a curated visual theme engineered for long reading sessions and reduced eye strain:

* **Dark Graphite Base** (`#151713`, `#1E211B`): Deep tonal surfaces that eliminate harsh glare.
* **Warm Cream Typography** (`#F1EFE7`, `#E2DFD2`): Soft, high-contrast text scales that avoid the harshness of pure white text on black.
* **Olive & Ochre Accents** (`#D9834F`, `#E6C875`): Subdued highlight tones providing clear visual distinction without distraction.
* **Layered Surfaces**: Clean borders, subtle shadows, and distinct interactive states that ensure visual hierarchy and readability.

---

## 9. Getting Started

Since ReadX is built with native web standards (HTML5, CSS3, and Vanilla JavaScript), running it locally is straightforward and requires no build steps or package installation.

### Prerequisites
* Any modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).

### Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Anandsahab/Dyslexia-Furnished.git
   ```

2. **Navigate to the project directory**:
   ```bash
   cd Dyslexia-Furnished
   ```

3. **Open with a local web server**:
   Due to browser security restrictions on Web Workers and Blob URLs (used for PDF and DOCX client-side processing), it is recommended to run the project via a local HTTP server rather than opening files directly from the filesystem.

   * *Using VS Code*: Open the folder and click **Go Live** with the **Live Server** extension.
   * *Using Python 3*:
     ```bash
     python -m http.server 8000
     ```
   * *Using Node.js (`npx`)*:
     ```bash
     npx serve .
     ```

4. **Access the application**:
   Open your browser and navigate to `http://localhost:8000` (or the URL provided by your local server).

---

## 10. Deployment

The project is structured as a static web application and is configured for continuous deployment via **Vercel**.

Configuration is maintained in `vercel.json` with clean URL rewriting enabled:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "cleanUrls": true,
  "trailingSlash": false
}
```

---

## 11. Future Improvements

The following features represent planned enhancements for future iterations of ReadX:

* **Expanded Course Library**: Additional STEM disciplines, mathematics notation rendering, and interactive coding sandboxes.
* **Enhanced Document Parsing**: Multi-column PDF layout reconstruction and OCR text recognition for scanned documents.
* **Advanced Practice Analytics**: Granular topic mastery heatmaps and spaced repetition recommendations.
* **Offline PWA Support**: Progressive Web App capabilities for offline reading and local document caching.
* **Bionic Reading & Syllable Segmentation**: Optional visual fixation guides and phoneme breakdown tools.

---

## 12. Project Goal

**ReadX** aims to make digital learning more adaptable, comfortable, and accessible by changing the reading experience rather than changing the educational content.
