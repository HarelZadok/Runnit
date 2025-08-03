'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OSAppFileProps } from '@/lib/features/OSApp/OSAppFile';

export interface taskbarState {
	pinnedApps: OSAppFileProps[],
	openedApps: OSAppFileProps[],
}

const initialState: taskbarState = {
	pinnedApps: [],
	openedApps: [],
};

const taskbarSlice = createSlice({
	name: 'taskbar',
	initialState,
	reducers: {
		pinApp: (state, app: PayloadAction<OSAppFileProps>) => {
			state.pinnedApps.push(app.payload);
		},
		unpinApp: (state, app: PayloadAction<OSAppFileProps>) => {
			state.pinnedApps = state.pinnedApps.filter(cApp => cApp.id !== app.payload.id);
		},
		addOpenApp: (state, app: PayloadAction<OSAppFileProps>) => {
			state.openedApps.push(app.payload);
		},
		removeOpenApp: (state, app: PayloadAction<OSAppFileProps>) => {
			state.openedApps = state.openedApps.filter(cApp => cApp.id !== app.payload.id);
		},
	},
});

export const { pinApp, unpinApp, addOpenApp, removeOpenApp } = taskbarSlice.actions;
export default taskbarSlice.reducer;