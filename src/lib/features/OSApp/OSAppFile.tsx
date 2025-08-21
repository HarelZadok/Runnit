// OSAppFile.tsx: Represents a desktop icon for an application, handles selection and launching on double-click
"use client";

import { useAppSelector } from "@/lib/hooks"; // Typed Redux hooks
import Image from "next/image";
import React, { forwardRef, useCallback, useState, useEffect } from "react";
import { Property } from "csstype";
import TextDecorationColor = Property.TextDecorationColor;
import { OSFileSystem } from "@/lib/OSApps/apps/files/OSFileSystem";

export interface OSAppFileProps {
  readonly id: number;
  name: string;
  icon: string;
}

export interface AdvancedOSAppFileProps {
  props: OSAppFileProps;
  onMenu?: () => void;
  onDoubleClick?: () => void;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  isActive?: boolean;
  textColor?: TextDecorationColor;
  width?: number;
  height?: number;
  isHidden?: boolean;
}

export const OSAppFile = forwardRef<HTMLDivElement, AdvancedOSAppFileProps>(
  (props, ref) => {
    // Retrieve icon scale from settings
    const iconScale = useAppSelector((state) => state.settings.iconScale);
    const [isTrashFilled, setIsTrashFilled] = useState(
      OSFileSystem.isTrashFilled()
    );
    const name = (() => {
      if ("extension" in props.props && props.props.extension !== ".app")
        return props.props.name + props.props.extension;
      return props.props.name;
    })();

    useEffect(() => {
      const updateTrashStatus = () =>
        setIsTrashFilled(OSFileSystem.isTrashFilled());

      OSFileSystem.addListener(updateTrashStatus);
      return () => OSFileSystem.removeListener(updateTrashStatus);
    }, []);

    // Toggle selection on click; support ctrl-click for multi-selection
    const onClick = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        if (props.onClick) props.onClick(event);
      },
      [props]
    );

    const onMenu = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        event.preventDefault();
        if (props.onMenu) props.onMenu();
      },
      [props]
    );

    // Prevent unintended drag behavior
    const onDragStart = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        event.preventDefault();
      },
      []
    );

    const isTrashIcon = () =>
      props.props.icon === "/icons/trash-full.png" ||
      props.props.icon === "/icons/trash-empty.png";

    return (
      <div
        className={`flex flex-col justify-center items-center select-none hover:bg-[#77777730] rounded-md hover:backdrop-brightness-150 text-sm ${props.isHidden && "opacity-60"}`}
        onClick={onClick}
        onDoubleClick={props.onDoubleClick}
        onMouseDown={onDragStart}
        onContextMenu={onMenu}
        ref={ref}
        data-id={props.props.id}
        title={name}
        style={{
          height: iconScale + (props.height ?? 50),
          width: iconScale + (props.width ?? 10),
          backgroundColor: props.isActive ? "#ffffff30" : undefined,
          border: props.isActive ? "1px solid" : undefined,
        }}
      >
        <Image
          width={iconScale}
          height={iconScale}
          priority
          src={
            isTrashIcon()
              ? isTrashFilled
                ? "/icons/trash-full.png"
                : "/icons/trash-empty.png"
              : props.props.icon
          }
          alt=''
        />
        <p
          className='text-center break-inside-avoid line-clamp-2'
          style={{
            color: props.textColor ?? "white",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
          }}
          dangerouslySetInnerHTML={{
            __html: name.replace(/\.([^.]+)$/, "<wbr>.$1"),
          }}
        />
      </div>
    );
  }
);

OSAppFile.displayName = "OSAppFile";
