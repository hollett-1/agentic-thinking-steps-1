import React from 'react';
import { AppState } from '../../types';
import { M3CollapsibleCard, M3Switch, M3Slider } from '../M3Components';
import { BaseControlCardProps } from './types';

export interface NeuralCardProps extends BaseControlCardProps {}

export const NeuralCard: React.FC<NeuralCardProps> = ({ 
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

    const isNeuralActive = Boolean(
        loader.expandedStyle === 'title_list_neural' ||
        loader.expandedStyle === 'title_list_determinate_neural' ||
        loader.expandedStyle === 'title_list_neural_particles' ||
        loader.expandedStyle === 'title_list_determinate_neural_particles' ||
        state.preset === 'labs_neural_aurora_particles' ||
        loader.auroraParticlesOnDetailLines === true
    );

    const handleToggleNeural = (checked: boolean) => {
        if (checked) {
            const newStyle = loader.expandedStyle === 'title_list_determinate' ? 'title_list_determinate_neural' : 'title_list_neural';
            updateLoader({
                expandedStyle: newStyle,
                auroraParticlesOnDetailLines: true,
            });
        } else {
            const newStyle = (loader.expandedStyle === 'title_list_neural' || loader.expandedStyle === 'title_list_neural_particles') ? 'title_list' :
                             (loader.expandedStyle === 'title_list_determinate_neural' || loader.expandedStyle === 'title_list_determinate_neural_particles') ? 'title_list_determinate' : loader.expandedStyle;
            updateLoader({
                expandedStyle: newStyle,
                auroraParticlesOnDetailLines: false,
            });
        }
    };

    return (
        <M3CollapsibleCard 
            title="Neural Effect" 
            icon="hub"
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
                    label="Enable Neural Particle Mesh"
                    checked={isNeuralActive}
                    onChange={handleToggleNeural}
                />

                {isNeuralActive && (
                    <>
                        <M3Switch
                            label="Particles on Detail Lines"
                            checked={loader.auroraParticlesOnDetailLines ?? true}
                            onChange={(checked) => updateLoader({ auroraParticlesOnDetailLines: checked })}
                        />

                        <M3Switch
                            label="Particles around Icon"
                            checked={loader.auroraParticlesOnIcon ?? true}
                            onChange={(checked) => updateLoader({ auroraParticlesOnIcon: checked })}
                        />

                        <M3Slider
                            label="Particle Density"
                            min={5}
                            max={30}
                            step={1}
                            value={loader.auroraParticleDensity ?? 5}
                            valueLabel={`${loader.auroraParticleDensity ?? 5}`}
                            onChange={(val) => updateLoader({ auroraParticleDensity: val })}
                        />

                        <M3Slider
                            label="Particle Animation Speed"
                            min={0.1}
                            max={3.0}
                            step={0.1}
                            value={loader.auroraParticleSpeed ?? 2.0}
                            valueLabel={`${(loader.auroraParticleSpeed ?? 2.0).toFixed(1)}x`}
                            onChange={(val) => updateLoader({ auroraParticleSpeed: val })}
                        />

                        <M3Slider
                            label="Particle Size"
                            min={1.0}
                            max={5.0}
                            step={0.2}
                            value={loader.auroraParticleSize ?? 1.0}
                            valueLabel={`${(loader.auroraParticleSize ?? 1.0).toFixed(1)}px`}
                            onChange={(val) => updateLoader({ auroraParticleSize: val })}
                        />
                    </>
                )}
            </div>
        </M3CollapsibleCard>
    );
};
