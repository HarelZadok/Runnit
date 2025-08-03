import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface settingsState {
	background: string,
	taskbarHeight: number,
	iconScale: number,
}

const initialState: settingsState = {
	background: `/wallpaper.jpg`,
	taskbarHeight: 90,
	iconScale: 64,
};

export const settingsSlice = createSlice({
	name: 'settings',
	initialState,
	reducers: {
		setTaskbarHeight: (state, height: PayloadAction<number>) => {
			state.taskbarHeight = height.payload;
		},
		changeBackground: (state, src: PayloadAction<string>) => {
			state.background = src.payload;
		},
		setIconScale: (state, scale: PayloadAction<number>) => {
			state.iconScale = scale.payload;
		},
	},
});

export const { setTaskbarHeight, changeBackground, setIconScale } = settingsSlice.actions;
export default settingsSlice.reducer;