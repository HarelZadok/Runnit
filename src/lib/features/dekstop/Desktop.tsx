"use client";

import { useAppDispatch, useAppSelector, useOpenFile } from "@/lib/hooks";
import { OSAppFile } from "@/lib/features/OSApp/OSAppFile";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Taskbar from "@/lib/features/taskbar/Taskbar";
import {
  addActiveDesktopApp as addActiveDesktopFile,
  clearActiveDesktopApps,
  removeActiveDesktopApp as removeActiveDesktopFile,
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
import {
  closeApp,
  launchApp,
} from "@/lib/features/windowManager/windowManagerSlice";
import { changeDesktopBackground } from "@/lib/features/settings/settingsSlice";
import { canAccessStorage, getSetting } from "@/lib/functions";
import { OSFileSystem } from "@/lib/OSApps/apps/files/OSFileSystem";
import packageInfo from "@/../package.json";
import UpdateNotifier from "@/lib/features/updateNotifier/UpdateNotifier";
import FilesItem from "@/lib/OSApps/apps/files/FilesItem";
import { getIdFromAppClass } from "@/lib/OSApps/AppList";
import Files from "@/lib/OSApps/apps/files/Files";

export default function Desktop() {
  const [files, setFiles] = useState<FilesItem[]>(
    OSFileSystem.getFolder("/home/desktop")?.items ?? [],
  );
  const openApps = useAppSelector((state) => state.windowManager.openApps);
  const activeFiles = useAppSelector(
    (state) => state.desktop.activeDesktopFiles,
  );
  const background = useAppSelector((state) => state.settings.background);
  const taskbarHeight = useAppSelector((state) => state.settings.taskbarHeight);
  const iconScale = useAppSelector((state) => state.settings.iconScale);
  const taskbarHideRate = useAppSelector((state) => state.taskbar.hideRate);
  const shouldIndicateFullscreen = useAppSelector(
    (state) => state.windowManager.shouldIndicateFullscreen,
  );
  const [showingTaskbar, setShowingTaskbar] = useState(false);
  const [columnHeight, setColumnHeight] = useState<number>(-1);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [selectionXStart, setSelectionXStart] = useState(-1);
  const [selectionYStart, setSelectionYStart] = useState(-1);
  const [selectionXEnd, setSelectionXEnd] = useState(-1);
  const [selectionYEnd, setSelectionYEnd] = useState(-1);
  const [fullscreen, setFullscreen] = useState(false);
  const itemRefs = useRef<HTMLDivElement[]>([]);
  const dispatch = useAppDispatch();

  const cursorY = useRef(0);

  const updateRef = useRef(false);
  useLayoutEffect(() => {
    if (canAccessStorage() && getSetting("version") !== packageInfo.version) {
      updateRef.current = true;
    }
  }, []);

  useEffect(() => {
    const onFilesUpdate = () => {
      const items = OSFileSystem.getFolder("/home/desktop")?.items ?? [];
      setFiles(items);
    };

    OSFileSystem.addListener(onFilesUpdate);

    return () => OSFileSystem.removeListener(onFilesUpdate);
  }, []);

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
    return files.filter((app) => overlappingIds.includes(app.id));
  }, [files, selectionXEnd, selectionXStart, selectionYEnd, selectionYStart]);

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
      dispatch(
        setActiveDesktopApps(
          getAppsInSelectionBox().flatMap((item) => item.id),
        ),
      );
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
  }, [iconScale, taskbarHeight, fullscreen]);

  const showApp = useCallback((id: number, args?: string[]) => {
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
      app.args = args ?? [];
      return <OSAppWindow props={props} key={id + 0.1} app={app} />;
    }
  }, []);

  useEffect(() => {
    OSFileSystem.init();
  }, []);

  useEffect(() => {
    document.body.onkeydown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTargetEditable =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if (isTargetEditable) {
        return;
      }

      if (e.key === "F12") e.preventDefault();
      if (e.key === "F5") {
        e.preventDefault();
        window.location.reload();
      } else if (e.key === "F11") {
        e.preventDefault();
        document.body.requestFullscreen();
      } else if (e.ctrlKey) {
        e.preventDefault();
        if (e.key === "Tab") {
          const focusedIndex = openApps.findIndex((app) => app.isFocused);
          if (focusedIndex >= 0) {
            if (e.shiftKey) {
              if (focusedIndex - 1 < 0) {
                dispatch(launchApp({ id: openApps[openApps.length - 1].pid }));
              } else {
                dispatch(launchApp({ id: openApps[focusedIndex - 1].pid }));
              }
            } else if (focusedIndex + 1 >= openApps.length) {
              dispatch(launchApp({ id: openApps[0].pid }));
            } else {
              dispatch(launchApp({ id: openApps[focusedIndex + 1].pid }));
            }
          }
        }
        if (e.key === "w") {
          const focusedIndex = openApps.findIndex((app) => app.isFocused);
          if (focusedIndex >= 0) {
            dispatch(closeApp(openApps[focusedIndex].pid));
          }
        }
      }

      e.preventDefault();
    };
    document.onfullscreenchange = () => {
      setFullscreen(document.fullscreenElement !== null);
    };

    return () => {
      document.body.onkeydown = null;
      document.onfullscreenchange = null;
    };
  }, [dispatch, openApps]);

  const openFile = useOpenFile();

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
          {files.map((file, i) => {
            const fileSelect = activeFiles.some((cApp) => cApp === file.id);

            return (
              <OSAppFile
                key={file.id}
                props={file}
                onMenu={() => {}}
                onClick={(event) => {
                  if (event.ctrlKey) {
                    if (!fileSelect) dispatch(addActiveDesktopFile(file.id));
                    else dispatch(removeActiveDesktopFile(file.id));
                  } else if (fileSelect) {
                    // Placeholder: rename logic could go here
                  } else {
                    dispatch(clearActiveDesktopApps());
                    dispatch(addActiveDesktopFile(file.id));
                  }
                }}
                onDoubleClick={() => {
                  dispatch(clearActiveDesktopApps());
                  for (const fileId of activeFiles) {
                    const cFile = files.find((cApp) => cApp.id === fileId)!;
                    if ("items" in cFile) {
                      const id = getIdFromAppClass(Files);
                      dispatch(
                        launchApp({
                          id: id,
                          args: ["--folder", cFile.path],
                        }),
                      );
                    } else {
                      openFile(cFile);
                    }
                  }
                }}
                isActive={fileSelect}
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
      {openApps.map((app) => showApp(app.pid, app.args))}
      <div
        className={`absolute bg-white/30 backdrop-blur-2xl border-white border-2 z-999 transition-all duration-500 pointer-events-none ${cursorY.current >= 11 ? "rounded-2xl inset-5" : "rounded-md inset-1"}`}
        style={{ opacity: shouldIndicateFullscreen ? "100%" : "0%" }}
      />
      {updateRef.current && <UpdateNotifier />}
    </div>
  );
}
