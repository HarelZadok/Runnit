import FilesItem, { Folder, File } from "@/lib/OSApps/apps/files/FilesItem";
import { canAccessStorage, getSetting, setSetting } from "@/lib/functions";

export class OSFileSystem {
  private static listeners: Set<() => void> = new Set();

  public static init() {
    if (!OSFileSystem.getFolder("/")) {
      OSFileSystem.updateFolder(new Folder("Root", "/"));
      OSFileSystem.createFolderFrom(
        new Folder("Trash", "/trash", "/icons/trash-empty.png")
      );
      OSFileSystem.createFolderFrom(
        new Folder("Home", "/home", "/icons/home.png")
      );
      OSFileSystem.createFolderFrom(
        new Folder("Desktop", "/home/desktop", "/icons/desktop.png")
      );
      OSFileSystem.createFolderFrom(
        new Folder("Documents", "/home/documents", "/icons/documents.png")
      );
      OSFileSystem.createFolderFrom(
        new Folder("Downloads", "/home/downloads", "/icons/downloads.png")
      );
      OSFileSystem.createFolderFrom(
        new Folder("Gallery", "/home/gallery", "/icons/gallery.png")
      );
    }
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
    const [path] = OSFileSystem.folderFullPathToPathAndName(folder.path);
    const parent = OSFileSystem.getFolder(path);
    if (parent) {
      parent.items.push(folder);
      OSFileSystem.updateFolder(parent);
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
    this.notifyListeners();
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

  public static updateFileValue(file: File): void {
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
    this.notifyListeners();
    return OSFileSystem.recursiveMove(item, path);
  }

  public static moveToTrash(item: FilesItem): boolean {
    return OSFileSystem.move(item, "/trash");
  }

  public static fileFullPathToPathAndName(fullPath: string): [string, string] {
    const path = fullPath.substring(0, fullPath.lastIndexOf("/") + 1);
    const name = fullPath.substring(
      fullPath.lastIndexOf("/") + 1,
      fullPath.length
    );
    return [path, name];
  }

  public static folderFullPathToPathAndName(
    fullPath: string
  ): [string, string] {
    if (fullPath.endsWith("/"))
      fullPath = fullPath.substring(0, fullPath.length - 1);
    const path = fullPath.substring(0, fullPath.lastIndexOf("/") + 1);
    const name = fullPath.substring(
      fullPath.lastIndexOf("/") + 1,
      fullPath.length
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

  private static notifyListeners(): void {
    this.listeners.forEach((callback) => callback());
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
