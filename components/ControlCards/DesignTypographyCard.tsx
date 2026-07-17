import React from 'react';
import { AppState } from '../../types';
import { M3CollapsibleCard, M3Switch, M3SegmentedButton, M3Slider } from '../M3Components';
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

                <div className="flex flex-col gap-2 pt-2">
                    <label className="text-xs font-medium text-[var(--on-surface-variant)]">
                        Leading Indicator
                    </label>
                    <M3SegmentedButton
                        options={[
                            { label: 'Spark', value: 'spark' },
                            { label: 'Dots', value: 'dots' },
                        ]}
                        value={(loader.loaderIconType === 'glowing_dots' || !loader.loaderIconType) ? 'spark' : loader.loaderIconType}
                        onChange={(val) => updateLoader({ loaderIconType: val as 'spark' | 'dots' })}
                    />
                </div>

                <div className="pt-2">
                    {(() => {
                        const ruleMap: Record<string, number> = { 'none': 0, 'dashed': 1, 'solid': 2, 'squiggly': 3 };
                        const numToRule: Record<number, 'none' | 'dashed' | 'solid' | 'squiggly'> = { 0: 'none', 1: 'dashed', 2: 'solid', 3: 'squiggly' };
                        const labelMap: Record<number, string> = { 0: 'No Rule', 1: 'Dashed', 2: 'Outline', 3: 'Expressive' };
                        const currentVal = ruleMap[loader.ruleVariant || 'dashed'] ?? 1;

                        return (
                            <M3Slider
                                label="Rule"
                                min={0}
                                max={3}
                                step={1}
                                value={currentVal}
                                valueLabel={labelMap[currentVal]}
                                onChange={(val) => updateLoader({ ruleVariant: numToRule[val] || 'dashed' })}
                            />
                        );
                    })()}
                </div>

                {/* Spacing & Layout Slider Section */}
                <div className="flex flex-col gap-1 pt-2">
                    <span className="text-xs font-semibold text-[var(--primary)] uppercase tracking-wider">Spacing & Layout</span>
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
                </div>

                {/* Typography Section */}
                <div className="flex flex-col gap-4 pt-2">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-[var(--primary)] uppercase tracking-wider">Title Role (Headers)</span>
                        <div className="pt-2">
                            <M3Slider
                                label="Title Weight"
                                min={300}
                                max={800}
                                step={25}
                                value={loader.titleWeight ?? 600}
                                onChange={(val) => updateLoader({ titleWeight: val })}
                            />
                        </div>
                        <div className="pt-2">
                            <M3Slider
                                label="Title Width (Stretch)"
                                min={60}
                                max={140}
                                step={5}
                                value={loader.titleWidth ?? 100}
                                onChange={(val) => updateLoader({ titleWidth: val })}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 pt-2">
                        <span className="text-xs font-semibold text-[var(--primary)] uppercase tracking-wider">Body Role (Descriptions)</span>
                        <div className="pt-2">
                            <M3Slider
                                label="Body Weight"
                                min={300}
                                max={700}
                                step={25}
                                value={loader.bodyWeight ?? 400}
                                onChange={(val) => updateLoader({ bodyWeight: val })}
                            />
                        </div>
                        <div className="pt-2">
                            <M3Slider
                                label="Body Width (Stretch)"
                                min={60}
                                max={140}
                                step={5}
                                value={loader.bodyWidth ?? 100}
                                onChange={(val) => updateLoader({ bodyWidth: val })}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </M3CollapsibleCard>
    );
};
