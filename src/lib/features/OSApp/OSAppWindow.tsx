// OSAppWindow.tsx: Renders a resizable, draggable window for a given OSApp instance, integrates with windowManager state
"use client";

import OSApp, { OSAppProps } from "@/lib/features/OSApp/OSApp";
import React, { useEffect, useState, useRef } from "react";
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
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  const [isHidingTaskbar, setIsHidingTaskbar] = useState(false);

  const appRef = useRef<OSApp>(null);
  const AppComponent = app.constructor as React.ComponentClass<
    OSAppProps,
    object
  >;

  const hasTriggeredHideRef = useRef(false);

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
    };
    setSetting("windowPrefs" + app.getAppProps().appFile.id, newPrefs);
  }, [width, height, position, app]);

  // Setup drag, maximize, minimize, and close handlers on the OSApp instance
  useEffect(() => {
    const instance = appRef.current;
    if (!instance) return;

    // Drag start: capture initial mouse
    instance.setOnGrabStart((e) => {
      setIsGrabbing(true);
      if (maximized) {
        dispatch(unmaximizeApp(app.getAppProps().appFile.id));
        setPosition({
          x: e.clientX - width / 2,
          y: e.clientY - 20,
        });
      }
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    });
    // Dragging: update position incrementally
    instance.setOnGrabbing((e) => {
      document.body.style.cursor = "move";
      const deltaX = e.clientX - prevMouseRef.current.x;
      const deltaY = e.clientY - prevMouseRef.current.y;

      setPosition((prev) => ({
        x: prev.x + deltaX,
        y: Math.max(prev.y + deltaY, -6),
      }));
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      if (e.clientY <= 10) {
        dispatch(indicateFullscreen());
      } else {
        dispatch(unindicateFullscreen());
      }
    });
    // Drag end: stop grabbing
    instance.setOnGrabEnd((e) => {
      setIsGrabbing(false);
      if (e.clientY <= 10) dispatch(maximizeApp(app.getAppProps().appFile.id));
    });
    document.body.style.cursor = "auto";

    // Maximize toggle
    instance.setOnMaximize(() => {
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
      dispatch(closeApp(app.getAppProps().appFile.id));
    });
    instance.setOnResizeStart(() => {
      setIsResizing(true);
    });
    instance.setOnResizing((event, sides) => {
      const updateNorth = () => {
        const deltaY = position.y - event.clientY;
        setHeight((prev) => {
          const newHeight = prev + deltaY;
          return Math.max(newHeight, app.minimumHeight);
        });
        if (height + deltaY > app.minimumHeight) {
          setPosition((prev) => {
            return { x: prev.x, y: prev.y - deltaY };
          });
        }
      };

      const updateSouth = () => {
        setHeight((prev) => {
          const newHeight = prev + (event.clientY - (position.y + height));
          return Math.max(newHeight, app.minimumHeight);
        });
      };

      const updateEast = () => {
        setWidth((prev) => {
          const newWidth = prev + (event.clientX - (position.x + width));
          return Math.max(newWidth, app.minimumWidth);
        });
      };

      const updateWest = () => {
        const deltaX = position.x - event.clientX;
        setWidth((prev) => {
          const newWidth = prev + deltaX;
          return Math.max(newWidth, app.minimumWidth);
        });
        if (width + deltaX > app.minimumWidth) {
          setPosition((prev) => {
            return { x: prev.x - deltaX, y: prev.y };
          });
        }
      };

      if (sides.includes("north") && sides.includes("east")) {
        updateNorth();
        updateEast();
      } else if (sides.includes("north") && sides.includes("west")) {
        updateNorth();
        updateWest();
      } else if (sides.includes("south") && sides.includes("east")) {
        updateSouth();
        updateEast();
      } else if (sides.includes("south") && sides.includes("west")) {
        updateSouth();
        updateWest();
      } else if (sides.includes("north")) {
        updateNorth();
      } else if (sides.includes("south")) {
        updateSouth();
      } else if (sides.includes("east")) {
        updateEast();
      } else if (sides.includes("west")) {
        updateWest();
      }
    });
    instance.setOnResizeEnd(() => {
      setIsResizing(false);
    });
  }, [
    app,
    dispatch,
    height,
    maximized,
    minimized,
    position.x,
    position.y,
    width,
  ]);

  // Render window container with dynamic styles based on state
  return (
    <div>
      <div
        className={`
					absolute
					backdrop-blur-2xl
					overflow-hidden
					transition-all
					duration-300
					rounded-${maximized ? "none" : "lg"}
					border-[1px]
			`}
        ref={windowRef}
        style={{
          borderColor: minimized ? "transparent" : "black",
          left: minimized ? window.innerWidth / 2 : maximized ? 0 : position.x,
          top: minimized
            ? window.innerHeight - taskbarHeight
            : maximized
              ? 0
              : position.y,
          width: minimized ? 0 : maximized ? window.innerWidth : width,
          height: minimized ? 0 : maximized ? window.innerHeight : height,
          zIndex: zIndex,
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
					${instance.isFocused ? "opacity-100" : isMouseOver ? "opacity-85" : "opacity-75"}
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
          <AppComponent args={app.args} ref={appRef} />
        </div>
      </div>
    </div>
  );
}
