import React, { useState, useEffect } from 'react';
import { Controls } from './components/Controls';
import { LabsControls, LABS_DEFAULT_STATE, LABS_LIST_STATE } from './components/LabsControls';
import { Loader } from './components/Loader';
import { ErrorBoundary } from './components/ErrorBoundary';
import {
  FreeformPresentationFrame,
  AndroidPresentationFrame,
  WebPresentationFrame,
} from './components/PresentationFrames';
import { AppState } from './types';
import { DEFAULT_STATE } from './constants';
import { useThemeInjection } from './hooks/useThemeInjection';


const App: React.FC = () => {
  const [isLabMode, setIsLabMode] = useState<boolean>(true);
  const [regularState, setRegularState] = useState<AppState>(DEFAULT_STATE);
  const [labsState, setLabsState] = useState<AppState>(LABS_LIST_STATE);
  const [isGuiVisible, setIsGuiVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fps, setFps] = useState(60);
  const [replayKey, setReplayKey] = useState(0);

  const state = isLabMode ? labsState : regularState;

  // FPS Counter Loop
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const tick = (now: number) => {
      frameCount++;
      const delta = now - lastTime;
      if (delta >= 500) {
        setFps(Math.round((frameCount * 1000) / delta));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Apply Light/Dark Mode CSS Theme Variables
  useThemeInjection(state.mode);

  const updateState = (updates: Partial<AppState>) => {
    if (isLabMode) {
      setLabsState(prev => ({ ...prev, ...updates }));
    } else {
      setRegularState(prev => ({ ...prev, ...updates }));
    }
  };

  // Mobile viewport detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCopyCode = () => {
    const isDark = state.mode === 'dark';
    const isInProgress = state.loader.sparkState === 'in_progress';
    const showBadges = state.loader.loaderVariant === 'with_badges' || state.loader.showBadges;

    const codeSnippet = `// Loader Component (React)
<Loader
  sparkState="${state.loader.sparkState}"
  statusText="${state.loader.statusText}"
  isExpanded={${state.loader.isExpanded}}
  loaderVariant="${state.loader.loaderVariant}"
  statusDetailTitle="${state.loader.statusDetailTitle}"
  statusDetailBody="${state.loader.statusDetailBody}"
/>`;

    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPlaying = state.loader.sparkState === 'in_progress';

  const handleTogglePlay = () => {
    updateState({
      loader: {
        ...state.loader,
        sparkState: isPlaying ? 'default' : 'in_progress'
      }
    });
  };

  const isDark = state.mode === 'dark';

  return (
    <div className={`flex h-screen w-full overflow-hidden font-sans relative ${isDark ? 'dark' : ''}`}>
      {/* Floating GUI Sidebar Controls (20px inset from top, left, bottom) */}
      <div 
        className={`
          absolute top-5 left-5 bottom-5 z-50 transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)] overflow-hidden
          ${isGuiVisible ? 'w-[calc(100%-40px)] md:w-[400px] opacity-100 pointer-events-auto' : 'w-0 opacity-0 pointer-events-none'}
        `}
      >
        <ErrorBoundary>
          {isLabMode ? (
            <LabsControls 
              state={state} 
              updateState={updateState} 
              isMobile={isMobile}
              onToggleGui={() => setIsGuiVisible(!isGuiVisible)}
              isLabMode={true}
              onToggleLabMode={() => setIsLabMode(false)}
            />
          ) : (
            <Controls 
              state={state} 
              updateState={updateState} 
              isMobile={isMobile}
              onToggleGui={() => setIsGuiVisible(!isGuiVisible)}
              isLabMode={false}
              onToggleLabMode={() => setIsLabMode(true)}
            />
          )}
        </ErrorBoundary>
      </div>

      {/* Main Canvas Area */}
      <main 
        id="main-preview-area"
        className={`flex-1 relative overflow-hidden flex flex-col items-center justify-center p-6 bg-[var(--surface)] transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)] ${
          isGuiVisible && !isMobile ? 'pl-[440px]' : 'pl-6'
        }`}
      >
        {/* Top Floating Controls Toggle (No drop shadow) */}
        <button
          id="gui-toggle-btn"
          onClick={() => setIsGuiVisible(!isGuiVisible)}
          className={`absolute top-5 z-40 w-10 h-10 rounded-full flex items-center justify-center border border-[var(--outline-variant)]/30 transition-all duration-300 cursor-pointer ${
            isDark 
              ? 'bg-[#2b2d31] text-[#c4c7c5] hover:bg-[#383a3f]' 
              : 'bg-white text-[#444746] hover:bg-[#f0f4f9]'
          } ${isGuiVisible ? 'left-5 md:left-[435px]' : 'left-5'}`}
          title={isGuiVisible ? "Hide Controls" : "Show Controls"}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isGuiVisible ? 'chevron_left' : 'tune'}
          </span>
        </button>

        {/* Top Right Action Buttons: Play/Pause & Copy Code (No drop shadow) */}
        <div className="absolute top-5 right-5 z-40 flex items-center gap-2">
          {/* Play / Pause Toggle Button */}
          <button
            onClick={handleTogglePlay}
            className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
              isDark
                ? 'bg-[#2b2d31] border-[#383a3f] text-[#e3e2e6] hover:bg-[#383a3f]'
                : 'bg-white border-[#e0e2e5] text-[#1f1f1f] hover:bg-[#f0f4f9]'
            }`}
            title={isPlaying ? "Pause Animation" : "Play Animation"}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>

          {/* Replay Button */}
          <button
            onClick={() => {
              setReplayKey(k => k + 1);
              if (!isPlaying) {
                updateState({
                  loader: {
                    ...state.loader,
                    sparkState: 'in_progress'
                  }
                });
              }
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
              isDark
                ? 'bg-[#2b2d31] border-[#383a3f] text-[#e3e2e6] hover:bg-[#383a3f]'
                : 'bg-white border-[#e0e2e5] text-[#1f1f1f] hover:bg-[#f0f4f9]'
            }`}
            title="Replay Animation"
          >
            <span className="material-symbols-outlined text-[18px]">
              replay
            </span>
          </button>

          {/* Copy Code Button */}
          <button
            onClick={handleCopyCode}
            className={`px-3.5 py-2 rounded-full flex items-center gap-2 text-xs font-medium border transition-all cursor-pointer ${
              isDark
                ? 'bg-[#2b2d31] border-[#383a3f] text-[#e3e2e6] hover:bg-[#383a3f]'
                : 'bg-white border-[#e0e2e5] text-[#1f1f1f] hover:bg-[#f0f4f9]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            {copied ? 'Copied Code!' : 'Copy React Code'}
          </button>
        </div>

        {/* Component Showcase Canvas wrapped in Presentation Frame */}
        <div className="w-full h-full flex flex-col items-center justify-center overflow-y-auto subtle-scrollbar px-4 py-16">
          {(() => {
            const presentation = state.loader.presentation || 'freeform';
            const loaderElement = (
              <ErrorBoundary>
                <Loader
                  config={state.loader}
                  mode={state.mode}
                  replayKey={replayKey}
                  onToggleExpand={() => {
                    updateState({
                      loader: {
                        ...state.loader,
                        isExpanded: !state.loader.isExpanded
                      }
                    });
                  }}
                />
              </ErrorBoundary>
            );

            if (presentation === 'android') {
              return (
                <AndroidPresentationFrame mode={state.mode} config={state.loader}>
                  {loaderElement}
                </AndroidPresentationFrame>
              );
            }

            if (presentation === 'web') {
              return (
                <WebPresentationFrame mode={state.mode} config={state.loader}>
                  {loaderElement}
                </WebPresentationFrame>
              );
            }

            return (
              <FreeformPresentationFrame mode={state.mode} config={state.loader}>
                {loaderElement}
              </FreeformPresentationFrame>
            );
          })()}
        </div>


        {/* FPS Indicator (Bottom-Right) */}
        <div 
          className={`absolute bottom-5 right-5 z-40 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border select-none pointer-events-none transition-colors backdrop-blur-sm ${
            isDark 
              ? 'bg-[#2b2d31]/80 border-[#383a3f] text-[#c4c7c5]' 
              : 'bg-white/80 border-[#e0e2e5] text-[#444746]'
          }`}
        >
          {fps} FPS
        </div>
      </main>
    </div>
  );
};

export default App;
