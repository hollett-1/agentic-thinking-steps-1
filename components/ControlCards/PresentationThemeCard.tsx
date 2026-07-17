import React from 'react';
import { AppState, PresentationMode } from '../../types';
import { M3CollapsibleCard, M3SegmentedButton, M3TextInput, M3Switch } from '../M3Components';
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

                <div className="flex flex-col gap-2 pt-1">
                    <label className="text-xs font-medium text-[var(--on-surface-variant)]">
                        Presentation Mode
                    </label>
                    <M3SegmentedButton
                        options={[
                            { label: 'Freeform', value: 'freeform' },
                            { label: 'Android', value: 'android' },
                            { label: 'Web', value: 'web' },
                        ]}
                        value={loader.presentation || 'freeform'}
                        onChange={(val) => updateLoader({ presentation: val as PresentationMode })}
                    />
                </div>

                {loader.presentation === 'android' && (
                    <div className="flex flex-col gap-2 pt-1">
                        <label className="text-xs font-medium text-[var(--on-surface-variant)]">
                            Loader Placement
                        </label>
                        <M3SegmentedButton
                            options={[
                                { label: 'Bottom Sheet', value: 'bottom' },
                                { label: 'Center Screen', value: 'center' },
                            ]}
                            value={loader.androidPosition || 'bottom'}
                            onChange={(val) => updateLoader({ androidPosition: val as 'bottom' | 'center' })}
                        />
                    </div>
                )}

                {loader.presentation === 'web' && (
                    <div className="flex flex-col gap-2 pt-1">
                        <M3TextInput
                            label="Browser Address Bar URL"
                            value={loader.webUrl || 'mail.google.com/mail/u/0/#inbox'}
                            onChange={(text) => updateLoader({ webUrl: text })}
                        />
                    </div>
                )}
            </div>
        </M3CollapsibleCard>
    );
};
