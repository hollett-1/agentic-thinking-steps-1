import { AppState, DetailItem } from './types';

export const SAMPLE_DETAILS: DetailItem[] = [
  {
    title: 'Analyzing recent chats and emails',
    body: 'My current approach involves systematically searching for unread emails from today and more recent emails containing specified keywords related to your project. I anticipate this straightforward approach will yield the desired results.'
  },
  {
    title: 'Searching Workspace documents & drive',
    body: 'Scanning all Google Docs, Sheets, and Slides modified in the last 7 days to compile key project milestones, action items, and relevant references.'
  },
  {
    title: 'Synthesizing research notes & summaries',
    body: 'Cross-referencing recent team discussions, meeting notes, and shared files to extract actionable insights and generate a cohesive summary.'
  },
  {
    title: 'Formulating response & checking references',
    body: 'Validating retrieved facts against authoritative internal sources, checking for accuracy, and structuring a clear, well-referenced response.'
  }
];

export const DEFAULT_STATE: AppState = {
  mode: 'light',
  preset: 'default_spark',
  gridGranularity: '3x3',
  loader: {
    hasContainment: false,
    loaderIconType: 'dots',
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
};

