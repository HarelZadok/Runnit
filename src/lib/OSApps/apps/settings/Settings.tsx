import OSApp, { OSAppProps } from "@/lib/features/OSApp/OSApp";
import SettingsComponent from "./SettingsComponent";

export default class Settings extends OSApp {
  constructor(props?: OSAppProps) {
    super(props);

    this.setAppFile({
      name: "Settings",
      icon: "/icons/settings.png",
    });
  }

  body = () => <SettingsComponent />;
}
