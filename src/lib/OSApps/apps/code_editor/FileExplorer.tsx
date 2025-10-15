import { Folder, File } from "@/lib/OSApps/apps/files/FilesItem";
import { useState } from "react";
import { IoIosArrowForward } from "react-icons/io";
import { AnimatePresence, motion } from "framer-motion";

export default function FileExplorer({
  folder,
  setFile,
  activeFile,
}: {
  folder: Folder;
  setFile: (file: File) => void;
  activeFile: File | null;
}) {
  folder.items = folder.items.sort((item1, item2) => {
    if ("items" in item1 && !("items" in item2)) {
      return -1;
    } else if (!("items" in item1) && "items" in item2) {
      return 1;
    } else {
      const len = Math.min(item1.name.length, item2.name.length);
      for (let i = 0; i < len; i++) {
        if (item1.name.charCodeAt(i) < item2.name.charCodeAt(i)) return -1;
        else if (item1.name.charCodeAt(i) > item2.name.charCodeAt(i)) return 1;
      }
      if (item1.name.length < item2.name.length) return -1;
      else if (item1.name.length > item2.name.length) return 1;
    }
    return 0;
  });

  return (
    <div className="w-55 h-full bg-black/70 backdrop-blur-3xl shrink-0 border-r border-gray-500/60">
      <FolderView setFile={setFile} folder={folder} activeFile={activeFile} />
    </div>
  );
}

const FileView = ({
  file,
  setFile,
  activeFile,
}: {
  file: File;
  setFile: (file: File) => void;
  activeFile: File | null;
}) => {
  return (
    <p
      className={`p-3 border-b border-gray-500/60 text-sm ${activeFile?.id === file.id ? "bg-blue-600" : "hover:bg-gray-500"}`}
      onDoubleClick={() => setFile(file)}
    >
      {file.name + file.extension}
    </p>
  );
};

const FolderView = ({
  folder,
  setFile,
  activeFile,
}: {
  folder: Folder;
  setFile: (file: File) => void;
  activeFile: File | null;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`flex flex-col ${!isOpen && "border-b"} border-gray-500/60`}
    >
      <div
        onClick={() => setIsOpen((p) => !p)}
        className="flex flex-row items-center p-2 hover:bg-gray-500"
      >
        <IoIosArrowForward
          className={`${isOpen ? "rotate-45" : "rotate-0"} transition-all`}
        />
        <p className="text-sm p-1"> {folder.name}</p>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{
              ease: "linear",
              duration: 0.1,
            }}
            className="pl-3 overflow-hidden"
          >
            {folder.items.map((item) => {
              if ("extension" in item) {
                return (
                  <FileView
                    key={item.id}
                    file={item as File}
                    setFile={setFile}
                    activeFile={activeFile}
                  />
                );
              } else {
                return (
                  <FolderView
                    key={item.id}
                    folder={item as Folder}
                    setFile={setFile}
                    activeFile={activeFile}
                  />
                );
              }
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
