
import { AppState } from './types';
import { SAMPLE_DETAILS } from './constants';

export interface LoaderPreset {
  label: string;
  config: Partial<AppState>;
}

export const UNIT_PRESETS: Record<string, any> = {
  time_mm_ss: {
    type: 'time',
    columns: [
      { range: [0, 59], label: 'Minutes', padZero: true },
      { range: [0, 59], label: 'Seconds', padZero: true }
    ],
    separator: ':'
  },
  time_hh_mm: {
    type: 'time',
    columns: [
      { range: [0, 23], label: 'Hours', padZero: true },
      { range: [0, 59], label: 'Minutes', padZero: true }
    ],
    separator: ':'
  },
  time_hh_mm_ss: {
    type: 'time',
    columns: [
      { range: [0, 23], label: 'Hours', padZero: true },
      { range: [0, 59], label: 'Minutes', padZero: true },
      { range: [0, 59], label: 'Seconds', padZero: true }
    ],
    separator: ':'
  },
  weight_lbs: {
    type: 'weight',
    columns: [
      { range: [0, 300], label: 'Weight', padZero: false, startValue: 150 },
      { range: [0, 9], label: '', padZero: false },
      { options: ['lbs', 'kgs'], label: 'Unit' }
    ],
    separator: '.'
  },
  length_ft_in: {
    columns: [
      { range: [0, 100], label: 'Feet', padZero: false, startValue: 5 },
      { range: [0, 11], label: 'Inches', padZero: false, startValue: 8 }
    ],
    separator: "'"
  },
  temp_c: {
    type: 'temperature',
    columns: [
      { range: [-50, 150], label: 'Temp', padZero: false, startValue: 22 },
      { options: ['°C', '°F'], label: 'Unit' }
    ],
    separator: ''
  }
};

export const REFERENCE_IMAGE_PRESETS = [
    { label: 'Custom / Upload', value: 'custom', url: '' },
    { label: 'G Leads prezo', value: 'g_leads_prezo', url: '/assets/g_leads_prezo.png' }, 
    { label: 'Alarm List', value: 'alarm_list', url: '/assets/alarm_list.png' },
    { label: 'December Calendar', value: 'december_calendar', url: '/assets/december_calendar.png' },
];

export const GLOBAL_PRESETS: Record<string, Partial<AppState>> = {
  // 1. Expressive (Light)
  preset_1: {
    mode: 'light',
    style: 'baseline',
    unit: 'time_hh_mm',
    showSeparators: true,
    showLabels: false,
    embeddedLabels: false,
    variableScroll: false,
    hideInactive: false,
    isModal: true,
    labelYPosition: 50,
    modalPadding: 12,
    showGuidelines: false,
    showMeasurements: false,
    showColorAnnotations: false,
    showShadow: false,
    showScrim: false,
    showInputModeToggle: true,
    showModalTitle: false,
    modalTitle: 'Select Time',
    customizeTimeIncrements: false,
    timeIncrement: 1,
    hapticsEnabled: true,
    soundEnabled: true,
    layout: {
      gap: 0,
      width: 100,
      height: 120,
      itemHeight: 53,
      containerRadius: 16,
      highlightRadius: 12,
      roundedFrame: false,
    },
    activeType: { size: 56, width: 100, weight: 500 },
    inactiveType: { size: 36, width: 100, weight: 400, colorRole: 'outline' },
    isMono: false,
    independentTypography: true,
    amPm: { enabled: true, containerGap: 8, buttonGap: 8, buttonHeight: 56, fontSize: 16, isSquare: true, align: 'center', colorMode: 'primary-container' },
    variableScrollConfig: { rangeMultiplier: 1.5, easing: 1.0, invert: false, intensity: 0.3 },
    exportConfig: { format: 'png', scale: 2, fps: 30, includeBackground: true },
    mockup: { enabled: false },
    backgroundImage: { url: null, x: 0, y: 0, scaleX: 0.5, scaleY: 0.5, proportional: true, opacity: 1, visible: true, width: 824, height: 1834 },
    primaryAction: { enabled: true, label: 'OK', showIcon: false, icon: 'check' },
    secondaryAction: { enabled: true, label: 'Cancel' }
  },
  // 2. Expressive (Dark)
  preset_2: {
    mode: 'dark',
    style: 'baseline',
    unit: 'time_hh_mm',
    showSeparators: true,
    showLabels: false,
    embeddedLabels: false,
    variableScroll: false,
    hideInactive: false,
    isModal: true,
    labelYPosition: 50,
    modalPadding: 12,
    showGuidelines: false,
    showMeasurements: false,
    showColorAnnotations: false,
    showShadow: false,
    showScrim: false,
    showInputModeToggle: true,
    showModalTitle: false,
    modalTitle: 'Select Time',
    customizeTimeIncrements: false,
    timeIncrement: 1,
    hapticsEnabled: true,
    soundEnabled: true,
    layout: {
      gap: 0,
      width: 100,
      height: 120,
      itemHeight: 53,
      containerRadius: 16,
      highlightRadius: 12,
      roundedFrame: false,
    },
    activeType: { size: 56, width: 100, weight: 500 },
    inactiveType: { size: 36, width: 100, weight: 400, colorRole: 'outline' },
    isMono: false,
    independentTypography: true,
    amPm: { enabled: true, containerGap: 8, buttonGap: 8, buttonHeight: 56, fontSize: 16, isSquare: true, align: 'center', colorMode: 'primary-container' },
    variableScrollConfig: { rangeMultiplier: 1.5, easing: 1.0, invert: false, intensity: 0.3 },
    exportConfig: { format: 'png', scale: 2, fps: 30, includeBackground: true },
    mockup: { enabled: false },
    backgroundImage: { url: null, x: 0, y: 0, scaleX: 0.5, scaleY: 0.5, proportional: true, opacity: 1, visible: true, width: 824, height: 1834 },
    primaryAction: { enabled: true, label: 'OK', showIcon: false, icon: 'check' },
    secondaryAction: { enabled: true, label: 'Cancel' }
  }
};

export const LOADER_PRESETS: Record<string, LoaderPreset> = {
  default_spark: {
    label: 'Default (Light Spark)',
    config: {
      mode: 'light',
      loader: {
        hasContainment: false,
        loaderIconType: 'spark',
        sparkState: 'in_progress',
        loaderVariant: 'default',
        statusText: 'Thinking...',
        isExpanded: false,
        statusDetailTitle: SAMPLE_DETAILS[0].title,
        statusDetailBody: SAMPLE_DETAILS[0].body,
        detailItemCount: 1,
        detailItems: SAMPLE_DETAILS,
        showBadges: false,
        animateBadges: false,
        badgeCount: '3',
        selectedProductIcons: ['gmail', 'docs', 'sheets', 'drive'],
        presentation: 'freeform',
        webUrl: 'mail.google.com/mail/u/0/#inbox',
        androidPosition: 'bottom',
      }
    }
  },
  docs_assistant: {
    label: 'Docs Assistant (Dark Glowing)',
    config: {
      mode: 'dark',
      loader: {
        hasContainment: true,
        loaderIconType: 'dots',
        sparkState: 'in_progress',
        loaderVariant: 'with_badges',
        statusText: 'Analyzing request...',
        isExpanded: true,
        statusDetailTitle: SAMPLE_DETAILS[1].title,
        statusDetailBody: SAMPLE_DETAILS[1].body,
        detailItemCount: 2,
        detailItems: SAMPLE_DETAILS,
        showBadges: true,
        animateBadges: true,
        badgeCount: '3',
        selectedProductIcons: ['docs', 'drive', 'gmail'],
        presentation: 'freeform',
        webUrl: 'mail.google.com/mail/u/0/#inbox',
        androidPosition: 'bottom',
      }
    }
  },
  gmail_sidebar: {
    label: 'Gmail Web Sidebar',
    config: {
      mode: 'light',
      loader: {
        hasContainment: true,
        loaderIconType: 'dots',
        sparkState: 'in_progress',
        loaderVariant: 'with_badges',
        statusText: 'Scanning files...',
        isExpanded: false,
        statusDetailTitle: SAMPLE_DETAILS[2].title,
        statusDetailBody: SAMPLE_DETAILS[2].body,
        detailItemCount: 1,
        detailItems: SAMPLE_DETAILS,
        showBadges: true,
        animateBadges: false,
        badgeCount: '4+',
        selectedProductIcons: ['gmail', 'docs', 'sheets', 'drive', 'calendar'],
        presentation: 'web',
        webUrl: 'mail.google.com/mail/u/0/#inbox',
        androidPosition: 'bottom',
      }
    }
  },
  android_bottom: {
    label: 'Android Bottom Sheet',
    config: {
      mode: 'dark',
      loader: {
        hasContainment: false,
        loaderIconType: 'spark',
        sparkState: 'in_progress',
        loaderVariant: 'default',
        statusText: 'Generating response...',
        isExpanded: true,
        statusDetailTitle: SAMPLE_DETAILS[3].title,
        statusDetailBody: SAMPLE_DETAILS[3].body,
        detailItemCount: 2,
        detailItems: SAMPLE_DETAILS,
        showBadges: false,
        animateBadges: false,
        badgeCount: '3',
        selectedProductIcons: ['gmail', 'docs', 'drive'],
        presentation: 'android',
        webUrl: 'mail.google.com/mail/u/0/#inbox',
        androidPosition: 'bottom',
      }
    }
  },
  workspace_sync: {
    label: 'Workspace Multi-App Sync',
    config: {
      mode: 'light',
      loader: {
        hasContainment: true,
        loaderIconType: 'dots',
        sparkState: 'in_progress',
        loaderVariant: 'with_badges',
        statusText: 'Synthesizing research...',
        isExpanded: true,
        statusDetailTitle: SAMPLE_DETAILS[2].title,
        statusDetailBody: SAMPLE_DETAILS[2].body,
        detailItemCount: 3,
        detailItems: SAMPLE_DETAILS,
        showBadges: true,
        animateBadges: true,
        badgeCount: '4+',
        presentation: 'freeform',
        webUrl: 'mail.google.com/mail/u/0/#inbox',
        androidPosition: 'bottom',
      }
    }
  }
};

export const LABS_DEFAULT_STATE: AppState = {
  mode: "light",
  preset: "labs_default",
  gridGranularity: "3x3",
  loader: {
    hasContainment: false,
    loaderIconType: "dots",
    sparkState: "in_progress",
    loaderVariant: "with_badges",
    statusText: "Synthesizing research...",
    isExpanded: true,
    statusDetailTitle: "Synthesizing research notes & summaries",
    statusDetailBody: "Cross-referencing recent team discussions, meeting notes, and shared files to extract actionable insights and generate a cohesive summary.",
    detailItemCount: 3,
    detailItems: [
      {
        title: "Analyzing recent chats and emails",
        body: "My current approach involves systematically searching for unread emails from today and more recent emails containing specified keywords related to your project. I anticipate this straightforward approach will yield the desired results."
      },
      {
        title: "Searching Workspace documents & drive",
        body: "Scanning all Google Docs, Sheets, and Slides modified in the last 7 days to compile key project milestones, action items, and relevant references."
      },
      {
        title: "Synthesizing research notes & summaries",
        body: "Cross-referencing recent team discussions, meeting notes, and shared files to extract actionable insights and generate a cohesive summary."
      },
      {
        title: "Formulating response & checking references",
        body: "Validating retrieved facts against authoritative internal sources, checking for accuracy, and structuring a clear, well-referenced response."
      }
    ],
    showBadges: true,
    animateBadges: true,
    badgeCount: "4+",
    selectedProductIcons: [
      "gmail",
      "docs",
      "sheets",
      "drive",
      "chat",
      "calendar"
    ],
    presentation: "freeform",
    webUrl: "mail.google.com/mail/u/0/#inbox",
    androidPosition: "bottom",
    showStepper: false,
    stepperPillWidth: 4,
    titleWidth: 95,
    titleWeight: 400,
    bodyWeight: 300,
    bodyWidth: 95,
    stepperStyle: "symbols",
    showStepperLines: true,
    ruleVariant: "none"
  },
  gridSelection: "stepper_hybrid"
};

export const LABS_CAROUSEL_STATE: AppState = {
  mode: "light",
  preset: "labs_carousel",
  gridGranularity: "3x3",
  loader: {
    hasContainment: false,
    loaderIconType: "dots",
    sparkState: "in_progress",
    loaderVariant: "with_badges",
    statusText: "Synthesizing research...",
    isExpanded: true,
    expandedStyle: "carousel_stack",
    carouselMode: true,
    statusDetailTitle: "Exploring user feedback trends",
    statusDetailBody: "I plan to aggregate feedback from various platforms, categorizing it by sentiment and relevance to identify key improvement areas for the product lifecycle.",
    detailItemCount: 4,
    detailItems: [
      {
        title: "Analyzing recent chats and emails",
        body: "My current approach involves systematically searching for unread emails from today and more recent emails containing specified keywords related to your project. I anticipate this straightforward approach will yield the desired results."
      },
      {
        title: "Exploring user feedback trends",
        body: "I plan to aggregate feedback from various platforms, categorizing it by sentiment and relevance to identify key improvement areas for the product lifecycle."
      },
      {
        title: "Reviewing competitor strategies",
        body: "By compiling data on competitors' marketing tactics and feature releases over the past quarter, I aim to uncover opportunities to differentiate our offerings."
      },
      {
        title: "Synthesizing team meeting notes",
        body: "I will consolidate minutes from recent team meetings, highlighting action items and recurring topics to ensure alignment on project goals and timelines."
      }
    ],
    showBadges: true,
    animateBadges: true,
    badgeCount: "4+",
    selectedProductIcons: [
      "gmail",
      "docs",
      "sheets",
      "drive",
      "chat",
      "calendar"
    ],
    presentation: "freeform",
    webUrl: "mail.google.com/mail/u/0/#inbox",
    androidPosition: "bottom",
    showStepper: false,
    stepperPillWidth: 4,
    titleWidth: 95,
    titleWeight: 400,
    bodyWeight: 300,
    bodyWidth: 95,
    stepperStyle: "symbols",
    showStepperLines: true,
    ruleVariant: "none",
    auroraGlowPosition: "orbit_clockwise",
    auroraGlowRadius: 14,
    auroraGlowBlur: 20,
    auroraGlowOpacity: 0.85,
    auroraGlowColors: "blue_aurora",
    auroraCardWidthPadding: 36,
    auroraActiveCardOpacity: 1.0
  },
  gridSelection: "stepper_hybrid"
};

export const LABS_LIST_STATE: AppState = {
  mode: "light",
  preset: "labs_title_list",
  gridGranularity: "3x3",
  loader: {
    hasContainment: false,
    loaderIconType: "dots",
    sparkState: "in_progress",
    loaderVariant: "with_badges",
    statusText: "Synthesizing research...",
    isExpanded: true,
    expandedStyle: "title_list",
    carouselMode: false,
    statusDetailTitle: "Exploring user feedback trends",
    statusDetailBody: "",
    detailItemCount: 4,
    detailItems: [
      {
        title: "Analyzing recent chats and emails",
        body: ""
      },
      {
        title: "Exploring user feedback trends",
        body: ""
      },
      {
        title: "Reviewing competitor strategies",
        body: ""
      },
      {
        title: "Synthesizing team meeting notes",
        body: ""
      }
    ],
    showBadges: true,
    animateBadges: true,
    badgeCount: "4+",
    selectedProductIcons: [
      "gmail",
      "docs",
      "sheets",
      "drive",
      "chat",
      "calendar"
    ],
    presentation: "freeform",
    webUrl: "mail.google.com/mail/u/0/#inbox",
    androidPosition: "bottom",
    showStepper: false,
    stepperStyle: "symbols",
    showStepperLines: false,
    ruleVariant: "none",
    titleWidth: 95,
    titleWeight: 400
  },
  gridSelection: "stepper_hybrid"
};

export const LABS_NEURAL_LIST_STATE: AppState = {
  mode: "light",
  preset: "labs_neural_list",
  gridGranularity: "3x3",
  loader: {
    hasContainment: false,
    loaderIconType: "dots",
    sparkState: "in_progress",
    loaderVariant: "with_badges",
    statusText: "Synthesizing research...",
    isExpanded: true,
    expandedStyle: "title_list_aurora",
    carouselMode: false,
    statusDetailTitle: "Exploring user feedback trends",
    statusDetailBody: "",
    detailItemCount: 4,
    detailItems: [
      {
        title: "Analyzing recent chats and emails",
        body: ""
      },
      {
        title: "Exploring user feedback trends",
        body: ""
      },
      {
        title: "Reviewing competitor strategies",
        body: ""
      },
      {
        title: "Synthesizing team meeting notes",
        body: ""
      }
    ],
    showBadges: true,
    animateBadges: true,
    badgeCount: "4+",
    selectedProductIcons: [
      "gmail",
      "docs",
      "sheets",
      "drive",
      "chat",
      "calendar"
    ],
    presentation: "freeform",
    webUrl: "mail.google.com/mail/u/0/#inbox",
    androidPosition: "bottom",
    showStepper: false,
    stepperStyle: "symbols",
    showStepperLines: false,
    ruleVariant: "none",
    titleWidth: 95,
    titleWeight: 400
  },
  gridSelection: "stepper_hybrid"
};

export const LABS_DETERMINATE_LIST_STATE: AppState = {
  mode: "light",
  preset: "labs_determinate_list",
  gridGranularity: "3x3",
  loader: {
    hasContainment: false,
    loaderIconType: "dots",
    sparkState: "in_progress",
    loaderVariant: "with_badges",
    statusText: "Synthesizing research...",
    isExpanded: true,
    expandedStyle: "title_list_determinate",
    carouselMode: false,
    statusDetailTitle: "Exploring user feedback trends",
    statusDetailBody: "",
    detailItemCount: 4,
    detailItems: [
      {
        title: "Analyzing recent chats and emails",
        body: ""
      },
      {
        title: "Exploring user feedback trends",
        body: ""
      },
      {
        title: "Reviewing competitor strategies",
        body: ""
      },
      {
        title: "Synthesizing team meeting notes",
        body: ""
      }
    ],
    showBadges: true,
    animateBadges: true,
    badgeCount: "4+",
    selectedProductIcons: [
      "gmail",
      "docs",
      "sheets",
      "drive",
      "chat",
      "calendar"
    ],
    presentation: "freeform",
    webUrl: "mail.google.com/mail/u/0/#inbox",
    androidPosition: "bottom",
    showStepper: false,
    stepperStyle: "symbols",
    showStepperLines: false,
    ruleVariant: "none",
    titleWidth: 95,
    titleWeight: 400
  },
  gridSelection: "stepper_hybrid"
};

export const LABS_DETERMINATE_NEURAL_LIST_STATE: AppState = {
  mode: "light",
  preset: "labs_determinate_neural_list",
  gridGranularity: "3x3",
  loader: {
    hasContainment: false,
    loaderIconType: "dots",
    sparkState: "in_progress",
    loaderVariant: "with_badges",
    statusText: "Synthesizing research...",
    isExpanded: true,
    expandedStyle: "title_list_determinate_aurora",
    carouselMode: false,
    statusDetailTitle: "Exploring user feedback trends",
    statusDetailBody: "",
    detailItemCount: 4,
    detailItems: [
      {
        title: "Analyzing recent chats and emails",
        body: ""
      },
      {
        title: "Exploring user feedback trends",
        body: ""
      },
      {
        title: "Reviewing competitor strategies",
        body: ""
      },
      {
        title: "Synthesizing team meeting notes",
        body: ""
      }
    ],
    showBadges: true,
    animateBadges: true,
    badgeCount: "4+",
    selectedProductIcons: [
      "gmail",
      "docs",
      "sheets",
      "drive",
      "chat",
      "calendar"
    ],
    presentation: "freeform",
    webUrl: "mail.google.com/mail/u/0/#inbox",
    androidPosition: "bottom",
    showStepper: false,
    stepperStyle: "symbols",
    showStepperLines: false,
    ruleVariant: "none",
    titleWidth: 95,
    titleWeight: 400
  },
  gridSelection: "stepper_hybrid"
};

export const LABS_NEURAL_PIXEL_DRIFT_STATE: AppState = {
  mode: "light",
  preset: "labs_neural_pixel_drift",
  gridGranularity: "3x3",
  loader: {
    hasContainment: false,
    loaderIconType: "dots",
    sparkState: "in_progress",
    loaderVariant: "with_badges",
    statusText: "Synthesizing research...",
    statusTextEffect: "pixel_drift",
    particleCount: 70,
    particleSize: 9,
    mouseRadius: 45,
    mouseForce: 6,
    particleFontSize: 20,
    particleAnimateIn: false,
    isExpanded: false,
    expandedStyle: "title_list_aurora",
    carouselMode: false,
    statusDetailTitle: "Exploring user feedback trends",
    statusDetailBody: "",
    detailItemCount: 4,
    detailItems: [
      {
        title: "Analyzing recent chats and emails",
        body: ""
      },
      {
        title: "Exploring user feedback trends",
        body: ""
      },
      {
        title: "Reviewing competitor strategies",
        body: ""
      },
      {
        title: "Synthesizing team meeting notes",
        body: ""
      }
    ],
    showBadges: true,
    animateBadges: true,
    badgeCount: "4+",
    selectedProductIcons: [
      "gmail",
      "docs",
      "sheets",
      "drive",
      "chat",
      "calendar"
    ],
    presentation: "freeform",
    webUrl: "mail.google.com/mail/u/0/#inbox",
    androidPosition: "bottom",
    showStepper: false,
    stepperStyle: "symbols",
    showStepperLines: false,
    ruleVariant: "none",
    titleWidth: 95,
    titleWeight: 400
  },
  gridSelection: "stepper_hybrid"
};

export const LABS_NEURAL_AURORA_PARTICLES_STATE: AppState = {
  mode: "dark",
  preset: "labs_neural_aurora_particles",
  gridGranularity: "3x3",
  loader: {
    hasContainment: false,
    loaderIconType: "dots",
    sparkState: "in_progress",
    loaderVariant: "with_badges",
    statusText: "Synthesizing research...",
    isExpanded: true,
    expandedStyle: "title_list_neural",
    auroraParticlesOnDetailLines: true,
    auroraParticlesOnIcon: true,
    auroraParticleDensity: 5,
    auroraParticleSpeed: 2.0,
    auroraParticleSize: 1.0,
    statusDetailTitle: "Exploring user feedback trends",
    statusDetailBody: "",
    detailItemCount: 4,
    detailItems: [
      {
        title: "Analyzing recent chats and emails",
        body: ""
      },
      {
        title: "Exploring user feedback trends",
        body: ""
      },
      {
        title: "Reviewing competitor strategies",
        body: ""
      },
      {
        title: "Synthesizing team meeting notes",
        body: ""
      }
    ],
    showBadges: true,
    animateBadges: true,
    badgeCount: "4+",
    selectedProductIcons: [
      "gmail",
      "docs",
      "sheets",
      "drive",
      "chat",
      "calendar"
    ],
    presentation: "freeform",
    webUrl: "mail.google.com/mail/u/0/#inbox",
    androidPosition: "bottom",
    showStepper: false,
    stepperStyle: "symbols",
    showStepperLines: false,
    ruleVariant: "none",
    titleWidth: 95,
    titleWeight: 400
  },
  gridSelection: "stepper_hybrid"
};

export const LABS_NEURAL_GLOW_LAYER_STATE: AppState = {
  mode: "dark",
  preset: "labs_neural_glow_layer",
  gridGranularity: "3x3",
  loader: {
    hasContainment: false,
    loaderIconType: "dots",
    sparkState: "in_progress",
    loaderVariant: "default",
    statusText: "Synthesizing research...",
    isExpanded: false,
    expandedStyle: "title_list_neural",
    auroraParticlesOnTopTitle: true,
    auroraGlowOnTopTitle: true,
    textGlowEnabled: true,
    textGlowBlur: 16,
    textGlowOpacity: 0.9,
    textBlendMode: "plus-lighter",
    auroraParticlesOnDetailLines: false,
    auroraParticlesOnIcon: true,
    auroraParticleDensity: 5,
    auroraParticleSpeed: 2.0,
    auroraParticleSize: 1.0,
    auroraGlowPosition: "border_halo",
    auroraGlowColors: "blue_aurora",
    auroraGlowRadius: 14,
    auroraGlowBlur: 38,
    auroraGlowOpacity: 0.65,
    statusDetailTitle: "Exploring user feedback trends",
    statusDetailBody: "",
    detailItemCount: 4,
    detailItems: [
      {
        title: "Analyzing recent chats and emails",
        body: ""
      },
      {
        title: "Exploring user feedback trends",
        body: ""
      },
      {
        title: "Reviewing competitor strategies",
        body: ""
      },
      {
        title: "Synthesizing team meeting notes",
        body: ""
      }
    ],
    showBadges: false,
    animateBadges: true,
    badgeCount: "4+",
    selectedProductIcons: [
      "gmail",
      "docs",
      "sheets",
      "drive",
      "chat",
      "calendar"
    ],
    presentation: "freeform",
    webUrl: "mail.google.com/mail/u/0/#inbox",
    androidPosition: "bottom",
    showStepper: false,
    stepperStyle: "symbols",
    showStepperLines: false,
    ruleVariant: "none",
    titleWidth: 95,
    titleWeight: 400
  },
  gridSelection: "stepper_hybrid"
};

export const LABS_NEURAL_MESH_SHEET_STATE: AppState = {
  mode: "dark",
  preset: "labs_neural_mesh_sheet",
  gridGranularity: "3x3",
  loader: {
    hasContainment: false,
    loaderIconType: "dots",
    sparkState: "in_progress",
    loaderVariant: "default",
    statusText: "Mapping neural surface dynamics...",
    isExpanded: false,
    expandedStyle: "title_list_neural",
    neuralMeshStyle: "sheet_mesh",
    sheetWaveSpeed: 0.9,
    sheetWaveAmplitude: 50,
    sheetWireframeOpacity: 0.0,
    particleShape: "circle",
    auroraParticlesOnTopTitle: true,
    auroraGlowOnTopTitle: true,
    textGlowEnabled: true,
    textGlowBlur: 16,
    textGlowOpacity: 0.9,
    textBlendMode: "plus-lighter",
    auroraParticlesOnDetailLines: true,
    auroraParticlesOnIcon: true,
    auroraParticleDensity: 5,
    auroraParticleSpeed: 0.9,
    auroraParticleSize: 1.0,
    auroraGlowPosition: "border_halo",
    auroraGlowColors: "blue_aurora",
    auroraGlowRadius: 16,
    auroraGlowBlur: 38,
    auroraGlowOpacity: 0.65,
    statusDetailTitle: "Calculating 3D surface vectors",
    statusDetailBody: "",
    detailItemCount: 4,
    detailItems: [
      { title: "Initializing depth mesh grid", body: "" },
      { title: "Calculating 3D surface vectors", body: "" },
      { title: "Simulating fluid sheet dynamics", body: "" },
      { title: "Rendering neural surface nodes", body: "" }
    ],
    showBadges: false,
    animateBadges: true,
    badgeCount: "4+",
    selectedProductIcons: ["gmail", "docs", "sheets", "drive", "chat", "calendar"],
    presentation: "freeform",
    webUrl: "mail.google.com/mail/u/0/#inbox",
    androidPosition: "bottom",
    showStepper: false,
    stepperStyle: "symbols",
    showStepperLines: false,
    ruleVariant: "none",
    titleWidth: 95,
    titleWeight: 400
  },
  gridSelection: "stepper_hybrid"
};

export const LABS_AURORA_NEURAL_WAVE_POOL_STATE: AppState = {
  mode: "dark",
  preset: "labs_aurora_neural_wave_pool",
  gridGranularity: "3x3",
  loader: {
    hasContainment: false,
    loaderIconType: "dots",
    sparkState: "in_progress",
    loaderVariant: "default",
    statusText: "Thinking...",
    isExpanded: false,
    expandedStyle: "title_list_neural",
    neuralMeshStyle: "particles",
    auroraGlowPosition: "swipe_in_out",
    auroraGlowColors: "blue_aurora",
    auroraWaveOffset: 50,
    auroraWaveAutoPlay: true,
    auroraWaveSpeed: 1.5,
    auroraParticlesOnTopTitle: true,
    auroraGlowOnTopTitle: true,
    textGlowEnabled: true,
    textGlowBlur: 18,
    textGlowOpacity: 0.9,
    textBlendMode: "plus-lighter",
    auroraParticlesOnDetailLines: true,
    auroraParticlesOnIcon: true,
    auroraParticleDensity: 12,
    auroraParticleSpeed: 1.8,
    auroraParticleSize: 1.2,
    auroraGlowRadius: 24,
    auroraGlowBlur: 35,
    auroraGlowOpacity: 0.8,
    statusDetailTitle: "Simulating atmospheric wave swipe",
    statusDetailBody: "",
    detailItemCount: 4,
    detailItems: [
      { title: "Initializing left-to-right wave swipe", body: "" },
      { title: "Simulating atmospheric wave swipe", body: "" },
      { title: "Coupling neural particles with glow offset", body: "" },
      { title: "Synthesizing wave pool dynamics", body: "" }
    ],
    showBadges: false,
    animateBadges: true,
    badgeCount: "4+",
    selectedProductIcons: ["gmail", "docs", "sheets", "drive", "chat", "calendar"],
    presentation: "freeform",
    webUrl: "mail.google.com/mail/u/0/#inbox",
    androidPosition: "bottom",
    showStepper: false,
    stepperStyle: "symbols",
    showStepperLines: false,
    ruleVariant: "none",
    titleWidth: 95,
    titleWeight: 400
  },
  gridSelection: "stepper_hybrid"
};







