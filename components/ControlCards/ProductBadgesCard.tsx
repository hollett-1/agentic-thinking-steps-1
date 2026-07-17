import React from 'react';
import { AppState, BadgeCount, LoaderVariant, ProductIconType } from '../../types';
import { M3CollapsibleCard, M3SegmentedButton, M3Switch } from '../M3Components';
import { BaseControlCardProps } from './types';

export interface ProductBadgesCardProps extends BaseControlCardProps {}

export const ProductBadgesCard: React.FC<ProductBadgesCardProps> = ({ 
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

    const toggleProductIcon = (icon: ProductIconType) => {
        const current = loader.selectedProductIcons;
        const exists = current.includes(icon);
        const updated = exists 
            ? current.filter(i => i !== icon)
            : [...current, icon];
        updateLoader({ selectedProductIcons: updated });
    };

    const allProductIcons: { type: ProductIconType; label: string }[] = [
        { type: 'gmail', label: 'Gmail' },
        { type: 'docs', label: 'Docs' },
        { type: 'sheets', label: 'Sheets' },
        { type: 'drive', label: 'Drive' },
        { type: 'chat', label: 'Chat' },
        { type: 'calendar', label: 'Calendar' },
    ];

    return (
        <M3CollapsibleCard 
            title="Product Icon Badges" 
            icon="apps"
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            isDragging={isDragging}
            isDragOver={isDragOver}
            dropPosition={dropPosition}
        >
            <M3SegmentedButton
                options={[
                    { label: 'Default', value: 'default' },
                    { label: 'With Badges', value: 'with_badges' },
                ]}
                value={loader.loaderVariant}
                onChange={(val) => updateLoader({ loaderVariant: val as LoaderVariant, showBadges: val === 'with_badges' })}
            />

            {(loader.loaderVariant === 'with_badges' || (loader.showBadges && loader.loaderVariant !== 'default')) && (
                <div className="flex flex-col gap-4 pt-1">
                    <M3Switch
                        label="Include in Animation (Fade In/Out)"
                        checked={loader.animateBadges || false}
                        onChange={(animate) => updateLoader({ animateBadges: animate })}
                    />
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-[var(--on-surface-variant)]">
                            Badge count prop
                        </label>
                        <M3SegmentedButton
                            options={[
                                { label: '1', value: '1' },
                                { label: '2', value: '2' },
                                { label: '3', value: '3' },
                                { label: '4+', value: '4+' },
                            ]}
                            value={loader.badgeCount}
                            onChange={(val) => updateLoader({ badgeCount: val as BadgeCount })}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-[var(--on-surface-variant)]">
                            Product badges shown
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {allProductIcons.map((item) => {
                                const isChecked = loader.selectedProductIcons.includes(item.type);
                                return (
                                    <button
                                        key={item.type}
                                        onClick={() => toggleProductIcon(item.type)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-[8px] border text-xs font-medium transition-all cursor-pointer ${
                                            isChecked
                                                ? 'bg-[var(--primary-container)] border-[var(--primary)] text-[var(--on-primary-container)]'
                                                : 'bg-[var(--surface-container-high)] border-transparent text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-highest)]'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-[16px]">
                                            {isChecked ? 'check_box' : 'check_box_outline_blank'}
                                        </span>
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </M3CollapsibleCard>
    );
};
