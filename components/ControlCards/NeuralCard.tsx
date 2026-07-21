import React from 'react';
import { AppState } from '../../types';
import { M3CollapsibleCard, M3Switch, M3Slider, M3Select, M3SliderWithPlay } from '../M3Components';
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
        state.preset === 'labs_neural_glow_layer' ||
        state.preset === 'labs_neural_mesh_sheet' ||
        state.preset === 'labs_aurora_neural_wave_pool' ||
        loader.auroraParticlesOnDetailLines === true ||
        loader.auroraParticlesOnTopTitle === true
    );

    const isSheetMesh = loader.neuralMeshStyle === 'sheet_mesh' || state.preset === 'labs_neural_mesh_sheet';

    const handleToggleNeural = (checked: boolean) => {
        if (checked) {
            const newStyle = loader.expandedStyle === 'title_list_determinate' ? 'title_list_determinate_neural' : 'title_list_neural';
            updateLoader({
                expandedStyle: newStyle,
                auroraParticlesOnDetailLines: true,
                auroraParticlesOnTopTitle: state.preset === 'labs_neural_glow_layer' || state.preset === 'labs_neural_mesh_sheet' || state.preset === 'labs_aurora_neural_wave_pool' || !loader.isExpanded ? true : loader.auroraParticlesOnTopTitle
            });
        } else {
            const newStyle = (loader.expandedStyle === 'title_list_neural' || loader.expandedStyle === 'title_list_neural_particles') ? 'title_list' :
                             (loader.expandedStyle === 'title_list_determinate_neural' || loader.expandedStyle === 'title_list_determinate_neural_particles') ? 'title_list_determinate' : loader.expandedStyle;
            updateLoader({
                expandedStyle: newStyle,
                auroraParticlesOnDetailLines: false,
                auroraParticlesOnTopTitle: false
            });
        }
    };

    const meshStyleOptions = [
        { label: 'Floating Constellation (Particles)', value: 'particles' },
        { label: '3D Waving Surface (Sheet / Blanket)', value: 'sheet_mesh' }
    ];

    const particleShapeOptions = [
        { label: 'Circle (Standard Dot)', value: 'circle' },
        { label: 'Gemini Spark (4-Point Star)', value: 'gemini_spark' }
    ];

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
                        <M3Select
                            label="Neural Mesh Style"
                            value={isSheetMesh ? 'sheet_mesh' : 'particles'}
                            onChange={(val) => updateLoader({ neuralMeshStyle: val as any })}
                            options={meshStyleOptions}
                        />

                        <M3Select
                            label="Particle Shape"
                            value={loader.particleShape ?? 'circle'}
                            onChange={(val) => updateLoader({ particleShape: val as any })}
                            options={particleShapeOptions}
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
                            label="Grid Density / Spacing"
                            min={2}
                            max={40}
                            step={1}
                            value={loader.auroraParticleDensity ?? 5}
                            valueLabel={`${loader.auroraParticleDensity ?? 5}`}
                            onChange={(val) => updateLoader({ auroraParticleDensity: val })}
                        />

                        <M3Slider
                            label="Wave Animation Speed"
                            min={0.1}
                            max={3.0}
                            step={0.1}
                            value={loader.sheetWaveSpeed ?? loader.auroraParticleSpeed ?? 1.8}
                            valueLabel={`${(loader.sheetWaveSpeed ?? loader.auroraParticleSpeed ?? 1.8).toFixed(1)}x`}
                            onChange={(val) => updateLoader({ sheetWaveSpeed: val, auroraParticleSpeed: val })}
                        />

                        {isSheetMesh ? (
                            <>
                                <M3Slider
                                    label="3D Surface Wave Depth"
                                    min={5}
                                    max={50}
                                    step={1}
                                    value={loader.sheetWaveAmplitude ?? 25}
                                    valueLabel={`${loader.sheetWaveAmplitude ?? 25}px`}
                                    onChange={(val) => updateLoader({ sheetWaveAmplitude: val })}
                                />

                                <M3Slider
                                    label="Wireframe Mesh Thread Opacity"
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    value={loader.sheetWireframeOpacity ?? 0.35}
                                    valueLabel={`${Math.round((loader.sheetWireframeOpacity ?? 0.35) * 100)}%`}
                                    onChange={(val) => updateLoader({ sheetWireframeOpacity: val })}
                                />
                            </>
                        ) : (
                            <M3Slider
                                label="Particle Size"
                                min={1.0}
                                max={5.0}
                                step={0.2}
                                value={loader.auroraParticleSize ?? 1.0}
                                valueLabel={`${(loader.auroraParticleSize ?? 1.0).toFixed(1)}px`}
                                onChange={(val) => updateLoader({ auroraParticleSize: val })}
                            />
                        )}
                    </>
                )}
            </div>
        </M3CollapsibleCard>
    );
};
