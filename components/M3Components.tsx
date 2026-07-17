import React, { useState } from 'react';

/* --- Material Design 3 Components --- */

export const M3SectionTitle: React.FC<{ title: string; icon: string }> = ({ title, icon }) => (
    <div className="flex items-center gap-2 select-none">
        <span 
            className="material-symbols-outlined text-[18px] text-[var(--on-surface-variant)]"
            style={{ fontVariationSettings: "'FILL' 1" }}
        >
            {icon}
        </span>
        <h3 className="text-[14px] font-medium font-display tracking-tight text-[var(--on-surface-variant)]">{title}</h3>
    </div>
);

export const M3CollapsibleCard: React.FC<{
  title: string;
  icon: string;
  defaultExpanded?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  dropPosition?: 'top' | 'bottom' | null;
  children?: React.ReactNode;
}> = ({ 
  title, 
  icon, 
  defaultExpanded = false, 
  onDragStart, 
  onDragOver, 
  onDrop, 
  onDragEnd, 
  isDragging = false, 
  isDragOver = false, 
  dropPosition = null, 
  children 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="relative">
      {/* Drop Indicator Bar Top */}
      {isDragOver && dropPosition === 'top' && (
        <div className="absolute -top-2 left-0 right-0 h-1 rounded-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary)] z-50 flex items-center justify-center pointer-events-none animate-pulse">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] ring-2 ring-[var(--surface-container)]" />
        </div>
      )}

      {/* Drop Indicator Bar Bottom */}
      {isDragOver && dropPosition === 'bottom' && (
        <div className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary)] z-50 flex items-center justify-center pointer-events-none animate-pulse">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] ring-2 ring-[var(--surface-container)]" />
        </div>
      )}

      <div 
        onDragOver={(e) => {
          if (onDragOver) {
            e.preventDefault();
            onDragOver(e);
          }
        }}
        onDrop={(e) => {
          if (onDrop) {
            e.preventDefault();
            onDrop(e);
          }
        }}
        onDragEnd={onDragEnd}
        className={`flex flex-col rounded-[16px] bg-[var(--surface-container-high)] overflow-hidden transition-all duration-200 ${
          isDragging ? 'opacity-30 scale-[0.98] border-2 border-dashed border-[var(--outline)] shadow-none' : ''
        } ${
          isDragOver ? 'ring-2 ring-[var(--primary)]/70 bg-[var(--primary-container)]/10 scale-[1.005]' : ''
        }`}
      >
        {/* Card Header (Clickable to Toggle, no bottom line) */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--on-surface)]/5 transition-colors text-left w-full"
        >
          <M3SectionTitle title={title} icon={icon} />

          <div className="flex items-center gap-1.5">
            {onDragStart && (
              <div 
                className="flex items-center gap-0.5 mr-1" 
                onClick={(e) => e.stopPropagation()}
              >
                <div 
                  draggable
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  title="Drag to reorder" 
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--on-surface-variant)]/60 hover:text-[var(--on-surface)] cursor-grab active:cursor-grabbing hover:bg-[var(--on-surface)]/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
                </div>
              </div>
            )}
            <span className={`material-symbols-outlined text-[20px] text-[var(--on-surface-variant)] transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : 'rotate-0'
            }`}>
              keyboard_arrow_down
            </span>
          </div>
        </button>

        {/* Card Content (without border-t divider under header) */}
        <div 
          className={`grid transition-all duration-300 ease-in-out ${
            isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="p-4 pt-0 space-y-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const M3Switch: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void }> = ({ label, checked, onChange }) => (
    <div 
        className="flex items-center justify-between cursor-pointer group py-2"
        onClick={() => onChange(!checked)}
    >
        <span className="text-[14px] text-[var(--on-surface)] font-normal font-sans">{label}</span>
        <div className={`relative w-[48px] h-[28px] rounded-full transition-colors duration-200 
            ${checked ? 'bg-[var(--primary)] border-[var(--primary)]' : 'bg-[var(--surface-container-highest)] border-[var(--outline-variant)]'} border-2`}
        >
            <div className={`absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-[cubic-bezier(0.2,0.0,0,1.0)] flex items-center justify-center rounded-full shadow-sm
                ${checked ? 'left-[calc(100%-24px)] w-[20px] h-[20px] bg-[var(--on-primary)]' : 'left-[5px] w-[14px] h-[14px] bg-[var(--outline-variant)] group-hover:bg-[var(--on-surface-variant)]'}`}
            >
                {checked && <span className="material-symbols-outlined text-[var(--primary)] text-[14px] font-bold">check</span>}
            </div>
        </div>
    </div>
);

export const M3ListItemSwitch: React.FC<{ label: string; checked: boolean; onChange: (c: boolean) => void; last?: boolean }> = ({ label, checked, onChange, last }) => (
    <div 
        className={`flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-[var(--on-surface)]/5 transition-colors`}
        onClick={() => onChange(!checked)}
    >
        <span className="text-[14px] text-[var(--on-surface)] font-sans">{label}</span>
        <div className={`relative w-[40px] h-[24px] rounded-full transition-colors duration-200 
            ${checked ? 'bg-[var(--primary)] border-[var(--primary)]' : 'bg-[var(--surface-container-highest)] border-[var(--outline-variant)]'} border-2`}
        >
             <div className={`absolute top-1/2 -translate-y-1/2 transition-all duration-300 rounded-full shadow-sm
                ${checked ? 'left-[calc(100%-18px)] w-[14px] h-[14px] bg-[var(--on-primary)]' : 'left-[4px] w-[12px] h-[12px] bg-[var(--outline-variant)]'}`}
            />
        </div>
    </div>
);


export const M3Slider: React.FC<{ 
    label: string; 
    value: number; 
    min: number; 
    max: number; 
    step?: number; 
    onChange: (val: number) => void; 
    disabled?: boolean;
    valueLabel?: string;
}> = ({ label, value, min, max, step = 1, onChange, disabled, valueLabel }) => (
    <div className={`flex flex-col gap-2 transition-opacity duration-300 ${disabled ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex justify-between items-end">
             <span className="text-[13px] font-medium text-[var(--on-surface-variant)] font-sans">{label}</span>
             <span className="text-xs font-medium text-[var(--on-primary-container)] bg-[var(--primary-container)] px-2 py-0.5 rounded-[4px] font-sans min-w-[36px] text-center">
                 {valueLabel !== undefined ? valueLabel : value?.toFixed(step < 1 ? 2 : 0)}
             </span>
        </div>
        <div className="h-[16px] flex items-center">
            <input 
                type="range" min={min} max={max} value={value} step={step}
                onChange={(e) => onChange(Number(e.target.value))}
                className="m3-range w-full"
                disabled={disabled}
            />
        </div>
    </div>
);

export const M3Select: React.FC<{ 
    label: string; 
    value: string; 
    onChange: (val: string) => void; 
    options: {label: string, value: string}[] 
}> = ({ label, value, onChange, options }) => (
    <div className="relative group">
        <div className="absolute -top-2 left-3 bg-[var(--surface-container-high)] px-1 z-10">
            <span className="text-[11px] font-medium text-[var(--primary)]">{label}</span>
        </div>
        <div className="relative w-full h-[48px] rounded-[8px] border border-[var(--outline-variant)] hover:border-[var(--on-surface)] has-[:focus]:border-2 has-[:focus]:border-[var(--primary)] transition-all bg-transparent">
            <select 
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-full px-3 pt-0 bg-transparent text-[var(--on-surface)] outline-none appearance-none cursor-pointer font-sans text-[14px]"
            >
                {options.map(o => <option key={o.value} value={o.value} className="bg-[var(--surface-container)] py-2">{o.label}</option>)}
            </select>
            {/* Dropdown Icon */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <span className="material-symbols-outlined text-[var(--on-surface-variant)] text-[20px]">arrow_drop_down</span>
            </div>
        </div>
    </div>
);

// Connected Button Group matching Figma node 2:785 and 2:741 with robust fallbacks
export const M3SegmentedButton: React.FC<{
    options: { label: string; value: string; icon?: string }[];
    value: string;
    onChange: (val: string) => void;
}> = ({ options, value, onChange }) => {
    if (options.length > 4) {
        return (
            <div className="grid grid-cols-2 gap-1.5 w-full">
                {options.map((opt) => {
                    const selected = value === opt.value;
                    return (
                        <button
                            key={opt.value}
                            onClick={() => onChange(opt.value)}
                            style={{
                                backgroundColor: selected 
                                    ? 'var(--secondary, #00639b)' 
                                    : 'var(--secondary-container, #c2e7ff)',
                                color: selected 
                                    ? 'var(--on-secondary, #ffffff)' 
                                    : 'var(--on-secondary-container, #004a77)',
                            }}
                            className={`flex items-center justify-center gap-1.5 h-[38px] px-2.5 text-[12px] font-medium font-sans transition-all duration-200 cursor-pointer select-none rounded-[12px] ${
                                selected ? 'font-semibold ring-2 ring-[var(--secondary)]/40 shadow-xs' : 'hover:opacity-90'
                            }`}
                        >
                            {selected && <span className="material-symbols-outlined text-[16px]">check</span>}
                            {!selected && opt.icon && <span className="material-symbols-outlined text-[16px]">{opt.icon}</span>}
                            {!opt.icon && <span className="truncate">{opt.label}</span>}
                        </button>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="flex w-full gap-[2px] items-center cursor-pointer rounded-[20px]">
            {options.map((opt, i) => {
                const selected = value === opt.value;
                const isFirst = i === 0;
                const isLast = i === options.length - 1;

                let borderRadius = 'rounded-[8px]';
                if (selected) {
                    borderRadius = 'rounded-[24px]';
                } else if (isFirst) {
                    borderRadius = 'rounded-tl-[100px] rounded-bl-[100px] rounded-tr-[8px] rounded-br-[8px]';
                } else if (isLast) {
                    borderRadius = 'rounded-tl-[8px] rounded-bl-[8px] rounded-tr-[100px] rounded-br-[100px]';
                }

                return (
                    <button
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        style={{
                            backgroundColor: selected 
                                ? 'var(--secondary, #00639b)' 
                                : 'var(--secondary-container, #c2e7ff)',
                            color: selected 
                                ? 'var(--on-secondary, #ffffff)' 
                                : 'var(--on-secondary-container, #004a77)',
                        }}
                        className={`flex-1 flex items-center justify-center gap-1.5 h-[40px] px-3 text-[14px] font-medium font-sans transition-all duration-200 cursor-pointer select-none ${borderRadius} ${
                            selected ? 'font-semibold' : 'hover:opacity-90'
                        }`}
                    >
                        {selected && <span className="material-symbols-outlined text-[18px]">check</span>}
                        {!selected && opt.icon && <span className="material-symbols-outlined text-[18px]">{opt.icon}</span>}
                        {!opt.icon && <span>{opt.label}</span>}
                    </button>
                );
            })}
        </div>
    );
};

export const M3TextInput: React.FC<{ label: string; value: string; onChange: (val: string) => void }> = ({ label, value, onChange }) => (
    <div className="relative group">
        <div className="absolute -top-2 left-3 bg-[var(--surface-container-high)] px-1 z-10">
            <span className="text-[11px] font-medium text-[var(--primary)]">{label}</span>
        </div>
        <input 
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-[48px] rounded-[8px] border border-[var(--outline-variant)] hover:border-[var(--on-surface)] focus:border-2 focus:border-[var(--primary)] bg-transparent px-3 text-[14px] text-[var(--on-surface)] outline-none transition-all"
        />
    </div>
);

export interface GridSelectorProps {
    granularity: '2x2' | '3x3';
    onGranularityChange: (val: '2x2' | '3x3') => void;
    selectedKey: string;
    onSelect: (yKey: string, xKey: string) => void;
}

export const M3GridSelector: React.FC<GridSelectorProps> = ({
    granularity,
    onGranularityChange,
    selectedKey,
    onSelect,
}) => {
    const yRows = granularity === '2x2'
        ? [ { key: 'stepper', label: 'Stepper' }, { key: 'more', label: 'More' }, { key: 'less', label: 'Less' } ]
        : [ { key: 'stepper', label: 'Stepper' }, { key: 'more', label: 'More' }, { key: 'medium', label: 'Medium' }, { key: 'less', label: 'Less' } ];

    const xCols = granularity === '2x2'
        ? [ { key: 'gm3', label: 'GM3' }, { key: 'luminous', label: 'Luminous' } ]
        : [ { key: 'gm3', label: 'GM3' }, { key: 'hybrid', label: 'Hybrid' }, { key: 'luminous', label: 'Luminous' } ];

    return (
        <div className="flex flex-col gap-4 select-none pt-1">
            {/* Grid Container with Axis Labels */}
            <div className="flex flex-col gap-2">
                {/* Top Y-Axis Indicator - Centered & Blue */}
                <div className="flex items-center justify-center w-full px-1 pb-1 text-[11px] font-bold text-[var(--primary)] tracking-wider uppercase text-center">
                    <span>↑ More Explanation</span>
                </div>

                {/* Matrix Grid */}
                <div className={`grid gap-2.5 ${granularity === '2x2' ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {yRows.map((row) =>
                        xCols.map((col) => {
                            const cellKey = `${row.key}_${col.key}`;
                            const isSelected = selectedKey === cellKey;
                            return (
                                <button
                                    key={cellKey}
                                    type="button"
                                    onClick={() => onSelect(row.key, col.key)}
                                    className={`flex flex-col items-center justify-center p-3 rounded-[14px] border transition-all duration-200 cursor-pointer text-center relative overflow-hidden group/cell ${
                                        isSelected
                                            ? 'bg-[var(--primary-container)] border-[var(--primary)] text-[var(--on-primary-container)] shadow-sm scale-[1.02] ring-1 ring-[var(--primary)]'
                                            : 'bg-[var(--surface-container)] hover:bg-[var(--surface-container-highest)] border-[var(--outline-variant)]/40 text-[var(--on-surface)]'
                                    }`}
                                    style={{ minHeight: granularity === '2x2' ? '86px' : '76px' }}
                                >
                                    <div className="flex items-center gap-1 mb-1.5">
                                        {isSelected ? (
                                            <span className="material-symbols-outlined text-[18px] text-[var(--primary)] font-bold">check_circle</span>
                                        ) : (
                                            <span className="w-2 h-2 rounded-full bg-[var(--outline-variant)] group-hover/cell:bg-[var(--primary)] transition-colors" />
                                        )}
                                    </div>

                                    <span className="text-[13px] font-semibold leading-tight">{row.label}</span>
                                    <span className={`text-[11px] mt-0.5 leading-tight ${isSelected ? 'text-[var(--primary)] font-medium' : 'text-[var(--on-surface-variant)]'}`}>
                                        {col.label}
                                    </span>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Bottom Y-Axis Indicator - Centered & Blue */}
                <div className="flex items-center justify-center w-full px-1 pt-1 text-[11px] font-bold text-[var(--primary)] tracking-wider uppercase text-center">
                    <span>↓ Less Explanation</span>
                </div>
            </div>
        </div>
    );
};
