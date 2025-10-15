import { FaPlay } from "react-icons/fa";

export default function StartButton({
  updateInstance,
}: {
  updateInstance: (launch: boolean) => void;
}) {
  return (
    <div className="flex flex-row justify-center items-center h-full">
      <button
        className="flex justify-center items-center hover:bg-[#00C000] text-[#00C000] hover:text-white cursor-pointer p-1.5 rounded-md"
        onClick={() => updateInstance(true)}
      >
        <FaPlay />
      </button>
      <div className="bg-gray-500 h-[70%] w-[1px] mx-2" />
    </div>
  );
}
