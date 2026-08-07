/**
 * Weather Pro - Meteorological & Physics Calculations
 * فرمول‌های هواشناسی، شاخص‌های فیزیکی جو و وضعیت کد WMO
 */

import { toFarsi } from './utils.js';

export function calculateDewPoint(tempC, rh) {
    if (tempC === null || rh === null || isNaN(tempC) || isNaN(rh)) return null;
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * tempC) / (b + tempC)) + Math.log(rh / 100);
    const dewPoint = (b * alpha) / (a - alpha);
    return Math.round(dewPoint);
}

export function calculateWindChill(tempC, windKmH) {
    if (tempC === null || windKmH === null || isNaN(tempC) || isNaN(windKmH)) return null;
    if (tempC > 10 || windKmH < 4.8) return Math.round(tempC);
    const wc = 13.12 + (0.6215 * tempC) - (11.37 * Math.pow(windKmH, 0.16)) + (0.3965 * tempC * Math.pow(windKmH, 0.16));
    return Math.round(wc);
}

export function calculateHeatIndex(tempC, rh) {
    if (tempC === null || rh === null || isNaN(tempC) || isNaN(rh)) return null;
    if (tempC < 27 || rh < 40) return Math.round(tempC);
    const tempF = (tempC * 9 / 5) + 32;
    const hiF = -42.379 + (2.04901523 * tempF) + (10.14333127 * rh)
        - (0.22475541 * tempF * rh) - (0.00683783 * tempF * tempF)
        - (0.05481717 * rh * rh) + (0.00122874 * tempF * tempF * rh)
        - (0.00085282 * tempF * rh * rh) - (0.00000199 * tempF * tempF * rh * rh);
    const hiC = (hiF - 32) * 5 / 9;
    return Math.round(hiC);
}

export function calculateCloudBase(tempC, dewPointC) {
    if (tempC === null || dewPointC === null || isNaN(tempC) || isNaN(dewPointC)) return null;
    const diff = Math.max(0, tempC - dewPointC);
    return Math.round(diff * 125);
}

export function calculateAirDensity(tempC, pressureHpa, rh) {
    if (tempC === null || pressureHpa === null || isNaN(tempC) || isNaN(pressureHpa)) return 1.225;
    const T_kelvin = tempC + 273.15;
    const p_pa = pressureHpa * 100;
    const rh_ratio = (rh || 50) / 100;
    const p_sat = 610.78 * Math.exp((17.27 * tempC) / (tempC + 237.3));
    const p_v = rh_ratio * p_sat;
    const p_d = p_pa - p_v;
    const density = (p_d / (287.058 * T_kelvin)) + (p_v / (461.495 * T_kelvin));
    return parseFloat(density.toFixed(3));
}

export function calculateEvapotranspiration(tempC, rh, windKmH) {
    if (tempC === null || isNaN(tempC)) return 3.5;
    const tMod = Math.max(1, tempC + 10);
    const rhMod = Math.max(10, 100 - (rh || 50));
    const windMs = (windKmH || 10) / 3.6;
    const et = (0.0023 * tMod * Math.sqrt(rhMod) * (1 + 0.2 * windMs)).toFixed(1);
    return parseFloat(et);
}

export function calculateVPD(tempC, rh) {
    if (tempC === null || rh === null || isNaN(tempC) || isNaN(rh)) {
        return { val: null, text: 'نامشخص', color: 'text-slate-400' };
    }
    const vpSat = 0.61078 * Math.exp((17.27 * tempC) / (tempC + 237.3));
    const vpAct = vpSat * (rh / 100);
    const vpd = vpSat - vpAct;
    const vpdVal = parseFloat(vpd.toFixed(2));

    if (vpdVal < 0.4) {
        return { val: vpdVal, text: 'اشباع مرطوب (خطر کپک)', color: 'text-cyan-400' };
    } else if (vpdVal <= 1.2) {
        return { val: vpdVal, text: 'ایده‌آل و مطلوب', color: 'text-emerald-400' };
    } else if (vpdVal <= 1.6) {
        return { val: vpdVal, text: 'کمی خشک (نیاز آبی)', color: 'text-yellow-400' };
    } else {
        return { val: vpdVal, text: 'خشک و تبخیر شدید', color: 'text-orange-400' };
    }
}

export function calculateWBGT(tempC, rh) {
    if (tempC === null || rh === null || isNaN(tempC) || isNaN(rh)) {
        return { val: null, text: 'نامشخص', color: 'text-slate-400' };
    }
    const T = tempC;
    const RH = rh;
    const twb = T * Math.atan(0.151977 * Math.sqrt(RH + 8.313659)) +
                Math.atan(T + RH) - Math.atan(RH - 1.676331) +
                0.00391838 * Math.pow(RH, 1.5) * Math.atan(0.023101 * RH) - 4.686035;
    
    const wbgt = 0.7 * twb + 0.3 * T;
    const wbgtVal = Math.round(wbgt);

    if (wbgtVal < 20) {
        return { val: wbgtVal, text: 'محیط خنک و امن', color: 'text-emerald-400' };
    } else if (wbgtVal < 26) {
        return { val: wbgtVal, text: 'احتیاط اولیه کار', color: 'text-green-400' };
    } else if (wbgtVal < 29) {
        return { val: wbgtVal, text: 'استرس حرارتی متوسط', color: 'text-yellow-400' };
    } else if (wbgtVal < 32) {
        return { val: wbgtVal, text: 'هشدار گرمازدگی', color: 'text-orange-400' };
    } else {
        return { val: wbgtVal, text: 'خطر گرمازدگی شدید', color: 'text-red-400' };
    }
}

export function calculateHydrationNeeds(tempC, rh, uvIndex) {
    if (tempC === null || isNaN(tempC)) return 300;
    let baseline = 300;
    if (tempC > 20) {
        baseline += (tempC - 20) * 25;
    }
    if (rh < 35) {
        baseline += 50;
    }
    if (uvIndex >= 6) {
        baseline += 80;
    }
    return Math.min(1000, Math.round(baseline));
}

export function calculateComfortIndex(tempC, rh) {
    if (tempC === null || rh === null || isNaN(tempC) || isNaN(rh)) {
        return { text: 'نامشخص', score: '--', color: 'text-slate-400', di: 0 };
    }
    const di = tempC - (0.55 - 0.0055 * rh) * (tempC - 14.5);
    
    if (di < 21) {
        return { text: 'مطبوع و خنک', score: 'عالی', color: 'text-emerald-400', di: Math.round(di) };
    } else if (di < 24) {
        return { text: 'دلپذیر و مطلوب', score: 'خوب', color: 'text-green-400', di: Math.round(di) };
    } else if (di < 27) {
        return { text: 'کمی گرم و مرطوب', score: 'متوسط', color: 'text-yellow-400', di: Math.round(di) };
    } else if (di < 29) {
        return { text: 'شرجی و کلافه‌کننده', score: 'سنگین', color: 'text-orange-400', di: Math.round(di) };
    } else {
        return { text: 'استرس گرمایی شدید', score: 'هشدار', color: 'text-red-400', di: Math.round(di) };
    }
}

export function calculateDayDetails(sunriseIso, sunsetIso) {
    if (!sunriseIso || !sunsetIso) return { lengthText: '--', noonText: '--', remainingText: '--' };
    const rise = new Date(sunriseIso);
    const set = new Date(sunsetIso);
    const now = new Date();

    if (isNaN(rise.getTime()) || isNaN(set.getTime())) return { lengthText: '--', noonText: '--', remainingText: '--' };

    const totalMinutes = Math.floor((set.getTime() - rise.getTime()) / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const lengthText = `${toFarsi(hours)} ساعت و ${toFarsi(minutes)} دقیقه`;

    const noonDate = new Date(rise.getTime() + (totalMinutes / 2) * 60 * 1000);
    const noonHours = String(noonDate.getHours()).padStart(2, '0');
    const noonMinutes = String(noonDate.getMinutes()).padStart(2, '0');
    const noonText = `${toFarsi(noonHours)}:${toFarsi(noonMinutes)}`;

    let remainingText = '';
    if (now.getTime() < rise.getTime()) {
        const diffMins = Math.floor((rise.getTime() - now.getTime()) / (1000 * 60));
        const h = Math.floor(diffMins / 60);
        const m = diffMins % 60;
        remainingText = `${toFarsi(h)} ساعت و ${toFarsi(m)} دقیقه تا طلوع`;
    } else if (now.getTime() < set.getTime()) {
        const diffMins = Math.floor((set.getTime() - now.getTime()) / (1000 * 60));
        const h = Math.floor(diffMins / 60);
        const m = diffMins % 60;
        remainingText = `${toFarsi(h)} ساعت و ${toFarsi(m)} دقیقه تا غروب`;
    } else {
        remainingText = 'شب (خورشید غروب کرده است)';
    }

    return { lengthText, noonText, remainingText };
}

export function calculateSafeSunExposure(uvIndex) {
    if (!uvIndex || uvIndex <= 0) return 'بدون محدودیت زمانی';
    if (uvIndex <= 2) return 'بیش از ۲ ساعت (کم‌خطر)';
    const mins = Math.max(10, Math.round(200 / uvIndex));
    return `حداکثر ${toFarsi(mins)} دقیقه بدون ضدآفتاب`;
}

export function getPressureTrendText(currentPressure, hourlyPressures = []) {
    if (!hourlyPressures || hourlyPressures.length < 4) {
        return { text: 'پایدار', icon: 'fa-solid fa-arrows-left-right text-slate-400' };
    }
    const pastP = hourlyPressures[0] || currentPressure;
    const diff = currentPressure - pastP;

    if (diff > 1.5) {
        return { text: 'رو به افزایش (بهبود و شفافیت هوا)', icon: 'fa-solid fa-arrow-trend-up text-emerald-400' };
    } else if (diff < -1.5) {
        return { text: 'رو به کاهش (احتمال ناپایداری و ابر)', icon: 'fa-solid fa-arrow-trend-down text-amber-400' };
    }
    return { text: 'پایدار و بدون تغییر شدید', icon: 'fa-solid fa-arrows-left-right text-slate-300' };
}

export function getMoonPhase(date = new Date()) {
    const d = new Date(date);
    let year = d.getFullYear();
    let month = d.getMonth() + 1;
    let day = d.getDate();
    if (month < 3) { year--; month += 12; }
    month++;
    let c = 365.25 * year;
    let e = 30.6 * month;
    let jd = c + e + day - 694039.09;
    jd /= 29.5305882;
    let b = parseInt(jd, 10);
    jd -= b;
    let age = Number((jd * 29.53).toFixed(1));
    b = Math.round(jd * 8);
    if (b >= 8) b = 0;

    const phaseFraction = jd;
    const illumination = Math.round((1 - Math.cos(phaseFraction * 2 * Math.PI)) / 2 * 100);

    const phases = [
        { text: 'ماه نو (جدید)', icon: 'fa-regular fa-circle text-slate-400', advice: 'آسمان تاریک و ایده‌آل برای رصد ستارگان، کهکشان راه شیری و عکاسی نجومی عمیق.' },
        { text: 'هلال فزاینده', icon: 'fa-solid fa-moon text-amber-200', advice: 'نور کم ماه؛ مناسب برای رصد سحابی‌ها و رصد اولیه هلال در افق غربی پس از غروب.' },
        { text: 'تربیع اول', icon: 'fa-solid fa-circle-half-stroke text-amber-300', advice: 'نصف قرص ماه روشن است؛ بهترین زمان برای رصد دهانه‌های برخوردی ماه با تلسکوپ.' },
        { text: 'گوژماه فزاینده', icon: 'fa-solid fa-moon text-amber-300', advice: 'نور زیاد ماه؛ آسمان نسبتاً روشن است و ستاره‌های کم‌فروغ‌تر دیده نمی‌شوند.' },
        { text: 'ماه کامل (بدر)', icon: 'fa-solid fa-circle text-amber-300', advice: 'قرص کامل و درخشان ماه؛ شب کاملاً مهتابی. برای عکاسی منظره شبانه و قدم‌زدن عالی است.' },
        { text: 'گوژماه کاهنده', icon: 'fa-solid fa-moon text-amber-200', advice: 'ماه در اواخر شب و بامداد در آسمان خودنمایی می‌کند. نور زیادی دارد.' },
        { text: 'تربیع آخر', icon: 'fa-solid fa-circle-half-stroke text-amber-200', advice: 'نیمه دوم ماه روشن است؛ مناسب برای رصد صبحگاهی ماه و عکاسی در ساعات سحر.' },
        { text: 'هلال کاهنده', icon: 'fa-regular fa-moon text-slate-300', advice: 'هلال باریک صبحگاهی در افق شرقی قبل از طلوع آفتاب قابل مشاهده است.' }
    ];

    const currentPhase = phases[b] || phases[0];
    return {
        ...currentPhase,
        age: toFarsi(age),
        ageRaw: age,
        illumination: toFarsi(illumination),
        illuminationRaw: illumination,
        cycleDays: '۲۹.۵ روز'
    };
}

export function getSunProgress(sunriseIso, sunsetIso) {
    if (!sunriseIso || !sunsetIso) return { percent: 0, status: 'نامشخص' };
    const now = new Date();
    const rise = new Date(sunriseIso);
    const set = new Date(sunsetIso);
    
    if (isNaN(rise.getTime()) || isNaN(set.getTime())) return { percent: 0, status: 'نامشخص' };
    if (now.getTime() < rise.getTime()) return { percent: 0, status: 'قبل از طلوع' };
    if (now.getTime() > set.getTime()) return { percent: 100, status: 'شب (غروب شده)' };
    
    const total = set.getTime() - rise.getTime();
    const current = now.getTime() - rise.getTime();
    const pct = Math.min(100, Math.max(0, Math.round((current / total) * 100)));
    return { percent: pct, status: `${toFarsi(pct)}٪ از روز گذشته` };
}

export function getWeatherDetails(code, isDay = 1) {
    switch(code) {
        case 0:
            return { text: isDay ? 'آفتابی و صاف' : 'صاف و مهتابی', icon: isDay ? 'fa-solid fa-sun text-amber-400' : 'fa-solid fa-moon text-indigo-300' };
        case 1:
        case 2:
            return { text: isDay ? 'غالباً آفتابی' : 'کمی ابری', icon: isDay ? 'fa-solid fa-cloud-sun text-amber-300' : 'fa-solid fa-cloud-moon text-indigo-200' };
        case 3:
            return { text: 'کاملاً ابری', icon: 'fa-solid fa-cloud text-slate-400' };
        case 45:
        case 48:
            return { text: 'مه‌آلود', icon: 'fa-solid fa-smog text-slate-300' };
        case 51:
        case 53:
        case 55:
        case 56:
        case 57:
            return { text: 'بارش نم‌نم باران', icon: 'fa-solid fa-cloud-rain text-blue-300' };
        case 61:
        case 63:
        case 66:
        case 67:
            return { text: 'بارش باران', icon: 'fa-solid fa-cloud-showers-heavy text-blue-400' };
        case 65:
            return { text: 'بارش شدید باران', icon: 'fa-solid fa-cloud-showers-water text-blue-500' };
        case 71:
        case 73:
        case 75:
        case 77:
            return { text: 'بارش برف', icon: 'fa-solid fa-snowflake text-cyan-200' };
        case 80:
        case 81:
        case 82:
            return { text: 'رگبار باران', icon: 'fa-solid fa-cloud-sun-rain text-blue-400' };
        case 85:
        case 86:
            return { text: 'رگبار برف', icon: 'fa-solid fa-snowflake text-blue-300' };
        case 95:
        case 96:
        case 99:
            return { text: 'رعد و برق و طوفان', icon: 'fa-solid fa-bolt-lightning text-amber-400 animate-pulse' };
        default:
            return { text: 'آب و هوای متعادل', icon: isDay ? 'fa-solid fa-cloud-sun text-blue-300' : 'fa-solid fa-cloud-moon text-indigo-300' };
    }
}

export function getAqiInfo(aqi) {
    if (aqi === null || aqi === undefined) {
        return { text: 'نامشخص', color: 'text-slate-400', badgeBg: 'bg-slate-800/80 border-slate-700/50 text-slate-400' };
    }
    if (aqi <= 20) return { text: 'عالی', color: 'text-emerald-400', badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' };
    if (aqi <= 40) return { text: 'خوب', color: 'text-green-400', badgeBg: 'bg-green-500/15 border-green-500/30 text-green-300' };
    if (aqi <= 60) return { text: 'متوسط', color: 'text-yellow-400', badgeBg: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300' };
    if (aqi <= 80) return { text: 'ناسالم حساس', color: 'text-orange-400', badgeBg: 'bg-orange-500/15 border-orange-500/30 text-orange-300' };
    if (aqi <= 100) return { text: 'ناسالم', color: 'text-red-400', badgeBg: 'bg-red-500/15 border-red-500/30 text-red-300' };
    return { text: 'خطرناک', color: 'text-purple-400', badgeBg: 'bg-purple-500/20 border-purple-500/40 text-purple-300' };
}

export function getBeaufortScale(windKmH) {
    if (windKmH === null || windKmH === undefined || isNaN(windKmH)) return { level: 0, name: 'آرام', color: 'text-slate-400', badgeBg: 'bg-slate-500/10 border-slate-500/20' };
    if (windKmH < 1) return { level: 0, name: 'آرام (بدون باد)', color: 'text-slate-400', badgeBg: 'bg-slate-500/10 border-slate-500/20' };
    if (windKmH <= 5) return { level: 1, name: 'هوای آرام / لطیف', color: 'text-blue-300', badgeBg: 'bg-blue-500/10 border-blue-500/20' };
    if (windKmH <= 11) return { level: 2, name: 'نسیم خفیف', color: 'text-blue-400', badgeBg: 'bg-blue-500/15 border-blue-500/30' };
    if (windKmH <= 19) return { level: 3, name: 'نسیم ملایم', color: 'text-emerald-400', badgeBg: 'bg-emerald-500/15 border-emerald-500/30' };
    if (windKmH <= 28) return { level: 4, name: 'نسیم متوسط و مطبوع', color: 'text-green-400', badgeBg: 'bg-green-500/15 border-green-500/30' };
    if (windKmH <= 38) return { level: 5, name: 'نسیم تازه / باد نسبتاً شدید', color: 'text-yellow-400', badgeBg: 'bg-yellow-500/15 border-yellow-500/30' };
    if (windKmH <= 49) return { level: 6, name: 'باد شدید', color: 'text-orange-400', badgeBg: 'bg-orange-500/15 border-orange-500/30' };
    if (windKmH <= 61) return { level: 7, name: 'تندباد شدید', color: 'text-red-400', badgeBg: 'bg-red-500/15 border-red-500/30' };
    if (windKmH <= 74) return { level: 8, name: 'طوفان ملایم', color: 'text-purple-400', badgeBg: 'bg-purple-500/20 border-purple-500/40' };
    return { level: 9, name: 'طوفان خطرناک', color: 'text-rose-500', badgeBg: 'bg-rose-500/20 border-rose-500/40' };
}

export function getWindImpact(windKmH) {
    if (windKmH === null || windKmH === undefined) return 'مناسب برای فعالیت‌های فضای باز';
    if (windKmH >= 45) return 'خطر وزش باد شدید؛ پرواز پهپاد، جرثقیل و کار در ارتفاع توصیه نمی‌شود.';
    if (windKmH >= 30) return 'باد نسبتاً قوی؛ دوچرخه‌سواری در خلاف جهت دشوار است و چتر ممکن است برگردد.';
    if (windKmH >= 15) return 'نسیم فعال؛ برای تهویه هوا، گردش و خشک شدن لباس‌ها مطلوب است.';
    return 'شرایط جوی بسیار آرام؛ عالی برای پیاده‌روی، عکاسی و پرواز پهپاد.';
}
