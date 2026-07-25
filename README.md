# 🚀 CF Upsolve

> **A powerful competitive programming dashboard and Chrome extension to track, upsolve, and systematically level up your Codeforces rating.**
> Analyze your profile, grind problems by difficulty, compare with other coders, and keep a personal problem vault — all in one dark-themed, real-time web app.
> Built with React, Tailwind CSS, and Firebase, with a Manifest V3 Chrome Extension for one-click problem logging from any Codeforces page.

🌐 **Live Demo:** [upsolve-nine.vercel.app](https://upsolve-nine.vercel.app)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **CF Handle Verification** | Verify ownership of your Codeforces handle by submitting a compile-error solution — no password required |
| 📋 **Problem Tracker** | Build a personal problem list, mark problems as solved, and organize with custom tags |
| ⚡ **Smart Upsolving** | Get personalized recommendations from recent Div 1–4 contests based on your rating and solve history |
| 👥 **User Comparison** | Compare any two CF users side-by-side and find problems one has solved that the other hasn't |
| 📊 **Profile Analysis** | Deep-dive into submission verdicts, rating progression, division performance, and tag breakdown charts |
| 🔥 **Rating Grind** | Browse problems by rating bucket and division, with live AC/WA/Unseen status pulled from your CF handle |
| 💯 **100 Hard Challenge** | A structured challenge to solve 100 problems across every rating tier (800–3500) with a live donut chart |
| 🧠 **Pre-Solve Vault** | Save your solution code alongside problems before submitting — great for reviewing your thinking process |
| 🏷️ **Tag & Filter System** | Filter by difficulty range, topic tags, or solved status; toggle tag visibility for spoiler-free practice |
| 🌐 **Real-time Online Users** | See how many users are currently active on the platform via Firebase Realtime Database presence |
| 🐛 **Bug Reports** | In-app bug report system available to all logged-in users |
| 🧩 **Chrome Extension** | One-click problem import from any Codeforces problem page using a Manifest V3 companion extension |

---

## 🗂️ Website Tabs

The navigation is split into **Navigate** and **Track** sections:

### Navigate
| Tab | Page Key | Auth Required |
|---|---|---|
| 🏠 Home | `home` | No |
| 👥 Compare | `compare` | No |
| 👤 Profile | `profile` | Google Sign-In |

### Track *(requires CF handle verification)*
| Tab | Page Key | Description |
|---|---|---|
| 📋 My Problems | `problems` | Personal problem list with filters, tags, and solve toggles |
| ⚡ Upsolve | `upsolve` | Smart recommendations from recent contests |
| 📈 Rating Grind | `rating-grind` | Browse all CF problems filtered by rating & division |
| 🔥 100 Hard | `100-hard` | Solve 100 problems across every rating bracket |
| 📊 Analysis | `analysis` | Full profile analytics with charts and stats |
| 🧠 Pre-Solve | `presolve` | Code vault to store solutions before submitting |

---

## 🧩 Chrome Extension

The **CF Upsolve Companion** (Manifest V3) lets you add any Codeforces problem to your list with a single click.

**How it works:**
1. Browse to any problem on `codeforces.com`
2. Click the extension icon in your browser toolbar
3. The app opens and auto-imports the problem with all details fetched from the CF API

**To install locally:**
1. Go to `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `/chrome-extension` folder
4. Open any Codeforces problem page and click the extension icon

> **Note:** Update `APP_URL` in [`chrome-extension/background.js`](./chrome-extension/background.js) to point to your own deployment or `http://localhost:5173` for local development.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7 |
| Styling | Tailwind CSS v4 |
| Animations | GSAP, Motion (Framer Motion) |
| Backend / Auth | Firebase (Firestore + Realtime DB + Google Auth) |
| API | Codeforces Public API |
| Analytics | Vercel Analytics |
| Hosting | Vercel |

---

## ⚙️ Environment Variables

Create a `.env` file in the project root with the following variables. All values come from your [Firebase project settings](https://console.firebase.google.com/).

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

---

## 🚀 How to Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- A Firebase project with Firestore, Realtime Database, and Google Auth enabled

### 1. Clone the repository

```bash
git clone https://github.com/JaiBansal007/UPSOLVE.git
cd UPSOLVE
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example and fill in your Firebase credentials:

```bash
cp .env.example .env
# Then edit .env with your Firebase config values
```

### 4. Set up Firebase

Follow the steps in [`FIREBASE_SETUP.md`](./FIREBASE_SETUP.md) to:
- Enable **Google Authentication**
- Create a **Firestore Database** (production mode)
- Create a **Realtime Database**
- Paste the correct security rules for both databases

### 5. Start the development server

```bash
npm run dev
```

The app will be running at `http://localhost:5173`

### Other Scripts

```bash
npm run build      # Build for production
npm run preview    # Preview the production build locally
npm run lint       # Run ESLint
```

---

## 🔥 Firebase Setup Summary

| Service | Purpose |
|---|---|
| **Google Authentication** | User sign-in with Google account |
| **Firestore Database** | Stores problems, settings, and verification data per user |
| **Realtime Database** | Tracks online presence, visit stats, bug reports, and registered users |

> See [`FIREBASE_SETUP.md`](./FIREBASE_SETUP.md) for the full rules and step-by-step setup guide.

---

## 📁 Project Structure

```
cf-upsolve/
├── chrome-extension/       # Manifest V3 Chrome extension
│   ├── background.js       # Service worker for deep-link handling
│   └── manifest.json       # Extension config
├── src/
│   ├── components/         # All UI components (tabs, forms, charts)
│   ├── contexts/           # React context (AuthContext)
│   ├── hooks/              # Custom hooks (useOnlinePresence)
│   ├── services/           # Firebase, Firestore, CF API logic
│   ├── App.jsx             # Root app, routing, auth state
│   └── main.jsx            # Entry point
├── .env                    # Environment variables (not committed)
├── FIREBASE_SETUP.md       # Firebase setup guide
├── firebase.json           # Firebase hosting config
└── vite.config.js          # Vite config
```

---

## 📄 License

This project is open source. Feel free to fork, star ⭐, and contribute!

---

*Built with ❤️ for the competitive programming community.*  
*Keywords: codeforces upsolve tracker, competitive programming dashboard, CF rating grind, DSA problem tracker, codeforces chrome extension, profile analysis, react firebase app*
