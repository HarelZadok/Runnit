import OSApp, { OSAppProps } from "@/lib/features/OSApp/OSApp";

export class EmptyApp extends OSApp {
  constructor(props?: OSAppProps) {
    super(props);

    this.setAppFile({
      icon: "/icons/file.png",
      name: "",
    });
  }
}
