import { OSAppFileProps } from "@/lib/features/OSApp/OSAppFile";
import { OSFileSystem } from "@/lib/OSApps/apps/files/OSFileSystem";

export default abstract class FilesItem {
  public readonly id: number;
  public name: string;
  public path: string;
  public icon: string;
  public beforeTrashPath?: string;
  public type: "file" | "folder";

  protected constructor(
    name: string,
    path: string,
    icon: string,
    type: "file" | "folder",
  ) {
    this.id = OSFileSystem.generateFileId();
    this.name = name;
    this.path = path;
    this.icon = icon;
    this.type = type;
  }
}

export class File extends FilesItem {
  public readonly dateOfCreation: number;
  public size: number;
  public extension: string;
  public value: string;

  constructor(
    name: string,
    path: string,
    extension: string,
    icon?: string,
    value?: string,
  ) {
    super(name, path, icon ?? "/icons/file.png", "file");
    this.size = 0;
    this.dateOfCreation = Date.now();
    this.extension = extension;
    this.value = value ?? "";
  }
}

export class AppShortcut extends File {
  public readonly appProps: OSAppFileProps;

  constructor(appProps: OSAppFileProps, path: string) {
    super(appProps.name, path, ".app", appProps.icon);
    this.appProps = appProps;
  }
}

export class Folder extends FilesItem {
  public items: FilesItem[];

  constructor(name: string, path: string, icon?: string) {
    super(name, path, icon ?? "/icons/files.png", "folder");
    this.items = [];
  }
}
