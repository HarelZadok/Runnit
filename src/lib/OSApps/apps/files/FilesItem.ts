export default abstract class FilesItem {
  private static filesId = 1;
  public id: number;
  public name: string;
  public path: string;
  public icon: string;

  protected constructor(name: string, path: string, icon: string) {
    this.id = FilesItem.filesId++;
    this.name = name;
    this.path = path;
    this.icon = icon;
  }
}

export class File extends FilesItem {
  public readonly dateOfCreation: number;
  public size: number;
  public extension: string;
  public value: string;

  constructor(name: string, path: string, extension: string, icon?: string) {
    super(name, path, icon ?? "/icons/file.png");
    this.size = 0;
    this.dateOfCreation = Date.now();
    this.extension = extension;
    this.value = "";
  }
}

export class Folder extends FilesItem {
  public items: FilesItem[];

  constructor(name: string, path: string, icon?: string) {
    super(name, path, icon ?? "/icons/files.png");
    this.items = [];
  }
}
