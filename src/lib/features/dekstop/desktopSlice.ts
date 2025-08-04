// desktopSlice.ts: Redux slice for managing desktop icons and active selections

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OSAppFileProps } from '@/lib/features/OSApp/OSAppFile';

export interface desktopState {
	desktopApps: OSAppFileProps[];
	activeDesktopApps: OSAppFileProps[];
}

const initialState: desktopState = {
	desktopApps: [],
	activeDesktopApps: [],
};

export const desktopSlice = createSlice({
	name: 'desktop',
	initialState,
	reducers: {
		addDesktopApp: (state, action: PayloadAction<OSAppFileProps>) => {
			state.desktopApps.push(action.payload);
		},
		removeDesktopApp: (state, action: PayloadAction<OSAppFileProps>) => {
			state.desktopApps = state.desktopApps.filter(app => app.id != action.payload.id);
		},
		renameDesktopApp: (state, action: PayloadAction<[number, string]>) => {
			const i = state.desktopApps.findIndex((app) => app.id === action.payload[0]);
			if (i !== -1) state.desktopApps[i].name = action.payload[1];
		},
		clearActiveDesktopApps: (state) => {
			state.activeDesktopApps = [];
		},
		addActiveDesktopApp: (state, action: PayloadAction<OSAppFileProps>) => {
			state.activeDesktopApps.push(action.payload);
		},
		setActiveDesktopApps: (state, action: PayloadAction<OSAppFileProps[]>) => {
			state.activeDesktopApps = action.payload;
		},
		removeActiveDesktopApp: (state, action: PayloadAction<OSAppFileProps>) => {
			state.activeDesktopApps = state.activeDesktopApps.filter(app => app.id !== action.payload.id);
		},
	},
});

export const {
	addDesktopApp,
	removeDesktopApp,
	renameDesktopApp,
	clearActiveDesktopApps,
	addActiveDesktopApp,
	removeActiveDesktopApp,
	setActiveDesktopApps,
} = desktopSlice.actions;
export default desktopSlice.reducer;