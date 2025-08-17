// hooks.ts: Typed React-Redux hooks for dispatch and selector to enforce AppDispatch and RootState types
import { useDispatch, useSelector, useStore } from "react-redux";
import type { AppDispatch, AppStore, RootState } from "@/lib/store";
import FilesItem, { AppShortcut, File } from "./OSApps/apps/files/FilesItem";
import { launchApp } from "./features/windowManager/windowManagerSlice";
import { getIdFromAppClass } from "./OSApps/AppList";
import CodeEditor from "./OSApps/apps/code_editor/CodeEditor";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();

export const useOpenFile = () => {
  const dispatch = useDispatch();
  return (item: FilesItem) => {
    const file = item as File;
    if (file.extension === ".app") {
      dispatch(launchApp({ id: (file as AppShortcut).appProps.id }));
    } else {
      const id = getIdFromAppClass(CodeEditor);
      dispatch(
        launchApp({
          id,
          args: ["--file", file!.path],
        })
      );
    }
  };
};
