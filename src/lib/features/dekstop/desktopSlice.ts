// desktopSlice.ts: Redux slice for managing desktop icons and active selections

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface desktopState {
  activeDesktopFiles: number[];
}

const initialState: desktopState = {
  activeDesktopFiles: [],
};

export const desktopSlice = createSlice({
  name: "desktop",
  initialState,
  reducers: {
    clearActiveDesktopApps: (state) => {
      state.activeDesktopFiles = [];
    },
    addActiveDesktopApp: (state, action: PayloadAction<number>) => {
      state.activeDesktopFiles.push(action.payload);
    },
    setActiveDesktopApps: (state, action: PayloadAction<number[]>) => {
      state.activeDesktopFiles = action.payload;
    },
    removeActiveDesktopApp: (state, action: PayloadAction<number>) => {
      state.activeDesktopFiles = state.activeDesktopFiles.filter(
        (app) => app !== action.payload
      );
    },
  },
});

export const {
  clearActiveDesktopApps,
  addActiveDesktopApp,
  removeActiveDesktopApp,
  setActiveDesktopApps,
} = desktopSlice.actions;
export default desktopSlice.reducer;
