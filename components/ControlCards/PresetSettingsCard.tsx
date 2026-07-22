import React from 'react';
import { AppState } from '../../types';
import { M3CollapsibleCard, M3Slider, M3Switch } from '../M3Components';
import { BaseControlCardProps } from './types';

export interface PresetSettingsCardProps extends BaseControlCardProps {}

export const PresetSettingsCard: React.FC<PresetSettingsCardProps> = ({ 
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
    const isFlat2D = loader.expandedStyle === 'product_orbit_flat' || state.preset === 'labs_product_orbit_flat';

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
            title="Preset Settings" 
            icon="motion_photos_on"
            defaultExpanded={true}
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
                    label="Stepped & Eased Motion"
                    checked={loader.orbitSteppedMotion !== false}
                    onChange={(checked) => updateLoader({ orbitSteppedMotion: checked })}
                />

                <M3Switch
                    label="Product Icon Containment"
                    checked={loader.orbitIconContainment !== false}
                    onChange={(checked) => updateLoader({ orbitIconContainment: checked })}
                />

                {!isFlat2D && (
                    <>
                        <M3Switch
                            label="Spiral Orbit Motion"
                            checked={loader.orbitSpiralParticles !== false}
                            onChange={(checked) => updateLoader({ 
                                orbitSpiralParticles: checked,
                                orbitRandomZSpace: !checked 
                            })}
                        />

                        <M3Switch
                            label="Random Z-Space Distribution"
                            checked={loader.orbitRandomZSpace ?? false}
                            onChange={(checked) => updateLoader({ 
                                orbitRandomZSpace: checked,
                                orbitSpiralParticles: !checked 
                            })}
                        />
                    </>
                )}

                <div className="pt-1">
                    <M3Slider
                        label="Number of Particles"
                        min={0}
                        max={100}
                        step={5}
                        value={loader.orbitStarCount ?? 35}
                        valueLabel={`${loader.orbitStarCount ?? 35}`}
                        onChange={(val) => updateLoader({ orbitStarCount: val })}
                    />
                </div>

                <div className="pt-1">
                    <M3Slider
                        label="Particle Diameter"
                        min={1.0}
                        max={8.0}
                        step={0.5}
                        value={loader.orbitParticleDiameter ?? 3.5}
                        valueLabel={`${(loader.orbitParticleDiameter ?? 3.5).toFixed(1)}px`}
                        onChange={(val) => updateLoader({ orbitParticleDiameter: Number(val.toFixed(1)) })}
                    />
                </div>

                <div className="pt-1">
                    <M3Slider
                        label="Speed of Rotation"
                        min={0.2}
                        max={3.0}
                        step={0.1}
                        value={loader.orbitSpeed ?? 0.8}
                        valueLabel={`${(loader.orbitSpeed ?? 0.8).toFixed(1)}x`}
                        onChange={(val) => updateLoader({ orbitSpeed: Number(val.toFixed(1)) })}
                    />
                </div>

                {!isFlat2D && (
                    <div className="pt-1">
                        <M3Slider
                            label="Camera Tilt (Y-Axis)"
                            min={-60}
                            max={60}
                            step={5}
                            value={loader.orbitCameraPitch ?? 15}
                            valueLabel={`${loader.orbitCameraPitch ?? 15}°`}
                            onChange={(val) => updateLoader({ orbitCameraPitch: val })}
                        />
                    </div>
                )}
            </div>
        </M3CollapsibleCard>
    );
};
