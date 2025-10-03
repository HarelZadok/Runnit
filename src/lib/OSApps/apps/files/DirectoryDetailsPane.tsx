import { useCallback, useEffect, useReducer, useState } from "react";
import FilesItem, { Folder, File } from "@/lib/OSApps/apps/files/FilesItem";
import { OSAppFile } from "@/lib/features/OSApp/OSAppFile";
import { useOpenFile } from "@/lib/hooks";
import { OSFileSystem } from "@/lib/OSApps/apps/files/OSFileSystem";
import { getSetting } from "@/lib/functions";

interface DirectoryDetailsPaneProps {
  directory: string;
  onDirectory: (directory: string) => void;
}

const CreateFileDialog = ({
  createFile,
  cancel,
}: {
  createFile: (name: string) => void;
  cancel: () => void;
}) => {
  const [name, setName] = useState("");

  return (
    <div className="flex flex-col absolute h-max w-60 left-1/2 top-1/2 -translate-1/2 bg-gray-300 p-3 rounded-xl">
      <p className="self-center font-bold mb-6">Create new file</p>
      <input
        onChange={(e) => setName(e.currentTarget.value)}
        className="bg-gray-200 rounded-md p-1 px-2 mb-5 outline-0"
        type="text"
        placeholder="File name"
      />
      <div className="flex flex-row gap-2">
        <div
          className="self-end w-full text-center p-2 bg-red-400 text-white rounded-lg"
          onClick={() => cancel()}
        >
          <p>Cancel</p>
        </div>
        <div
          className="self-end w-full text-center p-2 bg-green-400 text-white rounded-lg"
          onClick={() => createFile(name)}
        >
          <p>Create</p>
        </div>
      </div>
    </div>
  );
};

export default function DirectoryDetailsPane(props: DirectoryDetailsPaneProps) {
  const [folder, setFolder] = useState<Folder>();
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const forceUpdate = () => {
      const f = OSFileSystem.getFolder(props.directory);
      if (f) {
        setFolder(f);
      }
    };

    OSFileSystem.addListener(forceUpdate);

    return () => OSFileSystem.removeListener(forceUpdate);
  }, [props.directory]);

  useEffect(() => {
    const f = OSFileSystem.getFolder(props.directory);
    if (f) {
      setFolder(f);
    } else {
      const newFolder = OSFileSystem.createFolder(props.directory);
      if (newFolder) setFolder(newFolder);
    }
  }, [props.directory]);

  const createFile = useCallback(
    (name: string) => {
      if (name.length === 0 || !name.includes(".") || name.endsWith("."))
        return;

      if (folder?.items?.some((item) => item.name === name)) return;

      if (
        name.includes("/") ||
        name.includes("\\") ||
        name.includes(":") ||
        name.includes("*") ||
        name.includes("?") ||
        name.includes('"') ||
        name.includes("<") ||
        name.includes(">") ||
        name.includes("|")
      ) {
        return;
      }

      setShowDialog(false);

      let path = props.directory;
      if (!path.endsWith("/")) path += "/";
      path += name;

      const file = OSFileSystem.createFile(
        new File(
          name.substring(0, name.lastIndexOf(".")),
          path,
          name.substring(name.lastIndexOf("."), name.length),
        ),
      );
      if (file) {
        folder?.items.push(file);
        setFolder(folder);
      }
    },
    [folder, props.directory],
  );

  const deleteFile = useCallback(
    (item: FilesItem) => {
      const updatedFolder: Folder = {
        ...folder!,
        items: folder!.items.filter((cItem) => cItem.id !== item.id),
      };
      setFolder(updatedFolder);
      const [path] = OSFileSystem.fileFullPathToPathAndName(item.path);
      if (path === "/trash/") OSFileSystem.deleteItem(item);
      else OSFileSystem.moveToTrash(item);
    },
    [folder],
  );

  const openFile = useOpenFile();

  const openItem = useCallback(
    (item: FilesItem) => {
      if ("items" in item) {
        props.onDirectory(item.path);
      } else {
        openFile(item);
      }
    },
    [openFile, props],
  );

  const restoreItem = useCallback(
    (item: FilesItem) => {
      if (OSFileSystem.restoreFromTrash(item)) {
        const updatedFolder: Folder = {
          ...folder!,
          items: folder!.items.filter((cItem) => cItem.id !== item.id),
        };
        setFolder(updatedFolder);
      }
    },
    [folder],
  );

  const hiddenItems = folder?.items?.filter((item) =>
    item.name.startsWith("."),
  );
  const visibleItems = folder?.items?.filter(
    (item) => !item.name.startsWith("."),
  );
  const sortedItems = hiddenItems?.concat(visibleItems!);

  const [renamingFile, setRenamingFile] = useState(false);
  const [fileName, setFileName] = useState("");

  return (
    <div className="w-full h-full bg-white text-black flex flex-col">
      <div className="w-full h-8 bg-gray-100 text-gray-700 px-3 flex shrink-0 items-center">
        <p>{props.directory}</p>
      </div>
      <div
        className="relative flex flex-row flex-wrap w-full h-full content-start p-2 overflow-y-scroll"
        onContextMenu={() => setShowDialog(true)}
      >
        {sortedItems?.map((item, i) => {
          if (
            (item.name.startsWith(".") || item.name.length === 0) &&
            !getSetting("showHiddenFiles")
          ) {
            return;
          }
          return (
            <OSAppFile
              key={i}
              textColor="black"
              isHidden={item.name.startsWith(".") || item.name.length === 0}
              props={{
                name:
                  item.name +
                  ("extension" in item ? (item as File).extension : ""),
                icon: (item as File).icon,
                id: item.id,
              }}
              width={40}
              height={40}
              onMenu={() => {
                setRenamingFile(false);
                setFileName(item.name);
              }}
              menu={() => {
                const [path] = OSFileSystem.fileFullPathToPathAndName(
                  item.path,
                );

                return (
                  <div className="border-gray-500 rounded-md text-gray-500 flex flex-col">
                    {path === "/trash/" ? (
                      <button
                        className="hover:bg-gray-400 hover:text-gray-100 px-2 py-1 cursor-pointer"
                        onClick={() => restoreItem(item)}
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        className="hover:bg-gray-400 hover:text-gray-100 px-2 py-1 cursor-pointer"
                        onClick={() => openItem(item)}
                      >
                        Open
                      </button>
                    )}
                    {!renamingFile ? (
                      <button
                        className="hover:bg-gray-400 hover:text-gray-100 px-2 py-1 cursor-pointer"
                        onClick={() => setRenamingFile(true)}
                      >
                        Rename
                      </button>
                    ) : (
                      <div className="flex flex-row w-full justify-evenly">
                        <input
                          className="hover:bg-gray-400 hover:text-gray-100 px-2 py-1 cursor-pointer w-20"
                          value={fileName}
                          onChange={(e) => setFileName(e.target.value)}
                          autoFocus
                          onFocus={(e) => e.target.select()}
                          type="text"
                        />
                        <button
                          onClick={() => {
                            OSFileSystem.renameItem(item, fileName);
                            setRenamingFile(false);
                          }}
                          className="rounded-full bg-white border-1 border-black w-4 h-4 self-center"
                        >
                          V
                        </button>
                      </div>
                    )}
                    <button
                      className="hover:bg-gray-400 hover:text-gray-100 px-2 py-1 cursor-pointer"
                      onClick={() => deleteFile(item)}
                    >
                      Delete
                    </button>
                  </div>
                );
              }}
              onDoubleClick={() => openItem(item)}
            />
          );
        })}
        {showDialog && (
          <CreateFileDialog
            createFile={createFile}
            cancel={() => setShowDialog(false)}
          />
        )}
      </div>
    </div>
  );
}
