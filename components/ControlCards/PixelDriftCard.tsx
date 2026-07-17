import React from 'react';
import { AppState } from '../../types';
import { M3CollapsibleCard, M3Slider, M3Switch, M3Select } from '../M3Components';
import { BaseControlCardProps } from './types';

export interface PixelDriftCardProps extends BaseControlCardProps {}

export const PixelDriftCard: React.FC<PixelDriftCardProps> = ({ 
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
            title="Pixel Drift Effect" 
            icon="blur_on" 
            defaultExpanded={true}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            isDragging={isDragging}
            isDragOver={isDragOver}
            dropPosition={dropPosition}
        >
            <div className="space-y-4">
                <M3Switch
                    label="Fly-In Animation on Mount"
                    checked={loader.particleAnimateIn ?? false}
                    onChange={(animateIn) => updateLoader({ particleAnimateIn: animateIn })}
                />

                <M3Switch
                    label="Auto-Fit to Container Box"
                    checked={loader.particleAutoFit ?? false}
                    onChange={(autoFit) => updateLoader({ particleAutoFit: autoFit })}
                />

                <M3Select
                    label="Particle Color Palette"
                    value={loader.particleColorsPreset || 'monochrome'}
                    onChange={(val) => updateLoader({ particleColorsPreset: val as any })}
                    options={[
                        { label: 'Monochrome (Adaptive Theme)', value: 'monochrome' },
                        { label: 'Aurora (Vibrant Gradients)', value: 'aurora' },
                        { label: 'Cyber (Neon Cyan & Purple)', value: 'cyber' },
                        { label: 'Sunset (Warm Gold & Pink)', value: 'sunset' },
                        { label: 'Emerald (Mint & Green Glow)', value: 'emerald' }
                    ]}
                />

                <div className="pt-2 space-y-4">
                    <M3Slider
                        label="Particle Density (Count)"
                        min={20}
                        max={160}
                        step={10}
                        value={loader.particleCount ?? 70}
                        valueLabel={`${loader.particleCount ?? 70}`}
                        onChange={(val) => updateLoader({ particleCount: val })}
                    />

                    <M3Slider
                        label="Particle Dot Size"
                        min={4}
                        max={20}
                        step={1}
                        value={loader.particleSize ?? 9}
                        valueLabel={`${loader.particleSize ?? 9}px`}
                        onChange={(val) => updateLoader({ particleSize: val })}
                    />

                    <M3Slider
                        label="Hover Field Radius"
                        min={15}
                        max={120}
                        step={5}
                        value={loader.mouseRadius ?? 45}
                        valueLabel={`${loader.mouseRadius ?? 45}px`}
                        onChange={(val) => updateLoader({ mouseRadius: val })}
                    />

                    <M3Slider
                        label="Hover Repulsion Force"
                        min={1}
                        max={24}
                        step={1}
                        value={loader.mouseForce ?? 6}
                        valueLabel={`${loader.mouseForce ?? 6}`}
                        onChange={(val) => updateLoader({ mouseForce: val })}
                    />

                    <M3Slider
                        label="Title Base Font Size"
                        min={14}
                        max={32}
                        step={1}
                        value={loader.particleFontSize ?? 20}
                        valueLabel={`${loader.particleFontSize ?? 20}px`}
                        onChange={(val) => updateLoader({ particleFontSize: val })}
                    />
                </div>
            </div>
        </M3CollapsibleCard>
    );
};

