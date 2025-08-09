// taskbarSlice.ts: Manages pinned and opened apps in the taskbar for quick launch and status tracking

'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OSAppFileProps } from '@/lib/features/OSApp/OSAppFile';
import { getSetting, setSetting } from '@/lib/functions';

export interface taskbarState {
	pinnedTaskbarApps: OSAppFileProps[];
	openedTaskbarApps: OSAppFileProps[];
	hideRate: number;
	forceShow: boolean;
}

const initialState: taskbarState = {
	pinnedTaskbarApps: getSetting('pinnedTaskbarApps') ?? [],
	openedTaskbarApps: [],
	hideRate: 0,
	forceShow: false,
};

const taskbarSlice = createSlice({
	name: 'taskbar',
	initialState,
	reducers: {
		pinTaskbarApp: (state, app: PayloadAction<OSAppFileProps>) => {
			state.pinnedTaskbarApps.push(app.payload);
			setSetting('pinnedTaskbarApps', state.pinnedTaskbarApps);
		},
		unpinTaskbarApp: (state, app: PayloadAction<OSAppFileProps>) => {
			state.pinnedTaskbarApps = state.pinnedTaskbarApps.filter(cApp => cApp.id !== app.payload.id);
			setSetting('pinnedTaskbarApps', state.pinnedTaskbarApps);
		},
		addOpenTaskbarApp: (state, app: PayloadAction<OSAppFileProps>) => {
			state.openedTaskbarApps.push(app.payload);
		},
		removeOpenTaskbarApp: (state, app: PayloadAction<OSAppFileProps>) => {
			state.openedTaskbarApps = state.openedTaskbarApps.filter(cApp => cApp.id !== app.payload.id);
		},
		incrementHideRate: (state) => {
			state.hideRate++;
		},
		decrementHideRate: (state) => {
			state.hideRate = Math.max(0, state.hideRate - 1);
		},
		showTaskbar: (state) => {
			state.forceShow = true;
		},
		cancelShowTaskbar: (state) => {
			state.forceShow = false;
		},
	},
});

export const {
	pinTaskbarApp,
	unpinTaskbarApp,
	addOpenTaskbarApp,
	removeOpenTaskbarApp,
	incrementHideRate,
	decrementHideRate,
	showTaskbar,
	cancelShowTaskbar,
} = taskbarSlice.actions;
export default taskbarSlice.reducer;