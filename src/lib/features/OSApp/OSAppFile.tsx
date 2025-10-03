// OSAppFile.tsx: Represents a desktop icon for an application, handles selection and launching on double-click
"use client";

import { useAppSelector } from "@/lib/hooks"; // Typed Redux hooks
import Image from "next/image";
import React, {
  forwardRef,
  useCallback,
  useState,
  useEffect,
  JSX,
} from "react";
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
  menu?: () => JSX.Element;
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
      OSFileSystem.isTrashFilled(),
    );
    const name = (() => {
      if ("extension" in props.props && props.props.extension !== ".app")
        return props.props.name + props.props.extension;
      return props.props.name;
    })();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      [props],
    );

    const onMenu = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        event.preventDefault();
        if (props.onMenu) props.onMenu();
        setIsMenuOpen((p) => !p);
      },
      [props],
    );

    // Prevent unintended drag behavior
    const onDragStart = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        event.preventDefault();
      },
      [],
    );

    const isTrashIcon = () =>
      props.props.icon === "/icons/trash-full.png" ||
      props.props.icon === "/icons/trash-empty.png";

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const menuElement = event.target as Element;
        if (isMenuOpen && !menuElement.closest('[data-menu="true"]')) {
          setIsMenuOpen(false);
        }
      };

      if (isMenuOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isMenuOpen]);

    const [shouldRenderMenu, setShouldRenderMenu] = useState(false);
    const [menuHeight, setMenuHeight] = useState(0);
    const menuContentRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (isMenuOpen) {
        setShouldRenderMenu(true);
        // Measure content height after render
        setTimeout(() => {
          if (menuContentRef.current) {
            setMenuHeight(menuContentRef.current.scrollHeight);
          }
        }, 0);
      } else {
        setMenuHeight(0);
        const timer = setTimeout(() => setShouldRenderMenu(false), 200);
        return () => clearTimeout(timer);
      }
    }, [isMenuOpen]);

    return (
      <div style={{ zIndex: shouldRenderMenu ? 10 : 0 }}>
        {props.menu && shouldRenderMenu && (
          <div
            className={`absolute border-1 ${menuHeight > 0 ? "bg-gray-100 border-gray-300" : "bg-transparent border-transparent"} rounded-md justify-self-center transition-all overflow-hidden duration-200`}
            data-menu="true"
            style={{
              paddingTop: iconScale + (props.height ?? 50),
              height: menuHeight + iconScale + (props.height ?? 50),
              width: iconScale + (props.width ?? 10),
            }}
          >
            <div ref={menuContentRef}>{shouldRenderMenu && props.menu()}</div>
          </div>
        )}
        <div
          className={`flex relative flex-col justify-center items-center select-none hover:bg-[#77777730] rounded-md hover:backdrop-brightness-150 text-sm ${props.isHidden && "opacity-60"}`}
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
            alt=""
          />
          <p
            className="text-center break-inside-avoid line-clamp-2"
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
      </div>
    );
  },
);

OSAppFile.displayName = "OSAppFile";
