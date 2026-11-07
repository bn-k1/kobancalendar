// src/utils/eventTextColor.js
// Pick readable text for an event block. Event colors come from
// config/event.json, and several (sky blue, orange) are too light for white.

const DARK_TEXT = "#0f172a";
const LIGHT_TEXT = "#ffffff";

function relativeLuminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * White unless white falls below 3:1 on the fill; then dark text. White stays
 * the default so mid-tone fills (red, magenta) keep their familiar look.
 * Non-#rrggbb input returns white.
 */
export function eventTextColor(color) {
  let hex = String(color ?? "").trim();
  if (/^#[0-9a-f]{3}$/i.test(hex)) {
    hex = "#" + [...hex.slice(1)].map((c) => c + c).join("");
  }
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return LIGHT_TEXT;
  const whiteContrast = 1.05 / (relativeLuminance(hex) + 0.05);
  return whiteContrast < 3 ? DARK_TEXT : LIGHT_TEXT;
}
