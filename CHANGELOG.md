# 🚀 Minecraft Life Journal — Release Notes & Changelog

## 🎉 [2.0.0] - Official Public Release — 2026-08-17

> **Minecraft Life Journal v2.0.0 is officially live for the public!**
> Track, log, and preserve your Minecraft survival world stories, playtime, advancements, screenshot memories, and coordinates live with zero modding required.
>
> 🌐 **MLJ:** [https://mlj.app](https://mlj.app)

---

### 🌟 Features & Highlights

- **⚡ Zero-Bloat Tauri v2 Desktop Companion**:
  - Lightweight Rust desktop client with 0% idle CPU usage.
  - Automatic game process monitoring, session playtime calculation, and screenshot folder matching.
  - Single-instance window focus protection (`tauri-plugin-single-instance`).
  - System Tray integration with quick web dashboard launcher.
  - Custom window close behavior toggle (`Minimize to System Tray on Close (X)`).

- **💬 In-Game Chat Logging & Coordinate Mapping**:
  - Type `#journal <message>` in Minecraft chat to log timeline notes live.
  - Type `#coords <label> <X> <Y> <Z>` to map points of interest (bases, portals, villages, strongholds).
  - Auto-pairs F2 screenshots taken within 60 seconds of chat memories.

- **🐛 In-App Discord Bug Reporter**:
  - Native bug report modal built directly into the companion app that forwards rich, color-coded embeds to the developer's Discord server channel.

- **📖 Official Documentation & About Pages**:
  - Dedicated `/docs` and `/about` pages featuring Quick Start guides, chat command cheat sheets, troubleshooting FAQ, SmartScreen installation helper, and creator story by **SamXop123**.

- **🤖 AI Assistant Discovery & Search Engine Optimization**:
  - Native sitemap, robots control, and standard `llms.txt` for AI Assistant discovery (ChatGPT, Perplexity, Claude, Gemini).
  - JSON-LD `SoftwareApplication` schema markup for Google & Bing search indexing.
  - Open Graph and Twitter Card social link previews across messaging platforms.

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
