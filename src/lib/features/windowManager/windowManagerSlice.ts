import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface appInstance {
	pid: number,
	isMinimized: boolean,
	isMaximized: boolean,
	isFocused: boolean,
	zIndex: number,
}

export interface windowManagerState {
	openApps: appInstance[];
	focusZIndex: number;
}

const initialState: windowManagerState = {
	openApps: [],
	focusZIndex: 1000,
};

export const windowManagerSlice = createSlice({
	name: 'windowManager',
	initialState,
	reducers: {
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
		closeApp: (state, action: PayloadAction<number>) => {
			state.openApps = state.openApps.filter(instance => instance.pid !== action.payload);
			if (state.openApps.length === 0) {
				state.focusZIndex = 1000;
			} else if (state.openApps.length === 1) {
				state.focusZIndex = 1000;
				state.openApps[0].zIndex = state.focusZIndex++;
			}
		},
		minimizeApp: (state, action: PayloadAction<number>) => {
			const app = state.openApps.find(app => app.pid === action.payload);
			if (app) {
				app.isMinimized = true;
				app.isFocused = false;
			}
		},
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
		maximizeApp: (state, action: PayloadAction<number>) => {
			const app = state.openApps.find(app => app.pid === action.payload);
			if (app)
				app.isMaximized = true;
		},
		unmaximizeApp: (state, action: PayloadAction<number>) => {
			const app = state.openApps.find(app => app.pid === action.payload);
			if (app)
				app.isMaximized = false;
		},
		focusApp: (state, action: PayloadAction<number>) => {
			state.focusZIndex++;
			state.openApps.map(app => app.isFocused = false);
			const app = state.openApps.find(app => app.pid === action.payload);
			if (app) {
				app.isFocused = true;
				app.zIndex = state.focusZIndex;
			}
		},
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