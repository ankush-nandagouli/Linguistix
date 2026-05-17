# Linguistix

Linguistix is a premium, high-performance Indian script transliteration engine designed for historians, linguists, and modern communicators. It combines state-of-the-art AI with robust offline capabilities to provide seamless script conversion across text, documents, and images.

## 🚀 Core Features

### 1. Multi-Modal Transliteration
- **Text-to-Text**: Real-time transliteration between 10+ major Indian scripts (Hindi, Bengali, Sanskrit, Tamil, etc.) and ITRANS.
- **Document Processing (PDF)**: Extract text from PDFs and generate new transliterated versions while preserving some structural context.
- **Visual OCR (Image)**: Take a photo or upload an image. The engine detects text and transliterates it instantly.

### 2. Intelligent Engine Hybrid
- **Gemini Powered**: Uses advanced Google Gemini AI models for high-accuracy, context-aware transliteration when online.
- **Offline First**: Bundles a local Sanscript engine for privacy-focused, zero-latency transliteration without an internet connection.
- **Local OCR**: Employs Tesseract.js for client-side text recognition from images.

### 3. Voice & Accessibility
- **Speech-to-Text**: Dictate your input directly into the engine.
- **Neural Text-to-Speech**: Listen to the transliterated output in the target language's natural accent.

### 4. Data Privacy & History
- **IndexedDB Storage**: Your transliteration history is stored locally in your browser using IndexedDB. No sensitive text content is sent to a cloud database.
- **Firebase Authentication**: Securely manage your identity to separate local archives across different user profiles.

### 5. Professional UI/UX
- **Next-Gen Brutalist Design**: A bold, high-contrast interface built for efficiency and visual clarity.
- **Motion Orchestration**: Fluid transitions and micro-animations that guide the user experience.
- **Responsive Layout**: Precision-engineered for both desktop workflows and mobile-on-the-go usage.

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Motion (framer-motion)
- **AI/ML**: Google Generative AI (Gemini), Tesseract.js
- **Backend Services**: Firebase Authentication
- **Local Persistence**: IndexedDB (idb)
- **Document Ops**: jsPDF, PDF.js
- **Transliteration**: @indic-transliteration/sanscript

## 📖 How it Works

1. **Detection**: Linguistix analyzes your input text or media.
2. **Contextual Analysis**: Whether you're online or offline, the app selects the best engine for the task.
3. **Phonetic Mapping**: Scripts are mapped phonetically to ensure the "sound" of the language is preserved during the visual switch.
4. **Archive**: Every successful transliteration is logged in your personal local archive for future reference.

## 🔒 Security & Privacy

Linguistix is built with a "Privacy by Design" philosophy. All history is stored in the browser's **IndexedDB**, meaning your private notes and documents never leave your device unless required for API processing (online mode). Authentication is handled via industry-standard Firebase Auth.

---

*Linguistix - Preserving the phonetic soul of the East.*
