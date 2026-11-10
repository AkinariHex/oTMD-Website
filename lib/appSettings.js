const MAX_FONT_LENGTH = 128;
const MAX_CORNERS_LENGTH = 64;
const MAX_STYLE_PIXELS = 64;
const MIN_TEXT_SIZE = 80;
const MAX_TEXT_SIZE = 140;
const LAYOUTS = new Set(['sidebar', 'tabs']);
const TRAY_BEHAVIORS = new Set(['closeToTray', 'minimizeToTray']);
const PREVIEW_BACKGROUNDS = new Set(['checker', 'black', 'dark', 'gray', 'light', 'white', 'darkScene', 'lightScene', 'custom']);
const GENERIC_FONTS = new Set(['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui']);
const RGB = /^\d{1,3}, \d{1,3}, \d{1,3}$/;
const FONT_FAMILY = /^[\p{L}\p{N} _'",.\-&+]+$/u;
const CORNERS = /^(\d{1,2}px ?){4}$/;

const isObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const isWhole = (value, low, high) => Number.isInteger(value) && value >= low && value <= high;

function parseStyle(style) {
  if (!isObject(style)) return null;
  const { backgroundColor, backgroundOpacity, borderRadius, padding, fontFamily } = style;
  if (
    typeof backgroundColor !== 'string' || !RGB.test(backgroundColor) ||
    typeof backgroundOpacity !== 'number' || !(backgroundOpacity >= 0 && backgroundOpacity <= 1) ||
    !isWhole(borderRadius, 0, MAX_STYLE_PIXELS) ||
    !isWhole(padding, 0, MAX_STYLE_PIXELS) ||
    typeof fontFamily !== 'string' || fontFamily.length > MAX_FONT_LENGTH || !FONT_FAMILY.test(fontFamily)
  ) {
    return null;
  }
  return { backgroundColor, backgroundOpacity, borderRadius, padding, fontFamily };
}

function parseDisplayer(value) {
  if (!isObject(value)) return null;
  const { VisualizerStyle, SmallDisplayer, TransparentBackground } = value;
  const MapsStyle = parseStyle(value.MapsStyle);
  if (
    !MapsStyle ||
    typeof VisualizerStyle !== 'string' || VisualizerStyle.length > MAX_CORNERS_LENGTH || !CORNERS.test(VisualizerStyle) ||
    typeof SmallDisplayer !== 'boolean' ||
    typeof TransparentBackground !== 'boolean'
  ) {
    return null;
  }
  return { VisualizerStyle, SmallDisplayer, TransparentBackground, MapsStyle };
}

function parseApp(value) {
  if (!isObject(value)) return null;
  const { Layout, PreviewBackground, TextSize, Animations, TrayBehavior } = value;
  const validTextSize = TextSize === 0 || isWhole(TextSize, MIN_TEXT_SIZE, MAX_TEXT_SIZE);
  if (!LAYOUTS.has(Layout) || !PREVIEW_BACKGROUNDS.has(PreviewBackground) || !validTextSize || typeof Animations !== 'boolean' || !TRAY_BEHAVIORS.has(TrayBehavior)) {
    return null;
  }
  return { Layout, PreviewBackground, TextSize, Animations, TrayBehavior };
}

// Rebuilt field by field: anything else in the body, such as an API key, can never reach the database.
export function parseAppSettings(body) {
  if (!isObject(body) || !isObject(body.ranked)) return null;
  const displayer = parseDisplayer(body.displayer);
  const app = parseApp(body.app);
  const Health = parseStyle(body.ranked.Health);
  const Maps = parseStyle(body.ranked.Maps);
  const Ratio = parseStyle(body.ranked.Ratio);
  if (!displayer || !app || !Health || !Maps || !Ratio) return null;
  return { displayer, ranked: { Health, Maps, Ratio }, app };
}

export function extractFonts(settings) {
  const styles = [settings.displayer.MapsStyle, settings.ranked.Health, settings.ranked.Maps, settings.ranked.Ratio];
  const names = styles
    .map((style) => style.fontFamily.split(',')[0].trim().replace(/^["']|["']$/g, ''))
    .filter((name) => name && !GENERIC_FONTS.has(name.toLowerCase()));
  return [...new Set(names)];
}
