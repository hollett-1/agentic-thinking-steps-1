import React from 'react';
import { AppState } from '../../types';
import { M3CollapsibleCard, M3Switch } from '../M3Components';
import { BaseControlCardProps } from './types';

export interface PresentationThemeCardProps extends BaseControlCardProps {}

export const PresentationThemeCard: React.FC<PresentationThemeCardProps> = ({ 
    state, 
    updateState,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    isDragging,
    isDragOver,
    dropPosition
}) => {
    const loader = state.loader;

    const updateLoader = (updates: Partial<AppState['loader']>) => {
        updateState({
            preset: 'custom',
            loader: {
                ...loader,
                ...updates
            }
        });
    };

    return (
        <M3CollapsibleCard 
            title="Presentation & Theme" 
            icon="devices"
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            isDragging={isDragging}
            isDragOver={isDragOver}
            dropPosition={dropPosition}
        >
            <div className="flex flex-col gap-4">
                <M3Switch
                    label="Dark Theme"
                    checked={state.mode === 'dark'}
                    onChange={(dark) => updateState({ preset: 'custom', mode: dark ? 'dark' : 'light' })}
                />

                <div className="flex flex-col gap-2 pt-2 border-t border-[var(--outline-variant)]/40">
                    <M3Switch
                        label="Leading Loader"
                        checked={loader.showLeadingLoader !== false}
                        onChange={(checked) => updateLoader({ showLeadingLoader: checked })}
                    />

                    <M3Switch
                        label="Title Text"
                        checked={loader.showTitle !== false}
                        onChange={(checked) => updateLoader({ showTitle: checked })}
                    />

                    <M3Switch
                        label="Product Icons"
                        checked={loader.showBadges !== false}
                        onChange={(checked) => updateLoader({ showBadges: checked })}
                    />

                    <M3Switch
                        label="Timer"
                        checked={loader.showTimer ?? false}
                        onChange={(checked) => updateLoader({ showTimer: checked })}
                    />

                    <M3Switch
                        label="Stop Icon"
                        checked={loader.showStopIcon ?? false}
                        onChange={(checked) => updateLoader({ showStopIcon: checked })}
                    />

                    <M3Switch
                        label="Chevron"
                        checked={loader.showChevron !== false}
                        onChange={(checked) => updateLoader({ showChevron: checked })}
                    />
                </div>
            </div>
        </M3CollapsibleCard>
    );
};
