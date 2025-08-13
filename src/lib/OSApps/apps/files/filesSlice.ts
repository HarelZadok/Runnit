import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { canAccessStorage, getSetting, setSetting } from "@/lib/functions";
import FilesItem, { Folder } from "@/lib/OSApps/apps/files/FilesItem";
import { AppDispatch } from "@/lib/store";

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
    deleteItemFile: (
      state,
      action: PayloadAction<{ serItem: string; serUpdatedFolder: string }>,
    ) => {
      const item: FilesItem = JSON.parse(action.payload.serItem);
      if (canAccessStorage())
        localStorage.setItem(item.path, action.payload.serUpdatedFolder);
      state.trashFiles.push(item);
      setSetting("trashFiles", state.trashFiles);
    },
    emptyTrash: (state) => {
      state.trashFiles = [];
      setSetting("trashFiles", state.trashFiles);
    },
  },
});

export function deleteItem(
  dispatch: AppDispatch,
  item: FilesItem,
  updatedFolder: Folder,
) {
  const serItem = JSON.stringify(item);
  const serUpdatedFolder = JSON.stringify(updatedFolder);

  dispatch(filesSlice.actions.deleteItemFile({ serItem, serUpdatedFolder }));
}

export const { emptyTrash } = filesSlice.actions;
export default filesSlice.reducer;
