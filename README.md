# Runnit OS

Runnit OS is a desktop-like environment built with Next.js and TypeScript, featuring a customizable desktop, taskbar,
window manager, and OS-style applications such as Bin and Explorer. This project demonstrates advanced state management
and UI composition using React, Redux Toolkit, and modern CSS.

## Features

- Desktop with wallpaper and draggable icons
- Taskbar with application launcher and running indicators
- Window manager supporting multiple resizable and movable windows
- Built-in apps:
    - Bin (recycle bin)
    - Explorer (file browser)
- Modular architecture for adding new OS-style apps
- State management via Redux Toolkit slices

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
    page.tsx            # main entry for desktop
    providers/
      StoreProvider.tsx # Redux store provider
  lib/
    hooks.ts            # custom React hooks
    store.ts            # Redux store setup
    features/           # feature slices and components
      desktop/
        Desktop.tsx
        desktopSlice.ts
      taskbar/
        Taskbar.tsx
        taskbarSlice.ts
      windowManager/
        windowManagerSlice.ts
      OSApp/
        OSApp.tsx
        OSAppWindow.tsx
        OSAppFile.tsx
      settings/
        settingsSlice.ts
    OSApps/             # registry and app implementations
      AppRegistry.ts
      AppList.ts
      apps/
        bin/
          Bin.tsx
        explorer/
          Explorer.tsx
```

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to view the desktop environment.

## Customization

- To add a new OS app:
    1. Create a new folder under `src/lib/OSApps/apps/` with its own component.
    2. Register the app in `AppRegistry.ts`.
    3. Add an icon in `public/icons/` and update `AppList.ts`.
- Change the wallpaper by replacing `public/wallpaper.jpg`.
- Adjust global styles in `src/app/globals.css`.

## Tech Stack

- Next.js
- React 18
- Redux Toolkit
- TypeScript
- CSS Modules / PostCSS

## License

This project is licensed under the MIT License.
