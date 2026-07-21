import React, { useState, useMemo } from 'react';
import { AppState } from '../types';
import {
    Header,
    PresetsCard,
    DesignGridCard,
    StepperCard,
    PresentationThemeCard,
    DesignTypographyCard,
    StatusDetailCard,
    ProductBadgesCard,
    PixelDriftCard,
    AuroraCard,
    NeuralCard,
} from './ControlCards';

export interface ControlsProps {
    state: AppState;
    updateState: (updates: Partial<AppState>) => void;
    isMobile: boolean;
    onToggleGui: () => void;
    isLabMode?: boolean;
    onToggleLabMode?: () => void;
}

const ALL_CARD_KEYS = [
    'presets',
    'presentation_theme',
    'design_typography',
    'aurora',
    'neural',
    'pixel_drift',
    'design_grid',
] as const;

type CardKey = typeof ALL_CARD_KEYS[number];

export const Controls: React.FC<ControlsProps> = ({
    state,
    updateState,
    isMobile,
    onToggleGui,
    isLabMode,
    onToggleLabMode
}) => {
    const [draggedKey, setDraggedKey] = useState<string | null>(null);
    const [dragOverKey, setDragOverKey] = useState<string | null>(null);
    const [dropPosition, setDropPosition] = useState<'top' | 'bottom' | null>(null);

    const currentOrder = useMemo(() => {
        const saved = state.cardOrder || [];
        const set = new Set([...saved, ...ALL_CARD_KEYS]);
        return Array.from(set) as CardKey[];
    }, [state.cardOrder]);

    const visibleKeys = useMemo(() => {
        return currentOrder.filter(key => {
            if (key === 'presets') return !!isLabMode;
            if (key === 'pixel_drift') return state.loader.statusTextEffect === 'pixel_drift';
            if (key === 'design_grid') return !isLabMode;
            return ALL_CARD_KEYS.includes(key);
        });
    }, [currentOrder, isLabMode, state.loader.statusTextEffect]);

    const handleDragStart = (e: React.DragEvent, key: string) => {
        setDraggedKey(key);
        e.dataTransfer.setData('text/plain', key);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, targetKey: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (!draggedKey || draggedKey === targetKey) {
            if (dragOverKey === targetKey) {
                setDragOverKey(null);
                setDropPosition(null);
            }
            return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const pos = e.clientY < midY ? 'top' : 'bottom';
        setDragOverKey(targetKey);
        setDropPosition(pos);
    };

    const handleDrop = (e: React.DragEvent, targetKey: string) => {
        e.preventDefault();
        const sourceKey = draggedKey || e.dataTransfer.getData('text/plain');
        const pos = dropPosition || 'top';
        setDraggedKey(null);
        setDragOverKey(null);
        setDropPosition(null);
        if (!sourceKey || sourceKey === targetKey) return;

        const fullOrder = [...currentOrder];
        const fromIdx = fullOrder.indexOf(sourceKey as CardKey);
        let toIdx = fullOrder.indexOf(targetKey as CardKey);
        if (fromIdx !== -1 && toIdx !== -1) {
            fullOrder.splice(fromIdx, 1);
            toIdx = fullOrder.indexOf(targetKey as CardKey);
            if (pos === 'bottom') {
                toIdx += 1;
            }
            fullOrder.splice(toIdx, 0, sourceKey as CardKey);
            updateState({ cardOrder: fullOrder });
        }
    };

    const handleDragEnd = () => {
        setDraggedKey(null);
        setDragOverKey(null);
        setDropPosition(null);
    };

    const handleSaveSettingsToJson = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${isLabMode ? 'labs_' : ''}loader_settings_${Date.now()}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
        <aside className="w-full md:w-[400px] h-full bg-[var(--surface-container)] overflow-y-auto flex flex-col font-sans subtle-scrollbar relative rounded-[24px] border-none">
            <Header
                isMobile={isMobile}
                onToggleGui={onToggleGui}
                isLabMode={isLabMode}
                onToggleLabMode={onToggleLabMode}
            />

            <div className="flex flex-col gap-4 p-4 pb-12">
                {visibleKeys.map((key) => {
                    const commonProps = {
                        state,
                        updateState,
                        onDragStart: (e: React.DragEvent) => handleDragStart(e, key),
                        onDragOver: (e: React.DragEvent) => handleDragOver(e, key),
                        onDrop: (e: React.DragEvent) => handleDrop(e, key),
                        onDragEnd: handleDragEnd,
                        isDragging: draggedKey === key,
                        isDragOver: dragOverKey === key,
                        dropPosition: dragOverKey === key ? dropPosition : null,
                    };

                    switch (key) {
                        case 'presets':
                            return <PresetsCard key={key} {...commonProps} isLabMode={true} />;
                        case 'pixel_drift':
                            return <PixelDriftCard key={key} {...commonProps} />;
                        case 'design_grid':
                            return <DesignGridCard key={key} {...commonProps} />;
                        case 'stepper':
                            return <StepperCard key={key} {...commonProps} />;
                        case 'design_typography':
                            return <DesignTypographyCard key={key} {...commonProps} />;
                        case 'aurora':
                            return <AuroraCard key={key} {...commonProps} />;
                        case 'neural':
                            return <NeuralCard key={key} {...commonProps} />;
                        case 'presentation_theme':
                            return <PresentationThemeCard key={key} {...commonProps} />;
                        case 'status_detail':
                            return <StatusDetailCard key={key} {...commonProps} isLabMode={isLabMode} />;
                        case 'product_badges':
                            return <ProductBadgesCard key={key} {...commonProps} />;
                        default:
                            return null;
                    }
                })}

                <div className="pt-2">
                    <button
                        type="button"
                        onClick={handleSaveSettingsToJson}
                        className="w-full py-3 px-4 rounded-[12px] bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--on-primary)] font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
                    >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        {isLabMode ? 'Save labs settings to JSON' : 'Save settings to JSON'}
                    </button>
                </div>
            </div>
        </aside>
    );
};
