import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OSAppFileProps } from '@/lib/features/OSApp/OSAppFile';

export interface desktopState {
	apps: OSAppFileProps[];
	activeApps: OSAppFileProps[];
}

const initialState: desktopState = {
	apps: [],
	activeApps: [],
};

export const desktopSlice = createSlice({
	name: 'desktop',
	initialState,
	reducers: {
		addApp: (state, action: PayloadAction<OSAppFileProps>) => {
			state.apps.push(action.payload);
		},
		removeApp: (state, action: PayloadAction<OSAppFileProps>) => {
			state.apps = state.apps.filter(app => app.id != action.payload.id);
		},
		renameApp: (state, action: PayloadAction<[number, string]>) => {
			const i = state.apps.findIndex((app) => app.id === action.payload[0]);
			if (i !== -1) state.apps[i].name = action.payload[1];
		},
		clearActiveApps: (state) => {
			state.activeApps = [];
		},
		addActiveApp: (state, action: PayloadAction<OSAppFileProps>) => {
			state.activeApps.push(action.payload);
		},
		setActiveApps: (state, action: PayloadAction<OSAppFileProps[]>) => {
			state.activeApps = action.payload;
		},
		removeActiveApp: (state, action: PayloadAction<OSAppFileProps>) => {
			state.activeApps = state.activeApps.filter(app => app.id !== action.payload.id);
		},
	},
});

export const {
	addApp,
	removeApp,
	renameApp,
	clearActiveApps,
	addActiveApp,
	removeActiveApp,
	setActiveApps,
} = desktopSlice.actions;
export default desktopSlice.reducer;