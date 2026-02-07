# Clique Lounge

A productivity-focused social platform for students. Instagram Clone + Apple Music-inspired Player + Pomodoro Timer.

## Features

### 🌐 Social Media Core
- Posts with likes, comments, and shares
- Follow/unfollow system
- Profile pages with stats
- Explore page with discover content

### 📸 Student Stories
- 24-hour ephemeral content
- Story viewer with auto-progress
- Story creation with image/video upload
- View counts and replies

### 🎵 Apple Music Player
- Mini player with controls
- Expanded full-screen player
- Queue management
- Playlists and shuffle/repeat

### ⏱️ Pomodoro Timer
- 25-min work / 5-min break cycles
- Customizable durations
- Visual progress ring
- Session tracking & statistics
- Break reminders with notifications


## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Auth pages (login, signup)
│   ├── (main)/          # Main app pages
│   │   ├── feed/        # Instagram-style feed
│   │   ├── explore/     # Discover content
│   │   ├── create/      # Create post
│   │   ├── stories/     # Create story
│   │   ├── profile/     # User profiles
│   │   ├── pomodoro/    # Pomodoro timer
│   │   ├── music/       # Music player
│   │   └── settings/    # App settings
│   └── api/
├── components/
│   ├── ui/              # ShadCN components
│   ├── feed/            # Feed components
│   ├── stories/         # Story components
│   ├── music/           # Music player
│   ├── pomodoro/        # Pomodoro timer
│   └── shared/          # Navigation, etc.
├── lib/
│   ├── supabase/        # Supabase clients
│   ├── stores/          # Zustand stores
│   └── hooks/           # Custom hooks
└── types/               # TypeScript types
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Login page |
| `/signup` | Sign up page |
| `/feed` | Main feed with posts |
| `/explore` | Discover content |
| `/create` | Create new post |
| `/stories` | Create new story |
| `/profile` | Your profile |
| `/profile/[username]` | User profiles |
| `/pomodoro` | Pomodoro timer |
| `/music` | Music player |
| `/settings` | App settings |

# clique-lounge
