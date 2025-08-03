import { configureStore } from '@reduxjs/toolkit';
import desktopReducer from '@/lib/features/dekstop/desktopSlice';
import settingsReducer from '@/lib/features/settings/settingsSlice';
import taskbarReducer from '@/lib/features/taskbar/taskbarSlice';
import windowManagerReducer from '@/lib/features/windowManager/windowManagerSlice';

export const makeStore = () => {
	return configureStore({
		reducer: {
			desktop: desktopReducer,
			settings: settingsReducer,
			taskbar: taskbarReducer,
			windowManager: windowManagerReducer,
		},
	});
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];