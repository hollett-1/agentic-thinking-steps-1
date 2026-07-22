import React from 'react';
import { AppState } from '../../types';
import { LOADER_PRESETS, LABS_DEFAULT_STATE, LABS_CAROUSEL_STATE, LABS_LIST_STATE, LABS_THINKING_DOTS_STATE, LABS_NEURAL_LIST_STATE, LABS_DETERMINATE_LIST_STATE, LABS_DETERMINATE_NEURAL_LIST_STATE, LABS_NEURAL_PIXEL_DRIFT_STATE, LABS_NEURAL_AURORA_PARTICLES_STATE, LABS_NEURAL_GLOW_LAYER_STATE, LABS_NEURAL_MESH_SHEET_STATE, LABS_AURORA_NEURAL_WAVE_POOL_STATE, LABS_PRODUCT_ORBIT_SUCTION_STATE, LABS_PRODUCT_ORBIT_FLAT_STATE } from '../../presets';
import { M3CollapsibleCard, M3Select } from '../M3Components';
import { BaseControlCardProps } from './types';

export interface PresetsCardProps extends BaseControlCardProps {
    isLabMode?: boolean;
}

export const PresetsCard: React.FC<PresetsCardProps> = ({ 
    state, 
    updateState, 
    isLabMode,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    isDragging,
    isDragOver,
    dropPosition
}) => {
    const handlePresetChangeConfig = (key: string) => {
        if (key === 'custom') {
            updateState({ preset: 'custom' });
        } else if (isLabMode && key === 'labs_default') {
            updateState(LABS_DEFAULT_STATE);
        } else if (isLabMode && key === 'labs_carousel') {
            updateState(LABS_CAROUSEL_STATE);
        } else if (isLabMode && key === 'labs_title_list') {
            updateState(LABS_LIST_STATE);
        } else if (isLabMode && key === 'labs_thinking_dots') {
            updateState(LABS_THINKING_DOTS_STATE);
        } else if (isLabMode && key === 'labs_neural_list') {
            updateState(LABS_NEURAL_LIST_STATE);
        } else if (isLabMode && key === 'labs_determinate_list') {
            updateState(LABS_DETERMINATE_LIST_STATE);
        } else if (isLabMode && key === 'labs_determinate_neural_list') {
            updateState(LABS_DETERMINATE_NEURAL_LIST_STATE);
        } else if (isLabMode && key === 'labs_neural_pixel_drift') {
            updateState(LABS_NEURAL_PIXEL_DRIFT_STATE);
        } else if (isLabMode && key === 'labs_neural_aurora_particles') {
            updateState(LABS_NEURAL_AURORA_PARTICLES_STATE);
        } else if (isLabMode && key === 'labs_neural_glow_layer') {
            updateState(LABS_NEURAL_GLOW_LAYER_STATE);
        } else if (isLabMode && key === 'labs_neural_mesh_sheet') {
            updateState(LABS_NEURAL_MESH_SHEET_STATE);
        } else if (isLabMode && key === 'labs_aurora_neural_wave_pool') {
            const standardTitles = ['Thinking...', 'Analyzing request...', 'Scanning files...', 'Generating response...', 'Synthesizing research...'];
            const randomTitle = standardTitles[Math.floor(Math.random() * standardTitles.length)];
            updateState({
                ...LABS_AURORA_NEURAL_WAVE_POOL_STATE,
                loader: {
                    ...LABS_AURORA_NEURAL_WAVE_POOL_STATE.loader,
                    statusText: randomTitle
                }
            });
        } else if (isLabMode && key === 'labs_product_orbit_suction') {
            updateState(LABS_PRODUCT_ORBIT_SUCTION_STATE);
        } else if (isLabMode && key === 'labs_product_orbit_flat') {
            updateState(LABS_PRODUCT_ORBIT_FLAT_STATE);
        } else if (!isLabMode && LOADER_PRESETS[key]) {
            const presetConfig = LOADER_PRESETS[key].config;
            const newLoader = {
                ...state.loader,
                ...(presetConfig.loader || {})
            };
            updateState({
                preset: key,
                mode: presetConfig.mode ?? state.mode,
                loader: newLoader
            });
        }
    };

    const options = isLabMode
        ? [
              { label: '1. Indeterminate (Simple)', value: 'labs_title_list' },
              { label: '2. Indeterminate (Aurora)', value: 'labs_neural_list' },
              { label: '3. Determinate (Simple)', value: 'labs_determinate_list' },
              { label: '4. Determinate (Aurora)', value: 'labs_determinate_neural_list' },
              { label: '5. Indeterminate (Aurora + Pixel Drift)', value: 'labs_neural_pixel_drift' },
              { label: '6. Indeterminate (Neural)', value: 'labs_neural_aurora_particles' },
              { label: '7. Indeterminate (Neural + Glow Layer)', value: 'labs_neural_glow_layer' },
              { label: '8. Indeterminate (Neural Mesh Surface / Sheet)', value: 'labs_neural_mesh_sheet' },
              { label: '9. Indeterminate (Aurora & Neural Wave Pool Swipe)', value: 'labs_aurora_neural_wave_pool' },
              { label: '10. Indeterminate (Product Icons Orbit & Suction)', value: 'labs_product_orbit_suction' },
              { label: '11. Indeterminate (Product Icons 2D Flat Orbit)', value: 'labs_product_orbit_flat' },
              { label: 'Custom configuration', value: 'custom' }
          ]
        : [
              ...Object.entries(LOADER_PRESETS).map(([key, preset]) => ({
                  label: preset.label,
                  value: key
              })),
              { label: 'Custom configuration', value: 'custom' }
          ];

    const currentValue = state.preset || (isLabMode ? 'labs_title_list' : 'default_spark');

    return (
        <M3CollapsibleCard 
            title="Presets" 
            icon="tune" 
            defaultExpanded={true}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            isDragging={isDragging}
            isDragOver={isDragOver}
            dropPosition={dropPosition}
        >
            <M3Select
                label={isLabMode ? "Select Labs Configuration" : "Select Configuration"}
                value={currentValue}
                onChange={handlePresetChangeConfig}
                options={options}
            />
        </M3CollapsibleCard>
    );
};
