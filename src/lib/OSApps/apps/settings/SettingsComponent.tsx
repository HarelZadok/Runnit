import { clearSettings, getSetting, setSetting } from "@/lib/functions";
import packageInfo from "@/../package.json";

export default function SettingsComponent() {
  return (
    <div className='flex flex-row h-full w-full text-black'>
      <div className='w-50 h-full bg-white/70 backdrop-blur-2xl shrink-0'></div>
      <div className='w-full h-full bg-white flex flex-col justify-center items-center'>
        <button
          onClick={() => {
            setSetting("showHiddenFiles", !getSetting("showHiddenFiles"));
          }}
        >
          Show hidden files
        </button>
        <button
          onClick={() => {
            clearSettings();
            setSetting("version", packageInfo.version);
            window.location.reload();
          }}
          className='text-red-600 font-bold text-xl hover:text-white hover:bg-red-600 p-5 rounded-xl'
        >
          Reset to factory
        </button>
      </div>
    </div>
  );
}
