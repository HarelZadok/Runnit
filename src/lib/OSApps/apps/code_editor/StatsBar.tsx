import { File } from "@/lib/OSApps/apps/files/FilesItem";

export default function StatsBar({ file }: { file: File | null }) {
  return (
    <div className="w-full h-5 shrink-0 bg-white/65 backdrop-blur-2xl flex flex-row justify-end px-2 gap-5">
      {file && (
        <>
          <p className="text-sm text-black">
            Characters:{" "}
            {
              file.value.replaceAll(
                String.fromCharCode(13) + String.fromCharCode(10),
                "",
              ).length
            }
          </p>
          <p className="text-sm text-black">
            Words:{" "}
            {file.value.length === 0
              ? 0
              : file.value.split(RegExp("\\s\\S")).length}
          </p>
        </>
      )}
    </div>
  );
}
