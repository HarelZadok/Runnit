import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { canAccessStorage, getSetting, setSetting } from "@/lib/functions";
import FilesItem, { Folder } from "@/lib/OSApps/apps/files/FilesItem";

export interface filesState {
  trashFiles: FilesItem[];
}

const initialState: filesState = {
  trashFiles: getSetting("trashFiles") ?? [],
};

export const filesSlice = createSlice({
  name: "files",
  initialState,
  reducers: {
    deleteApp: (
      state,
      action: PayloadAction<{ item: FilesItem; updatedFolder: Folder }>,
    ) => {
      if (canAccessStorage())
        localStorage.setItem(
          action.payload.item.path,
          JSON.stringify(action.payload.updatedFolder),
        );
      state.trashFiles.push(action.payload.item);
      setSetting("trashFiles", state.trashFiles);
    },
    emptyTrash: (state) => {
      state.trashFiles = [];
      setSetting("trashFiles", state.trashFiles);
    },
  },
});

export const { deleteApp, emptyTrash } = filesSlice.actions;
export default filesSlice.reducer;
