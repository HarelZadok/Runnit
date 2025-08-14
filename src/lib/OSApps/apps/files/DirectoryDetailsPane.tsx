import { useCallback, useEffect, useState } from "react";
import { Folder, File } from "@/lib/OSApps/apps/files/FilesItem";
import { OSAppFile } from "@/lib/features/OSApp/OSAppFile";
import { useAppDispatch } from "@/lib/hooks";
import { launchApp } from "@/lib/features/windowManager/windowManagerSlice";
import { apps } from "@/lib/OSApps/AppList";
import CodeEditor from "@/lib/OSApps/apps/code_editor/CodeEditor";
import { OSFileSystem } from "@/lib/OSApps/apps/files/OSFileSystem";

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

  const dispatch = useAppDispatch();

  useEffect(() => {
    const f = OSFileSystem.getFolder(props.directory);
    console.log("f" + f);
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

  return (
    <div className="w-full h-full bg-white text-black flex flex-col">
      <div className="w-full h-8 bg-gray-100 text-gray-700 px-3 flex shrink-0 items-center">
        <p>{props.directory}</p>
      </div>
      <div
        className="relative flex flex-row flex-wrap w-full h-full content-start p-2 overflow-scroll"
        onContextMenu={() => setShowDialog(true)}
      >
        {folder?.items?.map((item, i) => (
          <OSAppFile
            key={i}
            textColor="black"
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
              const updatedFolder: Folder = {
                ...folder,
                items: folder.items.filter((cItem) => cItem.id !== item.id),
              };
              setFolder(updatedFolder);
              const [path] = OSFileSystem.fullPathToPathAndName(item.path);
              if (path === "/trash/") OSFileSystem.deleteItem(item);
              else OSFileSystem.moveToTrash(item);
            }}
            onDoubleClick={() => {
              if ("items" in item) {
                props.onDirectory(item.path);
              } else if ("extension" in item) {
                const id = apps.findIndex(
                  (app) => app.constructor === CodeEditor,
                );
                dispatch(
                  launchApp({
                    id,
                    args: [
                      "--file",
                      `${folder!.path}/${item.name + (item as File).extension}`,
                    ],
                  }),
                );
              }
            }}
          />
        ))}
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
