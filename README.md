# AgriCare — AI-Powered Autonomous Pest Detection and Crop Monitoring System 🌱

> **“Grow Smarter. Farm Better. Harvest More.”**

AgriCare is an enterprise-grade, mobile-first Agricultural Technology (AgriTech) Progressive Web Application (PWA) and IoT Cloud System designed for modern farmers, agronomists, and smart agriculture research.

---

## 🏗️ System Architecture & Technology Stack

```
                              ┌────────────────────────────────────────┐
                              │           FARMER / USER APP            │
                              │     Vercel (React 18 + TS + PWA)       │
                              └───────────────────▲────────────────────┘
                                                  │ HTTPS REST
                                                  ▼
                              ┌────────────────────────────────────────┐
                              │            RENDER CLOUD API            │
                              │         FastAPI (Python 3.10)          │
                              │   Database: SQLite / PostgreSQL        │
                              └───────────────────▲────────────────────┘
                                                  │
                  ┌───────────────────────────────┴──────────────────────────────┐
                  │ X-API-Key: agricare_live_secret_key_2026                      │
                  ▼                                                              ▼
    ┌───────────────────────────┐                                 ┌───────────────────────────┐
    │  NODEMCU ESP8266 IoT NODE │                                 │  SOLAR FIELD ROBOT ROVER  │
    │  - Soil Moisture (A0)     │                                 │  - Autonomous 20ft Mission│
    │  - DHT22 Temp/Humidity(D2)│                                 │  - U-Turn Navigation      │
    │  - RS485 Modbus NPK       │                                 │  - Solar Charging         │
    │  - Water Servo Valve (D5) │                                 │  - Manual Remote Jog      │
    │  - Medicine Valve (D6)    │                                 └───────────────────────────┘
    └───────────────────────────┘
```

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite, PWA Service Worker & Manifest.
- **Backend:** Python FastAPI, SQLAlchemy, Pydantic v2, Uvicorn, Render Infrastructure Blueprint.
- **IoT Firmware:** ESP8266 NodeMCU, RS485 Modbus RTU NPK, DHT22, Analog Capacitive Moisture, Servo Actuators.
- **Languages Supported:** English, Tamil (தமிழ்), Hindi (हिंदी), Telugu (తెలుగు), Kannada (ಕನ್ನಡ), Malayalam (മലയാളം), Marathi (मराठी).

---

## 📁 Repository Directory Structure

```
S5 MINI PROJECT_AGRICARE/
├── backend/                       # Python FastAPI Backend (Deploy to Render)
│   ├── app/
│   │   ├── main.py                # FastAPI Application & OpenAPI documentation
│   │   ├── config.py              # Environment variables & secrets
│   │   ├── database.py            # SQLite / PostgreSQL database engine
│   │   ├── models.py              # SQLAlchemy database tables
│   │   ├── schemas.py             # Pydantic schemas (IoT readings & commands)
│   │   └── routers/
│   │       ├── iot.py             # POST /api/readings & GET /api/command
│   │       ├── ai_crop.py         # Pluggable crop disease AI inference
│   │       ├── calendar.py        # Day 1 to Harvest agronomic timeline
│   │       ├── market.py          # District-wise Indian Mandi prices
│   │       ├── yield_pred.py      # 6-step yield prediction engine
│   │       ├── robot.py           # Solar field robot telemetry & controller
│   │       ├── chatbot.py         # AgriCare Advisor voice & text assistant
│   │       ├── auth.py            # OTP verification & farmer profiles
│   │       └── history.py         # Audit trail & CSV export
│   ├── requirements.txt
│   ├── render.yaml                # Render Web Service blueprint
│   ├── Dockerfile
│   └── .env.example
├── frontend/                      # React 18 + TypeScript PWA (Deploy to Vercel)
│   ├── public/
│   │   ├── manifest.json          # PWA Web App Manifest
│   │   ├── sw.js                  # PWA Service Worker (Offline caching)
│   │   └── logo.svg               # AgriCare SVG Logo
│   ├── src/
│   │   ├── components/            # Sidebar, Header, BottomNav, CameraModal, RobotCanvas, etc.
│   │   ├── context/               # LanguageContext (7 langs), AuthContext, IoTContext
│   │   ├── locales/               # Native translations (en, ta, hi, te, kn, ml, mr)
│   │   ├── pages/                 # All 14 complete functional application pages
│   │   ├── services/api.ts        # Dynamic Render URL client & simulation engine
│   │   ├── types/index.ts         # TypeScript data contracts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── vercel.json                # Vercel SPA routing rewrite rules
├── arduino/
│   ├── AgriCare_ESP8266.ino       # Production-ready ESP8266 NodeMCU firmware
│   └── README.md                  # Complete pinout and MAX485 wiring manual
├── render.yaml                    # Root Render configuration
├── .gitignore
└── README.md
```

---

## 🚀 Step 1: Push Codebase to GitHub

Your GitHub Account: **`https://github.com/sudharshanaa1417-lab`**

Run the following commands in this directory:

```powershell
# 1. Initialize git repository
git init

# 2. Add all project files
git add .

# 3. Commit the complete project
git commit -m "Initial commit: AgriCare Full-Stack System with IoT NodeMCU firmware"

# 4. Link your remote GitHub repository (Replace <repo-name> with your repo, e.g. agricare)
git remote add origin https://github.com/sudharshanaa1417-lab/agricare.git

# 5. Set branch to main and push
git branch -M main
git push -u origin main
```

---

## ☁️ Step 2: Deploy Backend on Render (https://render.com)

1. Sign in to [Render](https://dashboard.render.com/).
2. Click **New +** $\rightarrow$ **Web Service**.
3. Connect your GitHub repository: `sudharshanaa1417-lab/agricare`.
4. Fill in the service configuration:
   - **Name:** `agricare-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Region:** Any (e.g. `Oregon (US West)` or `Singapore`)
   - **Branch:** `main`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** `Free`
5. Under **Environment Variables**, add:
   - `DEVICE_API_KEY` = `agricare_live_secret_key_2026`
   - `ENVIRONMENT` = `production`
6. Click **Deploy Web Service**.
7. Once deployed, Render will provide your live URL, for example:  
   👉 **`https://agricare-backend.onrender.com`**  
   *(Verify it by opening `https://agricare-backend.onrender.com/docs` in your browser to view the interactive Swagger API documentation!)*

---

## ⚡ Step 3: Deploy Frontend PWA on Vercel (https://vercel.com)

1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your GitHub repository: `sudharshanaa1417-lab/agricare`.
4. In the project setup screen:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** and choose **`frontend`**
   - **Build Command:** `pnpm run build` or `npm run build`
   - **Output Directory:** `dist`
5. Expand **Environment Variables** and add:
   - `VITE_API_BASE_URL` = `https://agricare-backend.onrender.com` *(Use your actual Render URL from Step 2)*
6. Click **Deploy**.
7. Vercel will build and assign your production URL:  
   👉 **`https://agricare.vercel.app`**

> **Note:** You can also update the Render URL directly inside the application under **Settings $\rightarrow$ Backend API Base URL** without redeploying!

---

## 📟 Step 4: Flash the NodeMCU ESP8266 Arduino Kit

1. Open **Arduino IDE**.
2. Open [`arduino/AgriCare_ESP8266.ino`](arduino/AgriCare_ESP8266.ino).
3. Update lines 24–33 with your WiFi credentials and your Render backend URL:

```cpp
// =====================================================
// 1. WIFI AND RENDER SETTINGS - CHANGE THESE
// =====================================================
const char* WIFI_SSID     = "YOUR_WIFI_NAME";        // Your 2.4GHz WiFi Name
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";    // Your WiFi Password

// Enter your live Render URL from Step 2 (NO trailing slash)
const char* RENDER_URL    = "https://agricare-backend.onrender.com";

// Must match the DEVICE_API_KEY on Render
const char* API_KEY       = "agricare_live_secret_key_2026";
```

### Hardware Pinout Reference

| Sensor / Actuator | NodeMCU ESP8266 Pin | Notes |
| :--- | :--- | :--- |
| **Soil Moisture Sensor** | **A0** (Analog) | Calibrated: Dry = 800, Wet = 350 |
| **DHT22 (Temp & Humidity)** | **D2** (GPIO 4) | Pull-up 10k resistor to 3.3V |
| **Water Valve Servo** | **D5** (GPIO 14) | Timed 5-second pulse, 60s cooldown |
| **Medicine Valve Servo** | **D6** (GPIO 12) | Timed 3-second micro-dose pulse |
| **MAX485 RO (RX)** | **D7** (GPIO 13) | Modbus SoftwareSerial RX |
| **MAX485 DI (TX)** | **D1** (GPIO 5) | Modbus SoftwareSerial TX |
| **MAX485 DE & RE** | **D0** (GPIO 16) | Direction control (DE + RE tied) |

4. Flash the code to your NodeMCU ESP8266 at **115200 baud**.
5. The ESP8266 will connect to your WiFi and immediately begin posting real telemetry every 5 seconds to Render via:
   `POST https://YOUR-APP.onrender.com/api/readings` with header `X-API-Key: agricare_live_secret_key_2026`!

---

## 🌟 Key Application Modules (All 14 Pages Functional)

1. **Main Dashboard:** Personalized greeting, current farm location, selected crop & growth stage, live soil moisture / temp / humidity / NPK cards, device online badge, weather snapshot, mandi price snapshot, and prominent in-place **Camera** & **Multi-Image Uploader**.
2. **AI Crop Doctor:** Computer vision plant pathology engine. Multi-image file dropzone & live camera capture, plant part selector (Leaf, Stem, Fruit, Whole Plant), detailed diagnosis breakdown, model confidence score, symptoms, Option 1 (Scientific IPM) and Option 2 (Verified Cultural / Home Remedies), and source citations (ICAR, KVK). Includes dedicated Custom AI Model endpoint settings drawer!
3. **Crop Care Calendar:** Complete Day 1 to Harvest agronomic schedule for Tomato, Rice, Cotton, Groundnut, Maize. Daily irrigation advice, nutrient management, pest scouting, and completion checkboxes.
4. **Real-Time IoT Monitoring:** Dedicated hardware monitoring page for the ESP8266 kit. Live gauges, interactive SVG historical trend curves (1h, 24h, 7d, 30d), min/max/average stats, and downloadable CSV telemetry reports.
5. **District-Wise Market Prices:** Official daily APMC mandi gate modal prices across Indian states (Tamil Nadu, Karnataka, Maharashtra, AP, Gujarat, Punjab) with State, District, and Commodity filters.
6. **Yield Prediction:** 6-step guided agronomic wizard (Location $\rightarrow$ Soil Type $\rightarrow$ Crop $\rightarrow$ Sowing Month $\rightarrow$ Farm Area/Irrigation $\rightarrow$ Harvest Report). Provides yield per acre, total yield, confidence range, limiting factors, and alternative crop comparisons.
7. **Smart Irrigation & Valve Control:** Actuate Water Valve (Servo D5, 5s pulse), Medicine Valve (Servo D6, 3s dose), Auto-Watering threshold mode (Moisture &lt; 30%), Emergency STOP hero button, and command acknowledgment status.
8. **Solar Field Robot:** Animated top-down 2D canvas of agricultural plot with crop rows, robot rover, direction indicator, breadcrumb trail, distance counter in feet, battery %, and solar wattage. Includes automated **20-Foot Autonomous Mission** (Forward 20ft $\rightarrow$ Safe Stop $\rightarrow$ 180° U-turn $\rightarrow$ Return 20ft along adjacent row $\rightarrow$ Complete!).
9. **AI Voice Chatbot ("AgriCare Advisor"):** Text and Speech-to-Text microphone input, Text-to-Speech spoken audio answers, context-aware of current crop, soil moisture, and district.
10. **History & Reports:** Unified audit logging of all telemetry, valve commands, AI diagnoses, and robot movements. Printable farm report and CSV export.
11. **Notifications Center:** In-app alert feed for low soil moisture (&lt;30%), disease detection, and hardware heartbeat lost.
12. **Settings:** Profile, phone verification, farm location & PIN code, Render API base URL configuration, IoT device provisioning, language switcher, and Simulator / Demo Mode toggle.
13. **Help & Support:** Kisan Call Center helpline (**1800-180-1551**), KVK network info, and hardware setup instructions.
14. **Authentication & Profile:** Secure phone number OTP verification simulation, role-based access (Farmer, Farm Manager, Administrator).

---

## 🧪 Acceptance Verification Checklist

- [x] **Auth & Profile:** Login & registration with phone number and 6-digit PIN validation.
- [x] **Dashboard:** Opens with greeting, farm location, crop stage, live sensor cards, and in-place camera/image upload.
- [x] **AI Crop Doctor:** Supports multiple photographs, healthy/unhealthy/uncertain classification, confidence score, scientific IPM, verified cultural remedies, and ICAR citations.
- [x] **Crop Care Calendar:** Day 1 to Harvest daily timeline with persistent completion checkboxes.
- [x] **Real-Time Monitoring:** Live telemetry cards, interactive line charts, 1h/24h/7d/30d filters, and CSV export.
- [x] **Smart Irrigation:** Actuation controls for Water (D5), Medicine (D6), Auto-Water, and Emergency STOP with pending $\rightarrow$ confirmed states.
- [x] **Solar Field Robot:** Top-down canvas animation, 20-foot autonomous mission with U-turn, manual jog, battery & solar telemetry.
- [x] **Market Prices:** District-wise APMC mandi prices with State and Commodity filters.
- [x] **Yield Prediction:** 6-step wizard evaluating soil, sowing month, and acreage.
- [x] **Multilingual Interface:** Full native localization across 7 languages: English, தமிழ், മലയാളം, ಕನ್ನಡ, తెలుగు, मराठी, हिंदी.
- [x] **AI Voice Chatbot:** Text and speech-to-text mic input with spoken TTS audio playback.
- [x] **NodeMCU ESP8266 Firmware:** Verified matching Arduino sketch with `X-API-Key` and `POST /api/readings`.
- [x] **Production Build:** Passes TypeScript compilation and Vite production bundling with zero errors.
- [x] **Deployability:** Ready for immediate push to GitHub, hosting on Vercel, and backend deployment on Render.
