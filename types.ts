export type ThemeMode = 'light' | 'dark';
export type ThemeStyle = 'baseline' | 'purple' | 'green' | 'red' | 'teal' | 'pink' | 'yellow' | 'aurora' | 'custom';
export type ThemeVariant = 'content' | 'expressive' | 'fidelity' | 'fidelity_unsafe' | 'fruit_salad' | 'monochrome' | 'neutral' | 'rainbow' | 'search' | 'tonal_spot' | 'vibrant';
export type UnitPreset = 'time_mm_ss' | 'time_hh_mm' | 'time_hh_mm_ss' | 'weight_lbs' | 'length_ft_in' | 'temp_c';
export type ExportFormat = 'png';
export type SoundType = 'tick' | 'click' | 'beep' | 'pop';
export type MotionPreset = 'standard' | 'expressive' | 'custom';

export type AmPmColorMode = 
    | 'primary' 
    | 'secondary' 
    | 'tertiary' 
    | 'primary-container' 
    | 'secondary-container' 
    | 'tertiary-container';

export type SparkState = 'default' | 'in_progress';
export type LoaderVariant = 'default' | 'with_badges';
export type BadgeCount = '1' | '2' | '3' | '4+';
export type ProductIconType = 'gmail' | 'docs' | 'sheets' | 'drive' | 'chat' | 'calendar';
export type LoaderIconType = 'spark' | 'dots' | 'glowing_dots' | 'thinking_dots' | 'none';
export type PresentationMode = 'freeform' | 'android' | 'web';

export interface DetailItem {
  title: string;
  body: string;
}

export interface TypographyConfig {
  size: number;
  width: number;
  weight: number;
  roundness?: number;
  colorRole?: 'outline' | 'outline-variant' | 'on-surface-variant' | 'on-surface';
}

export interface LayoutConfig {
  gap: number;
  width: number;
  height: number;
  itemHeight: number;
  containerRadius: number;
  highlightRadius: number;
  roundedFrame: boolean;
}

export interface AmPmConfig {
  enabled: boolean;
  containerGap: number;
  buttonGap: number;
  buttonHeight: number;
  fontSize: number;
  isSquare: boolean;
  align: 'flex-start' | 'center' | 'flex-end';
  colorMode: AmPmColorMode;
}

export interface VariableScrollConfig {
  rangeMultiplier: number;
  easing: number;
  invert: boolean;
  intensity: number;
}

export interface ExportConfig {
  format: ExportFormat;
  scale: number;
  fps: number;
  includeBackground: boolean;
}

export interface MockupConfig {
  enabled: boolean;
}

export interface BackgroundImageConfig {
  url: string | null;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  proportional: boolean;
  opacity: number;
  visible: boolean;
  width: number;
  height: number;
}

export interface PrimaryActionConfig {
  enabled: boolean;
  label: string;
  showIcon: boolean;
  icon: string;
}

export interface SecondaryActionConfig {
  enabled: boolean;
  label: string;
}

export interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
  preset: MotionPreset;
}

export interface GenerativeBackgroundProps {
  state: AppState;
  windowDimensions: { width: number; height: number };
}

export interface GenerativeBackgroundConfig {
  enabled: boolean;
  seed: number;
  particleType: 'material_shapes';
  isPlaying?: boolean;
  auroraGlow?: boolean;
  glowIntensity?: number;
  glowSpeed?: number;
  symbolScale?: number;
  isolateShape?: boolean;
  glowThickness?: number;
  glowNoise?: number;
  glowPulse?: number;
  glowSoftness?: number;
  glowBackdropWidth?: number;
  glowCoreWidth?: number;
  glowSegmentLength?: number;
  glowSegmentGap?: number;
  glowCoreSoftness?: number;
  divisions?: number;
  canvasSize?: number;
  lineOrientation?: 'horizontal' | 'vertical' | 'mix';
  patternType?: 'gradient_strips' | 'symbols_3d' | 'depth_warp' | 'concentric_warp' | 'extruded_grid' | 'metaballs' | 'fields' | 'simplified_fields' | string;
  useSymbols?: boolean;
  selectedSymbol?: string;
  motionStyle?: 'continuous' | 'steps';
  stripShape?: 'horizontal' | 'concentric' | 'shape-1' | 'shape-2' | 'shape-3' | 'shape-5' | 'shape-6' | 'shape-7' | 'shape-main';
  edgeGlow?: boolean;
  motionSpeed?: number;
  glowAmount?: number;
  warpPerspective?: number;
  warpRadius?: number;
  warpCurvature?: number;
  warpTilt?: number;
  warpAspect?: number;
  warpHeight?: number;
  warpWaveAmplitude?: number;
  warpWaveFrequency?: number;
  scattered?: boolean;
  numberValue?: number;
  singleColor?: boolean;
}

export interface CanvasShape {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  cornerRadius: number;
  fillType?: 'solid' | 'linear' | 'radial';
  gradientColorStart?: string;
  gradientOpacityStart?: number;
  gradientColorEnd?: string;
  gradientOpacityEnd?: number;
  gradientAngle?: number;
  zOffset?: number;
  iconIndex?: number;
  localIndex?: number;
  gradientStops?: { color: string; opacity: number; offset: number }[];
  radialCenterX?: number;
  radialCenterY?: number;
  radialRadiusX?: number;
  radialRadiusY?: number;
  blur?: number;
  hasGlow?: boolean;
}

export interface ColumnData {
  range?: [number, number];
  options?: string[];
  label: string;
  padZero?: boolean;
  startValue?: number;
}

export interface PresetConfig {
  type?: 'weight' | 'temperature' | 'time';
  columns: ColumnData[];
  separator: string;
}

export interface LoaderConfig {
  hasContainment: boolean;
  loaderIconType: LoaderIconType;
  sparkState: SparkState;
  loaderVariant: LoaderVariant;
  statusText: string;
  statusTextEffect?: 'none' | 'pixel_drift';
  isExpanded: boolean;
  expandedStyle?: 'default' | 'carousel_stack' | 'title_list' | 'title_list_aurora' | 'title_list_neural' | 'title_list_determinate' | 'title_list_determinate_aurora' | 'title_list_determinate_neural' | 'title_list_neural_particles' | 'title_list_determinate_neural_particles' | 'product_orbit_suction' | 'product_orbit_flat';
  carouselMode?: boolean;
  showStepper?: boolean;
  stepperStyle?: 'pills' | 'symbols' | 'lines';
  showStepperLines?: boolean;
  stepperIconsPreset?: 'workflow' | 'analysis' | 'dev';
  stepperIcons?: string[];
  stepperPillWidth?: number;
  stepperSymbolSize?: number;
  ruleVariant?: 'none' | 'dashed' | 'solid' | 'squiggly';
  titleWeight?: number;
  titleWidth?: number;
  bodyWeight?: number;
  bodyWidth?: number;
  statusDetailTitle: string;
  statusDetailBody: string;
  detailItems?: DetailItem[];
  detailItemCount?: number;
  detailListGap?: number;
  listDensity?: number;
  showBadges: boolean;
  animateBadges?: boolean;
  badgeCount: BadgeCount;
  selectedProductIcons: ProductIconType[];
  presentation?: PresentationMode;
  webUrl?: string;
  androidPosition?: 'bottom' | 'center';
  auroraGlowPosition?: 'border_halo' | 'swipe_in_out' | 'pulse_sweep' | 'orbit_clockwise';
  auroraGlowRadius?: number;
  auroraGlowBlur?: number;
  auroraGlowOpacity?: number;
  auroraGlowColors?: 'blue_aurora' | 'violet_aurora' | 'emerald_aurora';
  auroraCardWidthPadding?: number;
  auroraActiveCardOpacity?: number;
  auroraParticlesOnDetailLines?: boolean;
  auroraParticlesOnIcon?: boolean;
  auroraParticleDensity?: number;
  auroraParticleSpeed?: number;
  auroraParticleSize?: number;
  particleCount?: number;
  particleSize?: number;
  mouseRadius?: number;
  mouseForce?: number;
  particleFontSize?: number;
  particleAnimateIn?: boolean;
  auroraGlowOnTopTitle?: boolean;
  auroraParticlesOnTopTitle?: boolean;
  textGlowEnabled?: boolean;
  textGlowBlur?: number;
  textGlowOpacity?: number;
  textBlendMode?: 'plus-lighter' | 'screen' | 'overlay' | 'normal';
  particleColorsPreset?: 'monochrome' | 'aurora' | 'cyber' | 'sunset' | 'emerald';
  neuralMeshStyle?: 'particles' | 'sheet_mesh';
  sheetWaveSpeed?: number;
  sheetWaveAmplitude?: number;
  sheetWireframeOpacity?: number;
  orbitStarCount?: number;
  orbitSpeed?: number;
  orbitIconContainment?: boolean;
  orbitSpiralParticles?: boolean;
  orbitRandomZSpace?: boolean;
  orbitCameraPitch?: number;
  orbitSteppedMotion?: boolean;
  orbitParticleDiameter?: number;
  particleShape?: 'circle' | 'gemini_spark';
  auroraWaveOffset?: number;
  auroraWaveAutoPlay?: boolean;
  auroraWaveSpeed?: number;
  showLeadingLoader?: boolean;
  showTitle?: boolean;
  showTimer?: boolean;
  showStopIcon?: boolean;
  showChevron?: boolean;
  auroraOnLeadingLoader?: boolean;
  auroraOnTitleRow?: boolean;
  auroraOnExplanationItems?: boolean;
  neuralOnLeadingLoader?: boolean;
  neuralOnTitleRow?: boolean;
  neuralOnExplanationItems?: boolean;
}

export interface AppState {
  mode: ThemeMode;
  preset?: string;
  gridSelection?: string;
  gridGranularity?: '2x2' | '3x3';
  cardOrder?: string[];
  loader: LoaderConfig;

  // Optional global/theme fields for compatibility across all components
  unit?: UnitPreset | string;
  style?: ThemeStyle;
  themeVariant?: ThemeVariant;
  customColor?: string;
  showSeparators?: boolean;
  showLabels?: boolean;
  hideInactive?: boolean;
  embeddedLabels?: boolean;
  variableScroll?: boolean;
  labelYPosition?: number;
  isMono?: boolean;
  showGuidelines?: boolean;
  showMeasurements?: boolean;
  showColorAnnotations?: boolean;
  showShadow?: boolean;
  showScrim?: boolean;
  showInputModeToggle?: boolean;
  showModalTitle?: boolean;
  modalTitle?: string;
  customizeTimeIncrements?: boolean;
  timeIncrement?: number;
  spring?: SpringConfig;
  hapticsEnabled?: boolean;
  hapticIntensity?: number;
  soundEnabled?: boolean;
  soundType?: SoundType;
  independentTypography?: boolean;
  is24Hour?: boolean;
  isModal?: boolean;
  modalPadding?: number;
  layout?: LayoutConfig;
  activeType?: TypographyConfig;
  inactiveType?: TypographyConfig;
  amPm?: AmPmConfig;
  variableScrollConfig?: VariableScrollConfig;
  exportConfig?: ExportConfig;
  mockup?: MockupConfig;
  backgroundImage?: BackgroundImageConfig;
  primaryAction?: PrimaryActionConfig;
  secondaryAction?: SecondaryActionConfig;
  generativeBackground?: GenerativeBackgroundConfig;
  canvasShapes?: CanvasShape[];
  selectedShapeId?: string | null;
  scatterZ?: boolean;
  globalGlowEnabled?: boolean;
  glowBounceEnabled?: boolean;
  glowIntensityMultiplier?: number;
  glowBounceIntensity?: number;
  targetScrollZ?: number;
  stepScatterEnabled?: boolean;
}
