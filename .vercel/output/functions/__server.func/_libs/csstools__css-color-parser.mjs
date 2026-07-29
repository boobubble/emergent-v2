import { B as isTokenHash, q as isTokenIdent, p as isTokenNumeric, a as isTokenComma, v as isTokenDelim, x as isTokenNumber, c, r as a, u as isTokenDimension, w as isTokenPercentage } from "./csstools__css-tokenizer.mjs";
import { c as contrast_ratio_wcag_2_1, X as XYZ_D65_to_sRGB, i as inGamut, a as clip, b as XYZ_D65_to_OKLCH, g as gam_sRGB, m as mapGamutRayTrace, d as XYZ_D65_to_XYZ_D65, e as XYZ_D50_to_XYZ_D65, O as OKLCH_to_XYZ_D65, L as LCH_to_XYZ_D65, f as OKLab_to_XYZ_D65, h as Lab_to_XYZ_D65, H as HWB_to_XYZ_D65, j as HSL_to_XYZ_D65, P as ProPhoto_RGB_to_XYZ_D65, k as a98_RGB_to_XYZ_D65, r as rec_2020_to_XYZ_D65, l as lin_P3_to_XYZ_D65, n as P3_to_XYZ_D65, o as lin_sRGB_to_XYZ_D65, s as sRGB_to_XYZ_D65, p as XYZ_D50_to_XYZ_D50, q as XYZ_D65_to_OKLab, t as XYZ_D50_to_LCH, u as XYZ_D50_to_Lab, v as XYZ_D65_to_HWB, w as XYZ_D65_to_HSL, x as XYZ_D65_to_a98_RGB, y as XYZ_D50_to_ProPhoto, z as XYZ_D65_to_rec_2020, A as XYZ_D65_to_lin_P3, B as XYZ_D65_to_P3, C as XYZ_D65_to_lin_sRGB, D as XYZ_D65_to_XYZ_D50, E as OKLCH_to_XYZ_D50, F as LCH_to_XYZ_D50, G as OKLab_to_XYZ_D50, I as Lab_to_XYZ_D50, J as HWB_to_XYZ_D50, K as HSL_to_XYZ_D50, M as ProPhoto_RGB_to_XYZ_D50, N as a98_RGB_to_XYZ_D50, Q as rec_2020_to_XYZ_D50, R as lin_P3_to_XYZ_D50, S as P3_to_XYZ_D50, T as lin_sRGB_to_XYZ_D50, U as sRGB_to_XYZ_D50, V as G, W as OKLCH_to_OKLab, Y as OKLab_to_XYZ, Z as XYZ_to_lin_sRGB, _ as lin_sRGB_to_XYZ, $ as XYZ_to_OKLab, a0 as OKLab_to_OKLCH } from "./csstools__color-helpers.mjs";
import { d as isFunctionNode, b as isTokenNode, e as isWhitespaceNode, f as isCommentNode, i as isWhiteSpaceOrCommentNode, T as TokenNode, r as replaceComponentValues } from "./@csstools/css-parser-algorithms+[...].mjs";
import { Q, a as calcFromComponentValues } from "./csstools__css-calc.mjs";
var De, Le;
function normalize(e, a2, n, r) {
  return Math.min(Math.max(e / a2, n), r);
}
function convertNaNToZero(e) {
  return [Number.isNaN(e[0]) ? 0 : e[0], Number.isNaN(e[1]) ? 0 : e[1], Number.isNaN(e[2]) ? 0 : e[2]];
}
function colorData_to_XYZ_D50(e) {
  switch (e.colorNotation) {
    case De.HEX:
    case De.RGB:
    case De.sRGB:
      return { ...e, colorNotation: De.XYZ_D50, channels: sRGB_to_XYZ_D50(convertNaNToZero(e.channels)) };
    case De.Linear_sRGB:
      return { ...e, colorNotation: De.XYZ_D50, channels: lin_sRGB_to_XYZ_D50(convertNaNToZero(e.channels)) };
    case De.Display_P3:
      return { ...e, colorNotation: De.XYZ_D50, channels: P3_to_XYZ_D50(convertNaNToZero(e.channels)) };
    case De.Linear_Display_P3:
      return { ...e, colorNotation: De.XYZ_D50, channels: lin_P3_to_XYZ_D50(convertNaNToZero(e.channels)) };
    case De.Rec2020:
      return { ...e, colorNotation: De.XYZ_D50, channels: rec_2020_to_XYZ_D50(convertNaNToZero(e.channels)) };
    case De.A98_RGB:
      return { ...e, colorNotation: De.XYZ_D50, channels: a98_RGB_to_XYZ_D50(convertNaNToZero(e.channels)) };
    case De.ProPhoto_RGB:
      return { ...e, colorNotation: De.XYZ_D50, channels: ProPhoto_RGB_to_XYZ_D50(convertNaNToZero(e.channels)) };
    case De.HSL:
      return { ...e, colorNotation: De.XYZ_D50, channels: HSL_to_XYZ_D50(convertNaNToZero(e.channels)) };
    case De.HWB:
      return { ...e, colorNotation: De.XYZ_D50, channels: HWB_to_XYZ_D50(convertNaNToZero(e.channels)) };
    case De.Lab:
      return { ...e, colorNotation: De.XYZ_D50, channels: Lab_to_XYZ_D50(convertNaNToZero(e.channels)) };
    case De.OKLab:
      return { ...e, colorNotation: De.XYZ_D50, channels: OKLab_to_XYZ_D50(convertNaNToZero(e.channels)) };
    case De.LCH:
      return { ...e, colorNotation: De.XYZ_D50, channels: LCH_to_XYZ_D50(convertNaNToZero(e.channels)) };
    case De.OKLCH:
      return { ...e, colorNotation: De.XYZ_D50, channels: OKLCH_to_XYZ_D50(convertNaNToZero(e.channels)) };
    case De.XYZ_D50:
      return { ...e, colorNotation: De.XYZ_D50, channels: XYZ_D50_to_XYZ_D50(convertNaNToZero(e.channels)) };
    case De.XYZ_D65:
      return { ...e, colorNotation: De.XYZ_D50, channels: XYZ_D65_to_XYZ_D50(convertNaNToZero(e.channels)) };
    default:
      throw new Error("Unsupported color notation");
  }
}
function colorData_to_XYZ_D65(e) {
  switch (e.colorNotation) {
    case De.HEX:
    case De.RGB:
    case De.sRGB:
      return { ...e, colorNotation: De.XYZ_D65, channels: sRGB_to_XYZ_D65(convertNaNToZero(e.channels)) };
    case De.Linear_sRGB:
      return { ...e, colorNotation: De.XYZ_D65, channels: lin_sRGB_to_XYZ_D65(convertNaNToZero(e.channels)) };
    case De.Display_P3:
      return { ...e, colorNotation: De.XYZ_D65, channels: P3_to_XYZ_D65(convertNaNToZero(e.channels)) };
    case De.Linear_Display_P3:
      return { ...e, colorNotation: De.XYZ_D65, channels: lin_P3_to_XYZ_D65(convertNaNToZero(e.channels)) };
    case De.Rec2020:
      return { ...e, colorNotation: De.XYZ_D65, channels: rec_2020_to_XYZ_D65(convertNaNToZero(e.channels)) };
    case De.A98_RGB:
      return { ...e, colorNotation: De.XYZ_D65, channels: a98_RGB_to_XYZ_D65(convertNaNToZero(e.channels)) };
    case De.ProPhoto_RGB:
      return { ...e, colorNotation: De.XYZ_D65, channels: ProPhoto_RGB_to_XYZ_D65(convertNaNToZero(e.channels)) };
    case De.HSL:
      return { ...e, colorNotation: De.XYZ_D65, channels: HSL_to_XYZ_D65(convertNaNToZero(e.channels)) };
    case De.HWB:
      return { ...e, colorNotation: De.XYZ_D65, channels: HWB_to_XYZ_D65(convertNaNToZero(e.channels)) };
    case De.Lab:
      return { ...e, colorNotation: De.XYZ_D65, channels: Lab_to_XYZ_D65(convertNaNToZero(e.channels)) };
    case De.OKLab:
      return { ...e, colorNotation: De.XYZ_D65, channels: OKLab_to_XYZ_D65(convertNaNToZero(e.channels)) };
    case De.LCH:
      return { ...e, colorNotation: De.XYZ_D65, channels: LCH_to_XYZ_D65(convertNaNToZero(e.channels)) };
    case De.OKLCH:
      return { ...e, colorNotation: De.XYZ_D65, channels: OKLCH_to_XYZ_D65(convertNaNToZero(e.channels)) };
    case De.XYZ_D50:
      return { ...e, colorNotation: De.XYZ_D65, channels: XYZ_D50_to_XYZ_D65(convertNaNToZero(e.channels)) };
    case De.XYZ_D65:
      return { ...e, colorNotation: De.XYZ_D65, channels: XYZ_D65_to_XYZ_D65(convertNaNToZero(e.channels)) };
    default:
      throw new Error("Unsupported color notation");
  }
}
!(function(e) {
  e.A98_RGB = "a98-rgb", e.Display_P3 = "display-p3", e.Linear_Display_P3 = "display-p3-linear", e.HEX = "hex", e.HSL = "hsl", e.HWB = "hwb", e.LCH = "lch", e.Lab = "lab", e.Linear_sRGB = "srgb-linear", e.OKLCH = "oklch", e.OKLab = "oklab", e.ProPhoto_RGB = "prophoto-rgb", e.RGB = "rgb", e.sRGB = "srgb", e.Rec2020 = "rec2020", e.XYZ_D50 = "xyz-d50", e.XYZ_D65 = "xyz-d65";
})(De || (De = {})), (function(e) {
  e.ColorKeyword = "color-keyword", e.HasAlpha = "has-alpha", e.HasDimensionValues = "has-dimension-values", e.HasNoneKeywords = "has-none-keywords", e.HasNumberValues = "has-number-values", e.HasPercentageAlpha = "has-percentage-alpha", e.HasPercentageValues = "has-percentage-values", e.HasVariableAlpha = "has-variable-alpha", e.Hex = "hex", e.LegacyHSL = "legacy-hsl", e.LegacyRGB = "legacy-rgb", e.NamedColor = "named-color", e.RelativeColorSyntax = "relative-color-syntax", e.ColorMix = "color-mix", e.ColorMixVariadic = "color-mix-variadic", e.ContrastColor = "contrast-color", e.RelativeAlphaSyntax = "relative-alpha-syntax", e.Experimental = "experimental";
})(Le || (Le = {}));
const Ze = /* @__PURE__ */ new Set([De.A98_RGB, De.Display_P3, De.Linear_Display_P3, De.HEX, De.Linear_sRGB, De.ProPhoto_RGB, De.RGB, De.sRGB, De.Rec2020, De.XYZ_D50, De.XYZ_D65]);
function colorDataToForInterpolation(e, a2) {
  const n = [...e.channels];
  let r = { ...e };
  return r.channels = convertPowerlessComponentsToMissingComponents(r.channels, e.colorNotation), r = convertToDestination(r, a2), r.channels = carryForwardMissingComponentsForColorAndNotation(r, e.colorNotation, a2, n), r;
}
function colorDataToForRelativeColorSyntax(e, a2) {
  if (e.colorNotation === a2) return { ...e };
  const n = [...e.channels];
  let r = { ...e };
  return r.channels = convertPowerlessComponentsToMissingComponents(r.channels, e.colorNotation), r = convertToDestination(r, a2), r.channels = carryForwardMissingComponentsForColorAndNotation(r, e.colorNotation, a2, n), r;
}
function convertToDestination(e, a2) {
  if (e.colorNotation === a2) return e.channels = convertNaNToZero(e.channels), e.channels = convertPowerlessComponentsToMissingComponents(e.channels, a2), e;
  switch (a2) {
    case De.HEX:
    case De.RGB: {
      const a3 = colorData_to_XYZ_D65(e);
      e.colorNotation = De.RGB, e.channels = XYZ_D65_to_sRGB(a3.channels), e.channels = e.channels.map((e2) => reducePrecisionOrNaN(e2, 8)), e.channels = normalizeAfterColorConversion(e.channels);
      break;
    }
    case De.sRGB: {
      const a3 = colorData_to_XYZ_D65(e);
      e.colorNotation = De.sRGB, e.channels = XYZ_D65_to_sRGB(a3.channels), e.channels = normalizeAfterColorConversion(e.channels);
      break;
    }
    case De.Linear_sRGB: {
      const a3 = colorData_to_XYZ_D65(e);
      e.colorNotation = De.Linear_sRGB, e.channels = XYZ_D65_to_lin_sRGB(a3.channels), e.channels = normalizeAfterColorConversion(e.channels);
      break;
    }
    case De.Display_P3: {
      const a3 = colorData_to_XYZ_D65(e);
      e.colorNotation = De.Display_P3, e.channels = XYZ_D65_to_P3(a3.channels), e.channels = normalizeAfterColorConversion(e.channels);
      break;
    }
    case De.Linear_Display_P3: {
      const a3 = colorData_to_XYZ_D65(e);
      e.colorNotation = De.Linear_Display_P3, e.channels = XYZ_D65_to_lin_P3(a3.channels), e.channels = normalizeAfterColorConversion(e.channels);
      break;
    }
    case De.Rec2020: {
      const a3 = colorData_to_XYZ_D65(e);
      e.colorNotation = De.Rec2020, e.channels = XYZ_D65_to_rec_2020(a3.channels), e.channels = normalizeAfterColorConversion(e.channels);
      break;
    }
    case De.ProPhoto_RGB: {
      const a3 = colorData_to_XYZ_D50(e);
      e.colorNotation = De.ProPhoto_RGB, e.channels = XYZ_D50_to_ProPhoto(a3.channels), e.channels = normalizeAfterColorConversion(e.channels);
      break;
    }
    case De.A98_RGB: {
      const a3 = colorData_to_XYZ_D65(e);
      e.colorNotation = De.A98_RGB, e.channels = XYZ_D65_to_a98_RGB(a3.channels), e.channels = normalizeAfterColorConversion(e.channels);
      break;
    }
    case De.HSL: {
      const n = colorData_to_XYZ_D65(e);
      e.colorNotation = De.HSL, e.channels = XYZ_D65_to_HSL(n.channels), e.channels = e.channels.map((e2) => reducePrecisionOrNaN(e2, 8)), e.channels = normalizeAfterColorConversion(e.channels, 0), e.channels = convertPowerlessComponentsToMissingComponents(e.channels, a2);
      break;
    }
    case De.HWB: {
      const n = colorData_to_XYZ_D65(e);
      e.colorNotation = De.HWB, e.channels = XYZ_D65_to_HWB(n.channels), e.channels = e.channels.map((e2) => reducePrecisionOrNaN(e2, 8)), e.channels = normalizeAfterColorConversion(e.channels, 0), e.channels = convertPowerlessComponentsToMissingComponents(e.channels, a2);
      break;
    }
    case De.Lab: {
      const a3 = colorData_to_XYZ_D50(e);
      e.colorNotation = De.Lab, e.channels = XYZ_D50_to_Lab(a3.channels), e.channels = normalizeAfterColorConversion(e.channels);
      break;
    }
    case De.LCH: {
      const n = colorData_to_XYZ_D50(e);
      e.colorNotation = De.LCH, e.channels = XYZ_D50_to_LCH(n.channels), e.channels = normalizeAfterColorConversion(e.channels, 2), e.channels = convertPowerlessComponentsToMissingComponents(e.channels, a2);
      break;
    }
    case De.OKLCH: {
      const n = colorData_to_XYZ_D65(e);
      e.colorNotation = De.OKLCH, e.channels = XYZ_D65_to_OKLCH(n.channels), e.channels = normalizeAfterColorConversion(e.channels, 2), e.channels = convertPowerlessComponentsToMissingComponents(e.channels, a2);
      break;
    }
    case De.OKLab: {
      const a3 = colorData_to_XYZ_D65(e);
      e.colorNotation = De.OKLab, e.channels = XYZ_D65_to_OKLab(a3.channels), e.channels = normalizeAfterColorConversion(e.channels);
      break;
    }
    case De.XYZ_D50: {
      const a3 = colorData_to_XYZ_D50(e);
      e.colorNotation = De.XYZ_D50, e.channels = XYZ_D50_to_XYZ_D50(a3.channels), e.channels = normalizeAfterColorConversion(e.channels);
      break;
    }
    case De.XYZ_D65: {
      const a3 = colorData_to_XYZ_D65(e);
      e.colorNotation = De.XYZ_D65, e.channels = XYZ_D65_to_XYZ_D65(a3.channels), e.channels = normalizeAfterColorConversion(e.channels);
      break;
    }
    default:
      throw new Error("Unsupported color notation");
  }
  return e;
}
function carryForwardMissingComponentsForColorAndNotation(e, a2, n, r) {
  if (a2 === n) return carryForwardMissingComponents(r, [0, 1, 2], [], e.channels, [0, 1, 2], []);
  if (Ze.has(n) && Ze.has(a2)) return carryForwardMissingComponents(r, [0, 1, 2], [], e.channels, [0, 1, 2], []);
  switch (n) {
    case De.HSL:
      switch (a2) {
        case De.HWB:
          return carryForwardMissingComponents(r, [0], [1, 2], e.channels, [0], [1, 2]);
        case De.Lab:
        case De.OKLab:
          return carryForwardMissingComponents(r, [0], [1, 2], e.channels, [2], [0, 1]);
        case De.LCH:
        case De.OKLCH:
          return carryForwardMissingComponents(r, [0, 1, 2], [], e.channels, [2, 1, 0], []);
        default:
          return carryForwardMissingComponents(r, [], [], e.channels, [], []);
      }
    case De.HWB:
      switch (a2) {
        case De.HSL:
          return carryForwardMissingComponents(r, [0], [1, 2], e.channels, [0], [1, 2]);
        case De.LCH:
        case De.OKLCH:
          return carryForwardMissingComponents(r, [2], [0, 1], e.channels, [0], [1, 2]);
        default:
          return carryForwardMissingComponents(r, [], [], e.channels, [], []);
      }
    case De.Lab:
    case De.OKLab:
      switch (a2) {
        case De.HSL:
          return carryForwardMissingComponents(r, [2], [0, 1], e.channels, [0], [1, 2]);
        case De.Lab:
        case De.OKLab:
          return carryForwardMissingComponents(r, [0, 1, 2], [], e.channels, [0, 1, 2], []);
        case De.LCH:
        case De.OKLCH:
          return carryForwardMissingComponents(r, [0], [1, 2], e.channels, [0], [1, 2]);
        default:
          return carryForwardMissingComponents(r, [], [], e.channels, [], []);
      }
    case De.LCH:
    case De.OKLCH:
      switch (a2) {
        case De.HSL:
          return carryForwardMissingComponents(r, [0, 1, 2], [], e.channels, [2, 1, 0], []);
        case De.HWB:
          return carryForwardMissingComponents(r, [0], [1, 2], e.channels, [2], [0, 1]);
        case De.Lab:
        case De.OKLab:
          return carryForwardMissingComponents(r, [0], [1, 2], e.channels, [0], [1, 2]);
        case De.LCH:
        case De.OKLCH:
          return carryForwardMissingComponents(r, [0, 1, 2], [], e.channels, [0, 1, 2], []);
        default:
          return carryForwardMissingComponents(r, [], [], e.channels, [], []);
      }
    default:
      return carryForwardMissingComponents(r, [], [], e.channels, [], []);
  }
}
function convertPowerlessComponentsToMissingComponents(e, a2) {
  const n = [...e];
  switch (a2) {
    case De.HSL:
      (Number.isNaN(n[1]) ? 0 : n[1]) <= 1e-3 && (n[0] = Number.NaN, !Number.isNaN(n[1]) && n[1] > 0 && (n[1] = 0));
      break;
    case De.HWB:
      Math.max(0, Number.isNaN(n[1]) ? 0 : n[1]) + Math.max(0, Number.isNaN(n[2]) ? 0 : n[2]) >= 99.999 && (n[0] = Number.NaN, Math.max(0, Number.isNaN(n[1]) ? 0 : n[1]) + Math.max(0, Number.isNaN(n[2]) ? 0 : n[2]) < 100 && (Number.isNaN(n[1]) || Number.isNaN(n[2]) ? Number.isNaN(n[1]) ? Number.isNaN(n[2]) || (n[2] = 100) : n[1] = 100 : n[2] = 100 - n[1]));
      break;
    case De.LCH:
      (Number.isNaN(n[1]) ? 0 : n[1]) <= 15e-4 && (n[2] = Number.NaN, !Number.isNaN(n[1]) && n[1] > 0 && (n[1] = 0));
      break;
    case De.OKLCH:
      (Number.isNaN(n[1]) ? 0 : n[1]) <= 4e-6 && (n[2] = Number.NaN, !Number.isNaN(n[1]) && n[1] > 0 && (n[1] = 0));
  }
  return n;
}
function carryForwardMissingComponents(e, a2, n, r, o, t) {
  if (a2.length < 3 && e.every(Number.isNaN)) return [Number.NaN, Number.NaN, Number.NaN];
  const l = [...r];
  for (let n2 = 0; n2 < a2.length; n2++) Number.isNaN(e[a2[n2]]) && (l[o[n2]] = Number.NaN);
  if (n.length && n.every((a3) => Number.isNaN(e[a3]))) for (let e2 = 0; e2 < t.length; e2++) l[t[e2]] = Number.NaN;
  return l;
}
function normalizeRelativeColorDataChannels(e) {
  const a2 = /* @__PURE__ */ new Map();
  switch (e.colorNotation) {
    case De.RGB:
    case De.HEX:
      a2.set("r", dummyNumberToken(255 * e.channels[0])), a2.set("g", dummyNumberToken(255 * e.channels[1])), a2.set("b", dummyNumberToken(255 * e.channels[2])), "number" == typeof e.alpha && a2.set("alpha", dummyNumberToken(e.alpha));
      break;
    case De.HSL:
      a2.set("h", dummyNumberToken(e.channels[0])), a2.set("s", dummyNumberToken(e.channels[1])), a2.set("l", dummyNumberToken(e.channels[2])), "number" == typeof e.alpha && a2.set("alpha", dummyNumberToken(e.alpha));
      break;
    case De.HWB:
      a2.set("h", dummyNumberToken(e.channels[0])), a2.set("w", dummyNumberToken(e.channels[1])), a2.set("b", dummyNumberToken(e.channels[2])), "number" == typeof e.alpha && a2.set("alpha", dummyNumberToken(e.alpha));
      break;
    case De.Lab:
    case De.OKLab:
      a2.set("l", dummyNumberToken(e.channels[0])), a2.set("a", dummyNumberToken(e.channels[1])), a2.set("b", dummyNumberToken(e.channels[2])), "number" == typeof e.alpha && a2.set("alpha", dummyNumberToken(e.alpha));
      break;
    case De.LCH:
    case De.OKLCH:
      a2.set("l", dummyNumberToken(e.channels[0])), a2.set("c", dummyNumberToken(e.channels[1])), a2.set("h", dummyNumberToken(e.channels[2])), "number" == typeof e.alpha && a2.set("alpha", dummyNumberToken(e.alpha));
      break;
    case De.sRGB:
    case De.A98_RGB:
    case De.Display_P3:
    case De.Linear_Display_P3:
    case De.Rec2020:
    case De.Linear_sRGB:
    case De.ProPhoto_RGB:
      a2.set("r", dummyNumberToken(e.channels[0])), a2.set("g", dummyNumberToken(e.channels[1])), a2.set("b", dummyNumberToken(e.channels[2])), "number" == typeof e.alpha && a2.set("alpha", dummyNumberToken(e.alpha));
      break;
    case De.XYZ_D50:
    case De.XYZ_D65:
      a2.set("x", dummyNumberToken(e.channels[0])), a2.set("y", dummyNumberToken(e.channels[1])), a2.set("z", dummyNumberToken(e.channels[2])), "number" == typeof e.alpha && a2.set("alpha", dummyNumberToken(e.alpha));
  }
  return a2;
}
function noneToZeroInRelativeColorDataChannels(e) {
  const a2 = new Map(e);
  for (const [n, r] of e) Number.isNaN(r[4].value) && a2.set(n, dummyNumberToken(0));
  return a2;
}
function normalizeAfterColorConversion(e, a2 = -1) {
  return e = convertNaNToZero(e), e = [0 === a2 ? e[0] : normalize(e[0], 1, -2147483647, 2147483647), 1 === a2 ? e[1] : normalize(e[1], 1, -2147483647, 2147483647), 2 === a2 ? e[2] : normalize(e[2], 1, -2147483647, 2147483647)], Number.isNaN(e[a2]) || Number.isFinite(e[a2]) || (e[a2] = 0), e;
}
function dummyNumberToken(n) {
  return Number.isNaN(n) ? [c.Number, "none", -1, -1, { value: Number.NaN, type: a.Number }] : [c.Number, n.toString(), -1, -1, { value: n, type: a.Number }];
}
function reducePrecisionOrNaN(e, a2 = 7) {
  if (Number.isNaN(e)) return e;
  const n = Math.pow(10, a2);
  return Math.round(e * n) / n;
}
const He = /[A-Z]/g;
function toLowerCaseAZ(e) {
  return e.replace(He, (e2) => String.fromCharCode(e2.charCodeAt(0) + 32));
}
function normalize_Color_ChannelValues(t, l, s) {
  if (isTokenIdent(t) && "none" === toLowerCaseAZ(t[4].value)) return s.syntaxFlags.add(Le.HasNoneKeywords), [c.Number, "none", t[2], t[3], { value: Number.NaN, type: a.Number }];
  if (isTokenPercentage(t)) {
    let n;
    return 3 !== l && s.syntaxFlags.add(Le.HasPercentageValues), n = 3 === l ? normalize(t[4].value, 100, 0, 1) : normalize(t[4].value, 100, -2147483647, 2147483647), [c.Number, n.toString(), t[2], t[3], { value: n, type: a.Number }];
  }
  if (isTokenNumber(t)) {
    let n;
    return 3 !== l && s.syntaxFlags.add(Le.HasNumberValues), n = 3 === l ? normalize(t[4].value, 1, 0, 1) : normalize(t[4].value, 1, -2147483647, 2147483647), [c.Number, n.toString(), t[2], t[3], { value: n, type: a.Number }];
  }
  return false;
}
const Pe = /* @__PURE__ */ new Set(["srgb", "srgb-linear", "display-p3", "display-p3-linear", "a98-rgb", "prophoto-rgb", "rec2020", "xyz", "xyz-d50", "xyz-d65"]);
function color$1(e, a2) {
  const r = [], s = [], c2 = [], i = [];
  let u, h, m = false, N = false;
  const p = { colorNotation: De.sRGB, channels: [0, 0, 0], alpha: 1, syntaxFlags: /* @__PURE__ */ new Set([]) };
  let b = r;
  for (let o = 0; o < e.value.length; o++) {
    let v2 = e.value[o];
    if (isWhitespaceNode(v2) || isCommentNode(v2)) for (; isWhitespaceNode(e.value[o + 1]) || isCommentNode(e.value[o + 1]); ) o++;
    else if (b === r && r.length && (b = s), b === s && s.length && (b = c2), isTokenNode(v2) && isTokenDelim(v2.value) && "/" === v2.value[4].value) {
      if (b === i) return false;
      b = i;
    } else {
      if (isFunctionNode(v2)) {
        if (b === i && "var" === toLowerCaseAZ(v2.getName())) {
          p.syntaxFlags.add(Le.HasVariableAlpha), b.push(v2);
          continue;
        }
        if (!Q.has(toLowerCaseAZ(v2.getName()))) return false;
        const [[e2]] = calcFromComponentValues([[v2]], { censorIntoStandardRepresentableValues: true, globals: h, precision: -1, toCanonicalUnits: true, rawPercentages: true });
        if (!e2 || !isTokenNode(e2) || !isTokenNumeric(e2.value)) return false;
        Number.isNaN(e2.value[4].value) && (e2.value[4].value = 0), v2 = e2;
      }
      if (b === r && 0 === r.length && isTokenNode(v2) && isTokenIdent(v2.value) && Pe.has(toLowerCaseAZ(v2.value[4].value))) {
        if (m) return false;
        m = toLowerCaseAZ(v2.value[4].value), p.colorNotation = colorSpaceNameToColorNotation(m), N && (N = colorDataToForRelativeColorSyntax(N, p.colorNotation), u = normalizeRelativeColorDataChannels(N), h = noneToZeroInRelativeColorDataChannels(u));
      } else if (b === r && 0 === r.length && isTokenNode(v2) && isTokenIdent(v2.value) && "from" === toLowerCaseAZ(v2.value[4].value)) {
        if (N) return false;
        if (m) return false;
        for (; isWhitespaceNode(e.value[o + 1]) || isCommentNode(e.value[o + 1]); ) o++;
        if (o++, v2 = e.value[o], N = a2(v2), false === N) return false;
        N.syntaxFlags.has(Le.Experimental) && p.syntaxFlags.add(Le.Experimental), p.syntaxFlags.add(Le.RelativeColorSyntax);
      } else {
        if (!isTokenNode(v2)) return false;
        if (isTokenIdent(v2.value) && u && u.has(toLowerCaseAZ(v2.value[4].value))) {
          b.push(new TokenNode(u.get(toLowerCaseAZ(v2.value[4].value))));
          continue;
        }
        b.push(v2);
      }
    }
  }
  if (!m) return false;
  if (1 !== b.length) return false;
  if (1 !== r.length || 1 !== s.length || 1 !== c2.length) return false;
  if (!isTokenNode(r[0]) || !isTokenNode(s[0]) || !isTokenNode(c2[0])) return false;
  if (u && !u.has("alpha")) return false;
  const v = normalize_Color_ChannelValues(r[0].value, 0, p);
  if (!v || !isTokenNumber(v)) return false;
  const f = normalize_Color_ChannelValues(s[0].value, 1, p);
  if (!f || !isTokenNumber(f)) return false;
  const g = normalize_Color_ChannelValues(c2[0].value, 2, p);
  if (!g || !isTokenNumber(g)) return false;
  const d = [v, f, g];
  if (1 === i.length) if (p.syntaxFlags.add(Le.HasAlpha), isTokenNode(i[0])) {
    const e2 = normalize_Color_ChannelValues(i[0].value, 3, p);
    if (!e2 || !isTokenNumber(e2)) return false;
    d.push(e2);
  } else p.alpha = i[0];
  else if (u && u.has("alpha")) {
    const e2 = normalize_Color_ChannelValues(u.get("alpha"), 3, p);
    if (!e2 || !isTokenNumber(e2)) return false;
    d.push(e2);
  }
  return p.channels = [d[0][4].value, d[1][4].value, d[2][4].value], 4 === d.length && (p.alpha = d[3][4].value), p;
}
function colorSpaceNameToColorNotation(e) {
  switch (e) {
    case "srgb":
      return De.sRGB;
    case "srgb-linear":
      return De.Linear_sRGB;
    case "display-p3":
      return De.Display_P3;
    case "display-p3-linear":
      return De.Linear_Display_P3;
    case "a98-rgb":
      return De.A98_RGB;
    case "prophoto-rgb":
      return De.ProPhoto_RGB;
    case "rec2020":
      return De.Rec2020;
    case "xyz":
    case "xyz-d65":
      return De.XYZ_D65;
    case "xyz-d50":
      return De.XYZ_D50;
    default:
      throw new Error("Unknown color space name: " + e);
  }
}
const Fe = /* @__PURE__ */ new Set(["srgb", "srgb-linear", "display-p3", "display-p3-linear", "a98-rgb", "prophoto-rgb", "rec2020", "lab", "oklab", "xyz", "xyz-d50", "xyz-d65"]), Me = /* @__PURE__ */ new Set(["hsl", "hwb", "lch", "oklch"]), Se = /* @__PURE__ */ new Set(["shorter", "longer", "increasing", "decreasing"]);
function colorMix(e, a2) {
  let r = null, o = null, t = null, l = false;
  for (let c2 = 0; c2 < e.value.length; c2++) {
    const i = e.value[c2];
    if (!isWhiteSpaceOrCommentNode(i)) {
      if (!(r || isTokenNode(i) && isTokenIdent(i.value) && "in" === toLowerCaseAZ(i.value[4].value))) return colorMixRectangular("oklab", colorMixComponents(e.value, a2));
      if (isTokenNode(i) && isTokenIdent(i.value)) {
        if (!r && "in" === toLowerCaseAZ(i.value[4].value)) {
          r = i;
          continue;
        }
        if (r && !o) {
          o = toLowerCaseAZ(i.value[4].value);
          continue;
        }
        if (r && o && !t && Me.has(o)) {
          t = toLowerCaseAZ(i.value[4].value);
          continue;
        }
        if (r && o && t && !l && "hue" === toLowerCaseAZ(i.value[4].value)) {
          l = true;
          continue;
        }
        return false;
      }
      return !(!isTokenNode(i) || !isTokenComma(i.value)) && (!!o && (t || l ? !!(t && l && Me.has(o) && Se.has(t)) && colorMixPolar(o, t, colorMixComponents(e.value.slice(c2 + 1), a2)) : Fe.has(o) ? colorMixRectangular(o, colorMixComponents(e.value.slice(c2 + 1), a2)) : !!Me.has(o) && colorMixPolar(o, "shorter", colorMixComponents(e.value.slice(c2 + 1), a2))));
    }
  }
  return false;
}
function colorMixComponents(e, a2) {
  const n = [];
  let o = false, t = false;
  for (let c2 = 0; c2 < e.length; c2++) {
    let i = e[c2];
    if (!isWhiteSpaceOrCommentNode(i)) {
      if (!isTokenNode(i) || !isTokenComma(i.value)) {
        if (!o) {
          const e2 = a2(i);
          if (e2) {
            o = e2;
            continue;
          }
        }
        if (!t) {
          if (isFunctionNode(i) && Q.has(toLowerCaseAZ(i.getName()))) {
            if ([[i]] = calcFromComponentValues([[i]], { censorIntoStandardRepresentableValues: true, precision: -1, toCanonicalUnits: true, rawPercentages: true }), !i || !isTokenNode(i) || !isTokenNumeric(i.value)) return false;
            Number.isNaN(i.value[4].value) && (i.value[4].value = 0);
          }
          if (isTokenNode(i) && isTokenPercentage(i.value) && i.value[4].value >= 0) {
            t = i.value[4].value;
            continue;
          }
        }
        return false;
      }
      if (!o) return false;
      n.push({ color: o, percentage: t }), o = false, t = false;
    }
  }
  return !!o && (n.push({ color: o, percentage: t }), n);
}
function colorMixRectangular(e, a2) {
  if (!a2 || !a2.length) return false;
  for (const e2 of a2) if (e2.percentage && (e2.percentage < 0 || e2.percentage > 100)) return false;
  const { items: n, leftover: r } = normalizeMixPercentages(a2, true), o = 1 - r / 100;
  let t;
  switch (e) {
    case "srgb":
      t = De.RGB;
      break;
    case "srgb-linear":
      t = De.Linear_sRGB;
      break;
    case "display-p3":
      t = De.Display_P3;
      break;
    case "display-p3-linear":
      t = De.Linear_Display_P3;
      break;
    case "a98-rgb":
      t = De.A98_RGB;
      break;
    case "prophoto-rgb":
      t = De.ProPhoto_RGB;
      break;
    case "rec2020":
      t = De.Rec2020;
      break;
    case "lab":
      t = De.Lab;
      break;
    case "oklab":
      t = De.OKLab;
      break;
    case "xyz-d50":
      t = De.XYZ_D50;
      break;
    case "xyz":
    case "xyz-d65":
      t = De.XYZ_D65;
      break;
    default:
      return false;
  }
  if (1 === n.length) {
    const e2 = colorDataToForInterpolation(n[0].color, t);
    return e2.colorNotation = t, e2.syntaxFlags.add(Le.ColorMixVariadic), e2.syntaxFlags.add(Le.ColorMix), "number" != typeof e2.alpha ? false : (e2.alpha = e2.alpha * o, e2);
  }
  for (n.reverse(); n.length >= 2; ) {
    const e2 = n.pop(), a3 = n.pop();
    if (!e2 || !a3) return false;
    const r2 = e2.percentage + a3.percentage, o2 = r2 > 0 ? a3.percentage / r2 : 0.5, l2 = colorMixRectangularPair(t, e2.color, a3.color, o2);
    if (!l2) return false;
    n.push({ color: l2, percentage: r2 });
  }
  const l = n[0]?.color;
  return !!l && ("number" == typeof l.alpha && (l.alpha = l.alpha * o, a2.some((e2) => e2.color.syntaxFlags.has(Le.Experimental)) && l.syntaxFlags.add(Le.Experimental), 2 !== a2.length && l.syntaxFlags.add(Le.ColorMixVariadic), l));
}
function colorMixRectangularPair(e, a2, n, r) {
  let o = a2.alpha;
  if ("number" != typeof o) return false;
  let t = n.alpha;
  if ("number" != typeof t) return false;
  o = Number.isNaN(o) ? t : o, t = Number.isNaN(t) ? o : t;
  const l = colorDataToForInterpolation(a2, e).channels, s = colorDataToForInterpolation(n, e).channels;
  l[0] = fillInMissingComponent(l[0], s[0]), s[0] = fillInMissingComponent(s[0], l[0]), l[1] = fillInMissingComponent(l[1], s[1]), s[1] = fillInMissingComponent(s[1], l[1]), l[2] = fillInMissingComponent(l[2], s[2]), s[2] = fillInMissingComponent(s[2], l[2]), l[0] = premultiply(l[0], o), l[1] = premultiply(l[1], o), l[2] = premultiply(l[2], o), s[0] = premultiply(s[0], t), s[1] = premultiply(s[1], t), s[2] = premultiply(s[2], t);
  const c2 = interpolate(o, t, r);
  return { colorNotation: e, channels: [un_premultiply(interpolate(l[0], s[0], r), c2), un_premultiply(interpolate(l[1], s[1], r), c2), un_premultiply(interpolate(l[2], s[2], r), c2)], alpha: c2, syntaxFlags: /* @__PURE__ */ new Set([Le.ColorMix]) };
}
function colorMixPolar(e, a2, n) {
  if (!n || !n.length) return false;
  for (const e2 of n) if (e2.percentage && (e2.percentage < 0 || e2.percentage > 100)) return false;
  const { items: r, leftover: o } = normalizeMixPercentages(n, true), t = 1 - o / 100;
  let l;
  switch (e) {
    case "hsl":
      l = De.HSL;
      break;
    case "hwb":
      l = De.HWB;
      break;
    case "lch":
      l = De.LCH;
      break;
    case "oklch":
      l = De.OKLCH;
      break;
    default:
      return false;
  }
  if (1 === r.length) {
    const e2 = colorDataToForInterpolation(r[0].color, l);
    return e2.colorNotation = l, e2.syntaxFlags.add(Le.ColorMixVariadic), e2.syntaxFlags.add(Le.ColorMix), "number" != typeof e2.alpha ? false : (e2.alpha = e2.alpha * t, e2);
  }
  for (r.reverse(); r.length >= 2; ) {
    const e2 = r.pop(), n2 = r.pop();
    if (!e2 || !n2) return false;
    const o2 = e2.percentage + n2.percentage, t2 = o2 > 0 ? n2.percentage / o2 : 0.5, s2 = colorMixPolarPair(l, a2, e2.color, n2.color, t2);
    if (!s2) return false;
    r.push({ color: s2, percentage: o2 });
  }
  const s = r[0]?.color;
  return !!s && ("number" == typeof s.alpha && (s.alpha = s.alpha * t, n.some((e2) => e2.color.syntaxFlags.has(Le.Experimental)) && s.syntaxFlags.add(Le.Experimental), 2 !== n.length && s.syntaxFlags.add(Le.ColorMixVariadic), s));
}
function colorMixPolarPair(e, a2, n, r, o) {
  let t = 0, l = 0, s = 0, c2 = 0, i = 0, u = 0, h = n.alpha;
  if ("number" != typeof h) return false;
  let m = r.alpha;
  if ("number" != typeof m) return false;
  h = Number.isNaN(h) ? m : h, m = Number.isNaN(m) ? h : m;
  const N = colorDataToForInterpolation(n, e).channels, p = colorDataToForInterpolation(r, e).channels;
  switch (e) {
    case De.HSL:
    case De.HWB:
      t = N[0], l = p[0], s = N[1], c2 = p[1], i = N[2], u = p[2];
      break;
    case De.LCH:
    case De.OKLCH:
      s = N[0], c2 = p[0], i = N[1], u = p[1], t = N[2], l = p[2];
  }
  if (s = fillInMissingComponent(s, c2), c2 = fillInMissingComponent(c2, s), i = fillInMissingComponent(i, u), u = fillInMissingComponent(u, i), t = fillInMissingComponent(t, l), l = fillInMissingComponent(l, t), Number.isNaN(t) && Number.isNaN(l)) ;
  else {
    Number.isNaN(t) ? t = 0 : Number.isNaN(l) && (l = 0);
    const e2 = l - t;
    switch (a2) {
      case "shorter":
        e2 > 180 ? t += 360 : e2 < -180 && (l += 360);
        break;
      case "longer":
        -180 < e2 && e2 < 180 && (e2 > 0 ? t += 360 : l += 360);
        break;
      case "increasing":
        e2 < 0 && (l += 360);
        break;
      case "decreasing":
        e2 > 0 && (t += 360);
        break;
      default:
        throw new Error("Unknown hue interpolation method");
    }
  }
  s = premultiply(s, h), i = premultiply(i, h), c2 = premultiply(c2, m), u = premultiply(u, m);
  let b = [0, 0, 0];
  const v = interpolate(h, m, o);
  switch (e) {
    case De.HSL:
    case De.HWB:
      b = [interpolate(t, l, o), un_premultiply(interpolate(s, c2, o), v), un_premultiply(interpolate(i, u, o), v)];
      break;
    case De.LCH:
    case De.OKLCH:
      b = [un_premultiply(interpolate(s, c2, o), v), un_premultiply(interpolate(i, u, o), v), interpolate(t, l, o)];
  }
  return { colorNotation: e, channels: b, alpha: v, syntaxFlags: /* @__PURE__ */ new Set([Le.ColorMix]) };
}
function fillInMissingComponent(e, a2) {
  return Number.isNaN(e) ? a2 : e;
}
function interpolate(e, a2, n) {
  return e * (1 - n) + a2 * n;
}
function premultiply(e, a2) {
  return Number.isNaN(a2) ? e : Number.isNaN(e) ? Number.NaN : e * a2;
}
function un_premultiply(e, a2) {
  return 0 === a2 || Number.isNaN(a2) ? e : Number.isNaN(e) ? Number.NaN : e / a2;
}
function normalizeMixPercentages(e, a2 = false) {
  let n = 0, r = 0;
  for (const a3 of e) a3.percentage && (n += a3.percentage), false === a3.percentage && r++;
  n = Math.min(100, n);
  for (const a3 of e) false === a3.percentage && (a3.percentage = (100 - n) / r);
  const o = e.slice();
  let t = 0;
  for (const e2 of o) t += e2.percentage;
  if (t > 100 || t > 0 && a2) for (const e2 of o) e2.percentage = e2.percentage * (100 / t);
  let l = 0;
  return t < 100 && (l = 100 - t), { items: o, leftover: l };
}
function hex(e) {
  const a2 = toLowerCaseAZ(e[4].value);
  if (a2.match(/[^a-f0-9]/)) return false;
  const n = { colorNotation: De.HEX, channels: [0, 0, 0], alpha: 1, syntaxFlags: /* @__PURE__ */ new Set([Le.Hex]) }, r = a2.length;
  if (3 === r) {
    const e2 = a2[0], r2 = a2[1], o = a2[2];
    return n.channels = [parseInt(e2 + e2, 16) / 255, parseInt(r2 + r2, 16) / 255, parseInt(o + o, 16) / 255], n;
  }
  if (6 === r) {
    const e2 = a2[0] + a2[1], r2 = a2[2] + a2[3], o = a2[4] + a2[5];
    return n.channels = [parseInt(e2, 16) / 255, parseInt(r2, 16) / 255, parseInt(o, 16) / 255], n;
  }
  if (4 === r) {
    const e2 = a2[0], r2 = a2[1], o = a2[2], t = a2[3];
    return n.channels = [parseInt(e2 + e2, 16) / 255, parseInt(r2 + r2, 16) / 255, parseInt(o + o, 16) / 255], n.alpha = parseInt(t + t, 16) / 255, n.syntaxFlags.add(Le.HasAlpha), n;
  }
  if (8 === r) {
    const e2 = a2[0] + a2[1], r2 = a2[2] + a2[3], o = a2[4] + a2[5], t = a2[6] + a2[7];
    return n.channels = [parseInt(e2, 16) / 255, parseInt(r2, 16) / 255, parseInt(o, 16) / 255], n.alpha = parseInt(t, 16) / 255, n.syntaxFlags.add(Le.HasAlpha), n;
  }
  return false;
}
function normalizeHue(n) {
  if (isTokenNumber(n)) return Number.isNaN(n[4].value) || Number.isFinite(n[4].value) || (n[4].value = 0), n[4].value = n[4].value % 360, n[4].value < 0 && (n[4].value += 360), n[1] = n[4].value.toString(), n;
  if (isTokenDimension(n)) {
    let r = n[4].value;
    switch (toLowerCaseAZ(n[4].unit)) {
      case "deg":
        break;
      case "rad":
        r = 180 * n[4].value / Math.PI;
        break;
      case "grad":
        r = 0.9 * n[4].value;
        break;
      case "turn":
        r = 360 * n[4].value;
        break;
      default:
        return false;
    }
    return Number.isNaN(n[4].value) || Number.isFinite(n[4].value) || (n[4].value = 0), r %= 360, r < 0 && (r += 360), [c.Number, r.toString(), n[2], n[3], { value: r, type: a.Number }];
  }
  return false;
}
function normalize_legacy_HSL_ChannelValues(n, t, l) {
  if (0 === t) {
    const e = normalizeHue(n);
    return false !== e && (isTokenDimension(n) && l.syntaxFlags.add(Le.HasDimensionValues), e);
  }
  if (isTokenPercentage(n)) {
    let r;
    return 3 === t ? l.syntaxFlags.add(Le.HasPercentageAlpha) : l.syntaxFlags.add(Le.HasPercentageValues), r = 3 === t ? normalize(n[4].value, 100, 0, 1) : normalize(n[4].value, 1, 0, 100), [c.Number, r.toString(), n[2], n[3], { value: r, type: a.Number }];
  }
  if (isTokenNumber(n)) {
    if (3 !== t) return false;
    let r;
    return r = normalize(n[4].value, 1, 0, 3 === t ? 1 : 100), [c.Number, r.toString(), n[2], n[3], { value: r, type: a.Number }];
  }
  return false;
}
function normalize_modern_HSL_ChannelValues(t, l, s) {
  if (isTokenIdent(t) && "none" === toLowerCaseAZ(t[4].value)) return s.syntaxFlags.add(Le.HasNoneKeywords), [c.Number, "none", t[2], t[3], { value: Number.NaN, type: a.Number }];
  if (0 === l) {
    const e = normalizeHue(t);
    return false !== e && (isTokenDimension(t) && s.syntaxFlags.add(Le.HasDimensionValues), e);
  }
  if (isTokenPercentage(t)) {
    let n;
    return 3 === l ? s.syntaxFlags.add(Le.HasPercentageAlpha) : s.syntaxFlags.add(Le.HasPercentageValues), n = 3 === l ? normalize(t[4].value, 100, 0, 1) : normalize(t[4].value, 1, 1 === l ? 0 : -2147483647, 2147483647), [c.Number, n.toString(), t[2], t[3], { value: n, type: a.Number }];
  }
  if (isTokenNumber(t)) {
    let n;
    return 3 !== l && s.syntaxFlags.add(Le.HasNumberValues), n = 3 === l ? normalize(t[4].value, 1, 0, 1) : normalize(t[4].value, 1, 1 === l ? 0 : -2147483647, 2147483647), [c.Number, n.toString(), t[2], t[3], { value: n, type: a.Number }];
  }
  return false;
}
function threeChannelLegacySyntax(e, a2, n, r) {
  const t = [], c2 = [], i = [], u = [], h = { colorNotation: n, channels: [0, 0, 0], alpha: 1, syntaxFlags: new Set(r) };
  let m = t;
  for (let a3 = 0; a3 < e.value.length; a3++) {
    let n2 = e.value[a3];
    if (!isWhitespaceNode(n2) && !isCommentNode(n2)) {
      if (isTokenNode(n2) && isTokenComma(n2.value)) {
        if (m === t) {
          m = c2;
          continue;
        }
        if (m === c2) {
          m = i;
          continue;
        }
        if (m === i) {
          m = u;
          continue;
        }
        if (m === u) return false;
      }
      if (isFunctionNode(n2)) {
        if (m === u && "var" === n2.getName().toLowerCase()) {
          h.syntaxFlags.add(Le.HasVariableAlpha), m.push(n2);
          continue;
        }
        if (!Q.has(n2.getName().toLowerCase())) return false;
        const [[e2]] = calcFromComponentValues([[n2]], { censorIntoStandardRepresentableValues: true, precision: -1, toCanonicalUnits: true, rawPercentages: true });
        if (!e2 || !isTokenNode(e2) || !isTokenNumeric(e2.value)) return false;
        Number.isNaN(e2.value[4].value) && (e2.value[4].value = 0), n2 = e2;
      }
      if (!isTokenNode(n2)) return false;
      m.push(n2);
    }
  }
  if (1 !== m.length) return false;
  if (1 !== t.length || 1 !== c2.length || 1 !== i.length) return false;
  if (!isTokenNode(t[0]) || !isTokenNode(c2[0]) || !isTokenNode(i[0])) return false;
  const N = a2(t[0].value, 0, h);
  if (!N || !isTokenNumber(N)) return false;
  const p = a2(c2[0].value, 1, h);
  if (!p || !isTokenNumber(p)) return false;
  const b = a2(i[0].value, 2, h);
  if (!b || !isTokenNumber(b)) return false;
  const v = [N, p, b];
  if (1 === u.length) if (h.syntaxFlags.add(Le.HasAlpha), isTokenNode(u[0])) {
    const e2 = a2(u[0].value, 3, h);
    if (!e2 || !isTokenNumber(e2)) return false;
    v.push(e2);
  } else h.alpha = u[0];
  return h.channels = [v[0][4].value, v[1][4].value, v[2][4].value], 4 === v.length && (h.alpha = v[3][4].value), h;
}
function threeChannelSpaceSeparated(e, a2, r, s, c2) {
  const i = [], u = [], h = [], m = [];
  let N, p, b = false;
  const v = { colorNotation: r, channels: [0, 0, 0], alpha: 1, syntaxFlags: new Set(s) };
  let f = i;
  for (let a3 = 0; a3 < e.value.length; a3++) {
    let o = e.value[a3];
    if (isWhitespaceNode(o) || isCommentNode(o)) for (; isWhitespaceNode(e.value[a3 + 1]) || isCommentNode(e.value[a3 + 1]); ) a3++;
    else if (f === i && i.length && (f = u), f === u && u.length && (f = h), isTokenNode(o) && isTokenDelim(o.value) && "/" === o.value[4].value) {
      if (f === m) return false;
      f = m;
    } else {
      if (isFunctionNode(o)) {
        if (f === m && "var" === o.getName().toLowerCase()) {
          v.syntaxFlags.add(Le.HasVariableAlpha), f.push(o);
          continue;
        }
        if (!Q.has(o.getName().toLowerCase())) return false;
        const [[e2]] = calcFromComponentValues([[o]], { censorIntoStandardRepresentableValues: true, globals: p, precision: -1, toCanonicalUnits: true, rawPercentages: true });
        if (!e2 || !isTokenNode(e2) || !isTokenNumeric(e2.value)) return false;
        Number.isNaN(e2.value[4].value) && (e2.value[4].value = 0), o = e2;
      }
      if (f === i && 0 === i.length && isTokenNode(o) && isTokenIdent(o.value) && "from" === o.value[4].value.toLowerCase()) {
        if (b) return false;
        for (; isWhitespaceNode(e.value[a3 + 1]) || isCommentNode(e.value[a3 + 1]); ) a3++;
        if (a3++, o = e.value[a3], b = c2(o), false === b) return false;
        b.syntaxFlags.has(Le.Experimental) && v.syntaxFlags.add(Le.Experimental), v.syntaxFlags.add(Le.RelativeColorSyntax), b = colorDataToForRelativeColorSyntax(b, r), N = normalizeRelativeColorDataChannels(b), p = noneToZeroInRelativeColorDataChannels(N);
      } else {
        if (!isTokenNode(o)) return false;
        if (isTokenIdent(o.value) && N) {
          const e2 = o.value[4].value.toLowerCase();
          if (N.has(e2)) {
            f.push(new TokenNode(N.get(e2)));
            continue;
          }
        }
        f.push(o);
      }
    }
  }
  if (1 !== f.length) return false;
  if (1 !== i.length || 1 !== u.length || 1 !== h.length) return false;
  if (!isTokenNode(i[0]) || !isTokenNode(u[0]) || !isTokenNode(h[0])) return false;
  if (N && !N.has("alpha")) return false;
  const g = a2(i[0].value, 0, v);
  if (!g || !isTokenNumber(g)) return false;
  const d = a2(u[0].value, 1, v);
  if (!d || !isTokenNumber(d)) return false;
  const y = a2(h[0].value, 2, v);
  if (!y || !isTokenNumber(y)) return false;
  const _ = [g, d, y];
  if (1 === m.length) if (v.syntaxFlags.add(Le.HasAlpha), isTokenNode(m[0])) {
    const e2 = a2(m[0].value, 3, v);
    if (!e2 || !isTokenNumber(e2)) return false;
    _.push(e2);
  } else v.alpha = m[0];
  else if (N && N.has("alpha")) {
    const e2 = a2(N.get("alpha"), 3, v);
    if (!e2 || !isTokenNumber(e2)) return false;
    _.push(e2);
  }
  return v.channels = [_[0][4].value, _[1][4].value, _[2][4].value], 4 === _.length && (v.alpha = _[3][4].value), v;
}
function hsl(e, a2) {
  if (e.value.some((e2) => isTokenNode(e2) && isTokenComma(e2.value))) {
    const a3 = hslCommaSeparated(e);
    if (false !== a3) return a3;
  }
  {
    const n = hslSpaceSeparated(e, a2);
    if (false !== n) return n;
  }
  return false;
}
function hslCommaSeparated(e) {
  return threeChannelLegacySyntax(e, normalize_legacy_HSL_ChannelValues, De.HSL, [Le.LegacyHSL]);
}
function hslSpaceSeparated(e, a2) {
  return threeChannelSpaceSeparated(e, normalize_modern_HSL_ChannelValues, De.HSL, [], a2);
}
function normalize_HWB_ChannelValues(t, l, s) {
  if (isTokenIdent(t) && "none" === toLowerCaseAZ(t[4].value)) return s.syntaxFlags.add(Le.HasNoneKeywords), [c.Number, "none", t[2], t[3], { value: Number.NaN, type: a.Number }];
  if (0 === l) {
    const e = normalizeHue(t);
    return false !== e && (isTokenDimension(t) && s.syntaxFlags.add(Le.HasDimensionValues), e);
  }
  if (isTokenPercentage(t)) {
    let n;
    return 3 === l ? s.syntaxFlags.add(Le.HasPercentageAlpha) : s.syntaxFlags.add(Le.HasPercentageValues), n = 3 === l ? normalize(t[4].value, 100, 0, 1) : normalize(t[4].value, 1, -2147483647, 2147483647), [c.Number, n.toString(), t[2], t[3], { value: n, type: a.Number }];
  }
  if (isTokenNumber(t)) {
    let n;
    return 3 !== l && s.syntaxFlags.add(Le.HasNumberValues), n = 3 === l ? normalize(t[4].value, 1, 0, 1) : normalize(t[4].value, 1, -2147483647, 2147483647), [c.Number, n.toString(), t[2], t[3], { value: n, type: a.Number }];
  }
  return false;
}
function normalize_Lab_ChannelValues(t, l, s) {
  if (isTokenIdent(t) && "none" === toLowerCaseAZ(t[4].value)) return s.syntaxFlags.add(Le.HasNoneKeywords), [c.Number, "none", t[2], t[3], { value: Number.NaN, type: a.Number }];
  if (isTokenPercentage(t)) {
    let n;
    return 3 !== l && s.syntaxFlags.add(Le.HasPercentageValues), n = 1 === l || 2 === l ? normalize(t[4].value, 0.8, -2147483647, 2147483647) : 3 === l ? normalize(t[4].value, 100, 0, 1) : normalize(t[4].value, 1, 0, 100), [c.Number, n.toString(), t[2], t[3], { value: n, type: a.Number }];
  }
  if (isTokenNumber(t)) {
    let n;
    return 3 !== l && s.syntaxFlags.add(Le.HasNumberValues), n = 1 === l || 2 === l ? normalize(t[4].value, 1, -2147483647, 2147483647) : normalize(t[4].value, 1, 0, 3 === l ? 1 : 100), [c.Number, n.toString(), t[2], t[3], { value: n, type: a.Number }];
  }
  return false;
}
function lab(e, a2) {
  return threeChannelSpaceSeparated(e, normalize_Lab_ChannelValues, De.Lab, [], a2);
}
function normalize_LCH_ChannelValues(t, l, s) {
  if (isTokenIdent(t) && "none" === toLowerCaseAZ(t[4].value)) return s.syntaxFlags.add(Le.HasNoneKeywords), [c.Number, "none", t[2], t[3], { value: Number.NaN, type: a.Number }];
  if (2 === l) {
    const e = normalizeHue(t);
    return false !== e && (isTokenDimension(t) && s.syntaxFlags.add(Le.HasDimensionValues), e);
  }
  if (isTokenPercentage(t)) {
    let n;
    return 3 !== l && s.syntaxFlags.add(Le.HasPercentageValues), n = 1 === l ? normalize(t[4].value, 100 / 150, 0, 2147483647) : 3 === l ? normalize(t[4].value, 100, 0, 1) : normalize(t[4].value, 1, 0, 100), [c.Number, n.toString(), t[2], t[3], { value: n, type: a.Number }];
  }
  if (isTokenNumber(t)) {
    let n;
    return 3 !== l && s.syntaxFlags.add(Le.HasNumberValues), n = normalize(t[4].value, 1, 0, 1 === l ? 2147483647 : 3 === l ? 1 : 100), [c.Number, n.toString(), t[2], t[3], { value: n, type: a.Number }];
  }
  return false;
}
function lch(e, a2) {
  return threeChannelSpaceSeparated(e, normalize_LCH_ChannelValues, De.LCH, [], a2);
}
const ze = /* @__PURE__ */ new Map();
for (const [e, a2] of Object.entries(G)) ze.set(e, a2);
function namedColor(e) {
  const a2 = ze.get(toLowerCaseAZ(e));
  return !!a2 && { colorNotation: De.RGB, channels: [a2[0] / 255, a2[1] / 255, a2[2] / 255], alpha: 1, syntaxFlags: /* @__PURE__ */ new Set([Le.ColorKeyword, Le.NamedColor]) };
}
function normalize_OKLab_ChannelValues(t, l, s) {
  if (isTokenIdent(t) && "none" === toLowerCaseAZ(t[4].value)) return s.syntaxFlags.add(Le.HasNoneKeywords), [c.Number, "none", t[2], t[3], { value: Number.NaN, type: a.Number }];
  if (isTokenPercentage(t)) {
    let n;
    return 3 !== l && s.syntaxFlags.add(Le.HasPercentageValues), n = 1 === l || 2 === l ? normalize(t[4].value, 250, -2147483647, 2147483647) : normalize(t[4].value, 100, 0, 1), [c.Number, n.toString(), t[2], t[3], { value: n, type: a.Number }];
  }
  if (isTokenNumber(t)) {
    let n;
    return 3 !== l && s.syntaxFlags.add(Le.HasNumberValues), n = 1 === l || 2 === l ? normalize(t[4].value, 1, -2147483647, 2147483647) : normalize(t[4].value, 1, 0, 1), [c.Number, n.toString(), t[2], t[3], { value: n, type: a.Number }];
  }
  return false;
}
function oklab(e, a2) {
  return threeChannelSpaceSeparated(e, normalize_OKLab_ChannelValues, De.OKLab, [], a2);
}
function normalize_OKLCH_ChannelValues(t, l, s) {
  if (isTokenIdent(t) && "none" === toLowerCaseAZ(t[4].value)) return s.syntaxFlags.add(Le.HasNoneKeywords), [c.Number, "none", t[2], t[3], { value: Number.NaN, type: a.Number }];
  if (2 === l) {
    const e = normalizeHue(t);
    return false !== e && (isTokenDimension(t) && s.syntaxFlags.add(Le.HasDimensionValues), e);
  }
  if (isTokenPercentage(t)) {
    let n;
    return 3 !== l && s.syntaxFlags.add(Le.HasPercentageValues), n = 1 === l ? normalize(t[4].value, 250, 0, 2147483647) : normalize(t[4].value, 100, 0, 1), [c.Number, n.toString(), t[2], t[3], { value: n, type: a.Number }];
  }
  if (isTokenNumber(t)) {
    let n;
    return 3 !== l && s.syntaxFlags.add(Le.HasNumberValues), n = normalize(t[4].value, 1, 0, 1 === l ? 2147483647 : 1), [c.Number, n.toString(), t[2], t[3], { value: n, type: a.Number }];
  }
  return false;
}
function oklch(e, a2) {
  return threeChannelSpaceSeparated(e, normalize_OKLCH_ChannelValues, De.OKLCH, [], a2);
}
function normalize_legacy_sRGB_ChannelValues(n, t, l) {
  if (isTokenPercentage(n)) {
    3 === t ? l.syntaxFlags.add(Le.HasPercentageAlpha) : l.syntaxFlags.add(Le.HasPercentageValues);
    const r = normalize(n[4].value, 100, 0, 1);
    return [c.Number, r.toString(), n[2], n[3], { value: r, type: a.Number }];
  }
  if (isTokenNumber(n)) {
    let r;
    return 3 !== t && l.syntaxFlags.add(Le.HasNumberValues), r = normalize(n[4].value, 3 === t ? 1 : 255, 0, 1), [c.Number, r.toString(), n[2], n[3], { value: r, type: a.Number }];
  }
  return false;
}
function normalize_modern_sRGB_ChannelValues(t, l, s) {
  if (isTokenIdent(t) && "none" === t[4].value.toLowerCase()) return s.syntaxFlags.add(Le.HasNoneKeywords), [c.Number, "none", t[2], t[3], { value: Number.NaN, type: a.Number }];
  if (isTokenPercentage(t)) {
    let n;
    return 3 !== l && s.syntaxFlags.add(Le.HasPercentageValues), n = 3 === l ? normalize(t[4].value, 100, 0, 1) : normalize(t[4].value, 100, -2147483647, 2147483647), [c.Number, n.toString(), t[2], t[3], { value: n, type: a.Number }];
  }
  if (isTokenNumber(t)) {
    let n;
    return 3 !== l && s.syntaxFlags.add(Le.HasNumberValues), n = 3 === l ? normalize(t[4].value, 1, 0, 1) : normalize(t[4].value, 255, -2147483647, 2147483647), [c.Number, n.toString(), t[2], t[3], { value: n, type: a.Number }];
  }
  return false;
}
function rgb(e, a2) {
  if (e.value.some((e2) => isTokenNode(e2) && isTokenComma(e2.value))) {
    const a3 = rgbCommaSeparated(e);
    if (false !== a3) return (!a3.syntaxFlags.has(Le.HasNumberValues) || !a3.syntaxFlags.has(Le.HasPercentageValues)) && a3;
  } else {
    const n = rgbSpaceSeparated(e, a2);
    if (false !== n) return n;
  }
  return false;
}
function rgbCommaSeparated(e) {
  return threeChannelLegacySyntax(e, normalize_legacy_sRGB_ChannelValues, De.RGB, [Le.LegacyRGB]);
}
function rgbSpaceSeparated(e, a2) {
  return threeChannelSpaceSeparated(e, normalize_modern_sRGB_ChannelValues, De.RGB, [], a2);
}
function XYZ_D65_to_sRGB_Gamut(e) {
  const a2 = XYZ_D65_to_sRGB(e);
  if (inGamut(a2)) return clip(a2);
  let n = e;
  return n = XYZ_D65_to_OKLCH(n), n[0] < 1e-6 && (n = [0, 0, 0]), n[0] > 0.999999 && (n = [1, 0, 0]), gam_sRGB(mapGamutRayTrace(n, oklch_to_lin_srgb, lin_srgb_to_oklch));
}
function oklch_to_lin_srgb(e) {
  return e = OKLCH_to_OKLab(e), e = OKLab_to_XYZ(e), XYZ_to_lin_sRGB(e);
}
function lin_srgb_to_oklch(e) {
  return e = lin_sRGB_to_XYZ(e), e = XYZ_to_OKLab(e), OKLab_to_OKLCH(e);
}
function contrastColor(e, a2) {
  let n = false;
  for (let r2 = 0; r2 < e.value.length; r2++) {
    const o2 = e.value[r2];
    if (!isWhitespaceNode(o2) && !isCommentNode(o2) && (n || (n = a2(o2), !n))) return false;
  }
  if (!n) return false;
  n.channels = convertNaNToZero(n.channels), n.channels = XYZ_D65_to_sRGB_Gamut(colorData_to_XYZ_D65(n).channels), n.colorNotation = De.sRGB;
  const r = { colorNotation: De.RGB, channels: [0, 0, 0], alpha: 1, syntaxFlags: /* @__PURE__ */ new Set([Le.ContrastColor, Le.Experimental]) }, o = contrast_ratio_wcag_2_1(n.channels, [1, 1, 1]), t = contrast_ratio_wcag_2_1(n.channels, [0, 0, 0]);
  return r.channels = o > t ? [1, 1, 1] : [0, 0, 0], r;
}
function alpha(e, a2) {
  let r, s, c2 = false, i = false, u = false;
  const h = { colorNotation: De.sRGB, channels: [0, 0, 0], alpha: 1, syntaxFlags: /* @__PURE__ */ new Set([]) };
  for (let m = 0; m < e.value.length; m++) {
    let N = e.value[m];
    if (isWhitespaceNode(N) || isCommentNode(N)) for (; isWhitespaceNode(e.value[m + 1]) || isCommentNode(e.value[m + 1]); ) m++;
    else if (u && !c2 && !i && isTokenNode(N) && isTokenDelim(N.value) && "/" === N.value[4].value) c2 = true;
    else {
      if (isFunctionNode(N) && Q.has(toLowerCaseAZ(N.getName()))) {
        const [[e2]] = calcFromComponentValues([[N]], { censorIntoStandardRepresentableValues: true, globals: s, precision: -1, toCanonicalUnits: true, rawPercentages: true });
        if (!e2 || !isTokenNode(e2) || !isTokenNumeric(e2.value)) return false;
        Number.isNaN(e2.value[4].value) && (e2.value[4].value = 0), N = e2;
      }
      if (c2 || i || !isTokenNode(N) || !isTokenIdent(N.value) || "from" !== toLowerCaseAZ(N.value[4].value)) {
        if (!c2) return false;
        if (i) return false;
        if (isTokenNode(N)) {
          if (isTokenIdent(N.value) && "alpha" === toLowerCaseAZ(N.value[4].value) && r && r.has("alpha")) {
            h.alpha = r.get("alpha")[4].value, i = true;
            continue;
          }
          const e2 = normalize_Color_ChannelValues(N.value, 3, h);
          if (!e2 || !isTokenNumber(e2)) return false;
          h.alpha = e2[4].value, i = true;
          continue;
        }
        if (isFunctionNode(N)) {
          const e2 = replaceComponentValues([[N]], (e3) => {
            if (isTokenNode(e3) && isTokenIdent(e3.value) && "alpha" === toLowerCaseAZ(e3.value[4].value) && r && r.has("alpha")) return new TokenNode(r.get("alpha"));
          });
          h.alpha = e2[0][0], i = true;
          continue;
        }
        return false;
      }
      if (u) return false;
      for (; isWhitespaceNode(e.value[m + 1]) || isCommentNode(e.value[m + 1]); ) m++;
      if (m++, N = e.value[m], u = a2(N), false === u) return false;
      r = normalizeRelativeColorDataChannels(u), s = noneToZeroInRelativeColorDataChannels(r), h.syntaxFlags = new Set(u.syntaxFlags), h.syntaxFlags.add(Le.RelativeAlphaSyntax), h.channels = [...u.channels], h.colorNotation = u.colorNotation, h.alpha = u.alpha;
    }
  }
  return !!r && h;
}
function color(e) {
  if (isFunctionNode(e)) {
    switch (toLowerCaseAZ(e.getName())) {
      case "rgb":
      case "rgba":
        return rgb(e, color);
      case "hsl":
      case "hsla":
        return hsl(e, color);
      case "hwb":
        return a2 = color, threeChannelSpaceSeparated(e, normalize_HWB_ChannelValues, De.HWB, [], a2);
      case "lab":
        return lab(e, color);
      case "lch":
        return lch(e, color);
      case "oklab":
        return oklab(e, color);
      case "oklch":
        return oklch(e, color);
      case "color":
        return color$1(e, color);
      case "color-mix":
        return colorMix(e, color);
      case "contrast-color":
        return contrastColor(e, color);
      case "alpha":
        return alpha(e, color);
    }
  }
  var a2;
  if (isTokenNode(e)) {
    if (isTokenHash(e.value)) return hex(e.value);
    if (isTokenIdent(e.value)) {
      const a3 = namedColor(e.value[4].value);
      return false !== a3 ? a3 : "transparent" === toLowerCaseAZ(e.value[4].value) && { colorNotation: De.RGB, channels: [0, 0, 0], alpha: 0, syntaxFlags: /* @__PURE__ */ new Set([Le.ColorKeyword]) };
    }
  }
  return false;
}
export {
  Le as L,
  color as c
};
