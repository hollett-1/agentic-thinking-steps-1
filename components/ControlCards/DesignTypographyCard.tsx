import React from 'react';
import { AppState } from '../../types';
import { M3CollapsibleCard, M3Switch, M3SegmentedButton, M3Slider, M3Select } from '../M3Components';
import { BaseControlCardProps } from './types';

export interface DesignTypographyCardProps extends BaseControlCardProps {}

export const DesignTypographyCard: React.FC<DesignTypographyCardProps> = ({ 
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
            title="Design & Typography" 
            icon="palette"
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            isDragging={isDragging}
            isDragOver={isDragOver}
            dropPosition={dropPosition}
        >
            <div className="flex flex-col gap-4">
                {/* Design Section */}
                <M3Switch
                    label="Overall Containment"
                    checked={loader.hasContainment}
                    onChange={(contained) => updateLoader({ hasContainment: contained })}
                />

                <div className="pt-2">
                    <M3Select
                        label="Leading Indicator"
                        value={loader.loaderIconType || 'spark'}
                        onChange={(val) => updateLoader({ loaderIconType: val as any })}
                        options={[
                            { label: 'Spark', value: 'spark' },
                            { label: 'Dots', value: 'dots' },
                            { label: 'Thinking Dots Processing Indicator', value: 'thinking_dots' },
                        ]}
                    />
                </div>

                <div className="pt-2">
                    <M3Slider
                        label="Distance to Details Lists"
                        min={0}
                        max={48}
                        step={2}
                        value={loader.detailListGap ?? 12}
                        valueLabel={`${loader.detailListGap ?? 12}px`}
                        onChange={(val) => updateLoader({ detailListGap: val })}
                    />
                </div>

                <div className="pt-2">
                    <M3Slider
                        label="List Density"
                        min={2}
                        max={24}
                        step={1}
                        value={loader.listDensity ?? 8}
                        valueLabel={`${loader.listDensity ?? 8}px`}
                        onChange={(val) => updateLoader({ listDensity: val })}
                    />
                </div>
            </div>
        </M3CollapsibleCard>
    );
};
