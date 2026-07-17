import React from 'react';
import { AppState } from '../../types';

export interface BaseControlCardProps {
    state: AppState;
    updateState: (updates: Partial<AppState>) => void;
    onDragStart?: (e: React.DragEvent) => void;
    onDragOver?: (e: React.DragEvent) => void;
    onDrop?: (e: React.DragEvent) => void;
    onDragEnd?: (e: React.DragEvent) => void;
    isDragging?: boolean;
    isDragOver?: boolean;
    dropPosition?: 'top' | 'bottom' | null;
}
