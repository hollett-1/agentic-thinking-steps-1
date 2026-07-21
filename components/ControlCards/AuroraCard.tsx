import React from 'react';
import { AppState } from '../../types';
import { M3CollapsibleCard, M3Switch, M3Select, M3Slider, M3SliderWithPlay } from '../M3Components';
import { BaseControlCardProps } from './types';

export interface AuroraCardProps extends BaseControlCardProps {}

export const AuroraCard: React.FC<AuroraCardProps> = ({ 
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

    // Determine target states with mutual exclusivity
    let isLeadingActive = false;
    let isTitleActive = false;
    let isExplanationActive = false;

    if (loader.auroraOnLeadingLoader === true) {
        isLeadingActive = true;
    } else if (loader.auroraOnTitleRow === true) {
        isTitleActive = true;
    } else if (loader.auroraOnExplanationItems === true) {
        isExplanationActive = true;
    } else if (loader.auroraOnLeadingLoader !== false && loader.auroraOnTitleRow !== false && loader.auroraOnExplanationItems !== false) {
        // Fallback for legacy preset states where explicit target booleans aren't saved yet
        if (loader.auroraOnLeadingLoader) {
            isLeadingActive = true;
        } else if (loader.auroraOnTitleRow || loader.auroraGlowOnTopTitle) {
            isTitleActive = true;
        } else if (loader.auroraOnExplanationItems || loader.expandedStyle === 'title_list_aurora' || loader.expandedStyle === 'title_list_determinate_aurora') {
            isExplanationActive = true;
        }
    }

    const anyTargetActive = isLeadingActive || isTitleActive || isExplanationActive;

    const handleTargetToggle = (target: 'leading' | 'title' | 'explanation', checked: boolean) => {
        if (!checked) {
            // Turning off the active target -> set all targets to false
            const newStyle = loader.expandedStyle === 'title_list_determinate_aurora' ? 'title_list_determinate' :
                             (loader.expandedStyle === 'title_list_aurora' ? 'title_list' : loader.expandedStyle);
            updateLoader({
                auroraOnLeadingLoader: false,
                auroraOnTitleRow: false,
                auroraGlowOnTopTitle: false,
                auroraOnExplanationItems: false,
                expandedStyle: newStyle,
            });
        } else {
            // Turning on selected target -> turn off all other targets
            let newStyle = loader.expandedStyle;
            if (target === 'explanation') {
                newStyle = (loader.expandedStyle === 'title_list_determinate' || loader.expandedStyle === 'title_list_determinate_neural' || loader.expandedStyle === 'title_list_determinate_neural_particles') 
                    ? 'title_list_determinate_aurora' 
                    : 'title_list_aurora';
            } else if (loader.expandedStyle === 'title_list_aurora' || loader.expandedStyle === 'title_list_determinate_aurora') {
                newStyle = loader.expandedStyle === 'title_list_determinate_aurora' ? 'title_list_determinate' : 'title_list';
            }

            updateLoader({
                auroraOnLeadingLoader: target === 'leading',
                auroraOnTitleRow: target === 'title',
                auroraGlowOnTopTitle: target === 'title',
                auroraOnExplanationItems: target === 'explanation',
                expandedStyle: newStyle,
                auroraGlowPosition: loader.auroraGlowPosition && loader.auroraGlowPosition !== 'border_halo' ? loader.auroraGlowPosition : 'border_halo',
            });
        }
    };

    const positionOptions = [
        { label: 'Border Halo (Breathing)', value: 'border_halo' },
        { label: 'Swipe In & Out Oscillating', value: 'swipe_in_out' },
        { label: 'Pulsing Wave Sweep', value: 'pulse_sweep' },
        { label: 'Orbit Clockwise Orbs', value: 'orbit_clockwise' }
    ];

    const colorOptions = [
        { label: 'Blue / Cyan Aurora', value: 'blue_aurora' },
        { label: 'Magenta / Pink Aurora', value: 'violet_aurora' },
        { label: 'Emerald / Green Aurora', value: 'emerald_aurora' }
    ];

    const blendModeOptions = [
        { label: 'Plus Lighter (Additive)', value: 'plus-lighter' },
        { label: 'Screen (Luminous)', value: 'screen' },
        { label: 'Overlay (Vibrant)', value: 'overlay' },
        { label: 'Normal (Standard)', value: 'normal' }
    ];

    return (
        <M3CollapsibleCard 
            title="Aurora Effect" 
            icon="blur_circular"
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            isDragging={isDragging}
            isDragOver={isDragOver}
            dropPosition={dropPosition}
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <M3Switch
                        label="Leading Loader"
                        checked={isLeadingActive}
                        onChange={(checked) => handleTargetToggle('leading', checked)}
                    />

                    <M3Switch
                        label="Entire Title Row"
                        checked={isTitleActive}
                        onChange={(checked) => handleTargetToggle('title', checked)}
                    />

                    <M3Switch
                        label="Explanation Items"
                        checked={isExplanationActive}
                        onChange={(checked) => handleTargetToggle('explanation', checked)}
                    />
                </div>

                {anyTargetActive && (
                    <div className="pt-3 border-t border-[var(--outline-variant)]/40 flex flex-col gap-4">
                        <M3Select
                            label="Glow Position & Behavior"
                            value={loader.auroraGlowPosition ?? 'border_halo'}
                            onChange={(val) => updateLoader({ auroraGlowPosition: val as any })}
                            options={positionOptions}
                        />

                        <M3Select
                            label="Glow Color Palette"
                            value={loader.auroraGlowColors ?? 'blue_aurora'}
                            onChange={(val) => updateLoader({ auroraGlowColors: val as any })}
                            options={colorOptions}
                        />

                        <M3SliderWithPlay
                            label="Wave Swipe Position / Phase"
                            min={0}
                            max={100}
                            step={1}
                            value={loader.auroraWaveOffset ?? 50}
                            isPlaying={loader.auroraWaveAutoPlay ?? false}
                            onTogglePlay={() => updateLoader({ auroraWaveAutoPlay: !(loader.auroraWaveAutoPlay ?? false) })}
                            valueLabel={
                                (loader.auroraWaveOffset ?? 50) <= 5 ? 'Out Left' :
                                (loader.auroraWaveOffset ?? 50) >= 95 ? 'Out Right' :
                                `${loader.auroraWaveOffset ?? 50}%`
                            }
                            onChange={(val) => updateLoader({ auroraWaveOffset: val })}
                        />

                        <M3Slider
                            label="Glow Radius / Spread"
                            min={0}
                            max={80}
                            step={1}
                            value={loader.auroraGlowRadius ?? 14}
                            valueLabel={`${loader.auroraGlowRadius ?? 14}px`}
                            onChange={(val) => updateLoader({ auroraGlowRadius: val })}
                        />

                        <M3Slider
                            label="Glow Blur"
                            min={0}
                            max={80}
                            step={1}
                            value={loader.auroraGlowBlur ?? 20}
                            valueLabel={`${loader.auroraGlowBlur ?? 20}px`}
                            onChange={(val) => updateLoader({ auroraGlowBlur: val })}
                        />

                        <M3Slider
                            label="Glow Opacity"
                            min={0}
                            max={1}
                            step={0.05}
                            value={loader.auroraGlowOpacity ?? 0.85}
                            valueLabel={`${Math.round((loader.auroraGlowOpacity ?? 0.85) * 100)}%`}
                            onChange={(val) => updateLoader({ auroraGlowOpacity: val })}
                        />

                        <div className="pt-2 border-t border-[var(--outline-variant)]/40 flex flex-col gap-4">
                            <M3Switch
                                label="Enable White Text Glow & Blend Mode"
                                checked={loader.textGlowEnabled ?? (state.preset === 'labs_neural_glow_layer')}
                                onChange={(checked) => updateLoader({ textGlowEnabled: checked })}
                            />

                            {(loader.textGlowEnabled ?? (state.preset === 'labs_neural_glow_layer')) && (
                                <>
                                    <M3Select
                                        label="Text Blend Mode"
                                        value={loader.textBlendMode ?? 'plus-lighter'}
                                        onChange={(val) => updateLoader({ textBlendMode: val as any })}
                                        options={blendModeOptions}
                                    />

                                    <M3Slider
                                        label="Text Glow Blur / Spread"
                                        min={0}
                                        max={40}
                                        step={1}
                                        value={loader.textGlowBlur ?? 16}
                                        valueLabel={`${loader.textGlowBlur ?? 16}px`}
                                        onChange={(val) => updateLoader({ textGlowBlur: val })}
                                    />

                                    <M3Slider
                                        label="Text Glow Opacity"
                                        min={0}
                                        max={1}
                                        step={0.05}
                                        value={loader.textGlowOpacity ?? 0.9}
                                        valueLabel={`${Math.round((loader.textGlowOpacity ?? 0.9) * 100)}%`}
                                        onChange={(val) => updateLoader({ textGlowOpacity: val })}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </M3CollapsibleCard>
    );
};
