# Runnit OS

Runnit OS is a desktop-style environment built with React and TypeScript that simulates a traditional desktop experience on the web.

## What's New in v0.2.5

### 🎨 Enhanced Update Notification System

- Beautiful animated update notifier with stunning visual effects
- Smooth gradient animations, particle effects, and backdrop blur
- Interactive refresh button with elegant hover animations
- Version tracking with persistent settings management

### 💻 New Code Editor App

- Full-featured Monaco Editor integration for in-browser code editing
- Complete TypeScript/React support with syntax highlighting and IntelliSense
- Real-time type checking and error detection
- File system integration - edit files directly from the Files app
- Professional IDE-like experience with modern editor features

### 🌐 Portfolio Showcase App

- Integrated portfolio viewer displaying developer's work
- Seamless iframe integration with loading states
- Professional presentation of projects and skills

### 🗂️ Advanced File Management System

- Complete virtual file system with persistent storage
- Create, edit, move, and delete files and folders
- Smart trash system with restore and permanent delete options
- File type recognition with appropriate icons
- Drag-and-drop file operations between directories

### 💾 Persistent State Management

- **Complete session persistence** - Your desktop layout, settings, and app states are preserved
- Files, folders, and trash contents remain intact between browser refreshes
- Window positions, sizes, and application data automatically restored
- Settings and preferences persist across sessions
- Seamless experience that maintains continuity like a real operating system

### 🪟 Enhanced Window Management

- **Individual taskbar minimization** - Each window gets its own taskbar icon when minimized
- **Keyboard shortcuts** - Use Ctrl+Tab to cycle through windows and Ctrl+W to close the focused window
- **Smooth animations** - Windows fade in when opening and fade out when closing
- **Smart taskbar interactions** - Click a focused window's taskbar icon to minimize and unfocus it

### ⚡ Technology Stack Upgrades

- **Next.js 15.4.3** with Turbopack for ultra-fast development
- **React 19.1.0** with latest features and performance improvements
- **Tailwind CSS 4.0** for modern styling capabilities
- **Monaco Editor 4.7.0** for professional code editing experience
- Enhanced TypeScript support with strict type checking

### 🎭 UI/UX Enhancements

- Mobile device detection with appropriate messaging
- Enhanced window management with better resize handles
- Improved desktop selection with visual feedback
- Refined taskbar interactions and app launcher
- Better icon scaling and responsive design

## Key Features

- **Persistent Desktop Environment**: Your complete OS state, including desktop layout, files, and settings, automatically saves and restores between browser sessions
- Customizable desktop: change wallpaper and rearrange draggable icons
- Taskbar with searchable app launcher, running app indicators, and quick access to apps
- Advanced window manager: open multiple resizable, movable, minimizable, and maximizable windows with snap support and smooth animations
- **Keyboard shortcuts**: Ctrl+Tab to switch windows, Ctrl+W to close focused window
- Built-in OS apps:
  - **Code Editor**: Professional Monaco-based code editor with TypeScript support
  - **Files**: Navigate and manage a complete virtual file system
  - **Portfolio**: Showcase and view developer portfolios
  - **Trash**: Restore or permanently delete files with smart management
- Settings panel: adjust preferences like theme, wallpaper, and keyboard shortcuts
- Modular OSApp framework: easily add or remove apps with isolated state and icons
- Global state management using Redux Toolkit for predictable, easy-to-debug updates
- Responsive design: adapts seamlessly across different screen resolutions and window sizes

## Usage Guide

1. Double-click or select + press Enter on desktop icons to launch apps
2. Drag icons on the desktop to reorganize as you prefer
3. Use the App Launcher in the taskbar to search, pin, and open applications
4. Click and drag window title bars to move windows; drag edges or corners to resize
5. Minimize, maximize, or close windows via the title bar controls
6. **Use keyboard shortcuts**: Ctrl+Tab to cycle through open windows, Ctrl+W to close the focused window
7. **Click taskbar icons**: Click a minimized app to restore it, or click a focused app to minimize it
8. Right-click on the desktop to open the context menu for wallpaper settings and refreshing
9. Browse files in the Files app; deleted items are sent to the Trash for recovery or permanent removal
10. Open the Settings app from the taskbar to customize themes, wallpaper, and shortcuts
11. **NEW**: Use the Code Editor to write and edit code with full TypeScript/React support
12. **NEW**: View portfolios and projects in the Portfolio app
13. **PERSISTENT**: Your work is automatically saved - close and reopen your browser to see everything exactly as you left it

## Repository Structure

```text
public/
  wallpaper.jpg
  icons/
    app-launcher.png
    code-editor.png
    files.png
    runnit-transparent.png
    trash-empty.png
    trash-full.png
src/
  app/
    globals.css         # global styles with Tailwind CSS 4.0
    layout.tsx          # root layout with mobile detection
    page.tsx            # main desktop entry
    providers/
      StoreProvider.tsx # Redux store provider
  lib/
    hooks.ts            # custom React hooks
    store.ts            # Redux store setup
    features/           # feature slices/components
      appLauncher/      # searchable app launcher
      desktop/          # desktop management
      taskbar/          # taskbar functionality
      windowManager/    # advanced window management
      OSApp/            # base app framework
      settings/         # user preferences
      updateNotifier/   # version update system
    OSApps/             # app registry & implementations
      AppRegistry.ts
      AppList.ts
      apps/
        code_editor/    # Monaco-based code editor
        files/          # virtual file system
        portfolio/      # portfolio showcase
        trash/          # file recovery system
```

## Getting Started

1. Install dependencies
   ```bash
   npm install
   ```
2. Run the dev server (now with Turbopack for faster builds)
   ```bash
   npm run dev
   ```
3. Open http://localhost:3000 to view the desktop

> **Note**: Mobile devices will see a compatibility message as the desktop experience is optimized for larger screens.

## Customization

### Adding New OS Apps

- Create a folder under `src/lib/OSApps/apps/` with your app component and assets
- Update `AppRegistry.ts` with metadata (name, icon, default props)
- Import and list your app in `AppList.ts` to make it available in the launcher

### Wallpaper and Themes

- Replace or add images in `public/` (e.g., `wallpaper.jpg`, `wallpaper-2.jpg`)
- Update `src/app/globals.css` to define CSS variables for colors, font sizes, and backgrounds
- Use `:root` selectors or theme-specific classes to switch themes dynamically via the Settings app

### Desktop Icons and Layout

- Modify default icon positions in `desktopSlice.ts` under `src/lib/features/desktop/`
- Add or remove desktop shortcuts by adjusting the initial state array (id, label, icon, appId, position)
- Drag-and-drop behavior is handled in `Desktop.tsx`—customize drag constraints or snap-to-grid settings there

### Taskbar and Context Menu

- Configure pinned apps and launcher behavior in `taskbarSlice.ts`
- Edit context menu options (right-click on desktop) by updating the menu items in `Desktop.tsx` or a dedicated context
  module
- Replace taskbar icons in `public/icons/` and reference new names in `Taskbar.tsx`

### Keyboard Shortcuts and Accessibility

- Define or override keybindings in `settingsSlice.ts` under `src/lib/features/settings/`
- Hooks in `hooks.ts` listen for global shortcuts; modify or add handlers as needed
- Ensure all interactive elements have ARIA attributes in component JSX for screen-reader compatibility

## Tech Stack

- **Next.js 15.4.3** - React framework with Turbopack support
- **React 19.1.0** - Latest React with improved performance
- **Redux Toolkit 2.8.2** - State management
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Modern utility-first styling
- **Monaco Editor 4.7.0** - VS Code-powered code editing
- **React Icons 5.5.0** - Comprehensive icon library

## License

Released under the MIT License.
