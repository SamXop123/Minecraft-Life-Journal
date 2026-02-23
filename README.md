# 🎮 Minecraft Life Journal

A cinematic, immersive web application for documenting and sharing your Minecraft adventures. Built with Next.js, MongoDB, and crafted with Minecraft-themed aesthetics.

---

## 🌟 Features

### Core Functionality
- **User Authentication** — Secure JWT-based auth with access & refresh tokens
- **World Management** — Create, track, and manage multiple Minecraft worlds
- **Memory Recording** — Log memories with titles, categories, descriptions, and images
- **Memory Editing** — Update existing memories with new details and images
- **Cinematic Slideshow** — View memories in fullscreen slideshow mode with Ken Burns zoom effects
- **User Profiles** — Customizable profiles with display names, avatars, experience levels, and bio

### Sharing & Collaboration
- **Shareable World Links** — Generate secure, token-based share links for individual worlds
- **Public Share Page** — View-only interface for shared worlds (no authentication required)
- **Copy-to-Clipboard** — One-click sharing of world URLs
- **Privacy Control** — Toggle sharing on/off per world

### Visual Design
- **Cinematic Backgrounds** — Breathing animated backgrounds with layered depth
- **Glass-Morphism UI** — Semi-transparent, blurred card-based interface
- **Pixel-Art Aesthetics** — Minecraft-themed sun/moon with immersive glows
- **Responsive Layout** — Mobile-friendly, scales beautifully across devices
- **Smooth Animations** — Framer Motion transitions for polished interactions
- **Dark Theme** — Warm amber accent colors on dark backgrounds

---

## 🛠️ Tech Stack

### Frontend
- **Framework** — Next.js 16+ (App Router)
- **UI Library** — Tailwind CSS
- **Animations** — Framer Motion
- **Image Handling** — Cloudinary for CDN & optimization

### Backend
- **Runtime** — Node.js
- **API Framework** — Next.js API Routes
- **Database** — MongoDB with Mongoose ODM
- **Authentication** — JWT (Access & Refresh tokens)
- **Crypto** — Built-in Node.js `crypto` for secure token generation

### Deployment & DevTools
- **Development** — `npm run dev` (Next.js Turbopack)
- **Environment** — `.env.local` for secrets
- **Package Manager** — npm

---

## 📦 Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas URI)
- Cloudinary account (for image uploads)
- npm

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd minecraft-life-journal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env.local` in the project root:
   ```env
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/minecraft-life-journal
   JWT_ACCESS_SECRET=your-secret-key-min-32-chars
   JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Usage

### For Users

1. **Register/Login** — Create a new account or sign in at `/login`
2. **Create a World** — Add a new Minecraft world with version, mode, seed, and dates
3. **Record Memories** — Click "Add Memory" to log achievements, builds, deaths, and moments
4. **Manage Memories** — Edit or delete memories; upload screenshots
5. **Cinematic Mode** — Click the camera icon to view memories as a fullscreen slideshow
6. **Share Worlds** — Click "Enable Sharing" to generate a unique link for others to view
7. **View Profile** — Customize your profile with avatar, bio, experience level, etc.

### For Developers

#### Project Structure
```
src/
├── app/
│   ├── page.js                      # Landing page with cinematic hero
│   ├── login/page.js                # Login route
│   ├── register/page.js             # Registration route
│   ├── dashboard/page.js            # World list & dashboard
│   ├── profile/page.js              # User profile page
│   ├── world/[id]/page.js           # World detail & memory timeline
│   ├── share/[token]/page.js        # Public shared world view
│   └── api/
│       ├── auth/
│       │   ├── login/route.js       # JWT auth endpoint
│       │   ├── register/route.js    # User registration
│       │   ├── refresh/route.js     # Token refresh
│       │   └── logout/route.js      # Logout
│       ├── worlds/
│       │   ├── route.js             # List & create worlds
│       │   ├── [id]/route.js        # Get, update, delete world
│       │   └── share/[id]/route.js  # Generate share token
│       ├── memories/
│       │   ├── route.js             # Create memory
│       │   ├── [id]/route.js        # Get memories for world
│       │   ├── edit/[id]/route.js   # Update memory
│       │   └── delete/[id]/route.js # Delete memory
│       ├── profile/route.js         # Get & update user profile
│       ├── share/[token]/route.js   # Public share endpoint
│       └── upload/route.js          # Cloudinary image upload
├── components/
│   ├── Navbar.js                    # Global navigation bar
│   ├── PixelParticles.js            # Floating pixel animation
│   ├── CinematicMode.js             # Fullscreen slideshow
│   ├── EditMemoryModal.js           # Memory edit form
│   └── EditProfileModal.js          # Profile edit form
├── models/
│   ├── User.js                      # User schema
│   ├── World.js                     # World schema
│   └── Memory.js                    # Memory schema
└── lib/
    ├── db.js                        # MongoDB connection
    ├── auth.js                      # Password & token utilities
    └── requireAuth.js               # Auth middleware
```

#### API Endpoints

**Authentication**
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login & get tokens
- `POST /api/auth/refresh` — Refresh access token
- `POST /api/auth/logout` — Clear session

**Worlds**
- `GET /api/worlds` — List user's worlds
- `POST /api/worlds` — Create world
- `GET /api/worlds/[id]` — Get world details
- `PUT /api/worlds/[id]` — Update world
- `DELETE /api/worlds/[id]` — Delete world
- `POST /api/worlds/share/[id]` — Generate share token

**Memories**
- `POST /api/memories` — Create memory
- `GET /api/memories/[worldId]` — Get memories for world
- `PATCH /api/memories/edit/[id]` — Update memory
- `DELETE /api/memories/delete/[id]` — Delete memory

**Profile**
- `GET /api/profile` — Get user profile
- `PATCH /api/profile` — Update user profile

**Sharing**
- `GET /api/share/[token]` — Get shared world (public, no auth)

**Uploads**
- `POST /api/upload` — Upload image to Cloudinary

#### Authentication Flow

1. **Registration** — Password hashed with bcryptjs, user stored in MongoDB
2. **Login** — Validate credentials, generate JWT tokens (15min access, 7day refresh)
3. **Access Token** — Sent in `Authorization: Bearer <token>` header
4. **Refresh Flow** — On 401, exchange refresh token for new access token
5. **Protected Routes** — API routes use `requireAuth()` middleware to verify token

#### Key Components

**Navbar.js**
- Global navigation with animated pickaxe icon
- Minecraft-style 3D buttons with multi-directional borders
- Responsive design, hides on public routes

**CinematicMode.js**
- Fullscreen slideshow with 7-second auto-advance
- Ken Burns zoom effect on memory images
- Keyboard controls (ESC, arrows, space)

**EditMemoryModal.js**
- Modal form for creating/editing memories
- Optional image upload with preview
- Category selection (achievement, build, death, funny, emotional)

**PixelParticles.js**
- Ambient floating pixel animation
- Four Minecraft colors (grass, gold, diamond, dirt)
- Configurable count, default 20

---

## 🔐 Security

- **Password Hashing** — bcryptjs with 10 salt rounds
- **JWT Secrets** — Stored in `.env.local`, never exposed
- **CORS** — Next.js API routes run on same domain
- **Token Expiry** — Access tokens expire in 15 minutes
- **Secure Cookies** — Refresh tokens stored as httpOnly, secure cookies
- **Ownership Checks** — All world/memory routes verify user ownership
- **Share Token Privacy** — 128-bit random tokens, no user data in URLs

---

## 🎨 Design Philosophy

### Cinematic Aesthetics
- **Breathing Backgrounds** — 14-second scale loop for immersive effect
- **Layered Depth** — 5 fixed background layers (image, overlay, glow, vignette, particles)
- **Warm Palette** — Amber (#FFE0B0) accents on dark (#1A1008) backgrounds
- **Glass-Morphism** — `backdrop-blur-lg` with semi-transparent overlays

### Performance
- **Image Optimization** — Cloudinary handles resize, format, and CDN
- **Fixed Backgrounds** — Prevent layout shift and unwanted stretching
- **Lazy Loading** — Next.js Image component for optimized delivery
- **Efficient Queries** — MongoDB `.select()` to fetch only needed fields

---

## 🔄 Development Workflow

### Adding a Feature
1. Create/update models in `src/models/`
2. Implement API routes in `src/app/api/`
3. Add frontend pages/components in `src/app/` or `src/components/`
4. Test authentication & authorization
5. Verify responsive design

### Environment Changes
- Modify `.env.local` and restart dev server: `npm run dev`
- Turbopack will hot-reload, but watch for console errors

### Database Migrations
- Mongoose schemas are flexible — add optional fields to existing models
- Use `findByIdAndUpdate` with `$set` operator to bypass cached model definitions
- Always use `.select()` filters for public endpoints

---

## 📄 License

This project is provided as-is for educational and personal use.

---

## 🤝 Contributing

To contribute:
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📞 Support

For issues or questions:
- Check existing GitHub issues
- Review the troubleshooting section above
- Examine server console logs: `npm run dev`

---

**Happy Minecrafting! 🎮✨**
