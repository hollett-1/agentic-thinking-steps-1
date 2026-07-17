import React from 'react';
import { AppState } from '../../types';
import { M3CollapsibleCard, M3Switch, M3Select, M3Slider } from '../M3Components';
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

    const isAuroraActive = Boolean(
        loader.expandedStyle === 'title_list_aurora' ||
        loader.expandedStyle === 'title_list_determinate_aurora' ||
        state.preset === 'labs_neural_list' ||
        state.preset === 'labs_determinate_neural_list' ||
        state.preset === 'labs_neural_pixel_drift' ||
        loader.auroraGlowPosition === 'swipe_in_out' ||
        loader.auroraGlowPosition === 'pulse_sweep' ||
        loader.auroraGlowPosition === 'orbit_clockwise'
    );

    const handleToggleAurora = (checked: boolean) => {
        if (checked) {
            const newStyle = (loader.expandedStyle === 'title_list_determinate' || loader.expandedStyle === 'title_list_determinate_neural' || loader.expandedStyle === 'title_list_determinate_neural_particles') 
                ? 'title_list_determinate_aurora' 
                : 'title_list_aurora';
            updateLoader({
                expandedStyle: newStyle,
                auroraGlowPosition: loader.auroraGlowPosition && loader.auroraGlowPosition !== 'border_halo' ? loader.auroraGlowPosition : 'border_halo',
            });
        } else {
            const newStyle = loader.expandedStyle === 'title_list_determinate_aurora' ? 'title_list_determinate' : 
                             (loader.expandedStyle === 'title_list_aurora' ? 'title_list' : loader.expandedStyle);
            updateLoader({
                expandedStyle: newStyle,
                auroraGlowPosition: undefined,
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
                <M3Switch
                    label="Enable Aurora Gradient Effect"
                    checked={isAuroraActive}
                    onChange={handleToggleAurora}
                />

                {isAuroraActive && (
                    <>
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

                        <M3Slider
                            label="Glow Radius / Spread"
                            min={0}
                            max={60}
                            step={1}
                            value={loader.auroraGlowRadius ?? 14}
                            valueLabel={`${loader.auroraGlowRadius ?? 14}px`}
                            onChange={(val) => updateLoader({ auroraGlowRadius: val })}
                        />

                        <M3Slider
                            label="Glow Blur"
                            min={0}
                            max={60}
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
                    </>
                )}
            </div>
        </M3CollapsibleCard>
    );
};
