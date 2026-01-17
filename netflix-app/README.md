# Netflix Mobile App
# Updated: 2026-01-17 10:35:00

A Netflix-style mobile streaming app built with React Native (Expo).

## 🎬 Overview

This project demonstrates a full product design sprint from Discovery to Delivery, creating a production-ready mobile streaming application.

## 📱 Features

- **Personalized Home Feed** - Hero content, categorized rows, continue watching
- **Search & Discovery** - Search, filters, recommendations
- **Content Details** - Synopsis, cast, episodes, similar content
- **Video Player** - Full-featured player with controls
- **Profile Management** - Multiple profiles, preferences, downloads
- **Offline Viewing** - Download content for offline playback

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native (Expo) |
| Navigation | React Navigation v6 |
| State | Zustand |
| Styling | NativeWind (Tailwind CSS) |
| Video | expo-av |
| Icons | @expo/vector-icons |

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run start

# Run on iOS simulator
bun run ios

# Run on Android emulator
bun run android
```

## 📁 Project Structure

```
netflix-app/
├── docs/
│   ├── PRD.md              # Product Requirements
│   ├── DESIGN_SYSTEM.md    # Design tokens & specs
│   └── USER_STORIES.md     # User stories with AC
├── src/
│   ├── components/
│   │   ├── common/         # Button, Typography, etc.
│   │   ├── content/        # ContentCard, ContentRow
│   │   ├── navigation/     # TabBar, Header
│   │   └── player/         # VideoPlayer, Controls
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   ├── DetailScreen.tsx
│   │   ├── PlayerScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── store/
│   │   └── useAppStore.ts
│   ├── data/
│   │   └── mockData.ts
│   ├── hooks/
│   ├── utils/
│   └── types/
│       └── index.ts
├── assets/
├── app.json
├── App.tsx
└── package.json
```

## 📋 Documentation

- [Product Requirements Document](./docs/PRD.md)
- [Design System](./docs/DESIGN_SYSTEM.md)
- [User Stories](./docs/USER_STORIES.md)

## 🎨 Design Principles

1. **Content First** - UI recedes, content shines
2. **Dark Theme** - Optimized for viewing experience
3. **Effortless Discovery** - Personalized, intuitive browsing
4. **Seamless Playback** - One tap to watch

## 📄 License

MIT - Educational/Portfolio Project

---

**Version:** 1.0.0
**Last Updated:** 2026-01-17 10:35:00
