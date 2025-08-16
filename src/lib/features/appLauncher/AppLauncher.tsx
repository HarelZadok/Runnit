import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  focusApp,
  launchApp,
  toggleAppLauncher,
  unfocusApp,
} from "@/lib/features/windowManager/windowManagerSlice";
import appRegistry from "@/lib/OSApps/AppRegistry";
import { OSAppFile, OSAppFileProps } from "@/lib/features/OSApp/OSAppFile";
import {
  addDesktopApp,
  removeDesktopApp,
} from "@/lib/features/dekstop/desktopSlice";

export default function AppLauncher() {
  const taskbarHeight = useAppSelector((state) => state.settings.taskbarHeight);
  const isPresent = useAppSelector(
    (state) => state.windowManager.isAppLauncherPresent
  );
  const lastUnfocusedApp = useAppSelector(
    (state) => state.windowManager.lastUnfocusedApp
  );
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [query, setQuery] = useState("");
  const [queryApps, setQueryApps] = useState<OSAppFileProps[]>([]);
  const desktopApps = useAppSelector((state) => state.desktop.desktopApps);
  const [activeIndex] = useState(0);

  useEffect(() => {
    let registeredApps = appRegistry.apps.flatMap((app) => app.app.appFile);
    if (query.length !== 0) {
      registeredApps = registeredApps.filter(
        (app) =>
          app.name.toLowerCase().includes(query.toLowerCase()) ||
          query.toLowerCase().includes(app.name.toLowerCase())
      );
    }
    setQueryApps(registeredApps);
  }, [query]);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isPresent) {
      setHeight(window.innerHeight - taskbarHeight);
      setWidth(window.innerWidth);
      setQuery("");
    } else {
      setHeight(0);
      setWidth(0);
    }
  }, [isPresent, taskbarHeight]);

  useEffect(() => {
    if (isPresent && lastUnfocusedApp < 0) {
      dispatch(unfocusApp());
    } else if (!isPresent && lastUnfocusedApp >= 0) {
      dispatch(focusApp(lastUnfocusedApp));
    }
  }, [lastUnfocusedApp, dispatch, isPresent]);

  return (
    <div
      className='absolute justify-center items-center flex w-full h-full z-19999'
      style={{
        pointerEvents: isPresent ? "auto" : "none",
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        dispatch(toggleAppLauncher());
      }}
    >
      <div
        className={`flex flex-col justify-start items-center bg-white/80 backdrop-blur-3xl rounded-3xl transition-all duration-300`}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        style={{
          width: `calc(0.8 * ${width}px)`,
          height: `calc(0.8 * ${height}px)`,
          marginBottom: taskbarHeight,
          opacity: isPresent ? "100%" : "0%",
        }}
      >
        <div className='w-4/5 h-16 flex-1 bg-gray-400/30 rounded-2xl justify-self-center mt-10 px-6'>
          <input
            className='
						text-black
						placeholder-gray-500
						outline-0
						w-full
						h-full
					'
            type='text'
            value={query}
            placeholder='Search apps...'
            onChange={(e) => setQuery(e.currentTarget.value)}
          />
        </div>
        <div className='flex flex-row flex-11 w-full justify-center items-start mt-10 gap-2 flex-wrap overflow-y-scroll no-scrollbar'>
          {queryApps.map((app, i) => (
            <OSAppFile
              key={app.id}
              isActive={i === activeIndex}
              width={50}
              textColor='black'
              props={app}
              onMenu={() => {
                if (!desktopApps.some((cApp) => cApp.id === app.id))
                  dispatch(addDesktopApp(app));
                else dispatch(removeDesktopApp(app));
              }}
              onClick={() => {
                dispatch(toggleAppLauncher());
                dispatch(launchApp({ id: app.id }));
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
