"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { OSAppFile } from "@/lib/features/OSApp/OSAppFile";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Taskbar from "@/lib/features/taskbar/Taskbar";
import {
  addActiveDesktopApp,
  clearActiveDesktopApps,
  removeActiveDesktopApp,
  setActiveDesktopApps,
} from "@/lib/features/dekstop/desktopSlice";
import OSAppWindow, { AppWindowProps } from "@/lib/features/OSApp/OSAppWindow";
import appRegistry from "@/lib/OSApps/AppRegistry";
import "@/lib/OSApps/AppList";
import {
  cancelShowTaskbar,
  showTaskbar,
} from "@/lib/features/taskbar/taskbarSlice";
import AppLauncher from "@/lib/features/appLauncher/AppLauncher";
import { launchApp } from "@/lib/features/windowManager/windowManagerSlice";
import { changeDesktopBackground } from "@/lib/features/settings/settingsSlice";
import { getSetting } from "@/lib/functions";

export default function Desktop() {
  const TEST_APPS = false;

  let apps = useAppSelector((state) => state.desktop.desktopApps);
  if (TEST_APPS)
    apps = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      name: "App " + i,
      icon: "/icons/trash.png",
    }));

  const openApps = useAppSelector((state) => state.windowManager.openApps);
  const activeApps = useAppSelector((state) => state.desktop.activeDesktopApps);
  const background = useAppSelector((state) => state.settings.background);
  const taskbarHeight = useAppSelector((state) => state.settings.taskbarHeight);
  const iconScale = useAppSelector((state) => state.settings.iconScale);
  const taskbarHideRate = useAppSelector((state) => state.taskbar.hideRate);
  const [showingTaskbar, setShowingTaskbar] = useState(false);
  const [columnHeight, setColumnHeight] = useState<number>(-1);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [selectionXStart, setSelectionXStart] = useState(-1);
  const [selectionYStart, setSelectionYStart] = useState(-1);
  const [selectionXEnd, setSelectionXEnd] = useState(-1);
  const [selectionYEnd, setSelectionYEnd] = useState(-1);
  const itemRefs = useRef<HTMLDivElement[]>([]);
  const dispatch = useAppDispatch();

  function getElementsInSelectionBox(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    elements: HTMLElement[],
  ): HTMLElement[] {
    const left = Math.min(startX, endX);
    const right = Math.max(startX, endX);
    const top = Math.min(startY, endY);
    const bottom = Math.max(startY, endY);

    return elements.filter((el) => {
      const rect = el.getBoundingClientRect();

      return !(
        rect.right < left ||
        rect.left > right ||
        rect.bottom < top ||
        rect.top > bottom
      );
    });
  }

  const getAppsInSelectionBox = useCallback(() => {
    const overlapping = getElementsInSelectionBox(
      selectionXStart,
      selectionYStart,
      selectionXEnd,
      selectionYEnd,
      itemRefs.current,
    );
    const overlappingIds = overlapping.map((el) => Number(el.dataset.id));
    return apps.filter((app) => overlappingIds.includes(app.id));
  }, [apps, selectionXEnd, selectionXStart, selectionYEnd, selectionYStart]);

  const onContextMenu = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      // TODO: allow changing background.
      dispatch(changeDesktopBackground(background));
    },
    [background, dispatch],
  );

  const onDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (event.button === 0) {
        dispatch(clearActiveDesktopApps());
        setSelectionXStart(event.clientX);
        setSelectionYStart(event.clientY);
        setIsSelecting(true);
      }
    },
    [dispatch],
  );

  const cursorY = useRef(0);

  const onMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      cursorY.current = event.clientY;

      if (isSelecting) {
        setSelectionXEnd(event.clientX);
        setSelectionYEnd(event.clientY);
      }
      if (
        taskbarHideRate > 0 &&
        !showingTaskbar &&
        cursorY.current >= window.innerHeight - 1
      ) {
        setShowingTaskbar(true);
      } else if (
        showingTaskbar &&
        cursorY.current < window.innerHeight - taskbarHeight
      ) {
        setShowingTaskbar(false);
        dispatch(cancelShowTaskbar());
      }
    },
    [dispatch, isSelecting, showingTaskbar, taskbarHeight, taskbarHideRate],
  );

  useEffect(() => {
    if (!showingTaskbar) return;
    const timer = setTimeout(() => {
      if (cursorY.current >= window.innerHeight - 1) dispatch(showTaskbar());
      else setShowingTaskbar(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [dispatch, showingTaskbar]);

  const onDragEnd = useCallback(() => {
    if (
      isSelecting &&
      selectionXStart !== -1 &&
      selectionXEnd !== -1 &&
      selectionYStart !== -1 &&
      selectionYEnd !== -1
    ) {
      dispatch(setActiveDesktopApps(getAppsInSelectionBox()));
      setSelectionXStart(-1);
      setSelectionXEnd(-1);
      setSelectionYStart(-1);
      setSelectionYEnd(-1);
    }
    setIsSelecting(false);
  }, [
    dispatch,
    getAppsInSelectionBox,
    isSelecting,
    selectionXEnd,
    selectionXStart,
    selectionYEnd,
    selectionYStart,
  ]);

  const handleMouseEvent = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      switch (event.button) {
        // Left Click
        case 0:
          if (isSelecting) onDragEnd();
          break;

        // Right Click
        case 2:
          break;
      }
    },
    [isSelecting, onDragEnd],
  );

  useEffect(() => {
    const screenHeight = window.innerHeight;
    const desktopHeight = screenHeight - taskbarHeight;
    setColumnHeight(desktopHeight / (iconScale + 50) - 1);
  }, [iconScale, taskbarHeight]);

  const showApp = useCallback((id: number) => {
    const app = appRegistry.getClass(id);
    if (app) {
      const position =
        getSetting("windowPrefs" + app.getAppProps().appFile.id)?.position ??
        undefined;
      const height =
        getSetting("windowPrefs" + app.getAppProps().appFile.id)?.height ??
        undefined;
      const width =
        getSetting("windowPrefs" + app.getAppProps().appFile.id)?.width ??
        undefined;
      const props: AppWindowProps = {
        x: position?.x ?? undefined,
        y: position?.y ?? undefined,
        height: height,
        width: width,
      };
      return <OSAppWindow props={props} key={id + 0.1} app={app} />;
    }
  }, []);

  return (
    <div
      className="relative flex flex-col w-screen h-screen bg-cover bg-center overflow-hidden select-none"
      style={{ backgroundImage: `url('${background}')` }}
      onMouseUp={handleMouseEvent}
      onContextMenu={onContextMenu}
      onMouseMove={onMouseMove}
      onMouseDown={onDragStart}
    >
      {isSelecting &&
        selectionXStart >= 0 &&
        selectionYStart >= 0 &&
        selectionXEnd >= 0 &&
        selectionYEnd >= 0 && (
          <div
            className="absolute bg-[#ffffff30] z-40 rounded-md border border-white"
            style={{
              top: Math.min(selectionYEnd, selectionYStart),
              left: Math.min(selectionXEnd, selectionXStart),
              bottom: Math.min(
                window.innerHeight - selectionYEnd,
                window.innerHeight - selectionYStart,
              ),
              right: Math.min(
                window.innerWidth - selectionXEnd,
                window.innerWidth - selectionXStart,
              ),
            }}
          ></div>
        )}
      {columnHeight !== -1 && (
        <div
          className="gap-3 h-full px-1 grid z-10"
          style={{
            paddingBottom: taskbarHeight + 30,
            gridAutoFlow: "column",
            gridTemplateRows: `repeat(${columnHeight.toFixed()}, minmax(0, 1fr))`,
            width: 0,
          }}
        >
          {apps.map((app, i) => {
            const appSelect = activeApps.some((cApp) => cApp.id === app.id);
            return (
              <OSAppFile
                key={app.id}
                props={app}
                onMenu={() => {}}
                onClick={(event) => {
                  if (event.ctrlKey) {
                    if (!appSelect) dispatch(addActiveDesktopApp(app));
                    else dispatch(removeActiveDesktopApp(app));
                  } else if (appSelect) {
                    // Placeholder: rename logic could go here
                  } else {
                    dispatch(clearActiveDesktopApps());
                    dispatch(addActiveDesktopApp(app));
                  }
                }}
                onDoubleClick={() => {
                  for (const app of activeApps) {
                    dispatch(clearActiveDesktopApps());
                    dispatch(launchApp(app.id));
                  }
                }}
                isActive={appSelect}
                ref={(el) => {
                  if (el) itemRefs.current[i] = el;
                }}
              />
            );
          })}
        </div>
      )}
      <Taskbar />
      <AppLauncher />
      {openApps.map((app) => showApp(app.pid))}
    </div>
  );
}
