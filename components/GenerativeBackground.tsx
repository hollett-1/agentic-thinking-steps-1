import React, { useMemo, useState, useEffect, useRef } from 'react';
import { AppState, GenerativeBackgroundProps } from '../types';
import { generateThemeFromSeed } from '../utils/color';
import { THEME_COLORS, THEME_COLORS_DARK } from '../themes';
import { useSpring } from '../hooks/useSpring';

const SYMBOL_PATHS: Record<string, string> = {
    star: 'M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z',
    favorite: 'M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.41,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.59,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z',
    diamond: 'M12,2L22,12L12,22L2,12L12,2Z',
    circle: 'M12,2A10,10 0 1,0 22,12A10,10 0 0,0 12,2Z',
    sparkles: 'M12,2L14,10L22,12L14,14L12,22L10,14L2,12L10,10L12,2Z',
    square: 'M3,3 H21 V21 H3 Z',
    triangle: 'M12,2 L22,22 H2 Z',
    pentagon: 'M12,2 L22,9 L18,22 H6 L2,9 Z',
    hexagon: 'M12,2 L21,7 V17 L12,22 L3,17 V7 Z',
    cross: 'M9,3 H15 V9 H21 V15 H15 V21 H9 V15 H3 V9 H9 Z',
    plus: 'M19,13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
    minus: 'M19,13H5v-2h14v2z',
    arrow_back: 'M20,11H7.83l5.59-5.59L12,4l-8,8l8,8l1.41-1.41L7.83,13H20V11z',
    arrow_forward: 'M12,4l-1.41,1.41L16.17,11H4v2h12.17l-5.59,5.59L12,20l8-8L12,4z',
    close: 'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41z',
    check: 'M9,16.17L4.83,12l-1.41,1.41L9,19 21,7l-1.41-1.41z',
    search: 'M15.5,14h-0.79l-0.28-0.27C15.41,12.59,16,11.11,16,9.5C16,5.91,13.09,3,9.5,3S3,5.91,3,9.5S5.91,16,9.5,16 c1.61,0,3.09-0.59,4.23-1.57l0.27,0.28v0.79l5,4.99L20.49,19L15.5,14z M9.5,14C7.01,14,5,11.99,5,9.5S7.01,5,9.5,5S14,7.01,14,9.5 S11.99,14,9.5,14z',
    home: 'M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z',
    settings: 'M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.33-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.44,0.17-0.48,0.41L9.21,5.34C8.62,5.58,8.09,5.9,7.59,6.28L5.2,5.32c-0.22-0.07-0.47,0-0.59,0.22L2.69,8.86 c-0.12,0.21-0.07,0.47,0.12,0.61l2.03,1.58C4.8,11.36,4.78,11.68,4.78,12c0,0.33,0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.37,2.53 c0.04,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.48-0.41l0.37-2.53c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.07,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.5c-1.93,0-3.5-1.57-3.5-3.5 c0-1.93,1.57-3.5,3.5-3.5s3.5,1.57,3.5,3.5C15.5,13.93,13.93,15.5,12,15.5z',
    delete: 'M6,19c0,1.1,0.9,2,2,2h8c1.1,0,2-0.9,2-2V7H6V19z M19,4h-3.5l-1-1h-5l-1,1H5v2h14V4z',
    edit: 'M3,17.25V21h3.75L17.81,9.94l-3.75-3.75L3,17.25z M20.71,7.04c0.39-0.39,0.39-1.02,0-1.41l-2.34-2.34c-0.39-0.39-1.02-0.39-1.41,0l-1.83,1.83l3.75,3.75L20.71,7.04z',
    share: 'M18,16.08c-0.76,0-1.44,0.3-1.96,0.77L8.91,12.7c0.05-0.23,0.09-0.46,0.09-0.7s-0.04-0.47-0.09-0.7l7.05-4.11 c0.54,0.5,1.25,0.81,2.04,0.81c1.66,0,3-1.34,3-3s-1.34-3-3-3s-3,1.34-3,3c0,0.24,0.04,0.47,0.09,0.7L8.04,9.81 C7.5,9.31,6.79,9,6,9c-1.66,0-3,1.34-3,3s1.34,3,3,3c0.79,0,1.5-0.31,2.04-0.81l7.12,4.16c-0.05,0.21-0.08,0.43-0.08,0.65 c0,1.61,1.31,2.92,2.92,2.92c1.61,0,2.92-1.31,2.92-2.92C20.92,17.39,19.61,16.08,18,16.08z',
    person: 'M12,12c2.21,0,4-1.79,4-4s-1.79-4-4-4s-4,1.79-4,4S9.79,12,12,12z M12,14c-2.67,0-8,1.34-8,4v2h16v-2C20,15.34,14.67,14,12,14z',
    mail: 'M20,4H4C2.9,4,2,4.9,2,6v12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V6C22,4.9,21.1,4,20,4z M20,8l-8,5L4,8V6l8,5l8-5V8z'
};

const DIGIT_COORDINATES: Record<number, { c: number; r: number }[]> = {
  0: [
    { c: 0, r: 1 }, { c: 0, r: 2 }, { c: 0, r: 3 }, { c: 0, r: 4 }, { c: 0, r: 5 },
    { c: 4, r: 1 }, { c: 4, r: 2 }, { c: 4, r: 3 }, { c: 4, r: 4 }, { c: 4, r: 5 },
    { c: 1, r: 0 }, { c: 2, r: 0 }, { c: 3, r: 0 },
    { c: 1, r: 6 }, { c: 2, r: 6 }, { c: 3, r: 6 }
  ],
  1: [
    { c: 1, r: 1 }, { c: 2, r: 0 }, { c: 2, r: 1 }, { c: 2, r: 2 }, { c: 2, r: 3 }, { c: 2, r: 4 }, { c: 2, r: 5 }, { c: 2, r: 6 }
  ],
  2: [
    { c: 0, r: 1 }, { c: 1, r: 0 }, { c: 2, r: 0 }, { c: 3, r: 0 }, { c: 4, r: 1 },
    { c: 4, r: 2 }, { c: 3, r: 3 }, { c: 2, r: 4 }, { c: 1, r: 5 },
    { c: 0, r: 6 }, { c: 1, r: 6 }, { c: 2, r: 6 }, { c: 3, r: 6 }, { c: 4, r: 6 }
  ],
  3: [
    { c: 0, r: 0 }, { c: 1, r: 0 }, { c: 2, r: 0 }, { c: 3, r: 0 }, { c: 4, r: 1 },
    { c: 4, r: 2 }, { c: 2, r: 3 }, { c: 3, r: 3 }, { c: 4, r: 4 }, { c: 4, r: 5 },
    { c: 0, r: 6 }, { c: 1, r: 6 }, { c: 2, r: 6 }, { c: 3, r: 6 }
  ],
  4: [
    { c: 0, r: 0 }, { c: 0, r: 1 }, { c: 0, r: 2 }, { c: 0, r: 3 },
    { c: 1, r: 3 }, { c: 2, r: 3 }, { c: 3, r: 3 }, { c: 4, r: 3 },
    { c: 3, r: 0 }, { c: 3, r: 1 }, { c: 3, r: 2 }, { c: 3, r: 4 }, { c: 3, r: 5 }, { c: 3, r: 6 }
  ],
  5: [
    { c: 0, r: 0 }, { c: 1, r: 0 }, { c: 2, r: 0 }, { c: 3, r: 0 }, { c: 4, r: 0 },
    { c: 0, r: 1 }, { c: 0, r: 2 }, { c: 0, r: 3 },
    { c: 1, r: 3 }, { c: 2, r: 3 }, { c: 3, r: 3 }, { c: 4, r: 4 }, { c: 4, r: 5 },
    { c: 3, r: 6 }, { c: 2, r: 6 }, { c: 1, r: 6 }, { c: 0, r: 5 }
  ],
  6: [
    { c: 2, r: 0 }, { c: 3, r: 0 }, { c: 1, r: 1 }, { c: 0, r: 2 },
    { c: 0, r: 3 }, { c: 0, r: 4 }, { c: 0, r: 5 },
    { c: 1, r: 6 }, { c: 2, r: 6 }, { c: 3, r: 6 },
    { c: 4, r: 5 }, { c: 4, r: 4 }, { c: 3, r: 3 }, { c: 2, r: 3 }, { c: 1, r: 3 }
  ],
  7: [
    { c: 0, r: 0 }, { c: 1, r: 0 }, { c: 2, r: 0 }, { c: 3, r: 0 }, { c: 4, r: 0 },
    { c: 4, r: 1 }, { c: 3, r: 2 }, { c: 3, r: 3 }, { c: 2, r: 4 }, { c: 2, r: 5 }, { c: 1, r: 6 }
  ],
  8: [
    { c: 1, r: 0 }, { c: 2, r: 0 }, { c: 3, r: 0 }, { c: 0, r: 1 }, { c: 4, r: 1 }, { c: 0, r: 2 }, { c: 4, r: 2 },
    { c: 1, r: 3 }, { c: 2, r: 3 }, { c: 3, r: 3 },
    { c: 0, r: 4 }, { c: 4, r: 4 }, { c: 0, r: 5 }, { c: 4, r: 5 }, { c: 1, r: 6 }, { c: 2, r: 6 }, { c: 3, r: 6 }
  ],
  9: [
    { c: 1, r: 0 }, { c: 2, r: 0 }, { c: 3, r: 0 }, { c: 0, r: 1 }, { c: 4, r: 1 }, { c: 0, r: 2 }, { c: 4, r: 2 },
    { c: 1, r: 3 }, { c: 2, r: 3 }, { c: 3, r: 3 }, { c: 4, r: 3 },
    { c: 4, r: 4 }, { c: 4, r: 5 },
    { c: 3, r: 6 }, { c: 2, r: 6 }, { c: 1, r: 6 }, { c: 0, r: 5 }
  ],
  10: [
    { c: -1.5, r: 1 }, { c: -0.5, r: 0 }, { c: -0.5, r: 1 }, { c: -0.5, r: 2 }, { c: -0.5, r: 3 }, { c: -0.5, r: 4 }, { c: -0.5, r: 5 }, { c: -0.5, r: 6 },
    { c: 2.5, r: 1 }, { c: 2.5, r: 2 }, { c: 2.5, r: 3 }, { c: 2.5, r: 4 }, { c: 2.5, r: 5 },
    { c: 5.5, r: 1 }, { c: 5.5, r: 2 }, { c: 5.5, r: 3 }, { c: 5.5, r: 4 }, { c: 5.5, r: 5 },
    { c: 3.5, r: 0 }, { c: 4.5, r: 0 }, { c: 3.5, r: 6 }, { c: 4.5, r: 6 }
  ]
};

const CUSTOM_SHAPES: Record<string, { d: string; w: number; h: number; label: string }> = {
    'shape-1': {
        label: 'Blob 1',
        w: 320, h: 290,
        d: 'M232.422 59.9068C223.213 45.2936 213.84 30.4777 201.389 18.8739C188.938 7.24119 172.808 -0.97696 156.27 0.0937147C141.748 1.04864 128.288 9.09317 117.662 19.5974C107.036 30.1015 98.7807 43.0365 90.6614 55.8556C68.7011 90.4645 46.7136 125.073 24.7533 159.711C14.3181 176.147 3.61045 193.307 0.722376 212.898C-2.76511 236.568 6.63475 260.673 23.3093 276.415C40.7467 292.88 69.0008 291.549 90.2254 287.035C113.493 282.086 136.244 272.797 159.975 272.797C180.301 272.797 199.945 279.685 219.726 284.691C239.479 289.668 260.704 292.735 279.776 285.327C303.453 276.154 320.454 250.082 319.991 223.315C319.555 198.892 293.508 156.759 293.508 156.759C293.508 156.759 252.78 92.1937 232.422 59.9068Z'
    },
    'shape-2': {
        label: 'Blob 2',
        w: 303, h: 312,
        d: 'M0 79.3221C0 35.5137 35.5137 0 79.3221 0H222.928C266.736 0 302.25 35.5137 302.25 79.3221C302.25 115.45 278.097 145.937 245.057 155.516C244.842 155.579 244.692 155.776 244.692 156C244.692 156.224 244.842 156.421 245.057 156.484C278.097 166.063 302.25 196.55 302.25 232.678C302.25 276.486 266.736 312 222.928 312H79.3221C35.5137 312 0 276.486 0 232.678C0 196.785 23.8388 166.461 56.547 156.674C56.845 156.585 57.0514 156.311 57.0514 156C57.0514 155.689 56.845 155.415 56.547 155.326C23.8388 145.539 0 115.214 0 79.3221Z'
    },
    'shape-3': {
        label: 'Ghost',
        w: 300, h: 300,
        d: 'M0 142.857C0 63.9593 67.1573 0 150 0C232.843 0 300 63.9593 300 142.857L300 242.857C300 274.416 273.137 300 240 300C230.178 300 220.907 297.752 212.724 293.768C208.554 291.737 204.394 289.512 200.216 287.277C185.513 279.411 170.592 271.429 154.27 271.429H145.73C129.408 271.429 114.487 279.411 99.7841 287.277C95.6062 289.512 91.4459 291.737 87.276 293.768C79.0926 297.752 69.8219 300 60 300C26.8629 300 0 274.416 0 242.857L0 142.857Z'
    },

    'shape-5': {
        label: 'Vase Shape',
        w: 296, h: 296,
        d: 'M21.0014 148C7.89536 132.339 0 112.126 0 90.0596C0 40.321 40.1131 0 89.5951 0C111.99 0 132.466 8.2594 148.173 21.9131C163.843 8.2594 184.271 0 206.614 0C255.981 0 296 40.321 296 90.0596C296 112.126 288.123 132.339 275.048 148C288.123 163.661 296 183.874 296 205.94C296 255.679 255.981 296 206.614 296C184.271 296 163.843 287.741 148.173 274.087C132.466 287.741 111.99 296 89.5951 296C40.1131 296 0 255.679 0 205.94C0 183.874 7.89536 163.661 21.0014 148Z'
    },
    'shape-6': {
        label: 'Organic Squiggle',
        w: 292, h: 292,
        d: 'M186.389 6.47298C249.109 -20.7672 312.767 42.8908 285.527 105.611L281.023 115.981C272.707 135.13 272.707 156.87 281.023 176.019L285.527 186.389C312.767 249.109 249.109 312.767 186.389 285.527L176.019 281.023C156.87 272.707 135.13 272.707 115.981 281.023L105.611 285.527C42.8908 312.767 -20.7672 249.109 6.47299 186.389L10.9768 176.019C19.2934 156.87 19.2934 135.13 10.9768 115.981L6.47298 105.611C-20.7672 42.8908 42.8908 -20.7672 105.611 6.47299L115.981 10.9768C135.13 19.2934 156.87 19.2934 176.019 10.9768L186.389 6.47298Z'
    },
    'shape-7': {
        label: 'Eye Shape',
        w: 300, h: 300,
        d: 'M231.309 231.309C161.705 300.913 68.8765 320.935 23.9707 276.029C-20.9352 231.123 -0.913343 138.295 68.6908 68.6908C138.295 -0.913329 231.123 -20.9352 276.029 23.9707C320.935 68.8765 300.913 161.705 231.309 231.309Z'
    },
    'shape-main': {
        label: 'Flower',
        w: 324, h: 320,
        d: 'M126.828 13.3757C128.575 11.9499 129.448 11.237 130.245 10.6352C149.03 -3.54505 174.97 -3.54505 193.755 10.6352C194.552 11.237 195.426 11.9499 197.172 13.3757C197.952 14.0122 198.342 14.3305 198.728 14.6334C207.568 21.5789 218.406 25.5149 229.653 25.8637C230.143 25.8789 230.647 25.8852 231.654 25.8977C233.911 25.9256 235.039 25.9396 236.038 25.9899C259.563 27.1743 279.435 43.8108 284.689 66.7206C284.912 67.693 285.122 68.7992 285.541 71.0116C285.728 71.9993 285.822 72.4931 285.922 72.9724C288.22 83.9624 293.987 93.9286 302.377 101.409C302.743 101.735 303.125 102.063 303.889 102.718C305.599 104.187 306.455 104.921 307.187 105.6C324.446 121.595 328.95 147.084 318.216 168.003C317.76 168.891 317.208 169.873 316.104 171.837C315.611 172.714 315.365 173.152 315.133 173.583C309.812 183.475 307.809 194.808 309.418 205.92C309.488 206.404 309.569 206.9 309.732 207.892C310.096 210.114 310.278 211.225 310.402 212.215C313.318 235.536 300.348 257.951 278.647 267.092C277.726 267.48 276.671 267.878 274.56 268.674C273.617 269.03 273.146 269.207 272.69 269.389C262.242 273.555 253.406 280.952 247.48 290.495C247.221 290.911 246.964 291.343 246.45 292.208C245.297 294.143 244.721 295.111 244.178 295.949C231.387 315.684 207.011 324.536 184.498 317.621C183.543 317.328 182.478 316.956 180.348 316.212C179.397 315.88 178.921 315.714 178.455 315.561C167.767 312.051 156.233 312.051 145.545 315.561C145.079 315.714 144.604 315.88 143.653 316.212C141.523 316.956 140.458 317.328 139.502 317.621C116.989 324.536 92.6131 315.684 79.8223 295.949C79.2794 295.111 78.7031 294.143 77.5505 292.208C77.036 291.343 76.7788 290.911 76.5203 290.495C70.5942 280.952 61.7586 273.555 51.3098 269.389C50.8541 269.207 50.3829 269.03 49.4406 268.674C47.3297 267.878 46.2742 267.48 45.3532 267.092C23.6525 257.951 10.6822 235.536 13.5983 212.215C13.722 211.225 13.9042 210.114 14.2684 207.892C14.431 206.9 14.5123 206.404 14.5825 205.92C16.1911 194.808 14.1882 183.475 8.86773 173.583C8.63566 173.152 8.38924 172.714 7.89641 171.837C6.79237 169.873 6.24036 168.891 5.78474 168.003C-4.9499 147.084 -0.445344 121.595 16.8131 105.6C17.5456 104.921 18.4009 104.187 20.1116 102.718C20.8752 102.063 21.257 101.735 21.623 101.409C30.0136 93.9285 35.7807 83.9624 38.0779 72.9724C38.1781 72.4931 38.2718 71.9993 38.459 71.0116C38.8785 68.7992 39.0883 67.6929 39.3113 66.7206C44.5654 43.8108 64.4372 27.1743 87.9625 25.9899C88.961 25.9396 90.0894 25.9256 92.346 25.8977C93.3534 25.8852 93.857 25.8789 94.3476 25.8637C105.594 25.5149 116.433 21.5789 125.273 14.6334C125.658 14.3305 126.048 14.0122 126.828 13.3757Z'
    }
};

export const GenerativeBackground: React.FC<GenerativeBackgroundProps> = ({ state, windowDimensions }) => {
    const config = state.generativeBackground;

    const [targetYaw, setTargetYaw] = useState(0);
    const [targetPitch, setTargetPitch] = useState(0);

    const springYaw = useSpring(targetYaw, {
        stiffness: 80,
        damping: 1.0,
        mass: 1.0,
        threshold: 0.001
    });

    const springPitch = useSpring(targetPitch, {
        stiffness: 80,
        damping: 1.0,
        mass: 1.0,
        threshold: 0.001
    });

    const targetScatter = config.scattered ? 1.0 : 0.0;
    const scatterSpring = useSpring(targetScatter, {
        stiffness: 7.5,
        damping: 0.85,
        mass: 1.0,
        threshold: 0.001
    });

    const morphSpeed = config.motionSpeed !== undefined ? config.motionSpeed : 5;
    const springNumber = useSpring(config.numberValue !== undefined ? config.numberValue : 1, {
        stiffness: morphSpeed * 5.0,
        damping: 0.82,
        mass: 1.0,
        threshold: 0.005
    });



    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const initialAngles = useRef({ yaw: 0, pitch: 0 });

    useEffect(() => {
        if (!isDragging) return;

        const handleWindowMouseMove = (e: MouseEvent) => {
            const dx = e.clientX - dragStart.current.x;
            const dy = e.clientY - dragStart.current.y;

            const sensitivity = 0.4; // degrees per pixel
            const newYaw = initialAngles.current.yaw + dx * sensitivity;
            const newPitch = Math.max(-85, Math.min(85, initialAngles.current.pitch + dy * sensitivity));

            setTargetYaw(newYaw);
            setTargetPitch(newPitch);
        };

        const handleWindowMouseUp = () => {
            setIsDragging(false);
        };

        window.addEventListener('mousemove', handleWindowMouseMove);
        window.addEventListener('mouseup', handleWindowMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleWindowMouseMove);
            window.removeEventListener('mouseup', handleWindowMouseUp);
        };
    }, [isDragging]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (config.patternType !== 'depth_warp') return;
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY };
        initialAngles.current = { yaw: targetYaw, pitch: targetPitch };
    };

    const [hoveredRole, setHoveredRole] = useState<string | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const updateTooltipPosition = (clientX: number, clientY: number) => {
        if (tooltipRef.current) {
            tooltipRef.current.style.left = `${clientX + 12}px`;
            tooltipRef.current.style.top = `${clientY + 12}px`;
        }
    };

    const size = Math.max(windowDimensions.width, windowDimensions.height) || 1000;

    const [vertexIndex, setVertexIndex] = useState(0);

    const rectW = size * 0.18;
    const rectH = size * 0.12;
    const vertices = useMemo(() => [
        { x: -rectW, y: -rectH }, // Top-Left
        { x: rectW, y: -rectH },  // Top-Right
        { x: rectW, y: rectH },   // Bottom-Right
        { x: -rectW, y: rectH }   // Bottom-Left
    ], [rectW, rectH]);

    const targetX = config.isPlaying ? vertices[vertexIndex].x : 0;
    const targetY = config.isPlaying ? vertices[vertexIndex].y : 0;

    const speed = config.motionSpeed !== undefined ? config.motionSpeed : 5;
    const vpStiffness = 5 + speed * 2;
    const vpDamping = 0.85;

    const vpSpringX = useSpring(targetX, {
        stiffness: vpStiffness,
        damping: vpDamping,
        mass: 1.0,
        threshold: 0.001
    });

    const vpSpringY = useSpring(targetY, {
        stiffness: vpStiffness,
        damping: vpDamping,
        mass: 1.0,
        threshold: 0.001
    });

    const [localTarget, setLocalTarget] = useState(config.seed);
    const [fallbackValue, setFallbackValue] = useState(config.seed);
    const svgRef = useRef<SVGSVGElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cellsRef = useRef<any[]>([]);

    const drawCanvas = (value: number) => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, size, size);

        const count = config.divisions * 2;
        const step = size / count;

        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        cellsRef.current.forEach(cell => {
            cell.elements.forEach(el => {
                const rotation = Math.sin(el.dist * 8 - value) * 180;
                const scale = 0.5 + 0.5 * Math.sin(el.dist * 5 + value);

                const cx = el.cx + step / 2;
                const cy = el.cy + step / 2;

                // Reset and apply transforms (much faster than save/restore)
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.translate(cx, cy);
                ctx.rotate(rotation * Math.PI / 180);

                ctx.fillStyle = el.fill;

                if (config.edgeGlow) {
                    const glowAmt = config.glowAmount !== undefined ? config.glowAmount : 5;
                    ctx.shadowColor = el.fill;
                    ctx.shadowBlur = glowAmt * 4;
                } else {
                    ctx.shadowBlur = 0;
                }

                if (el.type === 'path') {
                    const baseScale = (step * 0.8) / 24;
                    ctx.scale(baseScale * scale, baseScale * scale);
                    ctx.translate(-12, -12);
                    ctx.fill(el.path2D);
                } else if (el.type === 'rect') {
                    ctx.scale(scale, scale);

                    const rx = step * 0.1;
                    const ry = step * 0.1;
                    const x = el.x - el.cx - step / 2;
                    const y = el.y - el.cy - step / 2;
                    const w = el.w;
                    const h = el.h;

                    ctx.beginPath();
                    ctx.moveTo(x + rx, y);
                    ctx.lineTo(x + w - rx, y);
                    ctx.quadraticCurveTo(x + w, y, x + w, y + ry);
                    ctx.lineTo(x + w, y + h - ry);
                    ctx.quadraticCurveTo(x + w, y + h, x + w - rx, y + h);
                    ctx.lineTo(x + rx, y + h);
                    ctx.quadraticCurveTo(x, y + h, x, y + h - ry);
                    ctx.lineTo(x, y + ry);
                    ctx.quadraticCurveTo(x, y, x + rx, y);
                    ctx.closePath();
                    ctx.fill();
                }
            });
        });

        // Restore default transform and shadow
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.shadowBlur = 0;
    };

    const spring = useSpring(localTarget, {
        stiffness: config.motionStyle === 'steps' ? 60 : state.spring.stiffness,
        damping: config.motionStyle === 'steps' ? 1.2 : state.spring.damping,
        mass: config.motionStyle === 'steps' ? 1.5 : state.spring.mass,
        threshold: 0.001
    }, (value) => {
        if (config.patternType === 'fields') {
            drawCanvas(value);
        } else {
            setFallbackValue(value);
        }
    });

    useEffect(() => {
        if (!config.isPlaying) return;

        const speed = config.motionSpeed !== undefined ? config.motionSpeed : 5;

        if (config.motionStyle === 'steps') {
            // Stepped start-stop motion: duration between steps scale with motionSpeed parameter
            const stepInterval = Math.max(300, 2500 - (speed - 1) * 220);
            const interval = setInterval(() => {
                setLocalTarget(prev => prev + 2.0);
            }, stepInterval);
            return () => clearInterval(interval);
        } else {
            // Smooth continuous motion: increment speed scales with motionSpeed parameter
            const stepSize = 0.01 * speed;
            const interval = setInterval(() => {
                setLocalTarget(prev => prev + stepSize);
            }, 16);
            return () => clearInterval(interval);
        }
    }, [config.isPlaying, config.motionStyle, config.motionSpeed]);

    useEffect(() => {
        if (!config.isPlaying || config.patternType !== 'extruded_grid') return;

        const speed = config.motionSpeed !== undefined ? config.motionSpeed : 5;
        const intervalTime = Math.max(1200, 4000 - (speed - 1) * 350);

        const interval = setInterval(() => {
            setVertexIndex(prev => (prev + 1) % 4);
        }, intervalTime);

        return () => clearInterval(interval);
    }, [config.isPlaying, config.patternType, config.motionSpeed]);


    const theme = useMemo(() => {
        if (!config.enabled) return {} as Record<string, string>;

        if (state.style === 'custom') {
            return generateThemeFromSeed(state.customColor || '#0B57D0', state.mode === 'dark', state.themeVariant);
        } else if (state.themeVariant && state.themeVariant !== 'tonal_spot') {
            const baseTheme = state.mode === 'dark' ? THEME_COLORS_DARK[state.style] : THEME_COLORS[state.style];
            const seedColor = baseTheme.primary;
            return generateThemeFromSeed(seedColor, state.mode === 'dark', state.themeVariant);
        } else {
            return state.mode === 'dark' ? THEME_COLORS_DARK[state.style] : THEME_COLORS[state.style];
        }
    }, [state.style, state.customColor, state.mode, state.themeVariant, config.enabled]);

    const cells = useMemo(() => {
        if (!config.enabled || config.patternType === 'gradient_strips') return [];

        // Extract colors with their role names
        const colors: { role: string; hex: string }[] = [];
        for (const [role, hex] of Object.entries(theme)) {
            colors.push({ role, hex: hex as string });
        }

        const divisions = config.divisions;
        const cellWidth = size / divisions;
        const cellHeight = size / divisions;

        const orientation = config.lineOrientation || 'mix';
        const baseSeed = (config.patternType === 'fields' || config.patternType === 'simplified_fields') ? 0 : fallbackValue;
        const staticSeed = config.seed;

        // Deterministic hash function for grid position
        function hash(x: number, y: number) {
            const val = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
            return val - Math.floor(val);
        }

        function random(i: number, j: number) {
            // Center the coordinates so scaling feels like it expands from center
            const di = i - Math.floor(divisions / 2);
            const dj = j - Math.floor(divisions / 2);
            const s = staticSeed + hash(di, dj) * 1000;
            const x = Math.sin(s) * 10000;
            return x - Math.floor(x);
        }

        const result = [];

        if (config.patternType === 'fields' || config.patternType === 'simplified_fields') {
            const count = divisions * 2;
            const step = size / count;

            for (let i = 0; i < count; i++) {
                for (let j = 0; j < count; j++) {
                    const x = i * step;
                    const y = j * step;

                    const nx = (x / size) * 2 - 1;
                    const ny = (y / size) * 2 - 1;

                    const dist = Math.sqrt(nx * nx + ny * ny);


                    const primaryColorObj = colors.find(c => c.role === 'primary') || colors[0];
                    const colorObj = config.singleColor ? primaryColorObj : colors[Math.floor(hash(i, j) * colors.length)];

                    result.push({
                        x, y, w: step, h: step,
                        color1: 'transparent',
                        role1: colorObj.role,
                        type: 5,
                        elements: [config.useSymbols ? {
                            type: 'path',
                            cx: x, cy: y,
                            dist,
                            d: SYMBOL_PATHS[config.selectedSymbol || 'star'],
                            path2D: new Path2D(SYMBOL_PATHS[config.selectedSymbol || 'star']),
                            fill: colorObj.hex,
                            role: colorObj.role,
                        } : {
                            type: 'rect',
                            x: x + step * 0.1, y: y + step * 0.4,
                            cx: x, cy: y,
                            dist,
                            w: step * 0.8, h: step * 0.2,
                            rx: step * 0.1, ry: step * 0.1,
                            fill: colorObj.hex,
                            role: colorObj.role,
                        }]
                    });
                }
            }
        } else {
            // Default Grid Pattern
            for (let i = 0; i < divisions; i++) {
                for (let j = 0; j < divisions; j++) {
                    const x = i * cellWidth;
                    const y = j * cellHeight;

                    const nx = (x / size) * 2 - 1;
                    const ny = (y / size) * 2 - 1;
                    const dist = Math.sqrt(nx * nx + ny * ny);

                    // Use position-based random
                    const r1 = random(i, j);
                    const r2 = random(i + 100, j + 100); // offset for second random value

                    let type = Math.floor(r1 * 5);

                    // Apply line orientation constraint
                    if (orientation === 'horizontal') {
                        if (type === 1) type = 2; // vertical lines -> horizontal lines
                        if (type === 3) type = 4; // vertical bars -> horizontal bars
                    } else if (orientation === 'vertical') {
                        if (type === 2) type = 1; // horizontal lines -> vertical lines
                        if (type === 4) type = 3; // horizontal bars -> vertical bars
                    }

                    const colorObj1 = colors[Math.floor(r1 * colors.length)];
                    const colorObj2 = colors[Math.floor(r2 * colors.length)];

                    const cell = {
                        x, y, w: cellWidth, h: cellHeight,
                        color1: colorObj1.hex, color2: colorObj2.hex,
                        role1: colorObj1.role, role2: colorObj2.role,
                        type, elements: [] as any[]
                    };

                    if (type === 1) {
                        // Thin Vertical Lines
                        const count = 10;
                        const stripeWidth = cellWidth / (count * 2);
                        for (let k = 0; k < count * 2; k += 2) {
                            cell.elements.push({
                                type: 'rect',
                                x: x + k * stripeWidth, y,
                                w: stripeWidth, h: cellHeight,
                                cx: x + cellWidth / 2, cy: y + cellHeight / 2,
                                dist,
                                fill: colorObj2.hex,
                                role: colorObj2.role
                            });
                        }
                    } else if (type === 2) {
                        // Thin Horizontal Lines
                        const count = 10;
                        const stripeHeight = cellHeight / (count * 2);
                        for (let k = 0; k < count * 2; k += 2) {
                            cell.elements.push({
                                type: 'rect',
                                x, y: y + k * stripeHeight,
                                w: cellWidth, h: stripeHeight,
                                cx: x + cellWidth / 2, cy: y + cellHeight / 2,
                                dist,
                                fill: colorObj2.hex,
                                role: colorObj2.role
                            });
                        }
                    } else if (type === 3) {
                        // Thick Vertical Bars (rounded)
                        const barWidth = cellWidth * 0.2;
                        const barCount = 3;
                        const gap = (cellWidth - (barWidth * barCount)) / (barCount + 1);

                        for (let k = 0; k < barCount; k++) {
                            const bx = x + gap + k * (barWidth + gap);
                            const by = y + cellHeight * 0.1;
                            const bh = cellHeight * 0.8;
                            cell.elements.push({
                                type: 'rect',
                                x: bx, y: by,
                                w: barWidth, h: bh,
                                rx: barWidth / 2, ry: barWidth / 2,
                                cx: x + cellWidth / 2, cy: y + cellHeight / 2,
                                dist,
                                fill: colorObj2.hex,
                                role: colorObj2.role
                            });
                        }
                    } else if (type === 4) {
                        // Thick Horizontal Bars (rounded)
                        const barHeight = cellHeight * 0.2;
                        const barCount = 2;
                        const gap = (cellHeight - (barHeight * barCount)) / (barCount + 1);

                        for (let k = 0; k < barCount; k++) {
                            const bx = x + cellWidth * 0.1;
                            const by = y + gap + k * (barHeight + gap);
                            const bw = cellWidth * 0.8;
                            cell.elements.push({
                                type: 'rect',
                                x: bx, y: by,
                                w: bw, h: barHeight,
                                rx: barHeight / 2, ry: barHeight / 2,
                                cx: x + cellWidth / 2, cy: y + cellHeight / 2,
                                dist,
                                fill: colorObj2.hex,
                                role: colorObj2.role
                            });
                        }
                    }
                    result.push(cell);
                }
            }
        }
        return result;
    }, [config, state.customColor, state.mode, state.style, size, fallbackValue, state.themeVariant]);

    const depthWarpDots = useMemo(() => {
        if (!config.enabled || config.patternType !== 'depth_warp') return [];

        const colors: { role: string; hex: string }[] = [];
        for (const [role, hex] of Object.entries(theme)) {
            colors.push({ role, hex: hex as string });
        }
        if (colors.length === 0) return [];

        const divisions = config.divisions || 10;
        const numRows = divisions * 2;
        const numCols = divisions * 2;

        const D = config.warpPerspective !== undefined ? config.warpPerspective : 8;
        const R = config.warpRadius !== undefined ? config.warpRadius : 1.0;
        const C = config.warpCurvature !== undefined ? config.warpCurvature : 2.0;
        const tiltDegBase = config.warpTilt !== undefined ? config.warpTilt : 30;
        const tiltDeg = tiltDegBase + springPitch.value;
        const tilt = (tiltDeg * Math.PI) / 180;

        const yawDeg = springYaw.value;
        const yaw = (yawDeg * Math.PI) / 180;

        const aspect = config.warpAspect !== undefined ? config.warpAspect : 1.0;
        const H = config.warpHeight !== undefined ? config.warpHeight : 2.5;
        const waveAmp = config.warpWaveAmplitude !== undefined ? config.warpWaveAmplitude : 0.0;
        const waveFreq = config.warpWaveFrequency !== undefined ? config.warpWaveFrequency : 4.0;

        const projScale = size * 0.45;
        const dots = [];

        // Animation: rotate around the vertical (Y) axis
        const rotOffset = fallbackValue * 0.2;
        const scatterVal = scatterSpring.value;

        function hash(x: number, y: number) {
            const val = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
            return val - Math.floor(val);
        }

        for (let i = 0; i < numRows; i++) {
            const v = (i / (numRows - 1)) * 2 - 1;
            const r = R + C * v * v + waveAmp * Math.sin(waveFreq * v * Math.PI);

            for (let j = 0; j < numCols; j++) {
                const theta = (j / numCols) * 2 * Math.PI + rotOffset;

                // Random 3D offset vectors
                const ox = (hash(i, j * 7) * 2 - 1) * 8.0;
                const oy = (hash(i * 13, j) * 2 - 1) * 8.0;
                const oz = (hash(i * 17, j * 3) * 2 - 1) * 6.0;

                const x3d = r * Math.cos(theta) * aspect + ox * scatterVal;
                const y3d = v * H + oy * scatterVal;
                const z3d = r * Math.sin(theta) + oz * scatterVal;

                // Rotate around Y-axis (yaw)
                const xYaw = x3d * Math.cos(yaw) - z3d * Math.sin(yaw);
                const zYaw = x3d * Math.sin(yaw) + z3d * Math.cos(yaw);
                const yYaw = y3d;

                // Rotate around X-axis by tilt angle
                const xRot = xYaw;
                const yRot = yYaw * Math.cos(tilt) - zYaw * Math.sin(tilt);
                const zRot = yYaw * Math.sin(tilt) + zYaw * Math.cos(tilt);

                const distToCam = D - zRot;
                if (distToCam <= 0.1) continue;

                const xProj = xRot / distToCam;
                const yProj = yRot / distToCam;

                const xScreen = size / 2 + xProj * projScale;
                const yScreen = size / 2 + yProj * projScale;

                // Perspective scale factor for size of dot
                const pScale = Math.pow(1.0 / distToCam, 1.8);
                const baseDotSize = (size / divisions) * 0.25;
                const dotRadius = baseDotSize * pScale * 25.0;

                const primaryColorObj = colors.find(c => c.role === 'primary') || colors[0];
                const colorObj = config.singleColor ? primaryColorObj : colors[(i + j) % colors.length];

                dots.push({
                    x: xScreen,
                    y: yScreen,
                    z: zRot,
                    r: Math.max(0.5, dotRadius),
                    scale: pScale * 1.5,
                    fill: colorObj.hex,
                    role: colorObj.role,
                    useSymbol: config.useSymbols,
                    d: SYMBOL_PATHS[config.selectedSymbol || 'star']
                });
            }
        }

        // Painter's algorithm
        dots.sort((a, b) => a.z - b.z);

        return dots;
    }, [config, theme, size, fallbackValue, springYaw.value, springPitch.value, scatterSpring.value]);

    const extrudedGridData = useMemo(() => {
        if (!config.enabled || config.patternType !== 'extruded_grid') return [];

        const colors: { role: string; hex: string }[] = [];
        for (const [role, hex] of Object.entries(theme)) {
            colors.push({ role, hex: hex as string });
        }
        if (colors.length === 0) return [];

        const divisions = config.divisions || 10;
        const cellSize = size / divisions;

        // Vanishing point coordinates using the new rectangular animation springs
        const vx = size / 2 + vpSpringX.value;
        const vy = size / 2 + vpSpringY.value;

        const items = [];

        function hash(x: number, y: number) {
            const val = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
            return val - Math.floor(val);
        }

        for (let row = 0; row < divisions; row++) {
            for (let col = 0; col < divisions; col++) {
                const px = (col + 0.5) * cellSize;
                const py = (row + 0.5) * cellSize;

                // Distance/Direction from particle to vanishing point
                const dx = vx - px;
                const dy = vy - py;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Grid divisions size-based radius
                const baseRadius = cellSize * 0.25;

                const radius = baseRadius;

                const primaryColorObj = colors.find(c => c.role === 'primary') || colors[0];
                // Assign colors deterministically based on grid coordinates
                const colorObj = config.singleColor ? primaryColorObj : colors[(row + col) % colors.length];

                // Calculate normal vector perpendicular to direction vector
                let pathPoints = "";
                if (dist > 1.0) {
                    const nx = -dy / dist;
                    const ny = dx / dist;

                    // Circumference points on front circle
                    const ax = px + radius * nx;
                    const ay = py + radius * ny;
                    const bx = px - radius * nx;
                    const by = py - radius * ny;

                    // Converged/Tapered end points at/near vanishing point
                    const taper = 0.25; // taper ratio at the vanishing point
                    const endRadius = radius * taper;
                    const apx = vx + endRadius * nx;
                    const apy = vy + endRadius * ny;
                    const bpx = vx - endRadius * nx;
                    const bpy = vy - endRadius * ny;

                    pathPoints = `M ${ax.toFixed(1)} ${ay.toFixed(1)} L ${bx.toFixed(1)} ${by.toFixed(1)} L ${bpx.toFixed(1)} ${bpy.toFixed(1)} L ${apx.toFixed(1)} ${apy.toFixed(1)} Z`;
                }

                items.push({
                    row,
                    col,
                    px,
                    py,
                    radius,
                    fill: colorObj.hex,
                    role: colorObj.role,
                    dx,
                    dy,
                    dist,
                    pathPoints,
                    useSymbol: config.useSymbols,
                    d: SYMBOL_PATHS[config.selectedSymbol || 'star']
                });
            }
        }

        // Painter's algorithm: sort by distance to vanishing point descending (outer first, inner last)
        items.sort((a, b) => b.dist - a.dist);

        return items;
    }, [config, theme, size, fallbackValue, vpSpringX.value, vpSpringY.value]);

    const metaballsData = useMemo(() => {
        if (!config.enabled || config.patternType !== 'metaballs') return [];

        const colors: { role: string; hex: string }[] = [];
        for (const [role, hex] of Object.entries(theme)) {
            colors.push({ role, hex: hex as string });
        }
        if (colors.length === 0) return [];

        const divisions = config.divisions || 10;
        const cellSize = size / divisions;

        const items = [];

        function hash(x: number, y: number) {
            const val = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
            return val - Math.floor(val);
        }

        // We can place multiple overlapping pills per column
        for (let col = 0; col < divisions; col++) {
            // Number of pills per column
            const numPills = 3;
            for (let row = 0; row < numPills; row++) {
                const px = (col + 0.5) * cellSize;
                const py = (row + 0.5) * (size / numPills);

                // Oscillate vertical offset
                const speedMult = 1.0 + hash(col, row) * 0.5;
                const phase = col * 0.8 + row * 1.5 + fallbackValue * 1.2 * speedMult;
                const yOffset = config.isPlaying ? Math.sin(phase) * (size / (numPills * 2.5)) : 0;

                // Width of the pill
                const w = cellSize * 0.45;
                // Height of the pill: let's make it vary slightly
                const h = (size / numPills) * (0.5 + 0.2 * hash(row, col * 3));

                const primaryColorObj = colors.find(c => c.role === 'primary') || colors[0];
                const colorObj = config.singleColor ? primaryColorObj : colors[(col + row) % colors.length];

                items.push({
                    col,
                    row,
                    x: px - w / 2,
                    y: py - h / 2 + yOffset,
                    w,
                    h,
                    rx: w / 2,
                    fill: colorObj.hex,
                    role: colorObj.role
                });
            }
        }

        return items;
    }, [config, theme, size, fallbackValue]);

    const concentricWarpData = useMemo(() => {
        if (!config.enabled || config.patternType !== 'concentric_warp') return [];

        const colors: { role: string; hex: string }[] = [];
        for (const [role, hex] of Object.entries(theme)) {
            colors.push({ role, hex: hex as string });
        }
        if (colors.length === 0) return [];

        const divisions = config.divisions || 12;
        const numRings = Math.max(3, divisions);
        const maxRadius = size * 0.45;
        const spacing = maxRadius / numRings;

        const warp = config.warpCurvature !== undefined ? config.warpCurvature : 0.5;

        // Size Focus controls which row of particles is largest
        // If playing, animate focus back and forth from 0.0 to 1.0
        const sizeFocus = config.isPlaying
            ? 0.5 + 0.5 * Math.sin(fallbackValue * 0.6)
            : (config.warpRadius !== undefined ? config.warpRadius : 1.0);

        const dots: any[] = [];

        for (let i = 1; i <= numRings; i++) {
            // Normalized concentric ring index (0.0 to 1.0)
            const u = numRings > 1 ? (i - 1) / (numRings - 1) : 0.5;

            // Size factor peaking at sizeFocus (minimum size factor is 0.25 to prevent tiny dots)
            const sizeFactor = 0.25 + 0.75 * (1.0 - Math.abs(u - sizeFocus));

            // Define rows to generate for this ring index
            const isDouble = config.doubleRings || false;
            const subRows = isDouble
                ? [
                    { rOffset: -spacing * 0.16, angleOffset: 0.0 },       // Inner sub-row
                    { rOffset: spacing * 0.16, angleOffset: 0.5 }        // Outer staggered sub-row
                ]
                : [
                    { rOffset: 0.0, angleOffset: 0.0 }
                ];

            // Base radius of this ring index
            const rBase = (i / numRings) * maxRadius;

            subRows.forEach((subRow, subIdx) => {
                const r = Math.max(10, rBase + subRow.rOffset);
                const numPoints = Math.round(8 + i * 4.5);

                const twistOffset = config.isPlaying ? fallbackValue * 0.15 * (1.0 - i / numRings) : 0;

                for (let j = 0; j < numPoints; j++) {
                    // Stagger points in outer sub-row by offset of 0.5 step
                    const angleStepIndex = j + subRow.angleOffset;
                    const theta = (angleStepIndex / numPoints) * 2 * Math.PI + twistOffset;

                    const xBase = r * Math.cos(theta);
                    const yBase = r * Math.sin(theta);

                    const denom = 1.0 - (warp * yBase) / maxRadius;
                    const scale = 1.0 / Math.max(0.1, denom);

                    const xProj = xBase * scale;
                    const yProj = yBase * scale;

                    const xScreen = size / 2 + xProj;
                    const yScreen = size / 2 + yProj;

                    const baseDotRadius = (size / numRings) * 0.14;
                    const dotRadius = Math.max(0.6, baseDotRadius * scale * sizeFactor * 0.85);

                    // Oval Warp calculations
                    const isOval = config.ovalWarp || false;
                    const angleDeg = isOval ? (theta + Math.PI / 2) * (180 / Math.PI) : 0;
                    const scaleX = isOval ? scale * 1.45 * sizeFactor : scale * sizeFactor;
                    const scaleY = isOval ? scale * 0.75 * sizeFactor : scale * sizeFactor;

                    const primaryColorObj = colors.find(c => c.role === 'primary') || colors[0];
                    const colorObj = config.singleColor ? primaryColorObj : colors[(i + j + subIdx) % colors.length];

                    dots.push({
                        x: xScreen,
                        y: yScreen,
                        r: dotRadius,
                        fill: colorObj.hex,
                        role: colorObj.role,
                        angleDeg,
                        scaleX,
                        scaleY,
                        useSymbol: config.useSymbols,
                        d: SYMBOL_PATHS[config.selectedSymbol || 'star']
                    });
                }
            });
        }

        return dots;
    }, [config, theme, size, fallbackValue]);

    const particleDigitsData = useMemo(() => {
        if (!config.enabled || config.patternType !== 'particle_digits') return [];

        const colors: { role: string; hex: string }[] = [];
        for (const [role, hex] of Object.entries(theme)) {
            colors.push({ role, hex: hex as string });
        }
        if (colors.length === 0) return [];

        const numParticles = (config.divisions || 10) * 3;
        const scaleVal = config.numberScale !== undefined ? config.numberScale : 1.0;
        const cellSize = size * 0.082 * scaleVal;

        // Current spring-interpolated floating value
        const val = Math.max(0, Math.min(10, springNumber.value));
        const lower = Math.floor(val);
        const upper = Math.min(10, lower + 1);
        const t = val - lower;

        const dots = [];

        for (let i = 0; i < numParticles; i++) {
            // Target coordinates for lower integer number
            const coords1 = DIGIT_COORDINATES[lower];
            const cell1 = coords1[i % coords1.length];
            const x1 = size / 2 + (cell1.c - 2.0) * cellSize;
            const y1 = size / 2 + (cell1.r - 3.0) * cellSize;

            // Target coordinates for upper integer number
            const coords2 = DIGIT_COORDINATES[upper];
            const cell2 = coords2[i % coords2.length];
            const x2 = size / 2 + (cell2.c - 2.0) * cellSize;
            const y2 = size / 2 + (cell2.r - 3.0) * cellSize;

            // Linear interpolate between them
            const x = x1 + (x2 - x1) * t;
            const y = y1 + (y2 - y1) * t;

            // Simple scale factor that drops slightly during transitions for organic stretch feel
            const transitionStretch = 1.0 - 0.15 * Math.sin(t * Math.PI);
            const dotRadius = size * 0.023 * transitionStretch * scaleVal;

            const primaryColorObj = colors.find(c => c.role === 'primary') || colors[0];
            const fillHex = config.singleColor ? primaryColorObj.hex : '#ffffff';
            const roleStr = config.singleColor ? primaryColorObj.role : 'primary';

            dots.push({
                x,
                y,
                r: dotRadius,
                fill: fillHex,
                role: roleStr,
                scale: transitionStretch * 0.65 * scaleVal,
                useSymbol: config.useSymbols,
                d: SYMBOL_PATHS[config.selectedSymbol || 'star']
            });
        }

        return dots;
    }, [config, theme, size, springNumber.value]);




    const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const scaleX = size / rect.width;
        const scaleY = size / rect.height;
        const gridX = x * scaleX;
        const gridY = y * scaleY;

        const count = config.divisions * 2;
        const step = size / count;

        const col = Math.floor(gridX / step);
        const row = Math.floor(gridY / step);

        if (col >= 0 && col < count && row >= 0 && row < count) {
            const cellIndex = col * count + row;
            const cell = cells[cellIndex];
            if (cell) {
                setHoveredRole(cell.role1);
            }
        } else {
            setHoveredRole(null);
        }
        updateTooltipPosition(e.clientX, e.clientY);
    };

    useEffect(() => {
        cellsRef.current = cells;
        if (config.patternType === 'fields') {
            drawCanvas(spring.current);
        }
    }, [cells, config.patternType]);

    const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        updateTooltipPosition(e.clientX, e.clientY);
    };

    if (!config.enabled) return null;

    return (
        <>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                {config.patternType === 'fields' ? (
                    <canvas
                        ref={canvasRef}
                        width={size}
                        height={size}
                        style={{
                            background: state.mode === 'dark' ? '#121212' : 'white'
                        }}
                        className="pointer-events-auto cursor-crosshair"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseLeave={() => setHoveredRole(null)}
                    />
                ) : (
                    <svg
                        ref={svgRef}
                        width={size}
                        height={size}
                        viewBox={`0 0 ${size} ${size}`}
                        style={{
                            background: config.patternType === 'particle_digits' ? 'transparent' : (state.mode === 'dark' ? '#121212' : 'white'),
                            overflow: 'visible'
                        }}
                        className={`pointer-events-auto ${config.patternType === 'depth_warp' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}`}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleSvgMouseMove}
                        onMouseLeave={() => setHoveredRole(null)}
                    >
                        <defs>
                            {/* Inner Glow Filter for particles */}
                            <filter id="ball-inner-glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff" />
                                <feFlood flood-color="white" flood-opacity="0.55" result="flood" />
                                <feComposite in2="shadowDiff" operator="in" result="innerGlow" />
                                <feComposite in2="SourceGraphic" operator="over" result="glowingGraphic" />
                            </filter>

                            {/* Extrusion Noise Filter for grain effect */}
                            <filter id="extrusion-noise" x="-20%" y="-20%" width="140%" height="140%">
                                <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="1" result="noise" />
                                <feColorMatrix type="matrix" values="0 0 0 0 0.5
                                                                     0 0 0 0 0.5
                                                                     0 0 0 0 0.5
                                                                     0 0 0 0.22 0" result="grayNoise" />
                                <feComposite operator="in" in="grayNoise" in2="SourceGraphic" result="clippedNoise" />
                                <feMerge>
                                    <feMergeNode in="SourceGraphic" />
                                    <feMergeNode in="clippedNoise" />
                                </feMerge>
                            </filter>

                            {/* Gooey Metaballs Filter */}
                            <filter id="metaballs-goo" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
                                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -9" result="goo" />
                                <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                            </filter>
                        </defs>
                        {config.patternType === 'depth_warp' ? (
                            <g>
                                {depthWarpDots.map((dot, idx) => (
                                    dot.useSymbol ? (
                                        <path
                                            key={idx}
                                            d={dot.d}
                                            fill={dot.fill}
                                            filter={config.innerGlow ? "url(#ball-inner-glow)" : undefined}
                                            transform={`translate(${dot.x}, ${dot.y}) scale(${dot.scale}) translate(-12, -12)`}
                                        >
                                            <title>{dot.role}</title>
                                        </path>
                                    ) : (
                                        <circle
                                            key={idx}
                                            cx={dot.x}
                                            cy={dot.y}
                                            r={dot.r}
                                            fill={dot.fill}
                                            filter={config.innerGlow ? "url(#ball-inner-glow)" : undefined}
                                        >
                                            <title>{dot.role}</title>
                                        </circle>
                                    )
                                ))}
                            </g>
                        ) : config.patternType === 'extruded_grid' ? (
                            <g>
                                {/* Render Extrusion Trails first */}
                                {extrudedGridData.map((item, idx) => (
                                    item.pathPoints && (
                                        <path
                                            key={`trail-${idx}`}
                                            d={item.pathPoints}
                                            fill={`url(#ext-grad-${idx})`}
                                            filter="url(#extrusion-noise)"
                                        />
                                    )
                                ))}

                                {/* Render Front Face Circles/Symbols */}
                                {extrudedGridData.map((item, idx) => (
                                    item.useSymbol ? (
                                        <path
                                            key={`face-${idx}`}
                                            d={item.d}
                                            fill={item.fill}
                                            filter={config.innerGlow ? "url(#ball-inner-glow)" : undefined}
                                            transform={`translate(${item.px}, ${item.py}) scale(${(item.radius * 2) / 24}) translate(-12, -12)`}
                                        >
                                            <title>{item.role}</title>
                                        </path>
                                    ) : (
                                        <circle
                                            key={`face-${idx}`}
                                            cx={item.px}
                                            cy={item.py}
                                            r={item.radius}
                                            fill={item.fill}
                                            filter={config.innerGlow ? "url(#ball-inner-glow)" : undefined}
                                        >
                                            <title>{item.role}</title>
                                        </circle>
                                    )
                                ))}

                                {/* Dynamic gradients for each trail */}
                                <defs>
                                    {extrudedGridData.map((item, idx) => (
                                        <linearGradient
                                            key={`grad-${idx}`}
                                            id={`ext-grad-${idx}`}
                                            x1={item.px}
                                            y1={item.py}
                                            x2={item.px + item.dx}
                                            y2={item.py + item.dy}
                                            gradientUnits="userSpaceOnUse"
                                        >
                                            <stop offset="0%" stopColor={item.fill} stopOpacity="0.85" />
                                            <stop offset="35%" stopColor={item.fill} stopOpacity="0.4" />
                                            <stop offset="100%" stopColor={item.fill} stopOpacity="0.0" />
                                        </linearGradient>
                                    ))}
                                </defs>
                            </g>
                        ) : config.patternType === 'metaballs' ? (
                            <g filter={config.innerGlow ? "url(#ball-inner-glow)" : undefined}>
                                <g filter="url(#metaballs-goo)">
                                    {metaballsData.map((item, idx) => (
                                        <rect
                                            key={idx}
                                            x={item.x}
                                            y={item.y}
                                            width={item.w}
                                            height={item.h}
                                            rx={item.rx}
                                            ry={item.rx}
                                            fill={item.fill}
                                        >
                                            <title>{item.role}</title>
                                        </rect>
                                    ))}
                                </g>
                            </g>
                        ) : config.patternType === 'concentric_warp' ? (
                            <g>
                                {concentricWarpData.map((dot, idx) => (
                                    dot.useSymbol ? (
                                        <path
                                            key={idx}
                                            d={dot.d}
                                            fill={dot.fill}
                                            filter={config.innerGlow ? "url(#ball-inner-glow)" : undefined}
                                            transform={`translate(${dot.x}, ${dot.y}) rotate(${dot.angleDeg}) scale(${dot.scaleX}, ${dot.scaleY}) translate(-12, -12)`}
                                        >
                                            <title>{dot.role}</title>
                                        </path>
                                    ) : (
                                        // If ovalWarp is active, draw as rotated ellipse, else draw as simple circle
                                        dot.angleDeg !== 0 ? (
                                            <ellipse
                                                key={idx}
                                                cx={0}
                                                cy={0}
                                                rx={dot.r}
                                                ry={dot.r}
                                                fill={dot.fill}
                                                filter={config.innerGlow ? "url(#ball-inner-glow)" : undefined}
                                                transform={`translate(${dot.x}, ${dot.y}) rotate(${dot.angleDeg}) scale(1.45, 0.75)`}
                                            >
                                                <title>{dot.role}</title>
                                            </ellipse>
                                        ) : (
                                            <circle
                                                key={idx}
                                                cx={dot.x}
                                                cy={dot.y}
                                                r={dot.r}
                                                fill={dot.fill}
                                                filter={config.innerGlow ? "url(#ball-inner-glow)" : undefined}
                                            >
                                                <title>{dot.role}</title>
                                            </circle>
                                        )
                                    )
                                ))}
                            </g>
                        ) : config.patternType === 'particle_digits' ? (
                            <g filter={config.metaballQuality ? "url(#metaballs-goo)" : undefined}>
                                {particleDigitsData.map((dot, idx) => (
                                    dot.useSymbol ? (
                                        <path
                                            key={idx}
                                            d={dot.d}
                                            fill={dot.fill}
                                            filter={config.innerGlow ? "url(#ball-inner-glow)" : undefined}
                                            transform={`translate(${dot.x}, ${dot.y}) scale(${dot.scale}) translate(-12, -12)`}
                                        >
                                            <title>{dot.role}</title>
                                        </path>
                                    ) : (
                                        <circle
                                            key={idx}
                                            cx={dot.x}
                                            cy={dot.y}
                                            r={dot.r}
                                            fill={dot.fill}
                                            filter={config.innerGlow ? "url(#ball-inner-glow)" : undefined}
                                        >
                                            <title>{dot.role}</title>
                                        </circle>
                                    )
                                ))}
                            </g>
                        ) : config.patternType === 'inner_glow_shapes' ? (
                            <g>
                                <defs>
                                    {(() => {
                                        const color1 = theme.primary || '#0B57D0';
                                        const color2 = theme.primaryContainer || '#D3E3FD';
                                        const color3 = theme.secondary || '#6793f1';
                                        const color4 = theme.tertiary || '#ff2d55';
                                        const count = config.divisions || 10;

                                        return Array.from({ length: count }).map((_, i) => {
                                            const offset = (fallbackValue * 30 + i * 25) % 100;
                                            return (
                                                <linearGradient
                                                    key={i}
                                                    id={`inner-strip-grad-${i}`}
                                                    x1={`${offset}%`} y1="0%"
                                                    x2={`${offset + 100}%`} y2="0%"
                                                    spreadMethod="repeat"
                                                >
                                                    <stop offset="0%" stopColor={color1} />
                                                    <stop offset="25%" stopColor={color2} />
                                                    <stop offset="50%" stopColor={color4} />
                                                    <stop offset="75%" stopColor={color3} />
                                                    <stop offset="100%" stopColor={color1} />
                                                </linearGradient>
                                            );
                                        });
                                    })()}
                                    {config.edgeGlow && (
                                        <filter id="inner-glow-filter" filterUnits="userSpaceOnUse" x="-50%" y="-50%" width="200%" height="200%">
                                            <feGaussianBlur stdDeviation={2.0 * (config.glowAmount !== undefined ? config.glowAmount : 5)} result="blur" />
                                            <feComponentTransfer in="blur" result="inv-blur">
                                                <feFuncA type="linear" slope="-1" intercept="1" />
                                            </feComponentTransfer>
                                            <feComposite in="inv-blur" in2="SourceAlpha" operator="in" result="inner-glow-mask" />
                                            <feFlood flood-color={theme.tertiary || '#ff2d55'} flood-opacity="0.9" result="glow-color" />
                                            <feComposite in="glow-color" in2="inner-glow-mask" operator="in" result="colored-inner-glow" />
                                            <feMerge>
                                                <feMergeNode in="SourceGraphic" />
                                                <feMergeNode in="colored-inner-glow" />
                                                <feMergeNode in="colored-inner-glow" />
                                            </feMerge>
                                        </filter>
                                    )}
                                </defs>
                                <g>
                                    {(() => {
                                        const count = config.divisions || 5;
                                        const shapeInfo = CUSTOM_SHAPES[config.stripShape || 'shape-main'] || CUSTOM_SHAPES['shape-main'];
                                        const dPath = shapeInfo.d;
                                        const wShape = shapeInfo.w;
                                        const hShape = shapeInfo.h;

                                        const maxDim = Math.max(wShape, hShape);
                                        const baseScale = (size * 0.75) / maxDim;

                                        const themeSolidColors = [
                                            theme.primary || '#0B57D0',
                                            theme.secondary || '#6793f1',
                                            theme.tertiary || '#ff2d55',
                                            theme.primaryContainer || '#D3E3FD',
                                            theme.secondaryContainer || '#e0e0e0'
                                        ];

                                        return Array.from({ length: count }).map((_, i) => {
                                            const scaleFactor = 1.0 - i * (0.85 / count);
                                            const totalScale = baseScale * scaleFactor;
                                            const fillValue = config.gradientFill !== false
                                                ? `url(#inner-strip-grad-${i})`
                                                : themeSolidColors[i % themeSolidColors.length];

                                            return (
                                                <path
                                                    key={i}
                                                    d={dPath}
                                                    fill={fillValue}
                                                    filter={config.edgeGlow ? "url(#inner-glow-filter)" : undefined}
                                                    transform={`translate(${size / 2}, ${size / 2}) scale(${totalScale}) translate(${-wShape / 2}, ${-hShape / 2})`}
                                                    style={{
                                                        stroke: state.mode === 'dark' ? '#1f1f1f' : '#e0e0e0',
                                                        strokeWidth: 0.5 / totalScale,
                                                    }}
                                                />
                                            );
                                        });
                                    })()}
                                </g>
                            </g>
                        ) : config.patternType === 'gradient_strips' ? (
                            <g>
                                <defs>
                                    {(() => {
                                        const color1 = theme.primary || '#0B57D0';
                                        const color2 = theme.primaryContainer || '#D3E3FD';
                                        const color3 = theme.secondary || '#6793f1';
                                        const color4 = theme.tertiary || '#ff2d55';
                                        const count = config.divisions || 10;

                                        return Array.from({ length: count }).map((_, i) => {
                                            // Calculate shifting offset based on spring-animated fallbackValue and phase shift per layer
                                            const offset = (fallbackValue * 30 + i * 25) % 100;
                                            return (
                                                <linearGradient
                                                    key={i}
                                                    id={`strip-grad-${i}`}
                                                    x1={`${offset}%`} y1="0%"
                                                    x2={`${offset + 100}%`} y2="0%"
                                                    spreadMethod="repeat"
                                                >
                                                    <stop offset="0%" stopColor={color1} />
                                                    <stop offset="25%" stopColor={color2} />
                                                    <stop offset="50%" stopColor={color4} />
                                                    <stop offset="75%" stopColor={color3} />
                                                    <stop offset="100%" stopColor={color1} />
                                                </linearGradient>
                                            );
                                        });
                                    })()}
                                    {config.edgeGlow && (
                                        <filter id="edge-glow-filter" filterUnits="userSpaceOnUse" x="-50%" y="-50%" width="200%" height="200%">
                                            <feGaussianBlur stdDeviation={3 * (config.glowAmount !== undefined ? config.glowAmount : 5)} result="blur" />
                                            <feMerge>
                                                <feMergeNode in="blur" />
                                                <feMergeNode in="blur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    )}
                                </defs>
                                {config.stripShape === 'concentric' ? (
                                    <g>
                                        {(() => {
                                            const count = config.divisions || 10;
                                            const R_max = size * 0.7; // covers corners fully
                                            const R_step = R_max / count;
                                            const amount = config.glowAmount !== undefined ? config.glowAmount : 5;
                                            const glowScale = amount / 5;

                                            return Array.from({ length: count }).map((_, i) => {
                                                const radius = R_max - i * R_step;
                                                const glowOpacity = Math.min(1.0, (0.6 + 0.4 * Math.sin(fallbackValue * 1.5 + i * 0.5)) * glowScale);
                                                const glowWidth = (10 + 4 * Math.sin(fallbackValue * 1.2 + i * 0.7)) * glowScale;
                                                return (
                                                    <g key={i}>
                                                        <circle
                                                            cx={size / 2}
                                                            cy={size / 2}
                                                            r={radius}
                                                            fill={`url(#strip-grad-${i})`}
                                                        />
                                                        {config.edgeGlow && (
                                                            <circle
                                                                cx={size / 2}
                                                                cy={size / 2}
                                                                r={radius}
                                                                fill="none"
                                                                stroke={`url(#strip-grad-${i})`}
                                                                strokeWidth={glowWidth}
                                                                filter="url(#edge-glow-filter)"
                                                                opacity={glowOpacity}
                                                            />
                                                        )}
                                                    </g>
                                                );
                                            });
                                        })()}
                                    </g>
                                ) : CUSTOM_SHAPES[config.stripShape || ''] ? (
                                    <g>
                                        {(() => {
                                            const count = config.divisions || 10;
                                            const shapeInfo = CUSTOM_SHAPES[config.stripShape || ''];

                                            const maxDim = Math.max(shapeInfo.w, shapeInfo.h);
                                            const baseScale = (size * 0.8) / maxDim;
                                            const amount = config.glowAmount !== undefined ? config.glowAmount : 5;
                                            const glowScale = amount / 5;

                                            return Array.from({ length: count }).map((_, i) => {
                                                const scaleFactor = 1.0 - i * (0.9 / count);
                                                const totalScale = baseScale * scaleFactor;
                                                const glowOpacity = Math.min(1.0, (0.6 + 0.4 * Math.sin(fallbackValue * 1.5 + i * 0.5)) * glowScale);
                                                const glowWidth = (10 + 4 * Math.sin(fallbackValue * 1.2 + i * 0.7)) * glowScale;

                                                return (
                                                    <g key={i}>
                                                        <path
                                                            d={shapeInfo.d}
                                                            fill={`url(#strip-grad-${i})`}
                                                            transform={`translate(${size / 2}, ${size / 2}) scale(${totalScale}) translate(${-shapeInfo.w / 2}, ${-shapeInfo.h / 2})`}
                                                        />
                                                        {config.edgeGlow && (
                                                            <path
                                                                d={shapeInfo.d}
                                                                fill="none"
                                                                stroke={`url(#strip-grad-${i})`}
                                                                strokeWidth={glowWidth}
                                                                filter="url(#edge-glow-filter)"
                                                                opacity={glowOpacity}
                                                                transform={`translate(${size / 2}, ${size / 2}) scale(${totalScale}) translate(${-shapeInfo.w / 2}, ${-shapeInfo.h / 2})`}
                                                            />
                                                        )}
                                                    </g>
                                                );
                                            });
                                        })()}
                                    </g>
                                ) : (
                                    <g>
                                        {(() => {
                                            const count = config.divisions || 10;
                                            const stripHeight = size / count;
                                            const amount = config.glowAmount !== undefined ? config.glowAmount : 5;
                                            const glowScale = amount / 5;

                                            return Array.from({ length: count }).map((_, i) => {
                                                const glowOpacity = Math.min(1.0, (0.6 + 0.4 * Math.sin(fallbackValue * 1.5 + i * 0.5)) * glowScale);
                                                const glowWidth = (8 + 4 * Math.sin(fallbackValue * 1.2 + i * 0.7)) * glowScale;
                                                return (
                                                    <g key={i}>
                                                        <rect
                                                            x={0}
                                                            y={i * stripHeight}
                                                            width={size}
                                                            height={stripHeight}
                                                            fill={`url(#strip-grad-${i})`}
                                                        />
                                                        {config.edgeGlow && i > 0 && (
                                                            <line
                                                                x1={0}
                                                                y1={i * stripHeight}
                                                                x2={size}
                                                                y2={i * stripHeight}
                                                                stroke={`url(#strip-grad-${i})`}
                                                                strokeWidth={glowWidth}
                                                                filter="url(#edge-glow-filter)"
                                                                opacity={glowOpacity}
                                                            />
                                                        )}
                                                    </g>
                                                );
                                            });
                                        })()}
                                    </g>
                                )}
                            </g>
                        ) : (
                            cells.map((cell, idx) => (
                                <g key={idx}>
                                    <rect
                                        x={cell.x} y={cell.y} width={cell.w} height={cell.h} fill={cell.color1}
                                        onMouseEnter={() => setHoveredRole(cell.role1)}
                                        onMouseLeave={() => setHoveredRole(null)}
                                    >
                                        <title>{cell.role1}</title>
                                    </rect>
                                    <g clipPath={`url(#clip-${idx})`}>
                                        <defs>
                                            <clipPath id={`clip-${idx}`}>
                                                <rect x={cell.x} y={cell.y} width={cell.w} height={cell.h} />
                                            </clipPath>
                                        </defs>
                                        {cell.elements.map((el, eIdx) => {
                                            let transformStyle: React.CSSProperties | undefined = undefined;
                                            let transformAttr = el.transform;
                                            if (config.patternType === 'grid') {
                                                const phase = el.dist * 3 - fallbackValue;
                                                const scale = 0.93 + 0.07 * Math.sin(phase);
                                                transformStyle = {
                                                    transform: `scale(${scale})`,
                                                    transformOrigin: `${el.cx}px ${el.cy}px`,
                                                    transition: 'transform 0.1s ease-out'
                                                };
                                                transformAttr = undefined;
                                            }
                                            return el.type === 'rect' ? (
                                                <rect
                                                    key={eIdx}
                                                    x={el.x} y={el.y}
                                                    width={el.w} height={el.h}
                                                    rx={el.rx} ry={el.ry}
                                                    fill={el.fill || 'none'}
                                                    stroke={el.stroke}
                                                    strokeWidth={el.strokeWidth}
                                                    className="gen-bg-element"
                                                    transform={transformAttr}
                                                    style={transformStyle}
                                                    filter={config.innerGlow ? "url(#ball-inner-glow)" : undefined}
                                                >
                                                    <title>{el.role}</title>
                                                </rect>
                                            ) : el.type === 'path' ? (
                                                <path
                                                    key={eIdx}
                                                    d={el.d}
                                                    fill={el.fill}
                                                    className="gen-bg-element"
                                                    transform={transformAttr || `translate(${el.cx + cell.w / 2}, ${el.cy + cell.h / 2}) scale(${(cell.w * 0.8) / 24}) translate(-12, -12)`}
                                                    style={transformStyle}
                                                    filter={config.innerGlow ? "url(#ball-inner-glow)" : undefined}
                                                >
                                                    <title>{el.role}</title>
                                                </path>
                                            ) : null;
                                        })}
                                    </g>
                                </g>
                            ))
                        )}
                    </svg>
                )}
            </div>
            <div
                ref={tooltipRef}
                className={`fixed bg-[var(--surface-container-highest)] text-[var(--on-surface)] text-xs px-2 py-1 rounded-md shadow-lg pointer-events-none z-50 font-mono border border-[var(--outline-variant)] transition-opacity duration-100 ${hoveredRole ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                style={{ left: '-9999px', top: '-9999px' }}
            >
                {hoveredRole}
            </div>
        </>
    );
};
