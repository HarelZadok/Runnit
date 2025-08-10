# Runnit OS

Runnit OS is a desktop-style environment built with Next.js and TypeScript that simulates a traditional desktop
experience on the web.

## Key Features

- Customizable desktop: change wallpaper and rearrange draggable icons
- Taskbar with searchable app launcher, running app indicators, and quick access to apps
- Advanced window manager: open multiple resizable, movable, minimizable, and maximizable windows with snap support
- Built-in OS apps:
  - Bin: restore or permanently delete files
  - Files: navigate and manage a mock file system
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
6. Right-click on the desktop to open the context menu for wallpaper settings and refreshing
7. Browse files in the Files app; deleted items are sent to the Bin for recovery or permanent removal
8. Open the Settings app from the taskbar to customize themes, wallpapers, and shortcuts

## Repository Structure

```text
public/
  wallpaper.jpg
  icons/
    app-launcher.png
    bin.png
    explorer.png
src/
  app/
    globals.css         # global styles
    layout.tsx          # root layout
    page.tsx            # main desktop entry
    providers/
      StoreProvider.tsx # Redux store provider
  lib/
    hooks.ts            # custom React hooks
    store.ts            # Redux store setup
    features/           # feature slices/components
      desktop/
      taskbar/
      windowManager/
      OSApp/
      settings/
    OSApps/             # app registry & implementations
      AppRegistry.ts
      AppList.ts
      apps/
        bin/
        explorer/
```

## Getting Started

1. Install dependencies
   ```bash
   npm install
   ```
2. Run the dev server
   ```bash
   npm run dev
   ```
3. Open http://localhost:3000 to view the desktop

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

- Next.js
- React 18
- Redux Toolkit
- TypeScript
- CSS Modules / PostCSS

## License

Released under the MIT License.
