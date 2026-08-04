/**
 * Weather Pro - Advisors & Smart Calculators
 * تحلیل‌گر هوشمند پوشش، شاخص‌های سلامت پزشکی، هشدارها و پیشنهاد فعالیت‌ها
 */

import { toFarsi } from './utils.js';

export function calculateHealthIndexes(curr, aqiVal, pressure) {
    const getStatus = (status, color) => ({ status, badgeBg: color });

    let migraine = getStatus('کم‌خطر', 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300');
    if (pressure < 1005 || pressure > 1025) {
        migraine = getStatus('احتمال سردرد فشار جو', 'bg-orange-500/15 border-orange-500/30 text-orange-300');
    }

    let respiratory = getStatus('عالی و پاک', 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300');
    if (aqiVal > 80) respiratory = getStatus('خطرناک برای ریه', 'bg-red-500/15 border-red-500/30 text-red-300');
    else if (aqiVal > 50) respiratory = getStatus('حساسیت‌زا', 'bg-amber-500/15 border-amber-500/30 text-amber-300');

    let joint = getStatus('طبیعی', 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300');
    if (curr.temperature_2m < 10 && curr.relative_humidity_2m > 70) {
        joint = getStatus('احتمال درد مفاصل و روماتیسم', 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300');
    }

    let skin = getStatus('بی‌خطر', 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300');
    if (curr.uv_index >= 8) {
        skin = getStatus('خطر سوختگی شدید', 'bg-red-500/15 border-red-500/30 text-red-300');
    } else if (curr.uv_index >= 5) {
        skin = getStatus('نیازمند ضدآفتاب', 'bg-amber-500/15 border-amber-500/30 text-amber-300');
    }

    let allergyMold = getStatus('پایین', 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300');
    if (curr.relative_humidity_2m > 75 && curr.temperature_2m > 18) {
        allergyMold = getStatus('کپک و گرده گیاهان بالا', 'bg-orange-500/15 border-orange-500/30 text-orange-300');
    }

    return [
        { title: 'ریسک سردرد میگرنی', icon: 'fa-solid fa-brain text-purple-400', ...migraine },
        { title: 'سلامت ریه و آلاینده‌ها', icon: 'fa-solid fa-lungs text-cyan-400', ...respiratory },
        { title: 'وضعیت مفاصل و روماتیسم', icon: 'fa-solid fa-bone text-indigo-400', ...joint },
        { title: 'حفاظت پوست (UV)', icon: 'fa-solid fa-sun-plant-wilt text-amber-400', ...skin },
        { title: 'ریسک آلرژی و قارچ', icon: 'fa-solid fa-seedling text-emerald-400', ...allergyMold }
    ];
}

export function checkWeatherAlerts(curr, aqiVal) {
    let alerts = [];
    if (curr.wind_speed_10m >= 45) {
        alerts.push({ title: 'هشدار وزش باد شدید', desc: 'سرعت باد به بیش از ' + toFarsi(Math.round(curr.wind_speed_10m)) + ' کیلومتر بر ساعت رسیده است. مراقب سقوط اجسام باشید.', bg: 'bg-amber-500/20 border-amber-500/40 text-amber-300' });
    }
    if (curr.weather_code >= 95) {
        alerts.push({ title: 'هشدار طوفان و صاعقه', desc: 'شرایط جوی طوفانی فعال است. از استقرار در ارتفاعات و فضای باز خودداری کنید.', bg: 'bg-red-500/20 border-red-500/40 text-red-300' });
    }
    if (curr.uv_index >= 8) {
        alerts.push({ title: 'هشدار پرتو فرابنفش (UV) بسیار شدید', desc: 'شاخص UV به ' + toFarsi(curr.uv_index) + ' رسیده است. حتماً از ضدآفتاب و عینک آفتابی استفاده کنید.', bg: 'bg-orange-500/20 border-orange-500/40 text-orange-300' });
    }
    if (aqiVal >= 100) {
        alerts.push({ title: 'هشدار آلودگی شدید هوا', desc: 'کیفیت هوا در وضعیت ناسالم است. خروج گروه‌های حساس توصیه نمی‌شود.', bg: 'bg-red-500/20 border-red-500/40 text-red-300' });
    }
    if (curr.temperature_2m <= 0) {
        alerts.push({ title: 'هشدار یخبندان و سرمای شدید', desc: 'دمای هوا زیر صفر درجه است. احتیاط در رانندگی توصیه می‌شود.', bg: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' });
    }
    return alerts;
}

export function getClothingRecommendation(temp, precipChance) {
    let items = [];
    if (temp <= 5) {
        items.push({ name: 'کاپشن ضخیم و پالتو', icon: 'fa-solid fa-vest-patches text-cyan-300' });
        items.push({ name: 'شال‌گردن و دستکش', icon: 'fa-solid fa-mitten text-blue-300' });
    } else if (temp <= 15) {
        items.push({ name: 'سویشرت یا ژاکت گرم', icon: 'fa-solid fa-shirt text-indigo-300' });
    } else if (temp <= 25) {
        items.push({ name: 'لباس نخی یا پیراهن سبک', icon: 'fa-solid fa-shirt text-emerald-300' });
    } else {
        items.push({ name: 'تیشرت خنک و نخی', icon: 'fa-solid fa-shirt text-amber-300' });
        items.push({ name: 'عینک آفتابی و کلاه', icon: 'fa-solid fa-glasses text-amber-400' });
    }

    if (precipChance >= 25) {
        items.push({ name: 'چتر یا بارانی ضدآب', icon: 'fa-solid fa-umbrella text-blue-400' });
    }
    return items;
}

export function calculateActivities(curr, precipChance, aqiVal) {
    const temp = curr.temperature_2m;
    const wind = curr.wind_speed_10m;
    const humidity = curr.relative_humidity_2m;
    const cloud = curr.cloud_cover;
    const isDay = curr.is_day ?? 1;

    // Detailed activity scoring algorithm (0 to 100%)
    const calcScore = (baseConds) => {
        let score = 100;
        baseConds.forEach(c => { if (!c.pass) score -= c.penalty; });
        return Math.max(0, Math.min(100, score));
    };

    // 1. Jogging / Running
    const runScore = calcScore([
        { pass: temp >= 10 && temp <= 25, penalty: 30 },
        { pass: precipChance < 20, penalty: 40 },
        { pass: (aqiVal || 0) <= 60, penalty: 35 },
        { pass: wind < 30, penalty: 15 }
    ]);

    // 2. Drone Flying / Aero modeling
    const droneScore = calcScore([
        { pass: wind < 20, penalty: 50 },
        { pass: precipChance < 10, penalty: 50 },
        { pass: cloud < 85, penalty: 20 }
    ]);

    // 3. Stargazing
    const starScore = calcScore([
        { pass: isDay === 0, penalty: 90 },
        { pass: cloud < 20, penalty: 60 },
        { pass: precipChance < 10, penalty: 30 }
    ]);

    // 4. Outdoor Photography
    const photoScore = calcScore([
        { pass: isDay === 1, penalty: 40 },
        { pass: cloud >= 15 && cloud <= 70, penalty: 20 },
        { pass: precipChance < 25, penalty: 40 }
    ]);

    // 5. Cycling
    const bikeScore = calcScore([
        { pass: wind < 25, penalty: 45 },
        { pass: precipChance < 15, penalty: 40 },
        { pass: temp >= 12 && temp <= 30, penalty: 25 }
    ]);

    // 6. Solar Panel Efficiency
    const solarScore = Math.max(10, Math.round(100 - (cloud * 0.85)));

    // 7. Outdoor Laundry Drying
    const laundryScore = calcScore([
        { pass: precipChance < 15, penalty: 50 },
        { pass: humidity < 60, penalty: 30 },
        { pass: temp >= 15, penalty: 20 },
        { pass: wind >= 8, penalty: 10 }
    ]);

    // 8. Water Sports & Sailing
    const waterSportsScore = calcScore([
        { pass: temp >= 18, penalty: 35 },
        { pass: precipChance < 15, penalty: 45 },
        { pass: wind >= 8 && wind <= 35, penalty: 20 }
    ]);

    const getScoreBadge = (score) => {
        if (score >= 80) return { status: `${toFarsi(score)}٪ (عالی)`, badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' };
        if (score >= 50) return { status: `${toFarsi(score)}٪ (متوسط)`, badgeBg: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300' };
        return { status: `${toFarsi(score)}٪ (نامناسب)`, badgeBg: 'bg-red-500/15 border-red-500/30 text-red-300' };
    };

    return [
        { title: 'دویدن و ورزش', icon: 'fa-solid fa-person-running text-amber-400', score: runScore, ...getScoreBadge(runScore) },
        { title: 'پرواز پهپاد / کواد', icon: 'fa-solid fa-helicopter text-cyan-400', score: droneScore, ...getScoreBadge(droneScore) },
        { title: 'دوچرخه‌سواری', icon: 'fa-solid fa-person-biking text-emerald-400', score: bikeScore, ...getScoreBadge(bikeScore) },
        { title: 'خشک کردن لباس', icon: 'fa-solid fa-shirt text-blue-400', score: laundryScore, ...getScoreBadge(laundryScore) },
        { title: 'عکاسی فضای باز', icon: 'fa-solid fa-camera text-purple-400', score: photoScore, ...getScoreBadge(photoScore) },
        { title: 'رصد ستارگان', icon: 'fa-solid fa-star text-indigo-400', score: starScore, ...getScoreBadge(starScore) },
        { title: 'ورزش‌های آبی', icon: 'fa-solid fa-sailboat text-cyan-400', score: waterSportsScore, ...getScoreBadge(waterSportsScore) },
        { title: 'بازده خورشیدی', icon: 'fa-solid fa-solar-panel text-amber-300', score: solarScore, ...getScoreBadge(solarScore) }
    ];
}

export function calculateDay24Summary(hourlyList = []) {
    if (!hourlyList || hourlyList.length === 0) return null;
    let totalPrecip = 0;
    let maxWind = 0;
    let peakUv = 0;
    let peakUvTime = '--:--';
    let peakTemp = -99;
    let peakTempTime = '--:--';

    hourlyList.forEach(h => {
        totalPrecip += (h.precipMm || 0);
        if ((h.wind || 0) > maxWind) maxWind = h.wind;
        if ((h.uv || 0) > peakUv) {
            peakUv = h.uv;
            peakUvTime = h.time;
        }
        if ((h.temp || -99) > peakTemp) {
            peakTemp = h.temp;
            peakTempTime = h.time;
        }
    });

    return {
        totalPrecip: parseFloat(totalPrecip.toFixed(1)),
        maxWind: Math.round(maxWind),
        peakUv: Math.round(peakUv),
        peakUvTime,
        peakTemp: Math.round(peakTemp),
        peakTempTime
    };
}

export function getSmartSuggestion(data, aqiVal, precipChance) {
    const temp = data.temperature_2m;
    const wind = data.wind_speed_10m;
    const humidity = data.relative_humidity_2m;
    const uv = data.uv_index;
    
    let messages = [];

    if (precipChance > 40) {
        messages.push("احتمال بارش باران بالاست؛ حتماً چتر همراه داشته باشید.");
    }

    if (aqiVal > 80) {
        messages.push("کیفیت هوا به شدت پایین است؛ خروج غیرضروری توصیه نمی‌شود.");
    } else if (aqiVal > 50) {
        messages.push("کیفیت هوا برای گروه‌های حساس ناسالم است؛ ماسک بزنید.");
    }

    if (temp >= 35) {
        messages.push("گرمای هوا شدید است؛ در سایه بمانید و مایعات فراوان بنوشید.");
    } else if (temp <= 3) {
        messages.push("هوا بسیار سرد است؛ با لباس‌های کاملاً ضخیم خارج شوید.");
    } else if (temp > 3 && temp <= 12) {
        messages.push("هوا نسبتاً سرد است؛ پوشیدن یک ژاکت پیشنهاد می‌شود.");
    }

    if (wind >= 45) {
        messages.push("وزش باد شدید است؛ مراقب اشیاء پرتاب‌شونده باشید.");
    }

    if (humidity >= 75 && temp >= 26) {
        messages.push("رطوبت بالاست و هوا به شدت شرجی است.");
    }

    if (uv >= 7) {
        messages.push("شاخص UV بالاست؛ کرم ضد آفتاب ضروری است.");
    }

    if (messages.length === 0) {
        if (temp >= 16 && temp <= 27 && wind < 20 && humidity < 60 && aqiVal <= 40) {
            return "شرایط جوی بسیار عالی و کیفیت هوا مطلوب است؛ روزی فوق‌العاده برای گردش و ورزش!";
        }
        return "آب و هوا متعادل است و شرایط برای کارهای روزمره مناسب می‌باشد.";
    }

    return messages.slice(0, 2).join(' همچنین، ');
}
