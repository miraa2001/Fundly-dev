export const fundlyPalette = Object.freeze({
  primary: '#0C2A46',
  primarySoft: '#062239',
  deep: '#011826',
  accent: '#A67A53',
  accentSoft: '#D0AE8C',
  accentGlow: '#D5B595',
  accentTint: '#C9A27D',
  warm: '#401F14',
  surface: '#F2F2F2',
});

function toKebabCase(value) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function normalizeHex(hex) {
  const value = hex.replace('#', '');
  if (value.length === 3) {
    return value
      .split('')
      .map((part) => `${part}${part}`)
      .join('');
  }

  return value;
}

function hexToRgbString(hex) {
  const value = normalizeHex(hex);
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return `${red}, ${green}, ${blue}`;
}

export function colorVar(token) {
  return `var(--fundly-${toKebabCase(token)})`;
}

export function colorRgbVar(token) {
  return `var(--fundly-${toKebabCase(token)}-rgb)`;
}

export function alpha(token, opacity) {
  return `rgba(${colorRgbVar(token)}, ${opacity})`;
}

export const themeGradients = Object.freeze({
  appBackground: `linear-gradient(180deg, ${colorVar('deep')} 0%, ${colorVar('primary')} 52%, ${colorVar('deep')} 100%)`,
  primaryButton: `linear-gradient(180deg, ${colorVar('primary')} 0%, ${colorVar('primarySoft')} 46%, ${colorVar('deep')} 100%)`,
  accentButton: `linear-gradient(180deg, ${colorVar('accentSoft')} 0%, ${colorVar('accent')} 58%, ${colorVar('warm')} 100%)`,
  authPanel: `linear-gradient(180deg, ${alpha('deep', 0.86)}, ${alpha('primary', 0.74)})`,
  appPanel: `linear-gradient(160deg, ${colorVar('deep')} 0%, ${colorVar('primary')} 54%, ${colorVar('warm')} 100%)`,
  surfacePanel: `linear-gradient(180deg, ${alpha('surface', 0.97)}, ${alpha('surface', 0.91)})`,
  surfacePanelSoft: `linear-gradient(180deg, ${alpha('surface', 0.97)}, ${alpha('surface', 0.90)})`,
});

export function applyFundlyPalette(root = typeof document !== 'undefined' ? document.documentElement : null, palette = fundlyPalette) {
  if (!root?.style) {
    return;
  }

  Object.entries(palette).forEach(([token, value]) => {
    const cssName = toKebabCase(token);
    root.style.setProperty(`--fundly-${cssName}`, value);
    root.style.setProperty(`--fundly-${cssName}-rgb`, hexToRgbString(value));
  });
}

if (typeof document !== 'undefined') {
  applyFundlyPalette();
}
