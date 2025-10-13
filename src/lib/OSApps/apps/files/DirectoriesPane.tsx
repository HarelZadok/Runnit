interface DirectoriesPaneProps {
  onDirectory?: (directory: string) => void;
  directory: string;
}

const DirectoryButton = (props: {
  name: string;
  path: string;
  onClick?: (directory: string) => void;
  directory: string;
}) => {
  const p =
    props.directory.length > 1
      ? props.directory.substring(0, props.directory.length - 1)
      : props.directory;
  const selected = props.path === p;
  return (
    <div
      className={`w-full rounded-md ${selected ? "bg-blue-600 text-white" : "hover:bg-gray-300"} py-2 px-2 cursor-pointer`}
      onClick={() => {
        if (props.onClick) props.onClick(props.path);
      }}
    >
      <p>{props.name}</p>
    </div>
  );
};

export default function DirectoriesPane(props: DirectoriesPaneProps) {
  return (
    <div className="h-full w-56 bg-white/70 backdrop-blur-2xl flex flex-col shrink-0 text-gray-700 p-2">
      <DirectoryButton
        directory={props.directory}
        onClick={props.onDirectory}
        name="Root"
        path="/"
      />
      <DirectoryButton
        directory={props.directory}
        onClick={props.onDirectory}
        name="Trash"
        path="/trash"
      />
      <DirectoryButton
        directory={props.directory}
        onClick={props.onDirectory}
        name="Home"
        path="/home"
      />
      <DirectoryButton
        directory={props.directory}
        onClick={props.onDirectory}
        name="Desktop"
        path="/home/desktop"
      />
      <DirectoryButton
        directory={props.directory}
        onClick={props.onDirectory}
        name="Documents"
        path="/home/documents"
      />
      <DirectoryButton
        directory={props.directory}
        onClick={props.onDirectory}
        name="Downloads"
        path="/home/downloads"
      />
      <DirectoryButton
        directory={props.directory}
        onClick={props.onDirectory}
        name="Gallery"
        path="/home/gallery"
      />
    </div>
  );
}
