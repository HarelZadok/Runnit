import React from "react";
import { version } from "@/../package.json";

export default function UpdateNotifier() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/10 backdrop-blur-lg z-20000 animate-fadeIn pointer-events-auto"
      onMouseDown={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.stopPropagation()}
    >
      <div
        className="absolute inset-0 backdrop-blur-3xl bg-gradient-to-br from-black/20 via-slate-900/30 to-black/20"
        style={{ backdropFilter: "blur(20px) saturate(180%)" }}
      ></div>
      <div className="relative w-4/5 h-4/5 aspect-square bg-gradient-to-br from-slate-50/98 via-white/95 to-blue-50/98 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden animate-slideUp pointer-events-auto">
        {/* Enhanced animated background elements */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/15 to-purple-600/15 rounded-full blur-3xl animate-floatSlow"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-emerald-400/15 to-cyan-500/15 rounded-full blur-3xl animate-floatReverseSlow"></div>
        <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-gradient-to-br from-pink-400/10 to-orange-400/10 rounded-full blur-2xl animate-drift"></div>

        {/* Content container */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-12 text-center">
          {/* Enhanced Icon */}
          <div className="mb-8 relative">
            <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl animate-iconPulse">
              <svg
                className="w-14 h-14 text-white animate-iconRotate"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-3xl blur-lg animate-halo"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/30 to-purple-500/30 rounded-3xl animate-shimmer"></div>
          </div>

          {/* Enhanced Title */}
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-purple-700 bg-clip-text text-transparent mb-4 animate-titleSlide">
            Update Available
          </h1>

          {/* Enhanced Description */}
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed mb-4 animate-textFade">
            A new version of the OS is ready to enhance your experience.
            <br />
            Refresh to enjoy the latest features and improvements.
          </p>

          {/* Settings reset notification */}
          <p className="text-sm text-slate-400 max-w-2xl mb-12 animate-textFade">
            ⚠️ Note: Your settings will be reset to default after refreshing
          </p>

          {/* Single action button */}
          <div className="flex justify-center">
            <button
              onClick={handleReload}
              className="group cursor-pointer relative px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-500 ease-out overflow-hidden animate-buttonEntrance"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out skew-x-12"></div>
              <span className="relative z-10 flex items-center gap-3">
                <svg
                  className="w-6 h-6 group-hover:rotate-360 transition-transform duration-700 ease-out"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh Now
              </span>
            </button>
          </div>
        </div>

        {/* Version display at bottom */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-textFade">
          <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-200/50">
            Version {version}
          </span>
        </div>

        {/* Enhanced decorative elements */}
        <div className="absolute top-6 right-6 w-3 h-3 bg-green-400 rounded-full animate-sparkle"></div>
        <div className="absolute top-12 right-12 w-2 h-2 bg-blue-400 rounded-full animate-sparkleDelay"></div>
        <div className="absolute bottom-6 left-6 w-4 h-4 bg-purple-400/60 rounded-full animate-bounce2"></div>
        <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-yellow-400 rounded-full animate-twinkle"></div>
        <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-pink-400/50 rounded-full animate-twinkleDelay"></div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(3rem) scale(0.9) rotateX(10deg);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1) rotateX(0deg);
          }
        }
        @keyframes titleSlide {
          from {
            opacity: 0;
            transform: translateY(2rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes textFade {
          from {
            opacity: 0;
            transform: translateY(1rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes buttonEntrance {
          from {
            opacity: 0;
            transform: translateY(2rem) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes floatSlow {
          0%,
          100% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-15px) translateX(10px) rotate(3deg);
          }
          66% {
            transform: translateY(10px) translateX(-5px) rotate(-2deg);
          }
        }
        @keyframes floatReverseSlow {
          0%,
          100% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
          }
          33% {
            transform: translateY(15px) translateX(-10px) rotate(-3deg);
          }
          66% {
            transform: translateY(-10px) translateX(5px) rotate(2deg);
          }
        }
        @keyframes drift {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-30px) translateX(20px);
          }
        }
        @keyframes iconPulse {
          0%,
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 20px rgba(59, 130, 246, 0);
          }
        }
        @keyframes iconRotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes halo {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }
        @keyframes shimmer {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(1.05);
          }
        }
        @keyframes sparkle {
          0%,
          100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes sparkleDelay {
          0%,
          100% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1) rotate(180deg);
          }
        }
        @keyframes bounce2 {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.1);
          }
        }
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes twinkleDelay {
          0%,
          100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 1s ease-out;
        }
        .animate-titleSlide {
          animation: titleSlide 1s ease-out 0.3s both;
        }
        .animate-textFade {
          animation: textFade 1s ease-out 0.5s both;
        }
        .animate-buttonEntrance {
          animation: buttonEntrance 1s ease-out 0.7s both;
        }
        .animate-floatSlow {
          animation: floatSlow 8s ease-in-out infinite;
        }
        .animate-floatReverseSlow {
          animation: floatReverseSlow 10s ease-in-out infinite;
        }
        .animate-drift {
          animation: drift 12s ease-in-out infinite;
        }
        .animate-iconPulse {
          animation: iconPulse 2s ease-in-out infinite;
        }
        .animate-iconRotate {
          animation: iconRotate 2s linear infinite;
        }
        .animate-halo {
          animation: halo 3s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
        .animate-sparkle {
          animation: sparkle 1.5s ease-in-out infinite;
        }
        .animate-sparkleDelay {
          animation: sparkleDelay 1.8s ease-in-out infinite 0.5s;
        }
        .animate-bounce2 {
          animation: bounce2 2s ease-in-out infinite;
        }
        .animate-twinkle {
          animation: twinkle 1.2s ease-in-out infinite;
        }
        .animate-twinkleDelay {
          animation: twinkleDelay 1.5s ease-in-out infinite 0.3s;
        }

        .group:hover .group-hover\\:rotate-360 {
          transform: rotate(360deg);
        }
      `}</style>
    </div>
  );
}
