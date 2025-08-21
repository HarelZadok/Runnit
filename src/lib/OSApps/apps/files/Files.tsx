import OSApp, { OSAppProps } from "@/lib/features/OSApp/OSApp";
import React, { JSX } from "react";
import DirectoriesPane from "@/lib/OSApps/apps/files/DirectoriesPane";
import DirectoryDetailsPane from "@/lib/OSApps/apps/files/DirectoryDetailsPane";

interface filesState {
  currentDirectory: string;
}

export default class Files extends OSApp {
  state: filesState = {
    currentDirectory: "/",
  };

  constructor(props?: OSAppProps) {
    super(props);

    this.setAppFile({
      name: "Files",
      icon: "/icons/files.png",
    });

    this.minimumWidth = 550;
    this.minimumHeight = 350;
  }

  body(): JSX.Element {
    return (
      <div className='h-full w-full flex flex-row'>
        <DirectoriesPane onDirectory={this.handleOnDirectory} />
        <DirectoryDetailsPane
          onDirectory={this.handleOnDirectory}
          directory={this.state.currentDirectory}
        />
      </div>
    );
  }

  private handleOnDirectory = (directory: string) => {
    if (!directory.endsWith("/")) directory += "/";
    this.setState({ currentDirectory: directory });
  };
}
