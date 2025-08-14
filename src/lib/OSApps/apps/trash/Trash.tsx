import OSApp, { OSAppProps } from "@/lib/features/OSApp/OSApp";
import React from "react";

export default class Trash extends OSApp {
  constructor(props?: OSAppProps) {
    super(props);

    this.setAppFile({
      name: "Trash",
      icon: "/icons/trash-empty.png",
    });
  }

  body(): React.ReactElement {
    return <TrashComponent />;
  }
}

const TrashComponent = () => {
  return (
    <div className="text-black w-full h-full bg-white flex justify-center items-center">
      <p>Trash!</p>
    </div>
  );
};
