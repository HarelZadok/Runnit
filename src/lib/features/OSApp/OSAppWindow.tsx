// OSAppWindow.tsx: Renders a resizable, draggable window for a given OSApp instance, integrates with windowManager state
"use client";

import OSApp, { OSAppProps } from "@/lib/features/OSApp/OSApp";
import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  addOpenTaskbarApp,
  decrementHideRate,
  incrementHideRate,
  removeOpenTaskbarApp,
} from "@/lib/features/taskbar/taskbarSlice";
import {
  closeApp,
  focusApp,
  indicateFullscreen,
  maximizeApp,
  minimizeApp,
  unindicateFullscreen,
  unmaximizeApp,
  unminimizeApp,
} from "@/lib/features/windowManager/windowManagerSlice";
import { getSetting, setSetting } from "@/lib/functions";

export interface AppWindowProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
}

export interface OSAppWindowProps {
  props?: AppWindowProps;
  app: OSApp;
}

export default function OSAppWindow({ props, app }: OSAppWindowProps) {
  const dispatch = useAppDispatch();
  // Retrieve size and position settings from Redux
  const taskbarHeight = useAppSelector((state) => state.settings.taskbarHeight);
  const instance = useAppSelector((state) => state.windowManager.openApps).find(
    (cApp) => cApp.pid === app.getAppProps().appFile.id,
  )!;
  const maximized = instance.isMaximized;
  const minimized = instance.isMinimized;
  const zIndex = instance.zIndex;

  // Local state for window dimensions and drag position
  const [width, setWidth] = useState(props?.width ?? app.defaultWidth);
  const [height, setHeight] = useState(props?.height ?? app.defaultHeight);
  const [isMouseOver, setIsMouseOver] = useState(false);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState({
    x: props?.x ?? window.innerWidth / 2 - width / 2,
    y: props?.y ?? window.innerHeight / 2 - height / 2,
  });
  const [isHidingTaskbar, setIsHidingTaskbar] = useState(false);
  const [startOpacity, setStartOpacity] = useState(0);

  const prevMouseRef = useRef({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  const startRef = useRef({
    mouseX: 0,
    mouseY: 0,
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  });

  const pinnedApps = useAppSelector((state) => state.taskbar.pinnedTaskbarApps);
  const openApps = useAppSelector((state) => state.taskbar.openedTaskbarApps);
  const taskbarApps =
    pinnedApps.length > 0
      ? pinnedApps.concat(
          openApps.filter((curr) =>
            pinnedApps.some((pinned) => pinned.id !== curr.id),
          ),
        )
      : openApps;
  const iconWidth =
    useAppSelector((state) => state.settings.taskbarHeight) - 35;
  const taskbarWidth = taskbarApps.length * iconWidth + 70;
  const taskbarIconIndex = taskbarApps.findIndex(
    (curr) => curr.id === app.appFile.id,
  );
  const iconPosition =
    window.innerWidth / 2 -
    taskbarWidth / 2 +
    iconWidth * (taskbarIconIndex + 2) -
    iconWidth / 2;

  const AppComponent = app.constructor as React.ComponentClass<
    OSAppProps,
    object
  >;
  const appRef = useRef<OSApp>(null);

  const hasTriggeredHideRef = useRef(false);

  useEffect(() => {
    setTimeout(() => setStartOpacity(1), 1);
  }, [app.appFile.id]);

  useEffect(() => {
    const bottom = position.y + height;
    const shouldHide =
      (window.innerHeight - bottom <= taskbarHeight || maximized) && !minimized;

    if (shouldHide && !isHidingTaskbar && !hasTriggeredHideRef.current) {
      hasTriggeredHideRef.current = true;
      setIsHidingTaskbar(true);
      dispatch(incrementHideRate());
    } else if (!shouldHide && isHidingTaskbar) {
      hasTriggeredHideRef.current = false;
      setIsHidingTaskbar(false);
      dispatch(decrementHideRate());
    }
  }, [
    dispatch,
    height,
    isHidingTaskbar,
    maximized,
    minimized,
    position.y,
    taskbarHeight,
  ]);

  // Register window in taskbar on mount and cleanup on unmount
  useEffect(() => {
    dispatch(addOpenTaskbarApp(app.getAppProps().appFile));

    return () => {
      dispatch(removeOpenTaskbarApp(app.getAppProps().appFile));
    };
  }, [app, dispatch]);

  useEffect(() => {
    return () => {
      if (isHidingTaskbar) {
        dispatch(decrementHideRate());
      }
    };
  }, [dispatch, isHidingTaskbar]);

  useEffect(() => {
    const newPrefs = {
      ...getSetting("windowPrefs" + app.getAppProps().appFile.id),
      width: width,
      height: height,
      position: position,
      isMaximized: maximized,
    };
    setSetting("windowPrefs" + app.getAppProps().appFile.id, newPrefs);
  }, [width, height, position, app, maximized]);

  const [prevPos, setPrevPos] = useState<{ x: number; y: number } | null>();

  // Setup drag, maximize, minimize, and close handlers on the OSApp instance
  useEffect(() => {
    const instance = appRef.current;
    if (!instance) return;

    instance.setMaximize(maximized);
    instance.width = width;
    instance.height = height;

    // Drag start: capture initial mouse
    instance.setOnGrabStart((e) => {
      setIsGrabbing(true);
      const leftOffset = e.clientX / window.innerWidth;
      setPrevPos({ x: position.x, y: position.y });
      if (maximized) {
        instance.setMaximize(false);
        dispatch(unmaximizeApp(app.getAppProps().appFile.id));
        setPosition({
          x: e.clientX - width * leftOffset,
          y: e.clientY - 20,
        });
      }
      document.body.style.cursor = "move";
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    });

    // Dragging: update position incrementally
    instance.setOnGrabbing((e) => {
      const deltaX = e.clientX - prevMouseRef.current.x;
      const deltaY = e.clientY - prevMouseRef.current.y;

      setPosition((prev) => ({
        x: prev.x + deltaX,
        y: Math.max(prev.y + deltaY, -6),
      }));
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      if (e.clientY <= 10 && e.clientY >= 0) {
        dispatch(indicateFullscreen());
      } else {
        dispatch(unindicateFullscreen());
      }
    });

    // Drag end: stop grabbing
    instance.setOnGrabEnd((e) => {
      dispatch(unindicateFullscreen());
      setIsGrabbing(false);
      document.body.style.cursor = "auto";
      if (e.clientY <= 10 && e.clientY >= 0) {
        setPosition(prevPos!);
        instance.setMaximize(true);
        dispatch(maximizeApp(app.getAppProps().appFile.id));
      }
      setPrevPos(null);
    });

    // Maximize toggle
    instance.setOnMaximize(() => {
      instance.setMaximize(!maximized);
      if (!maximized) dispatch(maximizeApp(app.getAppProps().appFile.id));
      else dispatch(unmaximizeApp(app.getAppProps().appFile.id));
    });

    // Minimize toggle
    instance.setOnMinimize(() => {
      if (!minimized) dispatch(minimizeApp(app.getAppProps().appFile.id));
      else dispatch(unminimizeApp(app.getAppProps().appFile.id));
    });

    // Close window
    instance.setOnClose(() => {
      setStartOpacity(0);
      setTimeout(() => dispatch(closeApp(app.getAppProps().appFile.id)), 300);
    });

    instance.setOnResizeStart((e: React.MouseEvent) => {
      startRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        x: position.x,
        y: position.y,
        w: width,
        h: height,
      };
      setIsResizing(true);
    });

    instance.setOnResizing((e: MouseEvent, sides: string[]) => {
      const s = startRef.current;
      const dx = e.clientX - s.mouseX;
      const dy = e.clientY - s.mouseY;

      // propose box from start + total delta
      let x = s.x,
        y = s.y,
        w = s.w,
        h = s.h;

      if (sides.includes("east")) w = s.w + dx;
      if (sides.includes("south")) h = s.h + dy;
      if (sides.includes("west")) {
        x = s.x + dx;
        w = s.w - dx;
      }
      if (sides.includes("north")) {
        y = s.y + dy;
        h = s.h - dy;
      }

      // clamp and re-anchor edges so the opposite edge stays fixed
      const minW = app.minimumWidth;
      const minH = app.minimumHeight;

      if (w < minW) {
        if (sides.includes("west")) x = s.x + (s.w - minW); // lock east edge
        w = minW;
      }
      if (h < minH) {
        if (sides.includes("north")) y = s.y + (s.h - minH); // lock south edge
        h = minH;
      }

      // commit
      setPosition({ x, y });
      setWidth(w);
      setHeight(h);
    });

    instance.setOnResizeEnd(() => setIsResizing(false));
  }, [
    app,
    dispatch,
    height,
    maximized,
    minimized,
    position.x,
    position.y,
    width,
    prevPos,
  ]);

  // Render window container with dynamic styles based on state
  return (
    <div>
      <div
        className={`
					absolute
					overflow-hidden
					duration-300
					rounded-${maximized ? "none" : "lg"}
					border-[1px]
          origin-center
			`}
        ref={windowRef}
        style={{
          borderColor: minimized ? "transparent" : "black",
          left: minimized ? iconPosition : maximized ? 0 : position.x,
          top: minimized
            ? window.innerHeight - taskbarHeight
            : maximized
              ? 0
              : position.y,
          width: minimized ? 0 : maximized ? window.innerWidth : width,
          height: minimized ? 0 : maximized ? window.innerHeight : height,
          zIndex: zIndex,
          opacity: startOpacity,
          transitionProperty: isGrabbing || isResizing ? "none" : "all",
        }}
      >
        <div
          className={`
					flex
					flex-col
					transition-all
					duration-300
					w-full
					h-full
					select-none
          after:w-full
          after:h-full
          after:absolute
          after:backdrop-brightness-50
          after:transition-all
          after:pointer-events-none
					${instance.isFocused ? "after:opacity-0" : isMouseOver ? "after:opacity-30" : "after:opacity-60"}
				`}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onMouseDownCapture={() => {
            dispatch(focusApp(app.getAppProps().appFile.id));
          }}
          onMouseEnter={() => setIsMouseOver(true)}
          onMouseLeave={() => setIsMouseOver(false)}
        >
          <AppComponent
            args={app.args}
            devMessage={app.devMessage}
            isDev={app.isDev}
            ref={appRef}
          />
        </div>
      </div>
    </div>
  );
}
