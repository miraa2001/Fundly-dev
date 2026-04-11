export const fundlyPalette = Object.freeze({
  canvas: '#F2F2F2',
  surface: '#FFFFFF',
  primary: '#0C2A46',
  primarySoft: '#0C2A46',
  deep: '#011826',
  accent: '#A67A53',
  accentSoft: '#D4B79B',
  accentGlow: '#DCC4AE',
  accentTint: '#E7D8CB',
  warm: '#401F14',
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
  appBackground: colorVar('canvas'),
  primaryButton: colorVar('deep'),
  accentButton: alpha('accent', 0.12),
  authPanel: colorVar('surface'),
  appPanel: colorVar('surface'),
  surfacePanel: colorVar('surface'),
  surfacePanelSoft: colorVar('surface'),
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
