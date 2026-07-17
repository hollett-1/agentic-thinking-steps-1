import React from 'react';
import { LoaderConfig, ThemeMode } from '../types';

interface PresentationFrameProps {
  mode: ThemeMode;
  config: LoaderConfig;
  children: React.ReactNode;
}

// System status bar matching exact Figma node 14182:21792 (Status bar)
const AndroidStatusBar: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  return (
    <div className={`w-full h-[52px] px-[32px] flex items-center justify-between relative select-none shrink-0 ${
      isDark ? 'text-[#e3e2e6]' : 'text-[#262a33]'
    }`}>
      {/* .SB-Left (Clock 9:30) */}
      <div className="flex items-center">
        <span className="font-['Google_Sans_Flex',sans-serif] font-bold text-[14.5px] leading-none tracking-tight">
          9:30
        </span>
      </div>

      {/* Center: Camera punch-hole exactly 29.7px x 29.7px centered matching Figma 14182:21844 */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[29.7px] h-[29.7px] rounded-full bg-[#000000] pointer-events-none" />

      {/* .SB-Right (System Icons) matching exact Figma 14182:21795 */}
      <div className="flex items-center gap-[6px]">
        {/* Cellular / Signal (4 bars: 2 solid, 2 40% opacity matching Figma 14182:21816) */}
        <svg width="17.15" height="13" viewBox="0 0 18 13" fill="none" className="shrink-0">
          <rect x="0" y="6" width="2.6" height="7" rx="1.3" fill="currentColor" />
          <rect x="4.85" y="4" width="2.6" height="9" rx="1.3" fill="currentColor" />
          <rect x="9.7" y="2" width="2.6" height="11" rx="1.3" fill="currentColor" opacity="0.4" />
          <rect x="14.55" y="0" width="2.6" height="13" rx="1.3" fill="currentColor" opacity="0.4" />
        </svg>

        {/* Wi-Fi matching exact Figma 14182:21821 (outer 40% opacity arc, inner solid arc, solid center dot) */}
        <svg width="19.5" height="13" viewBox="0 0 20 14" fill="none" className="shrink-0">
          {/* Outer Dome Arc (40% opacity) */}
          <path
            d="M 1.5 4.5 C 6 0.5 13.5 0.5 18 4.5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.4"
          />
          {/* Inner Arc (Solid) */}
          <path
            d="M 5 8 C 7.5 5.5 12 5.5 14.5 8"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Bottom Center Dot (Solid) */}
          <circle cx="9.75" cy="11.5" r="1.4" fill="currentColor" />
        </svg>

        {/* Battery matching Figma 14182:21834 */}
        <div className="flex items-center gap-px shrink-0">
          {/* Capacity (22x12 rounded-[3.5px] solid fill) */}
          <div className="w-[22px] h-[12px] rounded-[3.5px] bg-current flex items-center justify-center overflow-hidden shrink-0" />
          {/* Terminal nub (1.5x5px) */}
          <div className="w-[1.5px] h-[5px] rounded-r-[1px] bg-current shrink-0" />
        </div>
      </div>
    </div>
  );
};


// Android Mobile Presentation Frame matching Figma node 14182:21791 (Hint)
export const AndroidPresentationFrame: React.FC<PresentationFrameProps> = ({
  mode,
  config,
  children,
}) => {
  const isDark = mode === 'dark';
  const position = config.androidPosition || 'bottom';

  return (
    <div className="flex flex-col items-center justify-center w-full py-2">
      {/* Figma node 14182:21791 (Hint): 412px wide, rounded-[55px], clean surface */}
      <div 
        data-node-id="14182:21791"
        data-name="Hint"
        className={`relative w-full max-w-[412px] h-[840px] max-h-[86vh] rounded-[55px] overflow-hidden flex flex-col shadow-[0_24px_60px_-15px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.45)] transition-all duration-300 border border-black/10 dark:border-white/10 ${
          isDark 
            ? 'bg-[#131416] text-[#e3e2e6]' 
            : 'bg-white text-[#262a33]'
        }`}
      >
        {/* Top Status Bar (52px) */}
        <AndroidStatusBar isDark={isDark} />

        {/* Screen Content Canvas */}
        <div 
          className={`flex-1 relative flex flex-col overflow-y-auto subtle-scrollbar px-6 ${
            position === 'bottom' 
              ? 'justify-end pb-12' 
              : 'justify-center items-center pb-6'
          }`}
        >
          {/* Sheet region matching Figma node 14182:21846 */}
          <div className="w-full flex justify-center z-10">
            {children}
          </div>
        </div>

        {/* Android Home Navigation Pill */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[108px] h-[4px] rounded-full pointer-events-none z-20 transition-colors bg-[#262a33]/20 dark:bg-white/25" />
      </div>
    </div>
  );
};


// Chrome-Style Web Browser Presentation Frame (Figma node 14182:21985)
export const WebPresentationFrame: React.FC<PresentationFrameProps> = ({
  mode,
  config,
  children,
}) => {
  const isDark = mode === 'dark';
  const url = config.webUrl || 'mail.google.com/mail/u/0/#inbox';

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[920px] py-4">
      {/* Web Browser Window Frame */}
      <div 
        className={`w-full rounded-[18px] overflow-hidden flex flex-col border transition-all duration-300 shadow-[0_24px_54px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_54px_rgba(0,0,0,0.45)] ${
          isDark 
            ? 'bg-[#1e1f22] border-[#383a3f]' 
            : 'bg-white border-[#d1d5db]'
        }`}
      >
        {/* Browser Top Toolbar (Chrome Browser Bar) */}
        <div 
          className={`h-[56px] px-4 flex items-center justify-between gap-3 border-b select-none shrink-0 ${
            isDark 
              ? 'bg-[#1e1f22] border-[#2b2d31] text-[#c4c7c5]' 
              : 'bg-white border-[#e5e7eb] text-[#444746]'
          }`}
        >
          {/* Navigation Controls: Back, Forward, Refresh */}
          <div className="flex items-center gap-1 shrink-0">
            <button 
              type="button" 
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-current/10 transition-colors"
              title="Back"
            >
              <span className="material-symbols-outlined text-[19px]">arrow_back</span>
            </button>
            <button 
              type="button" 
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-current/10 transition-colors"
              title="Forward"
            >
              <span className="material-symbols-outlined text-[19px]">arrow_forward</span>
            </button>
            <button 
              type="button" 
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-current/10 transition-colors"
              title="Reload"
            >
              <span className="material-symbols-outlined text-[19px]">refresh</span>
            </button>
          </div>

          {/* Center Address Bar */}
          <div 
            className={`flex-1 max-w-[560px] h-[36px] px-3.5 rounded-full flex items-center justify-between gap-2.5 border transition-colors ${
              isDark 
                ? 'bg-[#131416] border-[#383a3f] text-[#e3e2e6]' 
                : 'bg-[#f0f4f9] border-[#e0e2e5] text-[#1f1f1f]'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="material-symbols-outlined text-[16px] text-current/70 shrink-0">lock</span>
              <span className="text-[13.5px] font-sans truncate tracking-tight">
                {url}
              </span>
            </div>
            <button 
              type="button" 
              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-current/10 transition-colors shrink-0"
              title="Bookmark this tab"
            >
              <span className="material-symbols-outlined text-[17px] text-current/70">star</span>
            </button>
          </div>

          {/* Trailing Controls: Download, Share, Tabs, Profile Avatar, More */}
          <div className="flex items-center gap-1 shrink-0">
            <button 
              type="button" 
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-current/10 transition-colors hidden sm:flex"
              title="Download"
            >
              <span className="material-symbols-outlined text-[19px]">download</span>
            </button>
            <button 
              type="button" 
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-current/10 transition-colors hidden sm:flex"
              title="Share this page"
            >
              <span className="material-symbols-outlined text-[19px]">share</span>
            </button>
            <button 
              type="button" 
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-current/10 transition-colors"
              title="Open tabs"
            >
              <span className="material-symbols-outlined text-[19px]">tab</span>
            </button>

            {/* Profile Avatar Badge */}
            <div className="w-7 h-7 ml-1 rounded-full bg-[#747775] text-white font-medium text-[13px] flex items-center justify-center shadow-xs cursor-pointer select-none">
              M
            </div>

            <button 
              type="button" 
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-current/10 transition-colors"
              title="Customize and control"
            >
              <span className="material-symbols-outlined text-[19px]">more_vert</span>
            </button>
          </div>
        </div>

        {/* Browser Page Viewport Area */}
        <div 
          className={`min-h-[500px] flex flex-col items-center justify-center p-8 relative transition-colors ${
            isDark ? 'bg-[#131416]' : 'bg-[var(--surface)]'
          }`}
        >
          {/* Subtle Page Context Header Indicator (e.g. Workspace Header) */}
          <div className="absolute top-4 left-6 right-6 flex items-center justify-between opacity-50 select-none pointer-events-none text-xs">
            <div className="flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Google Workspace AI Assistant</span>
            </div>
            <span className="font-mono">Live Session</span>
          </div>

          {/* Rendered Loader Component Inside Web Viewport */}
          <div className="w-full flex justify-center z-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Freeform Presentation Frame (Current / Default layout)
export const FreeformPresentationFrame: React.FC<PresentationFrameProps> = ({
  children,
}) => {
  return (
    <div className="w-full max-w-[540px] flex flex-col items-center gap-6">
      <div className="w-full flex justify-center">
        {children}
      </div>
    </div>
  );
};
