import { useCallback, useEffect, useState } from "react";
import { Folder, File } from "@/lib/OSApps/apps/files/FilesItem";
import { OSAppFile } from "@/lib/features/OSApp/OSAppFile";
import { useAppDispatch } from "@/lib/hooks";
import { deleteItem } from "@/lib/OSApps/apps/files/filesSlice";

interface DirectoryDetailsPaneProps {
  directory: string;
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
    const jsonData = localStorage.getItem(props.directory);
    if (jsonData) {
      setFolder(JSON.parse(jsonData) as Folder);
    } else {
      const path = props.directory;
      const name = path.substring(path.lastIndexOf(".", path.length));
      const newFolder = new Folder(name, path);
      setFolder(newFolder);
      localStorage.setItem(props.directory, JSON.stringify(newFolder));
    }
  }, [props.directory]);

  const createFile = useCallback(
    (name: string) => {
      if (name.length === 0 || !name.includes(".") || name.endsWith("."))
        return;

      setShowDialog(false);
      folder?.items?.push(
        new File(
          name.substring(0, name.lastIndexOf(".")),
          props.directory,
          name.substring(name.lastIndexOf("."), name.length),
        ),
      );
      setFolder(folder);
      localStorage.setItem(props.directory, JSON.stringify(folder));
    },
    [folder, props.directory],
  );

  return (
    <div className="w-full h-full bg-white text-black flex flex-col">
      <div className="w-full h-8 bg-gray-100 text-gray-700 px-3 flex items-center">
        <p>{props.directory}</p>
      </div>
      <div
        className="relative flex flex-col w-full h-full p-2"
        onContextMenu={() => setShowDialog(true)}
      >
        {folder?.items?.map((item, i) => (
          <OSAppFile
            key={i}
            textColor="black"
            props={{
              name: item.name + (item as File).extension,
              icon: (item as File).icon,
              id: item.id,
            }}
            onMenu={() => {
              const updatedFolder: Folder = {
                ...folder,
                items: folder.items.filter((cItem) => cItem.id !== item.id),
              };
              setFolder(updatedFolder);
              deleteItem(dispatch, item, updatedFolder);
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
