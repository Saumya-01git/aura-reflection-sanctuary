# 🌙 Aura — AI Reflection Sanctuary & Growth Vault

[![Google Cloud Run](https://img.shields.io/badge/Google_Cloud_Run-Deployed-4285F4?logo=googlecloud&logoColor=white)](https://cloud.google.com/run)
[![Firebase Authentication](https://img.shields.io/badge/Firebase_Auth-Federated_SSO-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Cloud Firestore](https://img.shields.io/badge/Cloud_Firestore-Isolated_Vaults-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/docs/firestore)
[![Gemini 3.8 / 3.6 Flash](https://img.shields.io/badge/Gemini_API-Multimodal_Intelligence-8E75C2?logo=googlegemini&logoColor=white)](https://aistudio.google.com/)
[![Security Directives](https://img.shields.io/badge/Security-OWASP_Top_10_Compliant-success)](#-security-threat-model--zero-trust-architecture)

> *"Some moments deserve to be remembered. Some deserve to be understood."*

A production-ready, user-authenticated AI personal reflection sanctuary and collaborative memory system built with **Google AI Studio**, **Firebase Authentication**, **Cloud Firestore**, and **Google Cloud Run**. 

Developed for the **Google Cloud Gen AI Academy APAC Edition (Cohort 3) Ideathon**, Aura transforms the baseline "Personal Gemini Journal" into a culturally resonant, multimodal emotional growth companion featuring **Shayari / Persona Shifting**, **Selective Privacy-Preserving Sharing**, **Multimodal Polaroid Moments (Gemini Vision)**, **Procedural Ambient Soundscapes**, and **5-Member Collaborative Squad Rooms**.

---

## 📹 Video Walkthrough & Live Demo

- 🎥 **App Walkthrough & Demonstration Video:** [Watch Demo on LinkedIn](#) *(Add your LinkedIn video post URL here)*
- 💻 **Public GitHub Codebase:** [https://github.com/Saumya-01git/aura-reflection-sanctuary](https://github.com/Saumya-01git/aura-reflection-sanctuary)
- 🏷️ **Campaign Verification Label:** `dev-tutorial=cloud-run-ai-challenge`

---

## 🌟 Core Features & Original Innovations

### 1. 🎨 Ambient Frosted Glass Sanctuary & WhatsApp-Style Themes
- Multi-layered translucent glassmorphism (`backdrop-blur-xl`, delicate glowing borders).
- Four customizable ambient atmosphere palettes:
  - 🌧️ **Lofi Midnight Rain:** Slate mist with gentle cyan illumination.
  - 🌅 **Golden Hour Sunset:** Warm dusk amber and twilight violet glow.
  - ⚡ **Cyber Focus:** Dark obsidian terminal mode with emerald and teal accents.
  - 🖤 **Minimal Obsidian:** Pure titanium high-contrast focus canvas.

### 2. 📜 Multi-Turn Gemini Persona Shifter
- 📜 **Shayari & Poetic Soul (The "Alfaaz" Mode):** Responds with emotional nuance, philosophical wisdom, and classical Roman Urdu/Hindi couplets with English translations. Includes audio recitation via Web Speech API.
- ⚡ **Hackathon Coach / Tough Love:** Velocity-oriented, practical guidance built for hackathon builders; cuts through self-doubt.
- 🧘 **Mindful Zen:** Somatic grounding, anxiety de-escalation, and nervous system decompression.
- 🎙️ **Classic Reflective Journal:** Structured cognitive debriefs and executive summaries.

### 3. 📸 Multimodal Polaroid Moments (Gemini Vision + Photo Diary)
- Users upload personal photos (JPEG/PNG) capturing their daily journey.
- Analyzed server-side by **Gemini Vision** to detect ambient mood, extract emotional valence, generate an evocative title, and store as an interactive Frosted Polaroid Card with photo zoom and speech synthesis.

### 4. 🔗 Selective Privacy-Preserving Sharing ("Smart Quote Cards")
- Solves the critical privacy problem of traditional AI apps: users never want to expose an entire vulnerable private diary, but love sharing golden takeaways.
- Users select any quote, Shayari, or milestone to generate a beautiful visual share card (Velvet, Gold Poetry, Cyber Neon, Obsidian).
- Publishes to a decoupled public collection (`/public_snippets/{id}`) with zero personal chat context leaked.
- **Active Shares & Revocation Drawer:** Users can review all generated public quotes and revoke/delete them instantly from Firestore.

### 5. 👥 Collaborative Squad Rooms (Multi-Member Support up to 5 Teammates)
- Upgraded collaborative space allowing up to 5 hackathon teammates or friends to join via invite codes (`AUR-***`).
- Real-time Firestore synchronization where Gemini acts as a neutral consensus mediator and sprint retrospective scribe.

### 6. ⏳ Perspective-Shift Flashbacks ("On This Day") & Future Me Lockbox
- Automatically surfaces past milestone reflections to dismantle imposter syndrome: *"Look how far you've come: 3 months ago you were stressed about your project demo, and you conquered it."*
- **Future Me Time Capsule:** Write letters to future self locked behind an animated wax countdown seal celebrated with confetti upon opening.

### 7. 🎵 Procedural Ambient Soundscape Engine
- Built-in zero-dependency Web Audio API procedural sound engine:
  - *Lofi Rain & Drizzle* (pink noise with resonant lowpass filtering)
  - *Pacific Ocean Drift* (rhythmic tidal swells)
  - *Midnight Forest & Crickets* (ambient woodland hum)
- Full volume slider and instant mute toggle in the navigation bar.

### 8. 🎙️ Full Two-Way Voice Interaction
- **Voice In:** Microphone dictation using Web Speech Recognition API with animated pulsating sound wave bars.
- **Voice Out:** Calming audio speech synthesis on all Gemini responses with play, pause, and stop controls.

### 9. 🗑️ Data Sovereignty & Right to be Forgotten (GDPR Compliant)
- One-click **Clear Chat / Vault Purge** with confirmation safeguard.
- Delete individual past memories directly from Flashbacks.
- **Export Journal:** Download complete journal history as clean Markdown (`.md`) or structured JSON (`.json`).
- **Direct Client-Side PDF Generation:** High-resolution keepsake cards compiled using `html2canvas` and `jsPDF`.

---

## 🛡️ Security Threat Model & Zero-Trust Architecture

Aura was engineered by strictly following the **Google Cloud Codelab Production Directives**, mapping the **5 Threat Zones** to defensive countermeasures:

| Threat Zone | Identified Risks | Countermeasures & Architectural Controls |
| :--- | :--- | :--- |
| **1. Input Surfaces** | Prompt injection via vision inputs, malicious script tags in profile names, voice transcription noise. | Strict schema validation, sanitization via `sanitizeText()`, React JSX escaping, numeric name rejection, and client-side image compression. |
| **2. Planning & Reasoning** | System instruction bypass, persona hijacking. | Immutable server-side system prompts, temperature clamping, context delimiters, and fallback ladder (`gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-2.5-pro`). |
| **3. Tool Execution** | Gemini API key leakage, SSRF from image analysis. | 100% server-side API proxying (`/api/reflect`, `/api/analyze-moment`). API keys are never bundled into client JavaScript. |
| **4. Memory & State** | Cross-user data leakage in Firestore, unauthorized squad room access. | Owner-bound Firestore path security (`request.auth.uid == userId`). Squad rooms strictly validate `participantUids.size() <= 5`. |
| **5. Inter-System Comm** | Credential leakage during sign-in, public snippet harvesting. | Federated Google Sign-In via Firebase Auth (Directive #3: zero password storage); decoupled `/public_snippets/` collection containing only explicitly approved quotes. |

---

## 🔒 Cloud Firestore Security Rules

Deployed Firestore security rules strictly isolating personal user vaults, collaborative squad rooms, and public share cards:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 1. Single-User Private Vault Isolation
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 2. Multi-Member Collaborative Squad Rooms (Max 5 Members)
    match /squad_rooms/{roomId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid in resource.data.participantUids || 
         request.auth.uid in request.resource.data.participantUids) &&
        request.resource.data.participantUids.size() <= 5;
    }
    
    // 3. Selective Privacy-Preserving Public Snippets (Zero-PII)
    match /public_snippets/{snippetId} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.authorUid == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.authorUid == request.auth.uid;
    }
    
    // 4. Role-Based Access Control (RBAC) System Telemetry
    match /system_telemetry/{docId} {
      allow read: if request.auth != null && 
        (request.auth.token.role == 'admin' || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

---

## ☁️ Google Cloud Deployment & Secret Manager Setup

### 1. Secret Management Configuration
To keep the Gemini API key secure without hardcoding:

```bash
# 1. Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 2. Grant Cloud Run Service Account permissions to access secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 2. Google Cloud Run Deployment
Deploy containerized full-stack application:

```bash
# Build and deploy to Cloud Run
gcloud run deploy aura-sanctuary \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest"
```

### 3. Mandatory Campaign Verification Labeling
As required by the **Google Cloud Gen AI Academy Challenge Guidelines**, the Cloud Run service is tagged with the verification label:

```bash
# Attach the mandatory challenge label
gcloud run services update aura-sanctuary \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=asia-southeast1
```

---

## 🛠️ Tech Stack Overview

| Component | Technology | Role & Justification |
| :--- | :--- | :--- |
| **Frontend Framework** | React + TypeScript + Vite | Ultra-responsive modern UI with strict type safety. |
| **Styling & Aesthetics** | Vanilla CSS + Frosted Glass | Multi-layered backdrop blurs, WhatsApp wallpaper themes, ambient mesh. |
| **User Identity** | Firebase Authentication | Google Federated SSO (Directive #3: zero password vulnerabilities). |
| **Database** | Google Cloud Firestore | Owner-bound user document isolation and real-time squad collaboration. |
| **AI Processing Engine** | Gemini 3.8 / 3.6 Flash | Multi-turn conversation, multimodal vision analysis, and persona reasoning. |
| **Secret Management** | Google Cloud Secret Manager | Dynamic server-side credential injection; zero key leakage. |
| **Deployment & Hosting** | Google Cloud Run | Scalable, auto-provisioned containerized deployment. |

---

## 👩‍💻 Author & Acknowledgements

- **Author:** Saumya ([@Saumya-01git](https://github.com/Saumya-01git))
- **Cohort:** Google Cloud Gen AI Academy APAC Edition — Cohort 3
- **Challenge:** Cloud Run Build & Deploy Social Challenge ("Personal Gemini Journal" Extension)
- **Mandatory Hashtag:** `#AccelerateAIwithCloudRun`
