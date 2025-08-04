// windowManagerSlice.ts: Manages state of open application windows (minimize, maximize, focus, and z-index)
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface appInstance {
	pid: number,
	isMinimized: boolean,
	isMaximized: boolean,
	isFocused: boolean,
	zIndex: number,
}

export interface windowManagerState {
	openApps: appInstance[];  // Active window instances
	focusZIndex: number;      // Current highest z-index for focus stacking
}

const initialState: windowManagerState = {
	openApps: [],
	focusZIndex: 1000,
};

export const windowManagerSlice = createSlice({
	name: 'windowManager',
	initialState,
	reducers: {
		// Launch or focus an app window; increments z-index and handles restore
		launchApp: (state, action: PayloadAction<number>) => {
			state.focusZIndex++;
			const app = state.openApps.find(app => app.pid === action.payload);
			state.openApps.map(app => app.isFocused = false);
			if (app) {
				app.isMinimized = false;
				app.isFocused = true;
				app.zIndex = state.focusZIndex;
			} else state.openApps.push({
				pid: action.payload,
				isMinimized: false,
				isMaximized: false,
				isFocused: true,
				zIndex: state.focusZIndex,
			});
		},
		// Close window and adjust z-index for remaining windows
		closeApp: (state, action: PayloadAction<number>) => {
			state.openApps = state.openApps.filter(instance => instance.pid !== action.payload);
			if (state.openApps.length === 0) {
				state.focusZIndex = 1000;
			} else if (state.openApps.length === 1) {
				state.focusZIndex = 1000;
				state.openApps[0].zIndex = state.focusZIndex++;
			}
		},
		// Minimize the specified app window
		minimizeApp: (state, action: PayloadAction<number>) => {
			const app = state.openApps.find(app => app.pid === action.payload);
			if (app) {
				app.isMinimized = true;
				app.isFocused = false;
			}
		},
		// Restore a minimized window and bring to focus
		unminimizeApp: (state, action: PayloadAction<number>) => {
			state.focusZIndex++;
			const app = state.openApps.find(app => app.pid === action.payload);
			state.openApps.map(app => app.isFocused = false);
			if (app) {
				app.isMinimized = false;
				app.isFocused = true;
				app.zIndex = state.focusZIndex;
			}
		},
		// Maximize the specified window
		maximizeApp: (state, action: PayloadAction<number>) => {
			const app = state.openApps.find(app => app.pid === action.payload);
			if (app)
				app.isMaximized = true;
		},
		// Restore window from maximized state
		unmaximizeApp: (state, action: PayloadAction<number>) => {
			const app = state.openApps.find(app => app.pid === action.payload);
			if (app)
				app.isMaximized = false;
		},
		// Bring an existing window to front (update focus and z-index)
		focusApp: (state, action: PayloadAction<number>) => {
			state.focusZIndex++;
			state.openApps.map(app => app.isFocused = false);
			const app = state.openApps.find(app => app.pid === action.payload);
			if (app) {
				app.isFocused = true;
				app.zIndex = state.focusZIndex;
			}
		},
		// Remove focus from the specified window without altering z-index
		unfocusApp: (state, action: PayloadAction<number>) => {
			const app = state.openApps.find(app => app.pid === action.payload);
			if (app)
				app.isFocused = false;
		},
	},
});

export const {
	launchApp,
	closeApp,
	minimizeApp,
	unminimizeApp,
	maximizeApp,
	unmaximizeApp,
	focusApp,
	unfocusApp,
} = windowManagerSlice.actions;
export default windowManagerSlice.reducer;