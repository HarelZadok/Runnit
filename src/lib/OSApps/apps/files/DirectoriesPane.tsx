interface DirectoriesPaneProps {
  onDirectory?: (directory: string) => void;
}

const DirectoryButton = (props: {
  name: string;
  path: string;
  onClick?: (directory: string) => void;
}) => {
  return (
    <div
      className='w-full rounded-md bg-gray-300 hover:bg-gray-400 py-1 px-2 cursor-pointer'
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
    <div className='h-full w-56 bg-white/70 backdrop-blur-2xl flex flex-col shrink-0 text-gray-700 p-2 gap-1'>
      <DirectoryButton onClick={props.onDirectory} name='Root' path='/' />
      <DirectoryButton onClick={props.onDirectory} name='Trash' path='/trash' />
      <DirectoryButton onClick={props.onDirectory} name='Home' path='/home' />
      <DirectoryButton
        onClick={props.onDirectory}
        name='Desktop'
        path='/home/desktop'
      />
      <DirectoryButton
        onClick={props.onDirectory}
        name='Documents'
        path='/home/documents'
      />
      <DirectoryButton
        onClick={props.onDirectory}
        name='Downloads'
        path='/home/downloads'
      />
      <DirectoryButton
        onClick={props.onDirectory}
        name='Gallery'
        path='/home/gallery'
      />
    </div>
  );
}
