# Linguistix: Premium Transliteration Engine

Linguistix is a high-performance, AI-powered Indian script transliteration application designed for accuracy, speed, and cross-modal flexibility. It leverages Google Gemini AI alongside specialized OCR and PDF processing libraries to provide a premium phonetic transformation experience.

---

## 🚀 Key Features

### 1. Multi-Modal Input
- **Text Transliteration:** High-speed phonetic transformation of real-time text input into various Indian scripts (Hindi, Marathi, Sanskrit, etc.).
- **Visual OCR (Image Processing):** Upload images containing text (signs, documents, handwritten notes) and extract/transliterate them instantly using Tesseract.js and Gemini.
- **Document Processing (PDF):** Upload PDF files, parse their content, and receive a complete transliterated version.

### 2. Smart AI Engine
- **Powered by Gemini:** Uses Google's latest Gemini models for context-aware language detection and highly accurate phonetic mapping.
- **Phonetic Preservation:** Specifically tuned to maintain the phonetic nuances of Indian languages during script conversion.

### 3. Personalization & History
- **Cloud History:** Securely save your transliteration session history to Firebase Firestore for later retrieval.
- **Unified Authentication:** Seamless Google Login integration for cross-device access to your personal data.

### 4. Advanced UX/UI
- **Neo-Brutalist Design:** A bold, high-contrast interface using custom spacing, heavy shadows, and unique typography.
- **Fluid Animations:** Smooth state transitions and micro-interactions powered by `motion/react`.
- **Responsive Architecture:** Fully optimized for desktop precision and mobile accessibility.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind CSS |
| **Animation** | Motion (formerly Framer Motion) |
| **Database/Auth** | Firebase Auth & Google Cloud Firestore |
| **AI / NLP** | Google Gemini API (`@google/genai`) |
| **OCR** | Tesseract.js |
| **PDF Handling** | PDF.js (Parsing) & jsPDF (Generation) |
| **Icons** | Lucide React |

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- A Google AI Studio API Key (for Gemini)
- A Firebase Project (for Authentication and Firestore)

### 1. Clone & Install
```bash
# Clone the repository
git clone <repository-url>
cd linguistix

# Install dependencies
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory and add the following:
```env
# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration (Exposed to client via VITE prefix)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 3. Run Development Server
```bash
npm run dev
```

---

## 🏗 Component Architecture

- **/src/components**: Main feature components (`TextTransliteration`, `PDFTransliteration`, `ImageTransliteration`).
- **/src/lib**: Core library initializations (Firebase, Gemini).
- **/src/services**: Abstraction layer for AI processing and external APIs.
- **/src/types**: Unified TypeScript interfaces for state and data models.

---

## 🚢 Deployment

### Option 1: Google Cloud Run (Recommended)
This application is container-ready. You can deploy the bundled Docker container directly to Google Cloud Run for high scalability and secure environment variable management.

### Option 2: Static Hosting (Vercel / Netlify / Firebase Hosting)
As a Vite-powered SPA, you can build the project and deploy the `dist/` folder to any static site hosting provider.
```bash
npm run build
```

---

## 📜 License
This project is licensed under the MIT License - see the LICENSE file for details.
