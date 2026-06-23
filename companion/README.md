# 🌲 MLJ Companion App (Minecraft Life Journal Companion)

A lightweight desktop companion application designed to run silently in the background while you play Minecraft. It tails your game logs, monitors active sessions, and watches your screenshots folder to sync milestones, coordinates, and memories live to the [Minecraft Life Journal Web App](file:///../).

---

## 🚀 Key Features

* **⏱️ Automated Playtime Tracking**: Monitors when Minecraft (`javaw.exe`) starts and terminates. Calculates total active session duration in minutes and increments your world stats automatically.
* **📜 Live Chat Command Watcher**: Tails `latest.log` to parse chat entries. Supports special in-game chat hooks:
  * `#journal <message>`: Creates a text journal memory on your timeline.
  * `#coords <label> <X> <Y> <Z>`: Logs coordinate markers (Bases, Portals, Villages) in your coordinates notebook.
* **🏆 Auto-Advancement Syncing**: Automatically intercepts advancement unlocks (e.g., *Monster Hunter*, *The End?*) and creates themed timeline events on your profile.
* **📸 60-Second Screenshot Pairing**: Watches your `screenshots/` directory. If a screenshot is captured within 60 seconds of typing `#journal <message>` in chat, the app automatically uploads and pairs the image with your memory.
* **🔒 Secure API Key Syncing**: Interfaces securely with the web app backend using SHA-256 hashed API Keys.

---

## 🛠️ Architecture & Pipeline

```
 [ Minecraft Game Client ]
           │ 
           ├─ (Appends to latest.log) ───────► [ Log Tailer Thread ] ───────┐
           │                                                                ▼
           ├─ (Saves screenshots/*.png) ─────► [ File System Watcher ] ─────┼─► [ Next.js API ]
           │                                                                ▲
           └─ (Process starts/terminates) ──► [ Process Monitor Thread ] ───┘
```

---

## ⚙️ Tech Stack & Requirements

The client is built using a hybrid desktop architecture:
* **Frontend**: HTML5, Vanilla CSS, and JavaScript. Styled to match the Minecraft inventory UI.
* **Backend**: Rust (using the Tauri framework) for efficient OS file tailing, directory watching, process list querying, and low system resource overhead.

### Prerequisites
To build the application from source, you will need:
1. **Rust & Cargo**: Follow the [Rust installation guide](https://www.rust-lang.org/tools/install).
2. **Node.js & npm**: Install Node.js from the [official website](https://nodejs.org/).

---

## 📂 Project Structure

```
companion/
├── src/                # Frontend Web GUI assets (HTML, CSS, JS)
│   ├── assets/         # App logo and graphical SVG resources
│   ├── index.html      # Desktop settings panel UI
│   ├── main.js         # JavaScript handler for Tauri IPC commands
│   └── styles.css      # Custom inventory-pane themed styles
└── src-tauri/          # Rust Desktop Backend
    ├── Cargo.toml      # Rust package manifest and dependencies
    ├── tauri.conf.json # Tauri configuration & window boundaries
    └── src/
        ├── main.rs     # Rust entrypoint & CLI handlers
        ├── config.rs   # Local configuration persistence (.json)
        ├── log_watcher.rs         # Log tailing & command parser thread
        ├── process_monitor.rs     # Minecraft active session monitor
        └── screenshot_watcher.rs  # Screenshots folder watcher thread
```

---

## 🏃 Run & Build Commands

Commands should be executed within the `/companion` directory:

### 1. Install Node Dependencies
```bash
npm install
```

### 2. Run in Development Mode
Launches the companion settings interface with live hot-reloading:
```bash
npm run tauri dev
```

### 3. Build Production Executable
Compiles the Rust binary and packages it into a standalone Windows installer or executable:
```bash
npm run tauri build
```
The compiled output will be generated inside:
`src-tauri/target/release/`

---

## ⚙️ Configuration & Usage

1. **Launch the Companion**: Start the MLJ Companion App.
2. **Retrieve API Key**: Go to your web profile page, generate a **Companion API Key**, copy it, and paste it into the app's settings panel.
3. **Set Minecraft Path**: Provide the path to your active `.minecraft` directory (e.g., `C:\Users\<username>\AppData\Roaming\.minecraft`).
4. **Select Active World**: Choose the world you are currently playing from the dropdown menu populated from your account.
5. **Start Tracking**: Click **Start Monitoring** and open Minecraft to play!
