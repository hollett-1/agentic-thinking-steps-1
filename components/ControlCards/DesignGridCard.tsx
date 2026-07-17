import React from 'react';
import { AppState } from '../../types';
import { SAMPLE_DETAILS } from '../../constants';
import { M3CollapsibleCard, M3GridSelector } from '../M3Components';
import { BaseControlCardProps } from './types';

export interface DesignGridCardProps extends BaseControlCardProps {}

export const DesignGridCard: React.FC<DesignGridCardProps> = ({ 
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
    const handleGridGranularityChange = (granularity: '2x2' | '3x3') => {
        updateState({ gridGranularity: granularity });
    };

    const handleGridSelect = (yKey: string, xKey: string) => {
        const cellKey = `${yKey}_${xKey}`;
        const loader = state.loader;

        let isExpanded = false;
        let detailItemCount = 1;
        let showStepper = false;
        let statusText = loader.statusText;
        let statusDetailTitle = loader.statusDetailTitle;
        let statusDetailBody = loader.statusDetailBody;

        if (yKey === 'stepper') {
            isExpanded = true;
            detailItemCount = 4;
            showStepper = true;
            statusText = 'Executing multi-step agentic workflow...';
            statusDetailTitle = SAMPLE_DETAILS[0].title;
            statusDetailBody = SAMPLE_DETAILS[0].body;
        } else if (yKey === 'more') {
            isExpanded = true;
            detailItemCount = 3;
            showStepper = false;
            statusText = 'Deep analysis across workspace & synthesizing insights...';
            statusDetailTitle = SAMPLE_DETAILS[1].title;
            statusDetailBody = SAMPLE_DETAILS[1].body;
        } else if (yKey === 'medium') {
            isExpanded = true;
            detailItemCount = 2;
            showStepper = false;
            statusText = 'Analyzing request & checking context...';
            statusDetailTitle = SAMPLE_DETAILS[0].title;
            statusDetailBody = SAMPLE_DETAILS[0].body;
        } else {
            // less
            isExpanded = false;
            detailItemCount = 1;
            showStepper = false;
            statusText = 'Thinking...';
            statusDetailTitle = SAMPLE_DETAILS[0].title;
            statusDetailBody = SAMPLE_DETAILS[0].body;
        }

        let loaderIconType = loader.loaderIconType;
        let hasContainment = false;
        let loaderVariant = loader.loaderVariant;
        let showBadges = loader.showBadges;
        let animateBadges = loader.animateBadges;
        let badgeCount = loader.badgeCount;
        let selectedProductIcons = loader.selectedProductIcons;

        if (xKey === 'gm3') {
            loaderIconType = 'spark';
            hasContainment = false;
            loaderVariant = 'default';
            showBadges = false;
        } else if (xKey === 'hybrid') {
            loaderIconType = 'dots';
            hasContainment = false;
            loaderVariant = 'with_badges';
            showBadges = true;
            animateBadges = true;
            badgeCount = '4+';
            selectedProductIcons = ['gmail', 'docs', 'sheets', 'drive', 'calendar'];
        } else {
            // luminous (no glowing in luminous)
            loaderIconType = 'dots';
            hasContainment = false;
            loaderVariant = 'with_badges';
            showBadges = true;
            animateBadges = false;
            badgeCount = '3';
        }

        const newLoader = {
            ...loader,
            isExpanded,
            showStepper,
            detailItemCount,
            statusText,
            statusDetailTitle,
            statusDetailBody,
            loaderIconType,
            hasContainment,
            loaderVariant,
            showBadges,
            animateBadges,
            badgeCount,
            selectedProductIcons
        };

        updateState({
            preset: 'custom',
            gridSelection: cellKey,
            loader: newLoader
        });
    };

    return (
        <M3CollapsibleCard 
            title="Design Grid" 
            icon="grid_view"
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            isDragging={isDragging}
            isDragOver={isDragOver}
            dropPosition={dropPosition}
        >
            <M3GridSelector
                granularity={state.gridGranularity || '3x3'}
                onGranularityChange={handleGridGranularityChange}
                selectedKey={state.gridSelection || ''}
                onSelect={handleGridSelect}
            />
        </M3CollapsibleCard>
    );
};
