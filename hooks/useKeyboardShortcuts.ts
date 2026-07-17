import { useEffect } from 'react';
import { AppState } from '../types';

export const useKeyboardShortcuts = (
    state: AppState, 
    updateState: (updates: Partial<AppState>) => void,
    toggleGui: () => void,
    handleExport: () => void,
    isMobile: boolean
) => {
  useEffect(() => {
    if (isMobile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;

        const key = e.key.toLowerCase();

        if (key === 'h' || key === 'c') {
            toggleGui();
        }

        if (key === 'e') {
            handleExport();
        }
        
        if (key === 'r') {
            updateState({ showMeasurements: !state.showMeasurements });
        }
        
        if (key === 'g') {
             updateState({ showGuidelines: !state.showGuidelines });
        }

        if (key === 's') {
            updateState({ showColorAnnotations: !state.showColorAnnotations });
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.showGuidelines, state.showMeasurements, state.showColorAnnotations, isMobile, updateState, toggleGui, handleExport]);
};