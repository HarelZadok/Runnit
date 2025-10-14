import FilesItem, { File, Folder } from "@/lib/OSApps/apps/files/FilesItem";
import { canAccessStorage, getSetting, setSetting } from "@/lib/functions";

export class OSFileSystem {
  public static isInit = false;
  private static listeners: Set<() => void> = new Set();

  public static init() {
    if (!OSFileSystem.getFolder("/")) {
      OSFileSystem.updateFolder(new Folder("Root", "/"));
      OSFileSystem.createFolderFrom(
        new Folder("Trash", "/trash", "/icons/trash-empty.png"),
      );
      OSFileSystem.createFolderFrom(
        new Folder("Home", "/home", "/icons/home.png"),
      );
      OSFileSystem.createFolderFrom(
        new Folder("Desktop", "/home/desktop", "/icons/desktop.png"),
      );
      OSFileSystem.createFolderFrom(
        new Folder("Documents", "/home/documents", "/icons/documents.png"),
      );
      OSFileSystem.createFolderFrom(
        new Folder("Downloads", "/home/downloads", "/icons/downloads.png"),
      );
      OSFileSystem.createFolderFrom(
        new Folder("Gallery", "/home/gallery", "/icons/gallery.png"),
      );
      OSFileSystem.createFolderFrom(new Folder(".dev", "/.dev"));
      OSFileSystem.createFolderFrom(new Folder(".apps", "/.apps"));
      createTemplateFile();
    }
    this.isInit = true;
  }

  public static addListener(callback: () => void): void {
    this.listeners.add(callback);
  }

  public static removeListener(callback: () => void): void {
    this.listeners.delete(callback);
  }

  public static getFolder(fullPath: string): Folder | null {
    if (!canAccessStorage()) return null;
    if (!fullPath.endsWith("/")) fullPath += "/";
    const jsonData = localStorage.getItem(fullPath);
    if (jsonData) {
      return JSON.parse(jsonData) as Folder;
    }
    return null;
  }

  public static createFolder(directory: string): Folder | null {
    const [path, name] = OSFileSystem.fileFullPathToPathAndName(directory);
    const newFolder = new Folder(name, path + name);
    return OSFileSystem.createFolderFrom(newFolder);
  }

  public static createFolderFrom(folder: Folder): Folder | null {
    const parent = this.getParent(folder);
    if (parent) {
      OSFileSystem.updateFolder(folder);
      return folder;
    }
    return null;
  }

  public static deleteFolder(folder: Folder): boolean {
    if (!canAccessStorage()) return false;
    let path = folder.path;
    if (!path.endsWith("/")) path += "/";

    const parent = OSFileSystem.getFolder(path);
    if (parent) {
      const newItems = folder.items.filter((item) => item.id !== folder.id);
      if (parent.items.length !== newItems.length) {
        parent.items = newItems;
        localStorage.removeItem(path);
        OSFileSystem.updateFolder(parent);
        return true;
      }
    }
    return false;
  }

  public static updateFolder(folder: Folder): void {
    if (!canAccessStorage()) return;
    let path = folder.path;
    if (!path.endsWith("/")) path += "/";
    localStorage.setItem(path, JSON.stringify(folder));
    this.updateFileSystem();
    const parent = this.getParent(folder);
    if (parent) {
      const i = parent.items.findIndex((item) => item.id === folder.id);
      if (i === -1) parent.items.push(folder);
      else parent.items[i] = folder;
      this.updateFolder(parent);
    }
  }

  public static getFile(fullPath: string): File | null {
    const [path, name] = OSFileSystem.fileFullPathToPathAndName(fullPath);
    const folder = OSFileSystem.getFolder(path);
    if (folder) {
      const index = folder.items.findIndex((item) => {
        if ("extension" in item) return item.name + item.extension === name;
        return false;
      });
      if (index >= 0) return folder.items[index] as File;
    }
    return null;
  }

  public static createFile(file: File): File | null {
    const [path] = OSFileSystem.fileFullPathToPathAndName(file.path);
    const folder = OSFileSystem.getFolder(path);
    if (folder) {
      folder.items.push(file);
      OSFileSystem.updateFolder(folder);
      return file;
    }
    return null;
  }

  public static updateFile(file: File): void {
    const [path] = OSFileSystem.fileFullPathToPathAndName(file.path);
    const folder = OSFileSystem.getFolder(path);
    if (folder) {
      const fileIndex = folder.items.findIndex((item) => item.id === file.id);
      if (fileIndex >= 0) {
        (folder.items[fileIndex] as File) = file;
        OSFileSystem.updateFolder(folder);
      }
    }
  }

  public static renameFile(file: File, name: string): void {
    file.path =
      this.fileFullPathToPathAndName(file.path)[0] + name + file.extension;
    file.name = name;
    this.updateFile(file);
  }

  public static updateFileValue(file: File, value: string): void {
    file.value = value;
    this.updateFile(file);
  }

  public static renameFolder(folder: Folder, name: string): void {
    folder.path = this.folderFullPathToPathAndName(folder.path)[0] + name + "/";
    folder.name = name;
    this.updateFolder(folder);
  }

  public static renameItem(item: FilesItem, name: string): void {
    if (
      !this.getFolder(this.fileFullPathToPathAndName(item.path)[0]) ||
      !this.isNameValid(this.getFolder(item.path)!, name)
    )
      return;

    if ("items" in item) return this.renameFolder(item as Folder, name);
    else if ("extension" in item) return this.renameFile(item as File, name);
  }

  public static deleteFile(file: File): boolean {
    const [path] = OSFileSystem.fileFullPathToPathAndName(file.path);
    const folder = OSFileSystem.getFolder(path);
    if (folder) {
      const newItems = folder.items.filter((item) => item.id !== file.id);
      if (folder.items.length !== newItems.length) {
        folder.items = newItems;
        OSFileSystem.updateFolder(folder);
        return true;
      }
    }
    return false;
  }

  public static deleteItem(item: FilesItem): boolean {
    if ("items" in item) return OSFileSystem.deleteFolder(item as Folder);
    else if ("extension" in item) return OSFileSystem.deleteFile(item as File);

    return false;
  }

  public static move(item: FilesItem, path: string): boolean {
    this.updateFileSystem();
    return OSFileSystem.recursiveMove(item, path);
  }

  public static moveToTrash(item: FilesItem): boolean {
    [item.beforeTrashPath] = this.fileFullPathToPathAndName(item.path);
    return OSFileSystem.move(item, "/trash");
  }

  public static restoreFromTrash(item: FilesItem): boolean {
    const path = item.beforeTrashPath;
    item.beforeTrashPath = undefined;
    return OSFileSystem.move(item, path ?? "/");
  }

  public static fileFullPathToPathAndName(fullPath: string): [string, string] {
    const path = fullPath.substring(0, fullPath.lastIndexOf("/") + 1);
    const name = fullPath.substring(
      fullPath.lastIndexOf("/") + 1,
      fullPath.length,
    );
    return [path, name];
  }

  public static folderFullPathToPathAndName(
    fullPath: string,
  ): [string, string] {
    if (fullPath.endsWith("/"))
      fullPath = fullPath.substring(0, fullPath.length - 1);
    const path = fullPath.substring(0, fullPath.lastIndexOf("/") + 1);
    const name = fullPath.substring(
      fullPath.lastIndexOf("/") + 1,
      fullPath.length,
    );
    return [path, name];
  }

  public static isTrashFilled(): boolean {
    const trash = OSFileSystem.getFolder("/trash")!;
    if (!trash) return false;
    return trash.items.length > 0;
  }

  public static generateFileId() {
    const currentId = getSetting("fileId");

    if (currentId) setSetting("fileId", currentId + 1);
    else setSetting("fileId", 2);

    return currentId ?? 1;
  }

  public static updateFileSystem(): void {
    this.listeners.forEach((callback) => callback());
  }

  public static isNameValid(folder: Folder, name: string): boolean {
    if (name.length === 0 || name.endsWith(".")) return false;

    if (folder?.items?.some((item) => item.name === name)) return false;

    return !(
      name.includes("/") ||
      name.includes("\\") ||
      name.includes(":") ||
      name.includes("*") ||
      name.includes("?") ||
      name.includes('"') ||
      name.includes("<") ||
      name.includes(">") ||
      name.includes("|")
    );
  }

  public static getParent(folder: Folder): Folder | null {
    if (folder.path === "/") return null;
    const [path] = OSFileSystem.folderFullPathToPathAndName(folder.path);
    return OSFileSystem.getFolder(path);
  }

  private static recursiveMove(item: FilesItem, path: string): boolean {
    if (OSFileSystem.getFolder(path) === null) return false;

    if ("extension" in item) {
      if (OSFileSystem.deleteFile(item as File)) {
        const name = item.name + (item as File).extension;

        if (!path.endsWith("/")) path += "/";
        item.path = path + name;
        return OSFileSystem.createFile(item as File) !== null;
      }
      return false;
    } else if ("items" in item) {
      if (OSFileSystem.deleteFolder(item as Folder)) {
        if (!path.endsWith("/")) path += "/";
        item.path = path + item.name;
        OSFileSystem.createFolderFrom(item as Folder);
        for (const anItem of (item as Folder).items) {
          if (!OSFileSystem.recursiveMove(anItem, item.path)) return false;
        }
      }
    }
    return true;
  }
}

const createTemplateFile = () => {
  OSFileSystem.createFile(
    new File(
      "Template",
      "/.apps/Template.osapp",
      ".osapp",
      undefined,
      'import OSApp, { OSAppProps } from "runnit/OSApp";\n' +
        "import { useState, useEffect, ReactElement } from 'react'\n" +
        "\n" +
        "export default class Runnit extends OSApp {\n" +
        "  constructor(props?: OSAppProps) {\n" +
        "    super(props);\n" +
        "    \n" +
        "    this.setAppFile({\n" +
        "      name: 'Runnit App',\n" +
        "      icon: '/icons/runnit-transparent.png',\n" +
        "    });\n" +
        "\n" +
        "    this.minimumHeight = 550;\n" +
        "    this.minimumWidth = 750;\n" +
        "  };\n" +
        "\n" +
        "  body = () => {\n" +
        "    return <MainComponent \n" +
        "      addHeaderTrailingItem={this.addHeaderTrailingItem} \n" +
        "      removeHeaderTrailingItem={this.removeHeaderTrailingItem} \n" +
        "    />;\n" +
        "  };\n" +
        "}\n" +
        "\n" +
        "const ItemComponent = ({setColor}: {setColor: (color: string) => void;}) => {\n" +
        "  return <div>\n" +
        "    <button \n" +
        "      onClick={() => {\n" +
        "        const x = Math.random() * 255;\n" +
        "        const y = Math.random() * 255;\n" +
        "        const z = Math.random() * 255;\n" +
        "        setColor(`rgb(${x},${y},${z})`);\n" +
        "      }}\n" +
        '      className="w-max text-center h-full text-green-500 hover:text-black bg-transparent hover:bg-green-500 p-2">\n' +
        "      Click me!\n" +
        "    </button>\n" +
        "  </div>;\n" +
        "};\n" +
        "\n" +
        "const MainComponent = (\n" +
        "  {addHeaderTrailingItem, removeHeaderTrailingItem}: \n" +
        "  {addHeaderTrailingItem: (item: ReactElement) => void, removeHeaderTrailingItem: (item: ReactElement) => void}\n" +
        ") => {\n" +
        "  const [n, setN] = useState(0);\n" +
        "  const [color, setColor] = useState('rgb(255,255,255)');\n" +
        "  \n" +
        "  useEffect(() => {\n" +
        "    const item = <ItemComponent setColor={setColor}/>;\n" +
        "    addHeaderTrailingItem(item);\n" +
        "\n" +
        "    return () => removeHeaderTrailingItem(item);\n" +
        "  }, []);\n" +
        "\n" +
        '  return <div className="w-full h-full flex flex-col items-center p-10 bg-gray-700">\n' +
        '    <p style={{color: color}} className="text-[50px] pb-10 font-bold">Hello, Runnit!</p>\n' +
        '    <div className="flex flex-col justify-center items-center h-full w-full gap-5 bg-white rounded-3xl">\n' +
        '      <button className="bg-blue-500 p-3 rounded-lg text-xl" onClick={() => setN(p => p + 1)}>Click me!</button>\n' +
        '      <p className="text-2xl text-black">{n}</p>\n' +
        "    </div>\n" +
        "  </div>;\n" +
        "};",
    ),
  );
};
