import OSApp from "@/lib/features/OSApp/OSApp";
import React, { useEffect } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { emptyTrash } from "@/lib/OSApps/apps/files/filesSlice";

export default class Trash extends OSApp {
  constructor(props: never) {
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
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(emptyTrash());
  }, [dispatch]);

  return (
    <div className="text-black w-full h-full bg-white flex justify-center items-center">
      <p>Trash!</p>
    </div>
  );
};
