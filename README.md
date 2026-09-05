# 👁️‍🗨️ Bio-Mirror (Edge AI Vital Signs Monitor)

![Bio-Mirror Preview](https://img.shields.io/badge/Status-V2.0_Production_Ready-00f0ff?style=for-the-badge)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase)

**Bio-Mirror** is a cutting-edge Progressive Web App (PWA) that uses **Remote Photoplethysmography (rPPG)** and **Computer Vision** to measure human vital signs entirely contact-free through a standard device webcam. 

Built with a stunning Cyberpunk-inspired UI, all AI processing happens **locally on the device (Edge Computing)**, ensuring 100% data privacy.

---

## ✨ Key Features

* **🩺 Contactless Vitals Scanning:** Extracts Heart Rate (BPM), Heart Rate Variability (HRV), and Stress Levels directly from subtle facial color changes.
* **🧠 Edge AI Processing:** Uses Google's `MediaPipe FaceMesh` to track 468 facial landmarks in real-time. Heavy DSP (Digital Signal Processing) math runs via Web Workers to prevent UI lag.
* **🧘‍♂️ Smart Bio-Healer:** A dynamic, bio-feedback guided breathing module that automatically adjusts its rhythm based on the user's real-time elevated heart rate.
* **📊 Digital Body Profile:** Integrates user Age, Gender, Height, and Weight to calculate BMI, BMR, and personalized medical insights.
* **🌍 Trilingual i18n:** Full support for English, Sinhala (සිංහල), and Tamil (தமிழ்).
* **📱 PWA Ready:** Installable directly to mobile/desktop home screens bypassing traditional app stores.
* **🔒 100% Privacy:** No video or image data is ever recorded, saved, or sent to external servers.

## 🛠️ Technology Stack

* **Frontend Framework:** React 18 + Vite
* **Styling:** Tailwind CSS (Custom Cyberpunk theme & Neon effects)
* **Computer Vision:** MediaPipe FaceMesh (Loaded via CDN for reduced bundle size)
* **Signal Processing:** Custom CHROM algorithm running on HTML5 Web Workers
* **Backend & Hosting:** Firebase Hosting & Firestore
* **Icons:** Lucide React

## 🚀 How It Works (The Science)

1. **Face Tracking:** The app isolates the forehead and upper cheeks using a 3D facial mesh.
2. **Signal Extraction:** It extracts raw RGB pixel data from the isolated regions frame-by-frame.
3. **CHROM Algorithm:** By comparing the variations in Red, Green, and Blue light channels, the algorithm isolates the pulsatile blood flow signal (the tiny flush of blood with every heartbeat).
4. **DSP Filtering:** The signal passes through a Bandpass filter and Outlier Rejection logic to calculate accurate BPM and HRV metrics.

## 💻 Local Setup & Installation

To run this project locally on your machine:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Isuru-Dhananjaya/bio-mirror.git
   cd bio-mirror
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## ⚠️ Disclaimer
*Bio-Mirror is an experimental technology prototype. It is NOT a certified medical device and should not be used for medical diagnosis, treatment, or life-critical monitoring.*

---
*Crafted with precision for the future of Digital Health.*
