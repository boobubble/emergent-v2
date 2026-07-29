function multiplyMatrices(_2, t2) {
  return [_2[0] * t2[0] + _2[1] * t2[1] + _2[2] * t2[2], _2[3] * t2[0] + _2[4] * t2[1] + _2[5] * t2[2], _2[6] * t2[0] + _2[7] * t2[1] + _2[8] * t2[2]];
}
const _ = [0.955473421488075, -0.02309845494876471, 0.06325924320057072, -0.0283697093338637, 1.0099953980813041, 0.021041441191917323, 0.012314014864481998, -0.020507649298898964, 1.330365926242124];
function D50_to_D65(t2) {
  return multiplyMatrices(_, t2);
}
const t = [1.0479297925449969, 0.022946870601609652, -0.05019226628920524, 0.02962780877005599, 0.9904344267538799, -0.017073799063418826, -0.009243040646204504, 0.015055191490298152, 0.7518742814281371];
function D65_to_D50(_2) {
  return multiplyMatrices(t, _2);
}
function HSL_to_sRGB(_2) {
  let t2 = _2[0] % 360;
  const n2 = _2[1] / 100, o2 = _2[2] / 100;
  return t2 < 0 && (t2 += 360), [HSL_to_sRGB_channel(0, t2, n2, o2), HSL_to_sRGB_channel(8, t2, n2, o2), HSL_to_sRGB_channel(4, t2, n2, o2)];
}
function HSL_to_sRGB_channel(_2, t2, n2, o2) {
  const e2 = (_2 + t2 / 30) % 12;
  return o2 - n2 * Math.min(o2, 1 - o2) * Math.max(-1, Math.min(e2 - 3, 9 - e2, 1));
}
function HWB_to_sRGB(_2) {
  const t2 = _2[0], n2 = _2[1] / 100, o2 = _2[2] / 100;
  if (n2 + o2 >= 1) {
    const _3 = n2 / (n2 + o2);
    return [_3, _3, _3];
  }
  const e2 = HSL_to_sRGB([t2, 100, 50]), r2 = 1 - n2 - o2;
  return [e2[0] * r2 + n2, e2[1] * r2 + n2, e2[2] * r2 + n2];
}
function LCH_to_Lab(_2) {
  const t2 = _2[2] * Math.PI / 180;
  return [_2[0], _2[1] * Math.cos(t2), _2[1] * Math.sin(t2)];
}
function Lab_to_LCH(_2) {
  const t2 = Math.sqrt(Math.pow(_2[1], 2) + Math.pow(_2[2], 2));
  let n2 = 180 * Math.atan2(_2[2], _2[1]) / Math.PI;
  return n2 < 0 && (n2 += 360), t2 <= 15e-4 && (n2 = NaN), [_2[0], t2, n2];
}
const n = [0.3457 / 0.3585, 1, 0.2958 / 0.3585];
function Lab_to_XYZ(_2) {
  const t2 = 24389 / 27, o2 = 216 / 24389, e2 = (_2[0] + 16) / 116, r2 = _2[1] / 500 + e2, a2 = e2 - _2[2] / 200;
  return [(Math.pow(r2, 3) > o2 ? Math.pow(r2, 3) : (116 * r2 - 16) / t2) * n[0], (_2[0] > 8 ? Math.pow((_2[0] + 16) / 116, 3) : _2[0] / t2) * n[1], (Math.pow(a2, 3) > o2 ? Math.pow(a2, 3) : (116 * a2 - 16) / t2) * n[2]];
}
function OKLCH_to_OKLab(_2) {
  const t2 = _2[2] * Math.PI / 180;
  return [_2[0], _2[1] * Math.cos(t2), _2[1] * Math.sin(t2)];
}
function OKLab_to_OKLCH(_2) {
  const t2 = Math.sqrt(_2[1] ** 2 + _2[2] ** 2);
  let n2 = 180 * Math.atan2(_2[2], _2[1]) / Math.PI;
  return n2 < 0 && (n2 += 360), t2 <= 4e-6 && (n2 = NaN), [_2[0], t2, n2];
}
const o = [1.2268798758459243, -0.5578149944602171, 0.2813910456659647, -0.0405757452148008, 1.112286803280317, -0.0717110580655164, -0.0763729366746601, -0.4214933324022432, 1.5869240198367816], e = [1, 0.3963377773761749, 0.2158037573099136, 1, -0.1055613458156586, -0.0638541728258133, 1, -0.0894841775298119, -1.2914855480194092];
function OKLab_to_XYZ(_2) {
  const t2 = multiplyMatrices(e, _2);
  return multiplyMatrices(o, [t2[0] ** 3, t2[1] ** 3, t2[2] ** 3]);
}
function XYZ_to_Lab(_2) {
  const t2 = compute_f(_2[0] / n[0]), o2 = compute_f(_2[1] / n[1]);
  return [116 * o2 - 16, 500 * (t2 - o2), 200 * (o2 - compute_f(_2[2] / n[2]))];
}
const r = 216 / 24389, a = 24389 / 27;
function compute_f(_2) {
  return _2 > r ? Math.cbrt(_2) : (a * _2 + 16) / 116;
}
const i = [0.819022437996703, 0.3619062600528904, -0.1288737815209879, 0.0329836539323885, 0.9292868615863434, 0.0361446663506424, 0.0481771893596242, 0.2642395317527308, 0.6335478284694309], l = [0.210454268309314, 0.7936177747023054, -0.0040720430116193, 1.9779985324311684, -2.42859224204858, 0.450593709617411, 0.0259040424655478, 0.7827717124575296, -0.8086757549230774];
function XYZ_to_OKLab(_2) {
  const t2 = multiplyMatrices(i, _2);
  return multiplyMatrices(l, [Math.cbrt(t2[0]), Math.cbrt(t2[1]), Math.cbrt(t2[2])]);
}
const u = [30757411 / 17917100, -6372589 / 17917100, -4539589 / 17917100, -0.666684351832489, 1.616481236634939, 467509 / 29648200, 792561 / 44930125, -1921689 / 44930125, 0.942103121235474];
function XYZ_to_lin_2020(_2) {
  return multiplyMatrices(u, _2);
}
const c = [446124 / 178915, -333277 / 357830, -72051 / 178915, -14852 / 17905, 63121 / 35810, 423 / 17905, 11844 / 330415, -50337 / 660830, 316169 / 330415];
function XYZ_to_lin_P3(_2) {
  return multiplyMatrices(c, _2);
}
const s = [1.3457868816471583, -0.25557208737979464, -0.05110186497554526, -0.5446307051249019, 1.5082477428451468, 0.02052744743642139, 0, 0, 1.2119675456389452];
function XYZ_to_lin_ProPhoto(_2) {
  return multiplyMatrices(s, _2);
}
const X = [1829569 / 896150, -506331 / 896150, -308931 / 896150, -851781 / 878810, 1648619 / 878810, 36519 / 878810, 16779 / 1248040, -147721 / 1248040, 1266979 / 1248040];
function XYZ_to_lin_a98rgb(_2) {
  return multiplyMatrices(X, _2);
}
const Y = [12831 / 3959, -329 / 214, -1974 / 3959, -851781 / 878810, 1648619 / 878810, 36519 / 878810, 705 / 12673, -2585 / 12673, 705 / 667];
function XYZ_to_lin_sRGB(_2) {
  return multiplyMatrices(Y, _2);
}
function gam_2020(_2) {
  return [gam_2020_channel(_2[0]), gam_2020_channel(_2[1]), gam_2020_channel(_2[2])];
}
function gam_2020_channel(_2) {
  const t2 = _2 < 0 ? -1 : 1, n2 = Math.abs(_2);
  return t2 * Math.pow(n2, 1 / 2.4);
}
function gam_sRGB(_2) {
  return [gam_sRGB_channel(_2[0]), gam_sRGB_channel(_2[1]), gam_sRGB_channel(_2[2])];
}
function gam_sRGB_channel(_2) {
  const t2 = _2 < 0 ? -1 : 1, n2 = Math.abs(_2);
  return n2 > 31308e-7 ? t2 * (1.055 * Math.pow(n2, 1 / 2.4) - 0.055) : 12.92 * _2;
}
function gam_P3(_2) {
  return gam_sRGB(_2);
}
function gam_ProPhoto(_2) {
  return [gam_ProPhoto_channel(_2[0]), gam_ProPhoto_channel(_2[1]), gam_ProPhoto_channel(_2[2])];
}
const Z = 1 / 512;
function gam_ProPhoto_channel(_2) {
  const t2 = _2 < 0 ? -1 : 1, n2 = Math.abs(_2);
  return n2 >= Z ? t2 * Math.pow(n2, 1 / 1.8) : 16 * _2;
}
function gam_a98rgb(_2) {
  return [gam_a98rgb_channel(_2[0]), gam_a98rgb_channel(_2[1]), gam_a98rgb_channel(_2[2])];
}
function gam_a98rgb_channel(_2) {
  const t2 = _2 < 0 ? -1 : 1, n2 = Math.abs(_2);
  return t2 * Math.pow(n2, 256 / 563);
}
function lin_2020(_2) {
  return [lin_2020_channel(_2[0]), lin_2020_channel(_2[1]), lin_2020_channel(_2[2])];
}
function lin_2020_channel(_2) {
  const t2 = _2 < 0 ? -1 : 1, n2 = Math.abs(_2);
  return t2 * Math.pow(n2, 2.4);
}
const D = [63426534 / 99577255, 20160776 / 139408157, 47086771 / 278816314, 26158966 / 99577255, 0.677998071518871, 8267143 / 139408157, 0, 19567812 / 697040785, 1.0609850577107909];
function lin_2020_to_XYZ(_2) {
  return multiplyMatrices(D, _2);
}
function lin_sRGB(_2) {
  return [lin_sRGB_channel(_2[0]), lin_sRGB_channel(_2[1]), lin_sRGB_channel(_2[2])];
}
function lin_sRGB_channel(_2) {
  const t2 = _2 < 0 ? -1 : 1, n2 = Math.abs(_2);
  return n2 <= 0.04045 ? _2 / 12.92 : t2 * Math.pow((n2 + 0.055) / 1.055, 2.4);
}
function lin_P3(_2) {
  return lin_sRGB(_2);
}
const h = [608311 / 1250200, 189793 / 714400, 198249 / 1000160, 35783 / 156275, 247089 / 357200, 198249 / 2500400, 0, 32229 / 714400, 5220557 / 5000800];
function lin_P3_to_XYZ(_2) {
  return multiplyMatrices(h, _2);
}
function lin_ProPhoto(_2) {
  return [lin_ProPhoto_channel(_2[0]), lin_ProPhoto_channel(_2[1]), lin_ProPhoto_channel(_2[2])];
}
const f = 16 / 512;
function lin_ProPhoto_channel(_2) {
  const t2 = _2 < 0 ? -1 : 1, n2 = Math.abs(_2);
  return n2 <= f ? _2 / 16 : t2 * Math.pow(n2, 1.8);
}
const m = [0.7977666449006423, 0.13518129740053308, 0.0313477341283922, 0.2880748288194013, 0.711835234241873, 8993693872564e-17, 0, 0, 0.8251046025104602];
function lin_ProPhoto_to_XYZ(_2) {
  return multiplyMatrices(m, _2);
}
function lin_a98rgb(_2) {
  return [lin_a98rgb_channel(_2[0]), lin_a98rgb_channel(_2[1]), lin_a98rgb_channel(_2[2])];
}
function lin_a98rgb_channel(_2) {
  const t2 = _2 < 0 ? -1 : 1, n2 = Math.abs(_2);
  return t2 * Math.pow(n2, 563 / 256);
}
const b = [573536 / 994567, 263643 / 1420810, 187206 / 994567, 591459 / 1989134, 6239551 / 9945670, 374412 / 4972835, 53769 / 1989134, 351524 / 4972835, 4929758 / 4972835];
function lin_a98rgb_to_XYZ(_2) {
  return multiplyMatrices(b, _2);
}
const g = [506752 / 1228815, 87881 / 245763, 12673 / 70218, 87098 / 409605, 175762 / 245763, 12673 / 175545, 7918 / 409605, 87881 / 737289, 1001167 / 1053270];
function lin_sRGB_to_XYZ(_2) {
  return multiplyMatrices(g, _2);
}
function sRGB_to_HSL(_2) {
  const t2 = _2[0], n2 = _2[1], o2 = _2[2], e2 = Math.max(t2, n2, o2), r2 = Math.min(t2, n2, o2), a2 = (r2 + e2) / 2, i2 = e2 - r2;
  let l2 = Number.NaN, u2 = 0;
  if (0 !== Math.round(1e5 * i2)) {
    const _3 = Math.round(1e5 * a2);
    switch (u2 = 0 === _3 || 1e5 === _3 ? 0 : (e2 - a2) / Math.min(a2, 1 - a2), e2) {
      case t2:
        l2 = (n2 - o2) / i2 + (n2 < o2 ? 6 : 0);
        break;
      case n2:
        l2 = (o2 - t2) / i2 + 2;
        break;
      case o2:
        l2 = (t2 - n2) / i2 + 4;
    }
    l2 *= 60;
  }
  u2 < 0 && (l2 += 180, u2 = Math.abs(u2)), l2 >= 360 && (l2 -= 360);
  return u2 <= 1e-5 && (l2 = NaN), [l2, 100 * u2, 100 * a2];
}
function sRGB_to_Hue(_2) {
  const t2 = _2[0], n2 = _2[1], o2 = _2[2], e2 = Math.max(t2, n2, o2), r2 = Math.min(t2, n2, o2);
  let a2 = Number.NaN;
  const i2 = e2 - r2;
  if (0 !== i2) {
    switch (e2) {
      case t2:
        a2 = (n2 - o2) / i2 + (n2 < o2 ? 6 : 0);
        break;
      case n2:
        a2 = (o2 - t2) / i2 + 2;
        break;
      case o2:
        a2 = (t2 - n2) / i2 + 4;
    }
    a2 *= 60;
  }
  return a2 >= 360 && (a2 -= 360), a2;
}
function sRGB_to_XYZ_D50(_2) {
  let t2 = _2;
  return t2 = lin_sRGB(t2), t2 = lin_sRGB_to_XYZ(t2), t2 = D65_to_D50(t2), t2;
}
function HSL_to_XYZ_D50(_2) {
  let t2 = _2;
  return t2 = HSL_to_sRGB(t2), t2 = lin_sRGB(t2), t2 = lin_sRGB_to_XYZ(t2), t2 = D65_to_D50(t2), t2;
}
function HWB_to_XYZ_D50(_2) {
  let t2 = _2;
  return t2 = HWB_to_sRGB(t2), t2 = lin_sRGB(t2), t2 = lin_sRGB_to_XYZ(t2), t2 = D65_to_D50(t2), t2;
}
function Lab_to_XYZ_D50(_2) {
  let t2 = _2;
  return t2 = Lab_to_XYZ(t2), t2;
}
function XYZ_D50_to_Lab(_2) {
  let t2 = _2;
  return t2 = XYZ_to_Lab(t2), t2;
}
function LCH_to_XYZ_D50(_2) {
  let t2 = _2;
  return t2 = LCH_to_Lab(t2), t2 = Lab_to_XYZ(t2), t2;
}
function XYZ_D50_to_LCH(_2) {
  let t2 = _2;
  return t2 = XYZ_to_Lab(t2), t2 = Lab_to_LCH(t2), t2;
}
function OKLab_to_XYZ_D50(_2) {
  let t2 = _2;
  return t2 = OKLab_to_XYZ(t2), t2 = D65_to_D50(t2), t2;
}
function OKLCH_to_XYZ_D50(_2) {
  let t2 = _2;
  return t2 = OKLCH_to_OKLab(t2), t2 = OKLab_to_XYZ(t2), t2 = D65_to_D50(t2), t2;
}
function lin_sRGB_to_XYZ_D50(_2) {
  let t2 = _2;
  return t2 = lin_sRGB_to_XYZ(t2), t2 = D65_to_D50(t2), t2;
}
function a98_RGB_to_XYZ_D50(_2) {
  let t2 = _2;
  return t2 = lin_a98rgb(t2), t2 = lin_a98rgb_to_XYZ(t2), t2 = D65_to_D50(t2), t2;
}
function P3_to_XYZ_D50(_2) {
  let t2 = _2;
  return t2 = lin_P3(t2), t2 = lin_P3_to_XYZ(t2), t2 = D65_to_D50(t2), t2;
}
function lin_P3_to_XYZ_D50(_2) {
  let t2 = _2;
  return t2 = lin_P3_to_XYZ(t2), t2 = D65_to_D50(t2), t2;
}
function rec_2020_to_XYZ_D50(_2) {
  let t2 = _2;
  return t2 = lin_2020(t2), t2 = lin_2020_to_XYZ(t2), t2 = D65_to_D50(t2), t2;
}
function ProPhoto_RGB_to_XYZ_D50(_2) {
  let t2 = _2;
  return t2 = lin_ProPhoto(t2), t2 = lin_ProPhoto_to_XYZ(t2), t2;
}
function XYZ_D50_to_ProPhoto(_2) {
  let t2 = _2;
  return t2 = XYZ_to_lin_ProPhoto(t2), t2 = gam_ProPhoto(t2), t2;
}
function XYZ_D65_to_XYZ_D50(_2) {
  let t2 = _2;
  return t2 = D65_to_D50(t2), t2;
}
function XYZ_D50_to_XYZ_D65(_2) {
  let t2 = _2;
  return t2 = D50_to_D65(t2), t2;
}
function XYZ_D50_to_XYZ_D50(_2) {
  return _2;
}
function XYZ_D65_to_XYZ_D65(_2) {
  return _2;
}
function sRGB_to_XYZ_D65(_2) {
  let t2 = _2;
  return t2 = lin_sRGB(t2), t2 = lin_sRGB_to_XYZ(t2), t2;
}
function XYZ_D65_to_sRGB(_2) {
  let t2 = _2;
  return t2 = XYZ_to_lin_sRGB(t2), t2 = gam_sRGB(t2), t2;
}
function HSL_to_XYZ_D65(_2) {
  let t2 = _2;
  return t2 = HSL_to_sRGB(t2), t2 = lin_sRGB(t2), t2 = lin_sRGB_to_XYZ(t2), t2;
}
function XYZ_D65_to_HSL(_2) {
  let t2 = _2;
  return t2 = XYZ_to_lin_sRGB(t2), t2 = gam_sRGB(t2), t2 = sRGB_to_HSL(t2), t2;
}
function HWB_to_XYZ_D65(_2) {
  let t2 = _2;
  return t2 = HWB_to_sRGB(t2), t2 = lin_sRGB(t2), t2 = lin_sRGB_to_XYZ(t2), t2;
}
function XYZ_D65_to_HWB(_2) {
  let t2 = _2;
  t2 = XYZ_to_lin_sRGB(t2);
  const n2 = gam_sRGB(t2), o2 = Math.min(n2[0], n2[1], n2[2]), e2 = 1 - Math.max(n2[0], n2[1], n2[2]);
  let r2 = sRGB_to_Hue(n2);
  return o2 + e2 >= 0.99999 && (r2 = NaN), [r2, 100 * o2, 100 * e2];
}
function Lab_to_XYZ_D65(_2) {
  let t2 = _2;
  return t2 = Lab_to_XYZ(t2), t2 = D50_to_D65(t2), t2;
}
function LCH_to_XYZ_D65(_2) {
  let t2 = _2;
  return t2 = LCH_to_Lab(t2), t2 = Lab_to_XYZ(t2), t2 = D50_to_D65(t2), t2;
}
function OKLab_to_XYZ_D65(_2) {
  let t2 = _2;
  return t2 = OKLab_to_XYZ(t2), t2;
}
function XYZ_D65_to_OKLab(_2) {
  let t2 = _2;
  return t2 = XYZ_to_OKLab(t2), t2;
}
function OKLCH_to_XYZ_D65(_2) {
  let t2 = _2;
  return t2 = OKLCH_to_OKLab(t2), t2 = OKLab_to_XYZ(t2), t2;
}
function XYZ_D65_to_OKLCH(_2) {
  let t2 = _2;
  return t2 = XYZ_to_OKLab(t2), t2 = OKLab_to_OKLCH(t2), t2;
}
function lin_sRGB_to_XYZ_D65(_2) {
  let t2 = _2;
  return t2 = lin_sRGB_to_XYZ(t2), t2;
}
function XYZ_D65_to_lin_sRGB(_2) {
  let t2 = _2;
  return t2 = XYZ_to_lin_sRGB(t2), t2;
}
function a98_RGB_to_XYZ_D65(_2) {
  let t2 = _2;
  return t2 = lin_a98rgb(t2), t2 = lin_a98rgb_to_XYZ(t2), t2;
}
function XYZ_D65_to_a98_RGB(_2) {
  let t2 = _2;
  return t2 = XYZ_to_lin_a98rgb(t2), t2 = gam_a98rgb(t2), t2;
}
function P3_to_XYZ_D65(_2) {
  let t2 = _2;
  return t2 = lin_P3(t2), t2 = lin_P3_to_XYZ(t2), t2;
}
function XYZ_D65_to_P3(_2) {
  let t2 = _2;
  return t2 = XYZ_to_lin_P3(t2), t2 = gam_P3(t2), t2;
}
function lin_P3_to_XYZ_D65(_2) {
  let t2 = _2;
  return t2 = lin_P3_to_XYZ(t2), t2;
}
function XYZ_D65_to_lin_P3(_2) {
  let t2 = _2;
  return t2 = XYZ_to_lin_P3(t2), t2;
}
function rec_2020_to_XYZ_D65(_2) {
  let t2 = _2;
  return t2 = lin_2020(t2), t2 = lin_2020_to_XYZ(t2), t2;
}
function XYZ_D65_to_rec_2020(_2) {
  let t2 = _2;
  return t2 = XYZ_to_lin_2020(t2), t2 = gam_2020(t2), t2;
}
function ProPhoto_RGB_to_XYZ_D65(_2) {
  let t2 = _2;
  return t2 = lin_ProPhoto(t2), t2 = lin_ProPhoto_to_XYZ(t2), t2 = D50_to_D65(t2), t2;
}
function inGamut(_2) {
  return _2[0] >= -1e-4 && _2[0] <= 1.0001 && _2[1] >= -1e-4 && _2[1] <= 1.0001 && _2[2] >= -1e-4 && _2[2] <= 1.0001;
}
function clip(_2) {
  return [_2[0] < 0 ? 0 : _2[0] > 1 ? 1 : _2[0], _2[1] < 0 ? 0 : _2[1] > 1 ? 1 : _2[1], _2[2] < 0 ? 0 : _2[2] > 1 ? 1 : _2[2]];
}
function mapGamutRayTrace(_2, t2, n2) {
  const o2 = _2[0], e2 = _2[2];
  let r2 = t2(_2);
  const a2 = t2([o2, 0, e2]);
  for (let _3 = 0; _3 < 4; _3++) {
    if (_3 > 0) {
      const _4 = n2(r2);
      _4[0] = o2, _4[2] = e2, r2 = t2(_4);
    }
    const i2 = rayTraceBox(a2, r2);
    if (!i2) break;
    r2 = i2;
  }
  return clip(r2);
}
function rayTraceBox(_2, t2) {
  let n2 = 1 / 0, o2 = -1 / 0;
  const e2 = [0, 0, 0];
  for (let r2 = 0; r2 < 3; r2++) {
    const a2 = _2[r2], i2 = t2[r2] - a2;
    e2[r2] = i2;
    const l2 = 0, u2 = 1;
    if (Math.abs(i2) > 1e-15) {
      const _3 = 1 / i2, t3 = (l2 - a2) * _3, e3 = (u2 - a2) * _3;
      o2 = Math.max(Math.min(t3, e3), o2), n2 = Math.min(Math.max(t3, e3), n2);
    } else if (a2 < l2 || a2 > u2) return false;
  }
  return !(o2 > n2 || n2 < 0) && (o2 < 0 && (o2 = n2), !!isFinite(o2) && [_2[0] + e2[0] * o2, _2[1] + e2[1] * o2, _2[2] + e2[2] * o2]);
}
const G = { aliceblue: [240, 248, 255], antiquewhite: [250, 235, 215], aqua: [0, 255, 255], aquamarine: [127, 255, 212], azure: [240, 255, 255], beige: [245, 245, 220], bisque: [255, 228, 196], black: [0, 0, 0], blanchedalmond: [255, 235, 205], blue: [0, 0, 255], blueviolet: [138, 43, 226], brown: [165, 42, 42], burlywood: [222, 184, 135], cadetblue: [95, 158, 160], chartreuse: [127, 255, 0], chocolate: [210, 105, 30], coral: [255, 127, 80], cornflowerblue: [100, 149, 237], cornsilk: [255, 248, 220], crimson: [220, 20, 60], cyan: [0, 255, 255], darkblue: [0, 0, 139], darkcyan: [0, 139, 139], darkgoldenrod: [184, 134, 11], darkgray: [169, 169, 169], darkgreen: [0, 100, 0], darkgrey: [169, 169, 169], darkkhaki: [189, 183, 107], darkmagenta: [139, 0, 139], darkolivegreen: [85, 107, 47], darkorange: [255, 140, 0], darkorchid: [153, 50, 204], darkred: [139, 0, 0], darksalmon: [233, 150, 122], darkseagreen: [143, 188, 143], darkslateblue: [72, 61, 139], darkslategray: [47, 79, 79], darkslategrey: [47, 79, 79], darkturquoise: [0, 206, 209], darkviolet: [148, 0, 211], deeppink: [255, 20, 147], deepskyblue: [0, 191, 255], dimgray: [105, 105, 105], dimgrey: [105, 105, 105], dodgerblue: [30, 144, 255], firebrick: [178, 34, 34], floralwhite: [255, 250, 240], forestgreen: [34, 139, 34], fuchsia: [255, 0, 255], gainsboro: [220, 220, 220], ghostwhite: [248, 248, 255], gold: [255, 215, 0], goldenrod: [218, 165, 32], gray: [128, 128, 128], green: [0, 128, 0], greenyellow: [173, 255, 47], grey: [128, 128, 128], honeydew: [240, 255, 240], hotpink: [255, 105, 180], indianred: [205, 92, 92], indigo: [75, 0, 130], ivory: [255, 255, 240], khaki: [240, 230, 140], lavender: [230, 230, 250], lavenderblush: [255, 240, 245], lawngreen: [124, 252, 0], lemonchiffon: [255, 250, 205], lightblue: [173, 216, 230], lightcoral: [240, 128, 128], lightcyan: [224, 255, 255], lightgoldenrodyellow: [250, 250, 210], lightgray: [211, 211, 211], lightgreen: [144, 238, 144], lightgrey: [211, 211, 211], lightpink: [255, 182, 193], lightsalmon: [255, 160, 122], lightseagreen: [32, 178, 170], lightskyblue: [135, 206, 250], lightslategray: [119, 136, 153], lightslategrey: [119, 136, 153], lightsteelblue: [176, 196, 222], lightyellow: [255, 255, 224], lime: [0, 255, 0], limegreen: [50, 205, 50], linen: [250, 240, 230], magenta: [255, 0, 255], maroon: [128, 0, 0], mediumaquamarine: [102, 205, 170], mediumblue: [0, 0, 205], mediumorchid: [186, 85, 211], mediumpurple: [147, 112, 219], mediumseagreen: [60, 179, 113], mediumslateblue: [123, 104, 238], mediumspringgreen: [0, 250, 154], mediumturquoise: [72, 209, 204], mediumvioletred: [199, 21, 133], midnightblue: [25, 25, 112], mintcream: [245, 255, 250], mistyrose: [255, 228, 225], moccasin: [255, 228, 181], navajowhite: [255, 222, 173], navy: [0, 0, 128], oldlace: [253, 245, 230], olive: [128, 128, 0], olivedrab: [107, 142, 35], orange: [255, 165, 0], orangered: [255, 69, 0], orchid: [218, 112, 214], palegoldenrod: [238, 232, 170], palegreen: [152, 251, 152], paleturquoise: [175, 238, 238], palevioletred: [219, 112, 147], papayawhip: [255, 239, 213], peachpuff: [255, 218, 185], peru: [205, 133, 63], pink: [255, 192, 203], plum: [221, 160, 221], powderblue: [176, 224, 230], purple: [128, 0, 128], rebeccapurple: [102, 51, 153], red: [255, 0, 0], rosybrown: [188, 143, 143], royalblue: [65, 105, 225], saddlebrown: [139, 69, 19], salmon: [250, 128, 114], sandybrown: [244, 164, 96], seagreen: [46, 139, 87], seashell: [255, 245, 238], sienna: [160, 82, 45], silver: [192, 192, 192], skyblue: [135, 206, 235], slateblue: [106, 90, 205], slategray: [112, 128, 144], slategrey: [112, 128, 144], snow: [255, 250, 250], springgreen: [0, 255, 127], steelblue: [70, 130, 180], tan: [210, 180, 140], teal: [0, 128, 128], thistle: [216, 191, 216], tomato: [255, 99, 71], turquoise: [64, 224, 208], violet: [238, 130, 238], wheat: [245, 222, 179], white: [255, 255, 255], whitesmoke: [245, 245, 245], yellow: [255, 255, 0], yellowgreen: [154, 205, 50] };
function luminance(_2) {
  const [t2, n2, o2] = _2.map((_3) => _3 <= 0.04045 ? _3 / 12.92 : Math.pow((_3 + 0.055) / 1.055, 2.4));
  return 0.2126 * t2 + 0.7152 * n2 + 0.0722 * o2;
}
function contrast_ratio_wcag_2_1(_2, t2) {
  const n2 = luminance(_2), o2 = luminance(t2);
  return (Math.max(n2, o2) + 0.05) / (Math.min(n2, o2) + 0.05);
}
export {
  XYZ_to_OKLab as $,
  XYZ_D65_to_lin_P3 as A,
  XYZ_D65_to_P3 as B,
  XYZ_D65_to_lin_sRGB as C,
  XYZ_D65_to_XYZ_D50 as D,
  OKLCH_to_XYZ_D50 as E,
  LCH_to_XYZ_D50 as F,
  OKLab_to_XYZ_D50 as G,
  HWB_to_XYZ_D65 as H,
  Lab_to_XYZ_D50 as I,
  HWB_to_XYZ_D50 as J,
  HSL_to_XYZ_D50 as K,
  LCH_to_XYZ_D65 as L,
  ProPhoto_RGB_to_XYZ_D50 as M,
  a98_RGB_to_XYZ_D50 as N,
  OKLCH_to_XYZ_D65 as O,
  ProPhoto_RGB_to_XYZ_D65 as P,
  rec_2020_to_XYZ_D50 as Q,
  lin_P3_to_XYZ_D50 as R,
  P3_to_XYZ_D50 as S,
  lin_sRGB_to_XYZ_D50 as T,
  sRGB_to_XYZ_D50 as U,
  G as V,
  OKLCH_to_OKLab as W,
  XYZ_D65_to_sRGB as X,
  OKLab_to_XYZ as Y,
  XYZ_to_lin_sRGB as Z,
  lin_sRGB_to_XYZ as _,
  clip as a,
  OKLab_to_OKLCH as a0,
  XYZ_D65_to_OKLCH as b,
  contrast_ratio_wcag_2_1 as c,
  XYZ_D65_to_XYZ_D65 as d,
  XYZ_D50_to_XYZ_D65 as e,
  OKLab_to_XYZ_D65 as f,
  gam_sRGB as g,
  Lab_to_XYZ_D65 as h,
  inGamut as i,
  HSL_to_XYZ_D65 as j,
  a98_RGB_to_XYZ_D65 as k,
  lin_P3_to_XYZ_D65 as l,
  mapGamutRayTrace as m,
  P3_to_XYZ_D65 as n,
  lin_sRGB_to_XYZ_D65 as o,
  XYZ_D50_to_XYZ_D50 as p,
  XYZ_D65_to_OKLab as q,
  rec_2020_to_XYZ_D65 as r,
  sRGB_to_XYZ_D65 as s,
  XYZ_D50_to_LCH as t,
  XYZ_D50_to_Lab as u,
  XYZ_D65_to_HWB as v,
  XYZ_D65_to_HSL as w,
  XYZ_D65_to_a98_RGB as x,
  XYZ_D50_to_ProPhoto as y,
  XYZ_D65_to_rec_2020 as z
};
