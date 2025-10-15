import { File } from "@/lib/OSApps/apps/files/FilesItem";
import { IoCloseOutline } from "react-icons/io5";

export default function TabBar({
  activeFile,
  setActiveFile,
  openTabs,
  setOpenTabs,
}: {
  activeFile: File | null;
  setActiveFile: (file: File | null) => void;
  openTabs: File[];
  setOpenTabs: (tabs: File[]) => void;
}) {
  const closeTab = (tab: File) => {
    const i = openTabs.findIndex((t) => t.id === tab.id);
    if (openTabs[i] === activeFile) {
      if (Math.abs(i - 1) < openTabs.length) {
        setActiveFile(openTabs[Math.abs(i - 1)]);
      } else {
        setActiveFile(null);
      }
    }
    setOpenTabs(openTabs.filter((_, j) => j !== i));
  };

  return (
    <div className="h-10 w-full bg-black/90 backdrop-blur-3xl shrink-0 flex flex-row">
      {openTabs.map((tab) => {
        return (
          <div
            className={`h-full p-2 pr-1 flex flex-row justify-center items-center hover:bg-gray-500 ${activeFile?.id === tab.id && "border-b-2 border-blue-500"}`}
            key={tab.id}
            onClick={() => setActiveFile(tab)}
            onMouseDown={(e) => e.button === 1 && closeTab(tab)}
          >
            {tab.name + tab.extension}
            <IoCloseOutline
              className="ml-1 bg-transparent hover:bg-red-500 rounded-full"
              size={15}
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
