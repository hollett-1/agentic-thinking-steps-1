import React, { useState } from 'react';
import { AppState } from '../../types';
import { SAMPLE_DETAILS } from '../../constants';
import { M3CollapsibleCard, M3Select, M3TextInput, M3Switch, M3Slider, M3SegmentedButton } from '../M3Components';
import { BaseControlCardProps } from './types';

export interface StatusDetailCardProps extends BaseControlCardProps {
    isLabMode?: boolean;
}

export const StatusDetailCard: React.FC<StatusDetailCardProps> = ({ 
    state, 
    updateState, 
    isLabMode,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    isDragging,
    isDragOver,
    dropPosition
}) => {
    const loader = state.loader;

    const statusPresets = [
        { label: 'Thinking...', value: 'Thinking...' },
        { label: 'Analyzing request...', value: 'Analyzing request...' },
        { label: 'Scanning files...', value: 'Scanning files...' },
        { label: 'Generating response...', value: 'Generating response...' },
        ...(isLabMode ? [{ label: 'Synthesizing research...', value: 'Synthesizing research...' }] : [])
    ];

    const [selectedPresetVal, setSelectedPresetVal] = useState<string>(() => {
        return statusPresets.some(p => p.value === loader.statusText) ? loader.statusText : 'custom';
    });

    const updateLoader = (updates: Partial<AppState['loader']>) => {
        updateState({
            preset: 'custom',
            loader: {
                ...loader,
                ...updates
            }
        });
    };

    const handleStatusPresetChange = (val: string) => {
        setSelectedPresetVal(val);
        if (val !== 'custom') {
            updateLoader({ statusText: val });
        }
    };

    const handleRandomizeDetails = () => {
        const shuffled = [...SAMPLE_DETAILS].sort(() => Math.random() - 0.5);
        updateLoader({
            detailItems: shuffled,
            statusDetailTitle: shuffled[0].title,
            statusDetailBody: shuffled[0].body
        });
    };

    // Keep preset value in sync if statusText changes externally (e.g. from DesignGrid selector)
    const currentPreset = statusPresets.some(p => p.value === loader.statusText)
        ? loader.statusText
        : 'custom';

    return (
        <M3CollapsibleCard 
            title="Status & Detail" 
            icon="chat"
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            isDragging={isDragging}
            isDragOver={isDragOver}
            dropPosition={dropPosition}
        >
            <M3Select
                label="Preset Status"
                value={currentPreset}
                onChange={handleStatusPresetChange}
                options={[
                    ...statusPresets,
                    { label: 'Custom text...', value: 'custom' }
                ]}
            />

            {currentPreset === 'custom' && (
                <M3TextInput
                    label="Custom Status String"
                    value={loader.statusText}
                    onChange={(text) => updateLoader({ statusText: text })}
                />
            )}

            <div className="pt-1 space-y-1">
                <M3Switch
                    label="Expanded Explanation"
                    checked={loader.isExpanded}
                    onChange={(expanded) => updateLoader({ isExpanded: expanded })}
                />
                <M3Switch
                    label="Pixel Drift Status Title"
                    checked={loader.statusTextEffect === 'pixel_drift'}
                    onChange={(checked) => updateLoader({ statusTextEffect: checked ? 'pixel_drift' : 'none' })}
                />
            </div>

            {loader.isExpanded && (
                <div className="flex flex-col gap-4 pt-1">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-[var(--on-surface-variant)]">
                            Explanation Style
                        </label>
                        <M3SegmentedButton
                            options={[
                                { label: 'Standard', value: 'default' },
                                { label: 'Carousel Stack', value: 'carousel_stack' },
                                { label: 'Title List', value: 'title_list' },
                                { label: 'Aurora List', value: 'title_list_aurora' },
                                { label: 'Determinate List', value: 'title_list_determinate' },
                                { label: 'Determinate Aurora', value: 'title_list_determinate_aurora' },
                                { label: 'Neural List', value: 'title_list_neural' },
                                { label: 'Determinate Neural', value: 'title_list_determinate_neural' },
                            ]}
                            value={loader.expandedStyle || ((loader.carouselMode) ? 'carousel_stack' : 'default')}
                            onChange={(val) => updateLoader({
                                expandedStyle: val as any,
                                carouselMode: val === 'carousel_stack',
                                showStepper: (val === 'carousel_stack' || val === 'title_list' || val === 'title_list_aurora' || val === 'title_list_neural' || val === 'title_list_determinate' || val === 'title_list_determinate_aurora' || val === 'title_list_determinate_neural' || val === 'title_list_neural_particles' || val === 'title_list_determinate_neural_particles') ? false : loader.showStepper
                            })}
                        />
                    </div>

                    <M3Slider
                        label="Detail paragraphs count"
                        value={loader.detailItemCount || 1}
                        min={1}
                        max={4}
                        step={1}
                        onChange={(count) => updateLoader({ detailItemCount: count })}
                    />

                    <div className="flex items-center justify-between pt-1">
                        <label className="text-xs font-medium text-[var(--on-surface-variant)]">
                            Detail Content
                        </label>
                        <button
                            type="button"
                            onClick={handleRandomizeDetails}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--primary-container)] text-[var(--on-primary-container)] text-xs font-medium hover:opacity-90 transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
                            Randomize
                        </button>
                    </div>

                    {(() => {
                        const count = loader.detailItemCount || 1;
                        const items = (loader.detailItems && loader.detailItems.length > 0)
                            ? loader.detailItems
                            : SAMPLE_DETAILS;

                        return Array.from({ length: count }).map((_, idx) => {
                            const currentItem = items[idx] || SAMPLE_DETAILS[idx % SAMPLE_DETAILS.length];
                            return (
                                <div key={idx} className="flex flex-col gap-3 p-3 rounded-[12px] bg-[var(--surface-container)] border border-[var(--outline-variant)]/30">
                                    <div className="text-[11px] font-mono font-semibold text-[var(--primary)]">
                                        Detail Item #{idx + 1}
                                    </div>

                                    <M3TextInput
                                        label="Detail Title"
                                        value={currentItem.title}
                                        onChange={(title) => {
                                            const base = (loader.detailItems && loader.detailItems.length > 0) ? loader.detailItems : SAMPLE_DETAILS;
                                            const updated = Array.from({ length: Math.max(count, base.length) }, (_, i) => base[i] || SAMPLE_DETAILS[i % SAMPLE_DETAILS.length]);
                                            updated[idx] = { ...currentItem, title };
                                            updateLoader({
                                                detailItems: updated,
                                                statusDetailTitle: idx === 0 ? title : loader.statusDetailTitle
                                            });
                                        }}
                                    />

                                    <div className="relative group">
                                        <div className="absolute -top-2 left-3 bg-[var(--surface-container-high)] px-1 z-10">
                                            <span className="text-[11px] font-medium text-[var(--primary)]">Detail Paragraph</span>
                                        </div>
                                        <textarea
                                            value={currentItem.body}
                                            onChange={(e) => {
                                                const base = (loader.detailItems && loader.detailItems.length > 0) ? loader.detailItems : SAMPLE_DETAILS;
                                                const updated = Array.from({ length: Math.max(count, base.length) }, (_, i) => base[i] || SAMPLE_DETAILS[i % SAMPLE_DETAILS.length]);
                                                updated[idx] = { ...currentItem, body: e.target.value };
                                                updateLoader({
                                                    detailItems: updated,
                                                    statusDetailBody: idx === 0 ? e.target.value : loader.statusDetailBody
                                                });
                                            }}
                                            rows={3}
                                            className="w-full rounded-[8px] border border-[var(--outline-variant)] hover:border-[var(--on-surface)] focus:border-2 focus:border-[var(--primary)] bg-transparent p-3 text-[13px] text-[var(--on-surface)] outline-none transition-all resize-none font-sans"
                                        />
                                    </div>
                                </div>
                            );
                        });
                    })()}
                </div>
            )}
        </M3CollapsibleCard>
    );
};
