import React from 'react';

export interface HeaderProps {
    isMobile: boolean;
    onToggleGui: () => void;
    isLabMode?: boolean;
    onToggleLabMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    isMobile,
    onToggleGui,
    isLabMode,
    onToggleLabMode
}) => {
    return (
        <div className="px-5 pt-5 pb-3 bg-[var(--surface-container)] sticky top-0 z-20 bg-[var(--surface-container)]/95 backdrop-blur-sm flex items-center justify-between gap-3">
            <h1
                className="text-[24px] leading-8 text-[var(--on-surface)] font-display tracking-tight shrink-0"
                style={{ fontVariationSettings: "'wdth' 75, 'wght' 600" }}
            >
                Loader Controls
            </h1>

            <div className="flex items-center gap-2 shrink-0">
                {onToggleLabMode && (
                    <button
                        type="button"
                        onClick={onToggleLabMode}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer shadow-2xs shrink-0 ${
                            isLabMode
                                ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--on-primary)] hover:opacity-90 shadow-xs'
                                : 'border-[var(--outline-variant)]/30 bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-highest)]'
                        }`}
                        title={isLabMode ? "Exit Labs mode" : "Toggle Labs mode"}
                    >
                        <span className="material-symbols-outlined text-[15px]">science</span>
                        <span>Labs mode</span>
                    </button>
                )}

                {isMobile && (
                    <button
                        onClick={onToggleGui}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--surface-container-high)] text-[var(--on-surface)] hover:bg-[var(--surface-container-highest)] transition-colors shrink-0"
                        title="Close Controls"
                    >
                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                    </button>
                )}
            </div>
        </div>
    );
};
