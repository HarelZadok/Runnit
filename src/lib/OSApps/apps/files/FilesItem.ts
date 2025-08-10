export default abstract class FilesItem {
  private static filesId = 0;
  public id: number;
  public name: string;
  public path: string;

  protected constructor(name: string, path: string) {
    this.id = FilesItem.filesId++;
    this.name = name;
    this.path = path;
  }
}

export class File extends FilesItem {
  public readonly dateOfCreation: number;
  public size: number;
  public extension: string;
  public icon: string;
  public value: string;

  constructor(name: string, path: string, extension: string, icon?: string) {
    super(name, path);
    this.size = 0;
    this.dateOfCreation = Date.now();
    this.extension = extension;
    this.icon = icon ?? "/icons/file.png";
    this.value = "";
  }
}

export class Folder extends FilesItem {
  public items: FilesItem[];

  constructor(name: string, path: string) {
    super(name, path);
    this.items = [];
  }
}
