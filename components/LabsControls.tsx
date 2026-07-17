import React from 'react';
import { AppState } from '../types';
import { LABS_DEFAULT_STATE, LABS_CAROUSEL_STATE, LABS_LIST_STATE, LABS_NEURAL_LIST_STATE, LABS_DETERMINATE_LIST_STATE, LABS_DETERMINATE_NEURAL_LIST_STATE, LABS_NEURAL_PIXEL_DRIFT_STATE, LABS_NEURAL_AURORA_PARTICLES_STATE } from '../presets';
import { Controls, ControlsProps } from './Controls';

export { LABS_DEFAULT_STATE, LABS_CAROUSEL_STATE, LABS_LIST_STATE, LABS_NEURAL_LIST_STATE, LABS_DETERMINATE_LIST_STATE, LABS_DETERMINATE_NEURAL_LIST_STATE, LABS_NEURAL_PIXEL_DRIFT_STATE, LABS_NEURAL_AURORA_PARTICLES_STATE };


export interface LabsControlsProps extends ControlsProps {}

export const LabsControls: React.FC<LabsControlsProps> = (props) => {
    return <Controls {...props} isLabMode={true} />;
};
