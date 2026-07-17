import React from 'react';
import { AppState } from '../../types';
import { M3CollapsibleCard, M3Switch, M3SegmentedButton, M3Slider, M3Select } from '../M3Components';
import { BaseControlCardProps } from './types';

export interface StepperCardProps extends BaseControlCardProps {}

export const StepperCard: React.FC<StepperCardProps> = ({ 
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
            title="Stepper" 
            icon="linear_scale"
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            isDragging={isDragging}
            isDragOver={isDragOver}
            dropPosition={dropPosition}
        >
            <M3Switch
                label="Enable Stepper Mode"
                checked={loader.showStepper || loader.detailItemCount === 4}
                onChange={(checked) => updateLoader({
                    showStepper: checked,
                    isExpanded: checked ? true : loader.isExpanded,
                    detailItemCount: checked ? 4 : 3,
                    statusText: checked ? 'Executing multi-step agentic workflow...' : loader.statusText
                })}
            />

            <div className="flex flex-col gap-2 pt-2">
                <label className="text-xs font-medium text-[var(--on-surface-variant)]">
                    Indicator Style
                </label>
                <M3SegmentedButton
                    options={[
                        { label: 'Pills', value: 'pills' },
                        { label: 'Symbols', value: 'symbols' },
                        { label: 'Lines', value: 'lines' },
                    ]}
                    value={loader.stepperStyle || 'pills'}
                    onChange={(val) => updateLoader({
                        stepperStyle: val as 'pills' | 'symbols' | 'lines',
                        showStepperLines: (val === 'symbols' || val === 'lines') ? true : loader.showStepperLines
                    })}
                />
            </div>

            <div className="pt-2">
                <M3Switch
                    label="Show Connecting Lines"
                    checked={loader.showStepperLines !== undefined ? loader.showStepperLines : (loader.stepperStyle === 'symbols' || loader.stepperStyle === 'lines')}
                    onChange={(checked) => updateLoader({ showStepperLines: checked })}
                />
            </div>

            {loader.stepperStyle !== 'symbols' && (
                <div className="pt-2">
                    {(() => {
                        const pillVal = loader.stepperPillWidth ?? 4;
                        const pillLabels: Record<number, string> = {
                            1: '1px (Hairline)',
                            2: '2px (Thin)',
                            3: '4px (Slim)',
                            4: '6px (Medium)',
                            5: '10px (Thick)',
                            6: '14px (Wide)',
                        };
                        return (
                            <M3Slider
                                label={loader.stepperStyle === 'lines' ? "Line Width" : "Pills & Circles Width"}
                                min={1}
                                max={6}
                                step={1}
                                value={pillVal}
                                valueLabel={pillLabels[pillVal]}
                                onChange={(val) => updateLoader({ stepperPillWidth: val })}
                            />
                        );
                    })()}
                </div>
            )}

            {loader.stepperStyle === 'symbols' && (
                <>
                    <div className="flex flex-col gap-2 pt-2">
                        <M3Select
                            label="Step Icons Theme"
                            value={loader.stepperIconsPreset || 'workflow'}
                            onChange={(val) => {
                                const preset = val as 'workflow' | 'analysis' | 'dev';
                                const iconsMap: Record<'workflow' | 'analysis' | 'dev', string[]> = {
                                    workflow: ['description', 'filter_none', 'schedule', 'short_text'],
                                    analysis: ['search', 'insights', 'fact_check', 'task_alt'],
                                    dev: ['terminal', 'code', 'build', 'rocket_launch'],
                                };
                                updateLoader({ stepperIconsPreset: preset, stepperIcons: iconsMap[preset] });
                            }}
                            options={[
                                { label: 'Workflow (Docs, Tabs, Clock)', value: 'workflow' },
                                { label: 'Analysis (Search, Insights)', value: 'analysis' },
                                { label: 'Dev (Terminal, Code, Build)', value: 'dev' },
                            ]}
                        />
                    </div>

                    <div className="pt-2">
                        {(() => {
                            const symVal = loader.stepperSymbolSize ?? 2;
                            const symLabels: Record<number, string> = {
                                1: 'Small (300)',
                                2: 'Medium (400)',
                                3: 'Large (500)',
                                4: 'XL (600)'
                            };
                            return (
                                <M3Slider
                                    label="Symbols Size & Weight"
                                    min={1}
                                    max={4}
                                    step={1}
                                    value={symVal}
                                    valueLabel={symLabels[symVal]}
                                    onChange={(val) => updateLoader({ stepperSymbolSize: val })}
                                />
                            );
                        })()}
                    </div>
                </>
            )}
        </M3CollapsibleCard>
    );
};
