// OSAppFile.tsx: Represents a desktop icon for an application, handles selection and launching on double-click
'use client';

import { useAppSelector, useAppDispatch } from '@/lib/hooks'; // Typed Redux hooks
import Image from 'next/image';
import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import {
	addActiveDesktopApp,
	clearActiveDesktopApps,
	removeActiveDesktopApp,
} from '@/lib/features/dekstop/desktopSlice';
import { launchApp } from '@/lib/features/windowManager/windowManagerSlice';

export interface OSAppFileProps {
	id: number;
	name: string;
	icon: string;
}

export interface AdvancedOSAppFileProps {
	props: OSAppFileProps;
	onMenu?: () => void;
}

export const OSAppFile = forwardRef<HTMLDivElement, AdvancedOSAppFileProps>((props, ref) => {
	// Retrieve icon scale from settings
	const iconScale = useAppSelector(state => state.settings.iconScale);
	const dispatch = useAppDispatch();
	// Track selection state based on Redux activeApps
	const activeApps = useAppSelector(state => state.desktop.activeDesktopApps);
	const [appSelect, setAppSelect] = useState(false);

	// Toggle selection on click; support ctrl-click for multi-selection
	const onClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
		event.stopPropagation();
		if (event.ctrlKey) {
			if (!appSelect) dispatch(addActiveDesktopApp(props.props));
			else dispatch(removeActiveDesktopApp(props.props));
		} else if (appSelect) {
			// Placeholder: rename logic could go here
		} else {
			dispatch(clearActiveDesktopApps());
			dispatch(addActiveDesktopApp(props.props));
		}
	}, [appSelect, dispatch, props]);

	// Launch app on double click
	const runApp = useCallback(() => {
		for (const app of activeApps) {
			dispatch(clearActiveDesktopApps());
			dispatch(launchApp(app.id));
		}
	}, [activeApps, dispatch]);

	// Prevent unintended drag behavior
	const onDragStart = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
		event.stopPropagation();
		event.preventDefault();
	}, []);

	// Update visual selection when Redux activeApps changes
	useEffect(() => {
		setAppSelect(activeApps.some(app => app.id === props.props.id));
	}, [activeApps, props.props.id]);

	return <div
		className="flex flex-col justify-center items-center break-inside-avoid select-none hover:bg-[#ffffff30] rounded-md"
		onClick={onClick}
		onDoubleClick={runApp}
		onMouseDown={onDragStart}
		onContextMenu={props.onMenu}
		ref={ref}
		data-id={props.props.id}
		title={props.props.name}
		style={{
			height: iconScale + 50,
			width: iconScale + 10,
			backgroundColor: appSelect ? '#ffffff30' : undefined,
			border: appSelect ? '1px solid' : undefined,
		}}
	>
		<Image width={iconScale} height={iconScale} src={props.props.icon} alt="" />
		<p
			className="text-center break-words line-clamp-2">{props.props.name}</p>
	</div>;
});

OSAppFile.displayName = 'OSAppFile';