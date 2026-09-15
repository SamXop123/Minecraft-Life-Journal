# 🚀 Minecraft Life Journal — Release Notes & Changelog

## 🎉 [2.1.0] - Favorites Wall, Screenshot Lightbox & Smart Auto-Categorization — 2026-09-15

> **Minecraft Life Journal v2.1.0 introduces the interactive Favorites Wall, full-screen Screenshot Lightbox, in-game chat auto-categorizer, coordinate editing, and companion reliability updates!**

### 🌟 Features & Highlights

- **⭐ Interactive Favorites Wall & Starred Memories**:
  - **Star Animation**: Added `FavoriteStarButton` with physics-based cubic-bezier elastic spring animation (`ease: [0.175, 0.885, 0.32, 1.275]`) and particle burst effects.
  - **Slide-Out Drawer**: Introduced `FavoritesWallDrawer` sliding panel displaying all pinned memories, active counts, and direct modal actions.
  - **Floating Access Tab**: Upright vertically stacked launcher (`F A V O R I T E S  W A L L`) seamlessly accessible across Private World (`/world/[id]`), Public Showcase (`/public/world/[id]`), and Shared (`/share/[token]`) views.
  - **Atomic Backend Persistence**: Dedicated `/api/memories/favorite/[id]` route with lean MongoDB queries ensuring favorite states persist reliably across page reloads.

- **🔍 Fullscreen Screenshot Lightbox**:
  - Built `ScreenshotLightbox` for inspecting high-resolution Minecraft screenshots with smooth scaling, backdrop blur, metadata inspection, and instant download.
  - Integrated across memory cards, timeline lists, and the Favorites Wall.

- **🧠 Intelligent Chat Auto-Categorizer**:
  - Integrated heuristic categorizer (`src/lib/utils/categorizer.js`) that automatically scans `#journal` in-game entries and assigns contextual tags (*Build*, *Exploration*, *Mining*, *Combat*, *Death*, *Achievement*, *Redstone*, *Farming*).

- **🧭 Coordinate Editing & Management**:
  - Added `EditCoordinateModal` and `/api/coordinates/edit/[id]` endpoint to modify saved points of interest, X/Y/Z coordinates, labels, and dimensions (Overworld, Nether, The End).
  - Enhanced `EditMemoryModal` with interactive category pickers and refreshed validation.

- **⚡ Desktop Companion v2.1.0 & Process Monitoring**:
  - Desktop companion bumped to **v2.1.0** with updated tray menus and embedded Discord bug reporter.
  - Multi-target upload retry and fallback logic for log events and screenshot synchronization.
  - Released dual Windows installer formats in `public/`: NSIS Setup (`.exe`) and WiX MSI (`.msi`).

- **✨ UI & Experience Polish**:
  - Real-time dynamic memory counts on world cards.
  - Polished soft-delete trash bin and restoration workflows (`TrashBinModal`).
  - Core dependency upgrades: Tauri 2.11.5, Tokio 1.53.1, Cloudinary 2.10.0, and Serde JSON.

---

## 🎉 [2.0.0] - Official Public Release — 2026-08-17

> **Minecraft Life Journal v2.0.0 is officially live for the public!**
> Track, log, and preserve your Minecraft survival world stories, playtime, advancements, screenshot memories, and coordinates live with zero modding required.
>
> 🌐 **MLJ:** [https://mlj.app](https://mlj.app)

---

### 🌟 Features & Highlights

- **⚡Desktop Companion**:
  - Lightweight Rust desktop client with 0% idle CPU usage.
  - Automatic game process monitoring, session playtime calculation, and screenshot folder matching.
  - Single-instance window focus protection (`tauri-plugin-single-instance`).
  - System Tray integration with quick web dashboard launcher.
  - Custom window close behavior toggle (`Minimize to System Tray on Close (X)`).

- **💬 In-Game Chat Logging & Coordinate Mapping**:
  - Type `#journal <message>` in Minecraft chat to log timeline notes live.
  - Type `#coords <label> <X> <Y> <Z>` to map points of interest (bases, portals, villages, strongholds).
  - Auto-pairs F2 screenshots taken within 60 seconds of chat memories.

- **🐛 In-App Bug Reporter**:
  - Native bug report modal built directly into the companion app that forwards rich, color-coded embeds to the developer's Discord server channel.

- **📖 Official Documentation & About Pages**:
  - Dedicated `/docs` and `/about` pages featuring Quick Start guides, chat command cheat sheets, troubleshooting FAQ, SmartScreen installation helper, and creator story by **SamXop123**.

- **⚡ High-Performance Database Architecture**:
  - MongoDB compound indexing (`{ worldId: 1, isDeleted: 1, memoryDate: -1, createdAt: -1 }`) for fast timeline pagination.

---

## [1.4.0] - 2026-04-12

### Added
- Forgot-password flow with email-based password reset links.
- Dedicated reset request and password reset pages.
- Password reset token hashing, expiry tracking, and resend cooldown support.

### Changed
- Extended the shared email utilities to send password reset emails.
- Added a forgot-password entry point to the login screen.
- Expanded the user model to store password reset metadata.

## [1.3.0] - 2026-03-29

### Added
- Email OTP verification flow powered by Gmail SMTP and `nodemailer`.
- Inline registration verification UI with 6-digit code entry and resend support.
- Verification code hashing, expiry tracking, resend cooldowns, and attempt limits for user accounts.

### Changed
- Registration now sends a verification code instead of logging users in immediately.
- Login now blocks unverified accounts until their email is confirmed.
- Auth verification routes now explicitly run on the Node.js runtime for production deployments.


## [1.2.0] - 2026-03-28

### Added
- Complete profile redesign with modern **Bento Box** grid layout.
- Integrated `lucide-react` for high-quality SVG icons throughout the profile.
- Premium visual effects and animations.

### Changed
- Improved profile navigation with animated return buttons.
- Optimized profile details presentation for high-density information.


## [1.1.0] - 2026-03-26

### Added
- Added `.nvmrc` to specify Node.js version.
- Added `CONTRIBUTING.md` with contribution guidelines.
- Added `CHANGELOG.md` to track project evolution.
- Added `.prettierrc` for automated code formatting.
- Added `docker-compose.yml` for local MongoDB development.
- Added `vercel.json` for deployment configuration.
- Added `DEVELOPERS.md` with extensive technical documentation.
- Revamped `README.md` with a cinematic hero image, tech badges, and immersive copywriting.

### Changed
- Updated `package.json` with Prettier and new scripts.


## [1.0.0] - 2026-03-24

### Added
- Initial release of Minecraft Life Journal.
- User authentication (Access/Refresh tokens).
- World management and memory timeline.
- Cinematic slideshow mode.
- Coordinate tracker.
- Public sharing functionality.
- Custom profile management.
