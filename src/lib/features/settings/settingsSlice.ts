// settingsSlice.ts: Manages user preferences such as wallpaper, taskbar height, and icon scale

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getSetting, setSetting } from '@/lib/functions';

export interface settingsState {
	background: string,
	taskbarHeight: number,
	iconScale: number,
}

const initialState: settingsState = {
	background: getSetting('background') ?? `/wallpaper.jpg`,
	taskbarHeight: getSetting('taskbarHeight') ?? 90,
	iconScale: getSetting('iconScale') ?? 64,
};

export const settingsSlice = createSlice({
	name: 'settings',
	initialState,
	reducers: {
		setTaskbarHeight: (state, height: PayloadAction<number>) => {
			state.taskbarHeight = height.payload;
			setSetting('taskbarHeight', state.taskbarHeight);
		},
		changeDesktopBackground: (state, src: PayloadAction<string>) => {
			state.background = src.payload;
			setSetting('background', state.background);
		},
		setDesktopIconScale: (state, scale: PayloadAction<number>) => {
			state.iconScale = scale.payload;
			setSetting('iconScale', state.iconScale);
		},
	},
});

export const { setTaskbarHeight, changeDesktopBackground, setDesktopIconScale } = settingsSlice.actions;
export default settingsSlice.reducer;