'use client';

import React, { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/lib/store';

// StoreProvider: wraps app with Redux provider and persists store instance
export default function StoreProvider({ children }: { children: React.ReactNode }) {
	// useRef ensures single store instance per client session
	const storeRef = useRef<AppStore | null>(null);

	// Initialize store on first render
	if (!storeRef.current) {
		storeRef.current = makeStore();
	}

	// Provide Redux store to child components
	return <Provider store={storeRef.current}>{children}</Provider>;
}