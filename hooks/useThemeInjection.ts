import { useEffect } from 'react';
import { ThemeMode } from '../types';

export const useThemeInjection = (mode: ThemeMode) => {
  useEffect(() => {
    const root = document.documentElement;
    const isDark = mode === 'dark';

    if (isDark) {
      root.classList.add('dark');
      root.style.setProperty('--surface', '#131314');
      root.style.setProperty('--surface-container', '#1e1f20');
      root.style.setProperty('--surface-container-low', '#191a1a');
      root.style.setProperty('--surface-container-high', '#28292a');
      root.style.setProperty('--surface-container-highest', '#333537');
      root.style.setProperty('--primary', '#a8c7fa');
      root.style.setProperty('--on-primary', '#062e6f');
      root.style.setProperty('--primary-container', '#004a77');
      root.style.setProperty('--on-primary-container', '#c2e7ff');
      root.style.setProperty('--secondary', '#7fcfff');
      root.style.setProperty('--on-secondary', '#003353');
      root.style.setProperty('--secondary-container', '#004b73');
      root.style.setProperty('--on-secondary-container', '#c2e7ff');
      root.style.setProperty('--on-surface', '#e3e2e6');
      root.style.setProperty('--on-surface-variant', '#c4c7c5');
      root.style.setProperty('--outline', '#8e918f');
      root.style.setProperty('--outline-variant', '#444746');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('--surface', '#ffffff');
      root.style.setProperty('--surface-container', '#f0f4f9');
      root.style.setProperty('--surface-container-low', '#f7f9fc');
      root.style.setProperty('--surface-container-high', '#e9eef6');
      root.style.setProperty('--surface-container-highest', '#e1e8f5');
      root.style.setProperty('--primary', '#0b57d0');
      root.style.setProperty('--on-primary', '#ffffff');
      root.style.setProperty('--primary-container', '#d3e3fd');
      root.style.setProperty('--on-primary-container', '#041e49');
      root.style.setProperty('--secondary', '#00639b');
      root.style.setProperty('--on-secondary', '#ffffff');
      root.style.setProperty('--secondary-container', '#c2e7ff');
      root.style.setProperty('--on-secondary-container', '#004a77');
      root.style.setProperty('--on-surface', '#1f1f1f');
      root.style.setProperty('--on-surface-variant', '#444746');
      root.style.setProperty('--outline', '#747775');
      root.style.setProperty('--outline-variant', '#c4c7c5');
    }

    document.body.style.backgroundColor = isDark ? '#131314' : '#ffffff';
    document.body.style.color = isDark ? '#e3e2e6' : '#1f1f1f';
  }, [mode]);
};
