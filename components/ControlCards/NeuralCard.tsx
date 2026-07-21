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

    // Determine target states with mutual exclusivity
    let isLeadingActive = false;
    let isTitleActive = false;
    let isExplanationActive = false;

    if (loader.neuralOnLeadingLoader === true) {
        isLeadingActive = true;
    } else if (loader.neuralOnTitleRow === true) {
        isTitleActive = true;
    } else if (loader.neuralOnExplanationItems === true) {
        isExplanationActive = true;
    } else if (loader.neuralOnLeadingLoader !== false && loader.neuralOnTitleRow !== false && loader.neuralOnExplanationItems !== false) {
        // Fallback for legacy preset states where explicit target booleans aren't saved yet
        if (loader.auroraParticlesOnIcon && !loader.auroraParticlesOnTopTitle && !loader.auroraParticlesOnDetailLines) {
            isLeadingActive = true;
        } else if (loader.auroraParticlesOnTopTitle) {
            isTitleActive = true;
        } else if (loader.auroraParticlesOnDetailLines || loader.expandedStyle === 'title_list_neural' || loader.expandedStyle === 'title_list_determinate_neural' || loader.expandedStyle === 'title_list_neural_particles' || loader.expandedStyle === 'title_list_determinate_neural_particles') {
            isExplanationActive = true;
        }
    }

    const anyTargetActive = isLeadingActive || isTitleActive || isExplanationActive;
    const isSheetMesh = loader.neuralMeshStyle === 'sheet_mesh' || state.preset === 'labs_neural_mesh_sheet';

    const handleTargetToggle = (target: 'leading' | 'title' | 'explanation', checked: boolean) => {
        if (!checked) {
            // Turning off the active target -> turn off all targets
            const newStyle = (loader.expandedStyle === 'title_list_neural' || loader.expandedStyle === 'title_list_neural_particles') ? 'title_list' :
                             (loader.expandedStyle === 'title_list_determinate_neural' || loader.expandedStyle === 'title_list_determinate_neural_particles') ? 'title_list_determinate' : loader.expandedStyle;
            updateLoader({
                neuralOnLeadingLoader: false,
                auroraParticlesOnIcon: false,
                neuralOnTitleRow: false,
                auroraParticlesOnTopTitle: false,
                neuralOnExplanationItems: false,
                auroraParticlesOnDetailLines: false,
                expandedStyle: newStyle,
            });
        } else {
            // Turning on selected target -> turn off all other targets
            let newStyle = loader.expandedStyle;
            if (target === 'explanation') {
                newStyle = loader.expandedStyle === 'title_list_determinate' ? 'title_list_determinate_neural' : 'title_list_neural';
            } else if (loader.expandedStyle === 'title_list_neural' || loader.expandedStyle === 'title_list_determinate_neural') {
                newStyle = loader.expandedStyle === 'title_list_determinate_neural' ? 'title_list_determinate' : 'title_list';
            }

            updateLoader({
                neuralOnLeadingLoader: target === 'leading',
                auroraParticlesOnIcon: target === 'leading',
                neuralOnTitleRow: target === 'title',
                auroraParticlesOnTopTitle: target === 'title',
                neuralOnExplanationItems: target === 'explanation',
                auroraParticlesOnDetailLines: target === 'explanation',
                expandedStyle: newStyle,
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
                    </div>
                )}
            </div>
        </M3CollapsibleCard>
    );
};
